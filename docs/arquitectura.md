# Arquitectura

## Visión General
Aplicación e-commerce ligera construida con **Next.js App Router**, **Prisma**, **PostgreSQL** y **Tailwind CSS**. El objetivo es ofrecer catálogo, carrito basado en cookies y flujo de órdenes sin requerir autenticación obligatoria, con posibilidad de registrar usuarios y rol ADMIN.

## Capas
- **UI / Rutas (app/)**: Server Components para render inicial y Client Components para interacción (Navbar, búsqueda, carrito, auth provider).
- **API Routes (app/api)**: Endpoints REST simples (productos, categorías, búsqueda, carrito, auth, órdenes, administración CRUD).
- **Dominio / Datos (Prisma)**: Modelos `User`, `Product`, `Category`, `Order`, `OrderItem` con relaciones y campos audit.
- **Estado en cliente**: Mínimo; se usan hooks locales y eventos `CustomEvent` (`cart:updated`, `auth:changed`). No se añade Redux ni context extra para simplicidad.
- **Autenticación**: Cookie de sesión JWT (`session`) + cookie auxiliar `auth_user_id` (legado / compat). Ver `docs/auth-cart.md`.
- **Carrito**: Cookie no-HTTPOnly `cart` para acceso directo desde cliente sin roundtrips adicionales.

## Flujo de Peticiones
1. Usuario carga página -> Server Components consultan Prisma.
2. Acciones (agregar a carrito) llaman `/api/cart` -> escribe cookie -> UI dispara evento y re-render local.
3. Checkout crea orden en `/api/orders` leyendo contenido cookie + validación + persistencia.
4. Autenticación modifica cookies (`session`, `auth_user_id`) -> `AuthProvider` refetchea `/api/auth/me`.

## Decisiones Clave
| Decisión | Justificación | Alternativa futura |
|----------|---------------|--------------------|
| Carrito en cookie JSON | Simplicidad, sin tablas extra | Persistir carrito por usuario autenticado en DB |
| JWT manual (jose) | Control fino y dependencia mínima | Auth.js / NextAuth para social login |
| Eventos custom para sincronía | Evita context global | React Context + Reducer central |
| Búsqueda simple LIKE | Rápido implementar | Full‑text index / Elastic / Meilisearch |
| Tailwind utilitario | Rapidez de iteración | Design system con componentes compuestos |

## Convenciones
- Archivos API usan funciones HTTP export nombradas (`GET`, `POST`, etc.).
- Modelos usan naming singular PascalCase; tablas generadas por Prisma.
- Slugs generados en minúsculas reemplazando no-alfa-num por guiones.
- Validaciones mínimas en endpoints; errores JSON con `{ error, fields? }`.

## Seguridad
- Cookies de sesión `httpOnly` y `secure` en producción.
- No se exponen hashes ni campos sensibles.
- Validación básica de inputs (ej. longitud, formato email/phone).
- Límites carrito (`MAX_ITEMS`, `MAX_PER_ITEM`).

## Rendimiento
- Carga rápida: pocas dependencias, SSR + streaming por defecto.
- Sin sobre-fetch: la mayoría de UI reusa props iniciales; búsqueda y carrito son llamadas ligeras.
- Optimización pendiente: imagen de productos podría usar `next/image` y CDN.

## Accesibilidad
- Botones y enlaces con `aria-label` donde el icono es único (carrito, menú).
- Estados de foco visibles (`focus:ring`).
- Dropdown menú cierra con click externo.

## Observabilidad (Pendiente)
- Agregar logging estructurado (pino) y métricas (OpenTelemetry) en futuro.

## Diagrama Simplificado
```
[Browser]
  | UI events
  v
[Next.js Routes + Server Components]
  | Prisma Client
  v
[PostgreSQL]
```

## Próximas Mejoras Sugeridas
- Persistir carrito para usuarios autenticados (merge cookie + DB).
- Roles granulares (staff, support).
- Webhooks de pago (Stripe) y estados de orden.
- Revalidate on write (`revalidatePath`/`tag`) para caching selectivo.
