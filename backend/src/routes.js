import { z } from 'zod';
import { db } from './db.js';
import { newId } from './ids.js';
import { signToken } from './jwt.js';
import { verifyGoogleIdToken } from './google.js';

const ISO_DATE = () => new Date().toISOString();

function requireUser(request, reply) {
  if (!request.user) {
    reply.code(401).send({ error: 'Unauthorized' });
    return null;
  }
  return request.user;
}

function recordActivity(actorId, kind, targetId, payload) {
  const stmt = db.prepare(
    'INSERT INTO activities (id, actor_id, kind, target_id, payload, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  );
  stmt.run(newId(), actorId, kind, targetId || null, JSON.stringify(payload || {}), ISO_DATE());
}

// Zod schemas
const HandleParam = z.object({ handle: z.string().min(1).max(40).regex(/^[a-z0-9_]+$/) });
const GoogleAuthBody = z.object({ idToken: z.string().min(1), displayName: z.string().max(120).optional() });
const ProfileBody = z.object({
  displayName: z.string().min(1).max(120).optional(),
  bio: z.string().max(500).optional(),
  isPublic: z.boolean().optional(),
});
const ListBody = z.object({
  slug: z.string().min(1).max(80).regex(/^[a-z0-9_-]+$/),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  isPublic: z.boolean().optional(),
  items: z
    .array(
      z.object({
        mediaId: z.string().min(1).max(120),
        title: z.string().min(1).max(300),
        mediaType: z.enum(['movie', 'series', 'episode']),
      })
    )
    .max(500)
    .optional(),
});
const ListUpdateBody = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  isPublic: z.boolean().optional(),
});
const RewindBody = z.object({
  moviesWatched: z.number().int().min(0),
  episodesWatched: z.number().int().min(0),
  seriesCount: z.number().int().min(0),
  topMovieTitle: z.string().max(300).optional(),
  topSeriesTitle: z.string().max(300).optional(),
  payload: z.record(z.unknown()).optional(),
});

/**
 * Register all VibeVault API routes on the given Fastify instance.
 *
 * @param {import('fastify').FastifyInstance} fastify
 * @param {unknown} _options
 */
