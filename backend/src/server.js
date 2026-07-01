import Fastify from 'fastify';
import cors from '@fastify/cors';
import { registerRoutes } from './routes.js';
import { verifyToken } from './jwt.js';

const PORT = Number(process.env.PORT || '3000');
const HOST = process.env.HOST || '0.0.0.0';

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
});

await app.register(cors, {
  origin: process.env.CORS_ORIGIN || true,
  credentials: true,
});

// Decorate requests with authenticated user when a valid Bearer token is present.
app.decorateRequest('user', null);

app.addHook('onRequest', async (request, _reply) => {
  const auth = request.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    const token = auth.slice(7);
    try {
      const decoded = verifyToken(token);
      request.user = { userId: decoded.sub, handle: decoded.handle };
    } catch (_err) {
      // Leave user as null; protected routes will reject.
      request.user = null;
    }
  }
});

await app.register(registerRoutes, { prefix: '/api' });

try {
  await app.listen({ port: PORT, host: HOST });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
