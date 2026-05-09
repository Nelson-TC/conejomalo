# Metodología SCRUM — Reingeniería ConejoMalo

## 1. Resumen
Este documento define la ejecución de la reingeniería de **ConejoMalo** bajo SCRUM, incluyendo roles, ceremonias, backlog, historias de usuario, criterios de aceptación y plan de sprints.

---

## 2. Roles
- **Product Owner (PO):** prioriza backlog, define valor de negocio.
- **Scrum Master (SM):** elimina bloqueos, asegura el proceso SCRUM.
- **Development Team (Dev):** 2 personas, responsables del delivery.

---

## 3. Ceremonias
- **Sprint Planning (2h):** selección de historias priorizadas.
- **Daily Scrum (15m):** estado, bloqueos, plan diario.
- **Sprint Review (1h):** demo del incremento.
- **Sprint Retrospective (1h):** mejora continua.

---

## 4. Definición de Done (DoD)
- Código compilando y sin errores.
- Tests críticos pasan.
- Documentación mínima actualizada.
- Feature deployable.

---

## 5. Backlog de Producto (alto nivel)
1. Separación Frontend/Backend
2. Arquitectura limpia (Hexagonal/Clean)
3. Persistencia robusta (Repository Pattern)
4. Auth segura (JWT + validaciones)
5. Testing integral
6. CI/CD básico
7. Observabilidad + logging
8. Documentación (API + C4 + ADR)

---

## 6. Plan de Sprints (rápido)
### Sprint 1 (5 días) — Base técnica
**Objetivo:** infraestructura y separación front/back.
- Setup Next.js + NestJS
- Prisma + PostgreSQL
- Docker Compose
- CI/CD básico

### Sprint 2 (5 días) — Flujo principal
**Objetivo:** MVP operativo.
- Auth
- Catálogo
- Carrito
- Checkout simulado
- Órdenes

### Sprint 3 (5 días) — Calidad y observabilidad
**Objetivo:** robustez mínima.
- Tests críticos
- Logging
- OpenAPI
- Ajustes de performance

---

## 7. Historias de Usuario (con criterios de aceptación)

### HU-01 Autenticación
**Como** usuario
**Quiero** iniciar sesión
**Para** acceder a mi historial de compras

**Criterios de aceptación**
- Login funciona con token JWT válido
- Error claro en credenciales inválidas

---

### HU-02 Catálogo
**Como** usuario
**Quiero** ver productos por categoría
**Para** encontrar lo que necesito

**Criterios de aceptación**
- Lista con productos filtrados por categoría
- Detalle de producto accesible

---

### HU-03 Carrito persistente
**Como** usuario
**Quiero** guardar mi carrito
**Para** continuar luego

**Criterios de aceptación**
- Carrito persiste entre sesiones
- Se puede agregar y eliminar productos

---

### HU-04 Checkout simulado
**Como** usuario
**Quiero** finalizar compra
**Para** generar una orden

**Criterios de aceptación**
- Confirmación crea una orden
- Mensaje de éxito visible

---

### HU-05 Órdenes
**Como** usuario
**Quiero** ver mi historial de órdenes
**Para** revisar compras anteriores

**Criterios de aceptación**
- Lista de órdenes del usuario
- Detalle básico por orden

---

### HU-06 Observabilidad mínima
**Como** equipo
**Quiero** logs y métricas
**Para** diagnosticar errores

**Criterios de aceptación**
- Logs con contexto
- Métricas básicas disponibles

---

## 8. Métricas de seguimiento
- Velocidad por sprint
- Cobertura de tests críticos
- Tiempo de ciclo
- Bugs post release