export async function registerRoutes(fastify, _options) {
  // ---- Auth ----
  fastify.post('/auth/google', async (request, reply) => {
    const body = GoogleAuthBody.parse(request.body);
    let google;
    try {
      google = await verifyGoogleIdToken(body.idToken);
    } catch (_err) {
      return reply.code(401).send({ error: 'Invalid Google ID token' });
    }
    const handleBase = (body.displayName || google.name || 'user')
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 30) || 'user';

    let existing = db.prepare('SELECT id, handle FROM users WHERE google_sub = ?').get(google.sub);
    if (!existing) {
      let handle = handleBase;
      let suffix = 1;
      while (db.prepare('SELECT 1 FROM users WHERE handle = ?').get(handle)) {
        handle = `${handleBase}_${suffix++}`;
      }
      const id = newId();
      const now = ISO_DATE();
      db.prepare(
        'INSERT INTO users (id, handle, display_name, google_sub, created_at) VALUES (?, ?, ?, ?, ?)'
      ).run(id, handle, body.displayName || google.name || handle, google.sub, now);
      db.prepare('INSERT INTO public_profiles (user_id, bio, is_public) VALUES (?, ?, ?)').run(
        id,
        null,
        1
      );
      existing = { id, handle };
    }

    const token = signToken({ userId: existing.id, handle: existing.handle });
    return { token, user: { id: existing.id, handle: existing.handle } };
  });

  // ---- Profiles ----
  fastify.get('/u/:handle', async (request, reply) => {
    const { handle } = HandleParam.parse(request.params);
    const profile = db
      .prepare(
        `SELECT u.id, u.handle, u.display_name, u.created_at, p.bio, p.is_public
         FROM users u
         JOIN public_profiles p ON p.user_id = u.id
         WHERE u.handle = ?`
      )
      .get(handle);
    if (!profile) {
      return reply.code(404).send({ error: 'Profile not found' });
    }
    if (!profile.is_public) {
      return reply.code(404).send({ error: 'Profile not found' });
    }
    return {
      id: profile.id,
      handle: profile.handle,
      displayName: profile.display_name,
      bio: profile.bio,
      createdAt: profile.created_at,
    };
  });

  fastify.get('/u/:handle/lists', async (request, reply) => {
    const { handle } = HandleParam.parse(request.params);
    const user = db.prepare('SELECT id FROM users WHERE handle = ?').get(handle);
    if (!user) return reply.code(404).send({ error: 'User not found' });
    const rows = db
      .prepare(
        `SELECT id, slug, title, description, created_at, updated_at
         FROM published_lists
         WHERE user_id = ? AND is_public = 1
         ORDER BY updated_at DESC`
      )
      .all(user.id);
    return { lists: rows };
  });

  fastify.get('/me/profile', async (request, reply) => {
    const user = requireUser(request, reply);
    if (!user) return;
    const profile = db
      .prepare(
        `SELECT u.id, u.handle, u.display_name, u.created_at, p.bio, p.is_public
         FROM users u
         JOIN public_profiles p ON p.user_id = u.id
         WHERE u.id = ?`
      )
      .get(user.userId);
    return {
      id: profile.id,
      handle: profile.handle,
      displayName: profile.display_name,
      bio: profile.bio,
      isPublic: Boolean(profile.is_public),
      createdAt: profile.created_at,
    };
  });

  fastify.put('/me/profile', async (request, reply) => {
    const user = requireUser(request, reply);
    if (!user) return;
    const body = ProfileBody.parse(request.body);
    const now = ISO_DATE();
    if (body.displayName) {
      db.prepare('UPDATE users SET display_name = ? WHERE id = ?').run(body.displayName, user.userId);
    }
    db.prepare(
      'UPDATE public_profiles SET bio = COALESCE(?, bio), is_public = COALESCE(?, is_public) WHERE user_id = ?'
    ).run(body.bio ?? null, body.isPublic === undefined ? null : body.isPublic ? 1 : 0, user.userId);
    return { updatedAt: now };
  });

  // ---- Public lists ----
  fastify.get('/lists/:id', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const list = db
      .prepare(
        `SELECT l.id, l.slug, l.title, l.description, l.created_at, l.updated_at, u.handle as user_handle, u.display_name as user_display_name
         FROM published_lists l
         JOIN users u ON u.id = l.user_id
         WHERE l.id = ? AND l.is_public = 1`
      )
      .get(id);
    if (!list) return reply.code(404).send({ error: 'List not found' });
    const items = db
      .prepare(
        `SELECT media_id, title, media_type, added_at
         FROM published_list_items
         WHERE list_id = ?
         ORDER BY added_at`
      )
      .all(id);
    return { ...list, items };
  });

  // ---- My lists ----
  fastify.get('/me/lists', async (request, reply) => {
    const user = requireUser(request, reply);
    if (!user) return;
    const rows = db
      .prepare(
        `SELECT id, slug, title, description, is_public, created_at, updated_at
         FROM published_lists
         WHERE user_id = ?
         ORDER BY updated_at DESC`
      )
      .all(user.userId);
    return { lists: rows };
  });

  fastify.post('/me/lists', async (request, reply) => {
    const user = requireUser(request, reply);
    if (!user) return;
    const body = ListBody.parse(request.body);
    const id = newId();
    const now = ISO_DATE();
    const dup = db.prepare('SELECT 1 FROM published_lists WHERE user_id = ? AND slug = ?').get(user.userId, body.slug);
    if (dup) {
      return reply.code(409).send({ error: 'List slug already exists' });
    }
    db.prepare(
      'INSERT INTO published_lists (id, user_id, slug, title, description, is_public, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      id,
      user.userId,
      body.slug,
      body.title,
      body.description || null,
      body.isPublic === false ? 0 : 1,
      now,
      now
    );
    if (body.items?.length) {
      const insertItem = db.prepare(
        'INSERT INTO published_list_items (list_id, media_id, title, media_type, added_at) VALUES (?, ?, ?, ?, ?)'
      );
      for (const item of body.items) {
        insertItem.run(id, item.mediaId, item.title, item.mediaType, now);
      }
    }
    recordActivity(user.userId, 'published_list', id, { slug: body.slug, title: body.title });
    reply.code(201);
    return { id, slug: body.slug };
  });

  fastify.get('/me/lists/:id', async (request, reply) => {
    const user = requireUser(request, reply);
    if (!user) return;
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const list = db
      .prepare('SELECT * FROM published_lists WHERE id = ? AND user_id = ?')
      .get(id, user.userId);
    if (!list) return reply.code(404).send({ error: 'List not found' });
    const items = db
      .prepare(
        `SELECT media_id, title, media_type, added_at
         FROM published_list_items
         WHERE list_id = ?
         ORDER BY added_at`
      )
      .all(id);
    return { ...list, items };
  });

  fastify.put('/me/lists/:id', async (request, reply) => {
    const user = requireUser(request, reply);
    if (!user) return;
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = ListUpdateBody.parse(request.body);
    const list = db.prepare('SELECT user_id FROM published_lists WHERE id = ?').get(id);
    if (!list || list.user_id !== user.userId) return reply.code(404).send({ error: 'List not found' });
    const now = ISO_DATE();
    db.prepare(
      'UPDATE published_lists SET title = COALESCE(?, title), description = COALESCE(?, description), is_public = COALESCE(?, is_public), updated_at = ? WHERE id = ?'
    ).run(
      body.title ?? null,
      body.description ?? null,
      body.isPublic === undefined ? null : body.isPublic ? 1 : 0,
      now,
      id
    );
    return { updatedAt: now };
  });

  fastify.delete('/me/lists/:id', async (request, reply) => {
    const user = requireUser(request, reply);
    if (!user) return;
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const list = db.prepare('SELECT user_id, title FROM published_lists WHERE id = ?').get(id);
    if (!list || list.user_id !== user.userId) return reply.code(404).send({ error: 'List not found' });
    db.prepare('DELETE FROM published_lists WHERE id = ?').run(id);
    recordActivity(user.userId, 'deleted_list', id, { title: list.title });
    reply.code(204).send();
  });

  // ---- Rewinds ----
  fastify.post('/me/rewinds/:year', async (request, reply) => {
    const user = requireUser(request, reply);
    if (!user) return;
    const { year } = z.object({ year: z.coerce.number().int().min(2000).max(2100) }).parse(request.params);
    const body = RewindBody.parse(request.body);
    const now = ISO_DATE();
    db.prepare(
      `INSERT INTO published_rewinds
       (user_id, year, movies_watched, episodes_watched, series_count, top_movie_title, top_series_title, payload, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id, year) DO UPDATE SET
         movies_watched=excluded.movies_watched,
         episodes_watched=excluded.episodes_watched,
         series_count=excluded.series_count,
         top_movie_title=excluded.top_movie_title,
         top_series_title=excluded.top_series_title,
         payload=excluded.payload,
         created_at=excluded.created_at`
    ).run(
      user.userId,
      year,
      body.moviesWatched,
      body.episodesWatched,
      body.seriesCount,
      body.topMovieTitle || null,
      body.topSeriesTitle || null,
      JSON.stringify(body.payload || {}),
      now
    );
    recordActivity(user.userId, 'published_rewind', `${year}`, { year });
    reply.code(201);
    return { year, updatedAt: now };
  });

  fastify.get('/me/rewinds/:year', async (request, reply) => {
    const user = requireUser(request, reply);
    if (!user) return;
    const { year } = z.object({ year: z.coerce.number().int().min(2000).max(2100) }).parse(request.params);
    const row = db.prepare('SELECT * FROM published_rewinds WHERE user_id = ? AND year = ?').get(user.userId, year);
    if (!row) return reply.code(404).send({ error: 'Rewind not found' });
    return {
      year: row.year,
      moviesWatched: row.movies_watched,
      episodesWatched: row.episodes_watched,
      seriesCount: row.series_count,
      topMovieTitle: row.top_movie_title,
      topSeriesTitle: row.top_series_title,
      payload: JSON.parse(row.payload),
      createdAt: row.created_at,
    };
  });

  fastify.get('/rewind/:handle/:year', async (request, reply) => {
    const { handle, year } = z
      .object({
        handle: z.string().min(1),
        year: z.coerce.number().int().min(2000).max(2100),
      })
      .parse(request.params);
    const user = db.prepare('SELECT id, handle FROM users WHERE handle = ?').get(handle);
    if (!user) return reply.code(404).send({ error: 'User not found' });
    const profile = db.prepare('SELECT is_public FROM public_profiles WHERE user_id = ?').get(user.id);
    if (!profile?.is_public) return reply.code(404).send({ error: 'Rewind not found' });
    const row = db.prepare('SELECT * FROM published_rewinds WHERE user_id = ? AND year = ?').get(user.id, year);
    if (!row) return reply.code(404).send({ error: 'Rewind not found' });
    return {
      user: { id: user.id, handle: user.handle },
      year: row.year,
      moviesWatched: row.movies_watched,
      episodesWatched: row.episodes_watched,
      seriesCount: row.series_count,
      topMovieTitle: row.top_movie_title,
      topSeriesTitle: row.top_series_title,
      payload: JSON.parse(row.payload),
      createdAt: row.created_at,
    };
  });

  // ---- Follows (P5) ----
  fastify.post('/me/follows/:handle', async (request, reply) => {
    const me = requireUser(request, reply);
    if (!me) return;
    const { handle } = HandleParam.parse(request.params);
    const target = db.prepare('SELECT id FROM users WHERE handle = ?').get(handle);
    if (!target) return reply.code(404).send({ error: 'User not found' });
    if (target.id === me.userId) return reply.code(400).send({ error: 'Cannot follow yourself' });
    const now = ISO_DATE();
    try {
      db.prepare('INSERT INTO follows (follower_id, following_id, created_at) VALUES (?, ?, ?)').run(
        me.userId,
        target.id,
        now
      );
      recordActivity(me.userId, 'follow', target.id, { handle });
    } catch (_err) {
      // Already following is fine.
    }
    reply.code(204).send();
  });

  fastify.delete('/me/follows/:handle', async (request, reply) => {
    const me = requireUser(request, reply);
    if (!me) return;
    const { handle } = HandleParam.parse(request.params);
    const target = db.prepare('SELECT id FROM users WHERE handle = ?').get(handle);
    if (!target) return reply.code(404).send({ error: 'User not found' });
    db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').run(me.userId, target.id);
    reply.code(204).send();
  });

  fastify.get('/u/:handle/followers', async (request, reply) => {
    const { handle } = HandleParam.parse(request.params);
    const user = db.prepare('SELECT id FROM users WHERE handle = ?').get(handle);
    if (!user) return reply.code(404).send({ error: 'User not found' });
    const rows = db
      .prepare(
        `SELECT u.handle, u.display_name
         FROM follows f
         JOIN users u ON u.id = f.follower_id
         WHERE f.following_id = ?
         ORDER BY f.created_at DESC`
      )
      .all(user.id);
    return { followers: rows };
  });

  fastify.get('/u/:handle/following', async (request, reply) => {
    const { handle } = HandleParam.parse(request.params);
    const user = db.prepare('SELECT id FROM users WHERE handle = ?').get(handle);
    if (!user) return reply.code(404).send({ error: 'User not found' });
    const rows = db
      .prepare(
        `SELECT u.handle, u.display_name
         FROM follows f
         JOIN users u ON u.id = f.following_id
         WHERE f.follower_id = ?
         ORDER BY f.created_at DESC`
      )
      .all(user.id);
    return { following: rows };
  });

  // ---- Activity feed (P5) ----
  fastify.get('/me/feed', async (request, reply) => {
    const me = requireUser(request, reply);
    if (!me) return;
    const { limit = '50', before } = z
      .object({ limit: z.coerce.number().int().min(1).max(200).optional(), before: z.string().optional() })
      .parse(request.query);
    let sql = `SELECT a.id, a.actor_id, a.kind, a.target_id, a.payload, a.created_at, u.handle, u.display_name
               FROM activities a
               JOIN users u ON u.id = a.actor_id
               WHERE a.actor_id IN (
                 SELECT following_id FROM follows WHERE follower_id = ?
               )`;
    const params = [me.userId];
    if (before) {
      sql += ' AND a.created_at < ?';
      params.push(before);
    }
    sql += ' ORDER BY a.created_at DESC LIMIT ?';
    params.push(limit);
    const rows = db.prepare(sql).all(...params);
    return {
      activities: rows.map((r) => ({
        id: r.id,
        actorId: r.actor_id,
        handle: r.handle,
        displayName: r.display_name,
        kind: r.kind,
        targetId: r.target_id,
        payload: JSON.parse(r.payload),
        createdAt: r.created_at,
      })),
    };
  });

  // ---- Health ----
  fastify.get('/health', async (_request, _reply) => ({ ok: true }));
}
