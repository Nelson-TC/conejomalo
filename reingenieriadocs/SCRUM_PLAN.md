# Metodología SCRUM — Reingeniería ConejoMalo

## 1. Resumen
Este documento formaliza la ejecución de la reingeniería de **ConejoMalo** bajo SCRUM. Incluye roles, ceremonias, artefactos, definición de listo (DoR), definición de hecho (DoD), plan de sprints con fechas, backlog priorizado, historias de usuario y un tablero To‑Do sugerido.

---

## 2. Propósito del proyecto
**Reingenierizar** una plataforma e‑commerce (Pet Shop) desde un monolito acoplado hacia una arquitectura desacoplada, escalable y profesional, manteniendo el foco en tiempo récord.

---

## 3. Alcance (MVP)
**Incluye:** Auth, catálogo, carrito, checkout (simulado si no hay pasarela), órdenes, documentación técnica mínima.
**No incluye:** panel admin, migración de datos legacy, features avanzadas.

---

## 4. Roles y responsabilidades
- **Product Owner (PO):** define valor de negocio, prioriza backlog, acepta entregables.
- **Scrum Master (SM):** facilita ceremonias, elimina bloqueos, protege el sprint.
- **Development Team (Dev):** 2 personas, entrega el incremento.

---

## 5. Artefactos SCRUM
- **Product Backlog:** listado priorizado de funcionalidades.
- **Sprint Backlog:** historias seleccionadas para el sprint.
- **Incremento:** entregable funcional al final de cada sprint.

---

## 6. Ceremonias
- **Sprint Planning (2h):** selección de historias y objetivos.
- **Daily Scrum (15m):** avances, bloqueos, plan del día.
- **Sprint Review (1h):** demo del incremento.
- **Sprint Retrospective (1h):** mejora continua.

---

## 7. Definición de Ready (DoR)
Una historia entra a sprint si:
- Tiene criterios de aceptación claros.
- Está estimada (t-shirt o puntos).
- Tiene dependencias identificadas.
- Está priorizada por el PO.

## 8. Definición de Done (DoD)
- Código compilando sin errores.
- Tests críticos pasan.
- Documentación mínima actualizada.
- Feature deployable.

---

## 9. Plan de Sprints (con fechas)
**Referencia temporal:** inicio 2026‑05‑12 (lunes siguiente a la fecha actual).

### Sprint 1 (2026‑05‑12 → 2026‑05‑16) — Base técnica
**Objetivo:** separar frontend/backend y habilitar la base de desarrollo.
**Entregables:**
- Setup Next.js 15 + Tailwind
- Setup NestJS + Prisma
- PostgreSQL + Redis (Docker Compose)
- CI/CD básico (lint/test/build)

### Sprint 2 (2026‑05‑19 → 2026‑05‑23) — Flujo principal
**Objetivo:** MVP funcional end‑to‑end.
**Entregables:**
- Auth (JWT / proveedor externo)
- Catálogo
- Carrito persistente
- Checkout (simulado)
- Órdenes

### Sprint 3 (2026‑05‑26 → 2026‑05‑30) — Calidad y observabilidad
**Objetivo:** estabilidad mínima para release.
**Entregables:**
- Tests críticos
- Logging estructurado
- OpenAPI mínima
- Ajustes de performance

---

## 10. Backlog priorizado (alto nivel)
1. Separación Frontend/Backend
2. Arquitectura limpia (Clean/Hexagonal)
3. Persistencia con Repository Pattern
4. Auth segura (JWT + validaciones)
5. Catálogo + búsqueda
6. Carrito persistente
7. Checkout simulado
8. Órdenes
9. Testing integral
10. CI/CD básico
11. Observabilidad + logging
12. Documentación (API + C4 + ADR)

---

## 11. Historias de Usuario (con criterios de aceptación)

### HU‑01 Autenticación
**Como** usuario
**Quiero** iniciar sesión
**Para** acceder a mis órdenes

**Criterios de aceptación**
- Login devuelve JWT válido
- Error claro en credenciales inválidas

---

### HU‑02 Catálogo
**Como** usuario
**Quiero** ver productos por categoría
**Para** encontrar lo que necesito

**Criterios de aceptación**
- Lista filtrable por categoría
- Detalle de producto accesible

---

### HU‑03 Carrito persistente
**Como** usuario
**Quiero** guardar mi carrito
**Para** continuar luego

**Criterios de aceptación**
- Carrito persiste entre sesiones
- Agregar/eliminar productos funciona

---

### HU‑04 Checkout simulado
**Como** usuario
**Quiero** finalizar compra
**Para** generar una orden

**Criterios de aceptación**
- Confirmación crea una orden
- Mensaje de éxito visible

---

### HU‑05 Órdenes
**Como** usuario
**Quiero** ver mi historial de órdenes
**Para** revisar compras anteriores

**Criterios de aceptación**
- Lista de órdenes por usuario
- Detalle básico por orden

---

### HU‑06 Observabilidad mínima
**Como** equipo
**Quiero** logs y métricas
**Para** diagnosticar errores

**Criterios de aceptación**
- Logs con contexto
- Métricas básicas disponibles

---

## 12. Tablero To‑Do sugerido
**Columnas:**
- **Backlog**
- **To‑Do (Sprint)**
- **In Progress**
- **Review/QA**
- **Done**

**Política WIP:** máximo 2 ítems en “In Progress” por persona.

---

## 13. Métricas de seguimiento
- Velocidad por sprint
- Cobertura de tests críticos
- Tiempo de ciclo
- Bugs post‑release
