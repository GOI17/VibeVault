# VibeVault Product Roadmap — Extracto de conversación en ChatGPT

> Fuente: conversación del usuario con ChatGPT Business advisor.
> Estado del repo al momento de la conversación: Expo + Web, AsyncStorage, sin backend, sin identidad de usuario.

## Visión

No es un "tracker de series". Es una plataforma de descubrimiento, seguimiento y recomendación de entretenimiento personal.

Cuando alguien piense:
- ¿Qué estoy viendo?
- ¿Qué quiero ver?
- ¿Qué me recomiendas?
- ¿Dónde puedo verlo?

Queremos que piense en VibeVault.

## Problema

El historial del usuario está fragmentado entre Netflix, Prime, Disney, Apple TV. Ninguna plataforma tiene:
- Todo su historial.
- Favoritos globales.
- Listas personales.
- Recomendaciones personalizadas.
- Un perfil compartible.

## Objetivo de negocio (próximos 12 meses)

NO optimizar ingresos. Optimizar **retención**.

Retención → usuarios activos → monetización → negocio sostenible.

## North Star Metric

**WAU (Weekly Active Users)** — el producto tiene comportamiento semanal.

## Objetivos del producto

1. Que el usuario registre contenido (marcar episodio, agregar película, favorito, lista).
2. Que regrese (¿por qué volvería mañana / la próxima semana?).
3. Distribución orgánica: cada usuario debe generar contenido compartible (perfil, listas, resumen anual, actividad reciente).

## Qué NO construir ahora

- Chat
- Video propio
- Streaming propio
- Marketplace
- Ads complejos

## Roadmap propuesto

| Fase | Prioridad | Qué incluye |
|---|---|---|
| P0 | Analytics | signup, first favorite, first watched episode, share generated, return 7d/30d. |
| P1 | Core Tracking | Buscar, agregar, marcar visto, actualizar progreso. Menos de 3 clics. |
| P2 | Shareability | Deep links, imágenes, cards, static exports (sin backend). |
| P3 | Monetización | Where to watch, afiliados, premium. **Solo después de 100+ WAU.** |
| P4 | Publishing Platform | Perfiles públicos, listas públicas, rewind. **Requiere backend.** |
| P5 | Social Network | Followers, activity feeds, social graph. |

## Decisión clave: social vs. publicación

- **Diferir:** activity feeds, followers, comments, reactions, social graph.
- **Mantener en visión (con backend posterior):** public profiles, public lists, yearly rewind.
- **Ahora:** shareability sin backend (deep links + imágenes locales).

## Decisión clave: rewind

- **Opción elegida:** A. Device-generated rewind.
- Se genera local desde AsyncStorage (Favorites + WatchedProgress).
- Formato compartible: imagen, PDF, deep link.
- **NO** existe URL pública tipo `vibevault.app/u/jose/rewind` porque eso introduce backend.

## Implicaciones para el freemium actual

- Monetización va **después** de retención y shareability.
- Historial ilimitado es coherente: todo es local-first hoy.
- Premium puede agregar notificaciones, deep links directos a plataformas, y funciones de exportación.
- Sin backend en fase A, no hay perfiles públicos ni sync multi-dispositivo automático (solo Google Drive backup manual).

## Proxies / modelos de datos sugeridos para publicación futura

- `users` (handle, display name)
- `public_lists`
- `published_rewinds`
- **NO** followers, comments, likes, activities en la primera versión del backend.
