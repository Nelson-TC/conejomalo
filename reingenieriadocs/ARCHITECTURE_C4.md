# Arquitectura (C4 Model)

## Nivel 1 — Contexto
El sistema permite a clientes de una Pet Shop navegar productos, gestionar su carrito y realizar pedidos. Se integra con servicios de autenticación y un proveedor de deployment.

**Actores:**
- Cliente
- Administrador (futuro)

**Sistemas externos:**
- Proveedor de Auth (Supabase/Auth0)
- Plataforma de deploy (Render/Railway)

## Nivel 2 — Contenedores
- **Frontend (Next.js 15)**: UI, navegación, consumo de API
- **Backend (NestJS)**: API REST, lógica de negocio
- **PostgreSQL**: datos de productos, usuarios, órdenes
- **Redis**: sesiones/caché

## Nivel 3 — Componentes (opcional para MVP)
- Auth Module
- Catalog Module
- Cart Module
- Orders Module

## Flujos principales
1. **Auth:** Cliente → Frontend → Auth Provider → Backend
2. **Compra:** Cliente → Frontend → Backend → DB/Redis
