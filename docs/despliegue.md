# Guía de Despliegue

## Variables de Entorno
| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| DATABASE_URL | Conexión PostgreSQL | postgres://user:pass@host:5432/db |
| JWT_SECRET | Clave firma JWT | cambiar_por_valor_largo |
| NODE_ENV | `production` en build prod | production |

Crear `.env` (no commitear) y configurar en plataforma (Vercel / DO / Render).

## Pasos Generales (Vercel)
1. Importar repositorio.
2. Añadir `DATABASE_URL` y `JWT_SECRET` en Project Settings.
3. Build automático: `npm install && npx prisma generate && npm run build`.
4. Post-deploy (opcional) ejecutar migraciones manualmente (o usar hook):
```
npx prisma migrate deploy
node prisma/seed.js
```
5. Verificar logs y probar `/api/health` (crear si se desea).

## DigitalOcean App Platform
Build Command:
```
npm install && npx prisma generate && npm run build
```
Run Command:
```
npm start
```
Deploy Command (migraciones + seed opcional):
```
npx prisma migrate deploy && node prisma/seed.js || true
```

## Docker (Ejemplo Básico)
`Dockerfile` (crear si se requiere):
```
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production=false
COPY . .
RUN npx prisma generate && npm run build
ENV NODE_ENV=production
CMD ["npm","start"]
```

Docker Compose junto a Postgres:
```
version: '3.9'
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: conejomalo
    ports: ["5432:5432"]
  web:
    build: .
    environment:
      DATABASE_URL: postgres://app:secret@db:5432/conejomalo
      JWT_SECRET: cambia_esto
    ports: ["3000:3000"]
    depends_on: [db]
```

## Migraciones en CI/CD
- Paso antes de levantar contenedor: `npx prisma migrate deploy`.
- En pipelines con zero-downtime usar estrategia: migrar -> build -> swap tráfico.

## Observabilidad / Logs
- Agregar `pino` o `winston` para logs estructurados.
- Integrar con plataforma (Datadog / Grafana Loki) usando stdout.

## Normalizar migraciones si antes usaste `prisma db push`
Si en desarrollo usaste `npx prisma db push` (que crea/ajusta tablas directamente) y ahora quieres pasar a **migraciones versionadas** para producción (`migrate deploy`), sigue uno de estos caminos.

### Caso A: La base de producción todavía está vacía
Es el escenario más simple.
1. Genera migración inicial local:
  ```bash
  npx prisma migrate dev --name init
  ```
2. Haz commit de la carpeta `prisma/migrations` y despliega.
3. En producción ejecuta:
  ```bash
  npx prisma migrate deploy
  npx prisma db seed  # opcional si configuraste prisma.seed
  ```

### Caso B: Ya empujaste tablas con `db push` y tienes datos que quieres conservar
Necesitas crear una **migración baseline** que refleje el estado actual sin volver a recrear las tablas.

1. Asegúrate de que tu `schema.prisma` representa exactamente el estado real de la DB.
2. Genera script diff desde *vacío* hasta tu datamodel para capturarlo como migración inicial:
  ```bash
  npx prisma migrate diff \
    --from-empty \
    --to-schema-datamodel prisma/schema.prisma \
    --script > baseline.sql
  ```
3. Crea carpeta de migración manualmente, por ejemplo:
  ```bash
  mkdir -p prisma/migrations/20250913120000_init
  mv baseline.sql prisma/migrations/20250913120000_init/migration.sql
  ```
4. IMPORTANTE: No ejecutes este SQL en la base porque las tablas ya existen. Vamos a **marcarla como aplicada** para que Prisma la considere baseline.
5. Calcula el checksum que Prisma espera (opcional) ejecutando localmente `npx prisma migrate deploy` contra una base vacía de prueba y copiando la fila generada en `_prisma_migrations`. Método más simple: permitir que en una base limpia de prueba se aplique y luego copiar la entrada.
6. Inserta manualmente un registro en la tabla `_prisma_migrations` de producción (crea la tabla si no existe) simulando que la migración ya corrió. Estructura típica (puede variar con versión):
  ```sql
  INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES 
  ('<cuid_generado>', '<checksum_generado>', NOW(), '20250913120000_init', '', NULL, NOW(), 1);
  ```
  Donde `<checksum_generado>` es el hash que viste en el entorno de prueba. (Si omites pasos contados, Prisma podría intentar reaplicar). Si tu tabla aún no existe, puedes directamente ejecutar el contenido de `migration.sql` (porque la base no tenía tablas) y luego seguir flujo normal.

Simplificación alternativa (si los datos no son críticos): haz un backup, elimina tablas y vuelve al Caso A.

### Caso C: Te da igual perder los datos actuales
1. Respaldar por si acaso:
  ```bash
  pg_dump "$DATABASE_URL" > backup.sql
  ```
2. Drop schema y recrea con migraciones:
  ```bash
  psql "$DATABASE_URL" -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'
  npx prisma migrate deploy
  npx prisma db seed
  ```

### Verificación final
Ejecuta:
```bash
npx prisma migrate status
```
Debe mostrar que la migración inicial está aplicada y el estado está sincronizado. Luego prueba el seed.

## Hardening
- Usar cabeceras: `Content-Security-Policy`, `X-Frame-Options`, etc. (middleware futuro).
- Rotar `JWT_SECRET` y revocar sesiones (agregar campo `tokenVersion` si se implementa lista negra).

## Escalado
- Stateless: múltiples instancias pueden servir tráfico (carrito en cookie, no en memoria).
- DB: habilitar connection pooling (pgBouncer / DO pooler).
- Cache de lectura futuro: Redis para productos populares + tag revalidation.

## Checklist Pre‑Producción
- [ ] Variables de entorno definidas
- [ ] Migraciones ejecutadas
- [ ] Seed (opcional) corrido
- [ ] Logs verificados
- [ ] Monitoreo / uptime configurado
- [ ] Backups DB programados
