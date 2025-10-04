# API Reference

Base: `/api`
Todas las respuestas son JSON. Errores estándar: `{ error: string, fields?: Record<string,string> }`.

## Catálogo
### `GET /api/products`
Lista todos los productos (incluye categoría). Sin paginación inicial.

### `GET /api/categories`
Devuelve `{ categories: [...] }` solo activas.

### `GET /api/search?q=texto`
Búsqueda mínima (min 2 chars) en nombre y descripción. Devuelve `items` (id, name, slug, imageUrl, price).

## Carrito
Cookie `cart` mantiene `{ items: [{ productId, qty }] }`.

### `GET /api/cart`
Devuelve `{ items, subtotal, enriched }` donde `enriched` añade `name, price, lineTotal`.

### `POST /api/cart`
Body: `{ productId, qty }` (qty >=1). Agrega o incrementa.

### `PUT /api/cart`
Body: `{ productId, qty }` (qty >=0). 0 elimina item.

### `DELETE /api/cart`
Body: `{ productId }` elimina item.

Errores: `400` datos inválidos, `404` producto / item no encontrado, límites cantidad.

## Órdenes
### `POST /api/orders`
Crea orden a partir del carrito cookie. Body: `{ customer, email, phone, address }`.
Validaciones: longitud mínima, email / teléfono formato, carrito no vacío.
Respuesta: `201` con entidad Order (incluye `items`). Vacía carrito.

## Autenticación
Cookies: `session` (JWT httpOnly), `auth_user_id` (legado para user lookup).

### `POST /api/auth/register`
Body: `{ email, password, name }`. Requisitos: email válido, password >=6. Crea usuario y logea automáticamente.

### `POST /api/auth/login`
Body: `{ email, password }`. Devuelve `{ ok: true }` o 401.

### `POST /api/auth/logout`
Borra cookies de sesión. Devuelve `{ ok: true }`.

### `GET /api/auth/me`
Devuelve `{ authenticated: boolean, sub?, email?, name? }`.

## Administración
(Se requiere rol ADMIN — pendiente middleware robusto.)

### `GET /api/admin/products`
Lista productos.
### `POST /api/admin/products`
Body: `{ name, price, description?, categoryId }` -> crea producto + slug.
### `GET /api/admin/products/:id` | `PUT` | `DELETE`
CRUD producto.

### `GET /api/admin/categories`
Lista categorías.
### `POST /api/admin/categories`
Body: `{ name, active? }` -> crea con slug.
### `GET /api/admin/categories/:id` | `PUT` | `DELETE`
CRUD categoría.

### `GET /api/admin/users`
Lista usuarios.
### `POST /api/admin/users`
Crea usuario básico (sin password) - uso interno.
### `GET/PUT/DELETE /api/admin/users/:id`
Obtener, actualizar `name`, borrar.

## Dashboard / Métricas (Resumen)
Los endpoints de exportación (CSV) reutilizan helpers de `metrics.ts` (actualmente expuestos vía `ExportMenu` usando rutas `/api/admin/...` o `/api/...` según se definan). Si se extienden, documentar:
- `/api/admin/export/summary`
- `/api/admin/export/timeseries`
- `/api/admin/export/top-products`
- `/api/admin/export/categories`
- `/api/admin/export/orders-status`

## Códigos de Estado Comunes
- 200 OK / 201 Created / 204 No Content
- 400 Bad Request (validación)
- 401 Unauthorized (credenciales)
- 404 Not Found
- 409 Conflict (duplicados)
- 422 Validation (campos específicos)
- 500 Internal Error

## Versionado
Actualmente v1 implícito. Para cambios breaking: prefijo `/api/v2/...`.

## Ejemplos Rápidos
```bash
# Buscar
curl '/api/search?q=heno'
# Agregar al carrito
curl -X POST -H 'Content-Type: application/json' -d '{"productId":"PID","qty":2}' /api/cart
```
