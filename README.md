# Aula Docente — Prof. Wilmer

Plataforma docente con gestión de contenido auditado: asignaturas, apuntes,
guías, laboratorios y avisos, administrados desde un panel interno con
cuentas individuales, roles académicos, versionado y bitácora de auditoría.

**Stack:** Next.js (App Router) · TypeScript estricto · Tailwind CSS v4 ·
Drizzle ORM · PostgreSQL (compatible con Supabase).

---

## 1. Repositorio y entorno

```bash
# Clonar (repositorio privado) e instalar
gh repo clone <org>/aula-docente && cd aula-docente
npm ci

# Variables de entorno
cp .env.example .env   # completar DATABASE_URL
```

| Variable | Uso |
| --- | --- |
| `DATABASE_URL` | Conexión PostgreSQL. Local o **Supabase** (pooler `:6543`). TLS se habilita automáticamente en URLs de Supabase. |

### Supabase PostgreSQL

Basta apuntar `DATABASE_URL` al *Connection Pooler* del proyecto
(`Project Settings → Database → Connection String`). Drizzle gestiona el
esquema (`auth.users` de Supabase **no** se toca: las cuentas del aula
viven en la tabla propia `users`, con credenciales individuales scrypt).
En la siguiente fase, `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`
(ya previstas en `.env.example`) activarán Auth administrado y Storage
para los archivos de materiales.

### CI — GitHub Actions

`.github/workflows/ci.yml` ejecuta en cada push/PR, contra un servicio
PostgreSQL efímero:

1. `npm ci`
2. `npx drizzle-kit migrate` — valida que las migraciones versionadas aplican limpio
3. `npm run lint` — ESLint (flat config)
4. `npm run typecheck` — TypeScript estricto
5. `npm run build` — compilación de producción

---

## 2. Modelo de base de datos (Drizzle)

Esquema en `src/db/schema.ts`. Migraciones versionadas en `./drizzle/`
(se generan con `npx drizzle-kit generate --name <nombre>` y se aplican
con `npx drizzle-kit migrate`; **nunca** editar el SQL histórico).

| Tabla | Propósito |
| --- | --- |
| `users` | Cuentas individuales (email único, hash scrypt, rol, estado). |
| `user_sessions` | Sesiones persistidas: token SHA-256, expiración, revocación, IP/UA. |
| `professor_profile` | Perfil público del docente titular. |
| `courses` | Asignaturas (`code`/`slug` únicos, período, créditos). |
| `course_materials` | Apuntes, guías, laboratorios y enlaces por asignatura. |
| `course_announcements` | Avisos por asignatura (o generales, si `courseId` es nulo). |
| `site_settings` | Configuración global clave → valor JSON. |
| `audit_logs` | Bitácora inmutable de acciones administrativas. |
| `content_versions` | Snapshots inmutables `(entity, entityId, version)`. |

Las tablas de contenido (`courses`, `course_materials`,
`course_announcements`) implementan los campos de control estándar:

```
id · status · createdAt · updatedAt · publishedAt · deletedAt
createdBy · updatedBy · version
```

El borrado es **lógico** (`deletedAt` + estado `archivado`): el historial
y las versiones se conservan siempre.

### Semilla de demostración

```bash
npx tsx src/db/seed.ts
```

Crea las cuentas individuales iniciales, el perfil docente, ajustes del
sitio y contenido de ejemplo (3 asignaturas, 7 materiales, 3 avisos):

| Rol | Correo | Contraseña inicial* |
| --- | --- | --- |
| Administrador | `wilmer@aula.edu` | `Aula#2026` |
| Editor / Ayudante | `ayudante@aula.edu` | `Ayudante#2026` |

\* Cambiar inmediatamente en producción.

---

## 3. Autenticación y roles académicos

- **Cuentas individuales** (`users` + `user_sessions`): se descarta el
  modelo de contraseña compartida. Contraseñas con **scrypt**
  (`src/lib/auth/passwords.ts`) y sesión en cookie `httpOnly` que guarda
  solo el hash SHA-256 del token (`src/lib/auth/session.ts`).
- **Roles verificados en el servidor** — nunca en el cliente:
  - `administrador` (Prof. Wilmer): todo, además cuentas, ajustes y perfil.
  - `editor` (ayudante): gestión de contenidos (cursos, materiales, avisos).
  - Guardas: `requirePageUser()` / `requireActionUser()` con listas de roles.
- **Rutas protegidas** `/admin/*` por dos capas:
  1. `src/proxy.ts` — exige la cookie de sesión (primera barrera, sin DB).
  2. `src/app/admin/(panel)/layout.tsx` — valida la sesión contra la base
     de datos en cada petición (vigencia, revocación, cuenta activa).
  Toda Server Action vuelve a comprobar sesión y rol antes de actuar.

---

## 4. Sistema de auditoría

Helper global en `src/lib/audit.ts`:

```ts
await recordAuditLog({
  actor,                              // quién (id, email, rol)
  action: AUDIT_ACTIONS.MATERIAL_CREATED,
  entity: "course_material",
  entityId: material.id,
  summary: `${actor.fullName} subió «${title}» a ${course.code}`,
  metadata: { courseCode, type },
});
```

Registra automáticamente: **quién** (cuenta + rol), **qué** (acción
catalogada en `AUDIT_ACTIONS`), **sobre qué entidad**, **cuándo**,
**desde qué IP** y **con qué navegador**. La auditoría nunca interrumpe
el flujo principal (fallo aislado con log en consola).

Está integrada en todas las acciones del panel: inicios y cierres de
sesión (incluidos *intentos fallidos*), altas de contenido, cambios de
estado, fijar avisos, gestión de cuentas y ajustes. Se consulta en
`/admin/auditoria` con filtros por entidad.

---

## 5. Módulos docentes (fase 2)

| Módulo | Ruta | Detalle |
| --- | --- | --- |
| Asignaturas | `/admin/cursos` | Creación y **edición completa** (`/admin/cursos/[id]`): niveles **Grado / Máster / Doctorado**, códigos, semestres, créditos, aula principal y **horario semanal** por sesiones, con historial de versiones visible. |
| Repositorio | `/admin/materiales` | Categorías: programas/syllabus, guías de prácticas de laboratorio, ejercicios resueltos, presentaciones, apuntes, guías y enlaces. **Subida individual** y **carga masiva** (hasta 20 archivos/lote). |
| Avisos | `/admin/avisos` | Publicación rápida por asignatura con **tipología** (general, examen, cambio de aula, entrega) y **fecha del evento**. |
| Consultas | `/admin/consultas` | Bandeja de dudas del formulario público con **antispam** (honeypot + trampa temporal + límite por IP hasheada), marcar leída, respuesta interna y archivo. |
| Papelera | `/admin/papelera` | Borrado lógico restaurable (vuelve como borrador) y **purgado definitivo** solo para administradores. |
| Ajustes | `/admin/ajustes` | Perfil (encabezado, **departamento**, despacho, horario, correo institucional) y **colores institucionales** personalizables que tiñen el sitio público. |

### Editor sanitizado y notación académica

`src/lib/rich-text.ts` implementa un mini-lenguaje seguro: el texto se
**escapa por completo antes** de aplicar los patrones permitidos
(`**negrita**`, `*cursiva*`, `__subrayado__`, subíndice `~…~` → H~2~O,
superíndice `^…^` → Ca^2+^, enlaces `[t](url)`, listas y `` `fórmulas` ``),
con vista previa en el editor (`RichTextEditor`). Imposible inyectar HTML.

### Subida de archivos y entrega protegida

- Validación en servidor por **extensión allowlist**, **MIME declarado**,
  **límite 25 MB** y **firma mágica** (%PDF, PK, OLE, PNG, JPEG).
- Driver **Supabase Storage** (bucket privado + **URL firmada de 5 min**)
  si hay credenciales; reserva local en `.storage/` para desarrollo.
- Los archivos **nunca** se enlazan directamente: se sirven por
  `/archivos/[key]`, que exige material **publicado** (público) o sesión
  del aula (borrador/archivado); lo demás responde 404.
- `POST /api/admin/upload` (individual) y `POST /api/admin/materiales/bulk`
  (masiva) requieren sesión activa del aula.

---

## 6. Interfaz pública del estudiante (fase 3)

Sin autenticación, 100% **Server Components** (carga ultrarrápida):

| Ruta | Contenido |
| --- | --- |
| `/` | Presentación del profesor (despacho, horarios de atención, correo institucional), accesos directos a las asignaturas activas, próximas evaluaciones, tablón de avisos, bio y formulario de contacto directo. |
| `/asignaturas` | Listado de materias **agrupadas por nivel** (Grado / Máster / Doctorado) y **subagrupadas por semestre**. |
| `/cursos/[slug]` | Aula pública del curso: información general con **syllabus destacado** (descarga directa), horarios semanales y aula, avisos recientes de la materia y **repositorio descargable** agrupado por categoría. `generateMetadata` por curso + **JSON-LD `Course`** (con `instructor: Person`). Curso en borrador/archivado → 404, nunca indexable. |
| `/agenda` | **Calendario mensual** accesible (tabla con `caption`, `abbr`, navegación `?anio&mes` sin JS) con eventos por tipología (examen, entrega, cambio de aula, general), leyenda, próximas fechas y histórico plegable. |

**SEO e indexación interna:** metadatos base con OpenGraph, `sitemap.xml`
dinámico (solo contenido publicado), `robots.txt` (bloquea `/admin`, `/api`,
`/archivos`), y datos estructurados **Schema.org**: `Person` en el inicio y
`Course` + `CourseInstance` en cada aula.

**Accesibilidad (WCAG):** enlace «Saltar al contenido», landmarks
(`header`/`main`/`footer`/`nav`/`contentinfo`), `aria-current` en la
navegación, foco visible global (`:focus-visible`), `prefers-reduced-motion`,
tablas con `scope`/`abbr`, listas semánticas en repositorios y fechas con
`dateTime` máquina-legible. Diseño **mobile-first** (avisos y descargas de
PDF cómodas en teléfono).

---

## 7. Carga masiva, respaldos y notificaciones (fase 4)

### Transferencia de estructuras (`/admin/transferencia`, solo Administrador)

- **Exportar** `/api/admin/export/cursos?formato=json|csv` — la estructura
  completa de asignaturas (con materiales, avisos y metadatos de archivos)
  en el formato canónico `aula-docente/cursos` v1, o CSV plano (separador
  `;`, compatible con Excel es-ES). Ambas descargas se firman en la bitácora.
- **Importar** con asistente en 3 pasos *(archivo → vista previa → resultado)*:
  validación total antes de escribir (formato, enums, horarios, duplicados
  por código, máx. 512 KB), remapeo opcional de período, e inclusión
  opcional de materiales y avisos. Todo entra como **borrador** con sus
  versiones iniciales y la firma `importacion.cursos`.
- **Respaldo completo** `/api/admin/export/respaldo` — todas las tablas
  (contenido, ajustes, consultas, versiones, bitácora y cuentas con sus
  hashes scrypt, marcado como sensible) + metadatos de los archivos.

### Notificaciones por correo (Resend)

- Cliente de servidor en `src/lib/email/resend.ts` (API REST de Resend,
  sin SDK). Claves **solo de entorno**: `RESEND_API_KEY`, `RESEND_FROM`.
- **Alerta automática** al profesor ante cada consulta estudiantil recibida
  en la web (nombre, correo, asignatura, mensaje y enlace directo a la
  bandeja). Destinatario editable en Ajustes (`notify_email`).
- Resultado del envío (`enviada` / `simulada` / `fallida`) anotado en los
  metadatos del evento `consulta.recibida` de la bitácora.
- Sin `RESEND_API_KEY` el sistema opera en **modo simulado** (registra los
  envíos en consola) — la integración se activa con una sola variable.
- Tarjeta «Notificaciones por correo» en Ajustes con estado del servicio y
  botón **«Enviar correo de prueba»** (firmado como `notificacion.prueba`).

---

## 8. Pruebas E2E (Playwright) y seguridad

Suite en `./e2e/` (11 tests, un solo trabajador, datos aislados por marca
`E2E-*` y limpieza total en el teardown):

```bash
npm run build && npx playwright install chromium   # una vez
npx playwright test                                 # local (arranca solo)
PLAYWRIGHT_BASE_URL=https://tu-sitio npx playwright test   # contra producción
```

- **`admin-content.spec.ts`** — crítico: login del profesor por la UI +
  validación de **cookie segura** (`httpOnly`, `SameSite=Lax`, `Secure`
  bajo HTTPS, `path=/`) → crear curso → **subir PDF de guía de laboratorio**
  → publicar → verificar visualización **y descarga pública inmediata**
  (`200`, `application/pdf`, bytes `%PDF`).
- **`student-contact.spec.ts`** — consulta del estudiante → bandeja del
  panel (estado `nuevo`), **honeypot con éxito silencioso sin persistir** y
  formulario vacío bloqueado por validación nativa.
- **`security.spec.ts`** — robustez: archivos **>25 MB → 422**, extensión no
  permitida → 422, **firma mágica falsa → 422**, subida vacía → 400; panel
  redirige al login (307), APIs administrativas → **401** anónimas, archivo
  en borrador **404 público / 200 con sesión** y traversal bloqueado.

> La suite detectó y guió la corrección de un fallo real: las Server
> Actions fallaban en producción por exportaciones no-async en módulos
> `use server` (resuelto moviendo constantes a módulos puros).

**Control de buckets (Supabase Storage):** el bucket `materiales` debe ser
**privado** (sin políticas públicas de lectura/escritura). La app usa solo
la `SUPABASE_SERVICE_ROLE_KEY` en el servidor y entrega **siempre** por
`/archivos/[key]` con URLs firmadas de 5 minutos y verificación de estado
del material: ningún cliente recibe enlaces directos al bucket.

---

## 9. Despliegue en producción (Vercel + Supabase + Resend)

### 9.1 Repositorio privado en GitHub

```bash
git init && git add -A && git commit -m "Aula docente — versión inicial"
gh repo create aula-docente --private --source=. --push
```

La CI (`.github/workflows/ci.yml`) corre lint, TypeScript, migraciones y
build en cada push.

### 9.2 Base de datos en Supabase

1. Crea el proyecto en [supabase.com](https://supabase.com).
2. En **Project Settings → Database → Connection String** copia la URI del
   *pooler* (`:6543`) y ponla como `DATABASE_URL` en Vercel.
3. Aplica el esquema desde tu máquina:
   `DATABASE_URL=<pooler> npx drizzle-kit migrate` y (opcional)
   `DATABASE_URL=<pooler> npx tsx src/db/seed.ts` para las cuentas iniciales.
4. **Storage**: crea el bucket `materiales` como **privado** (sin políticas
   RLS públicas). Copia la URL del proyecto y la *service-role key*.

### 9.3 Coro de notificaciones (Resend)

1. Verifica tu dominio en [resend.com](https://resend.com) y crea una API key.
2. Configura `RESEND_API_KEY` y `RESEND_FROM`
   (`Aula Docente <notificaciones@tudominio.edu>`) en Vercel.
3. En Ajustes del panel, define el *Correo para alertas* y pulsa
   **«Enviar correo de prueba»** para validar.

### 9.4 Proyecto en Vercel

1. **New Project → Import** el repo privado (Framework: Next.js, sin cambios).
2. Variables de entorno:

| Variable | Valor |
| --- | --- |
| `DATABASE_URL` | URI del pooler de Supabase (`?pgbouncer=true` opcional) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | service-role (secreta, solo servidor) |
| `SUPABASE_STORAGE_BUCKET` | `materiales` |
| `RESEND_API_KEY` | `re_…` |
| `RESEND_FROM` | remitente verificado |
| `NEXT_PUBLIC_SITE_URL` | URL pública final (SEO + enlaces en correos) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key (reservada para futuras fases) |

3. Deploy → verifica `/api/health` y ejecuta la suite:
   `PLAYWRIGHT_BASE_URL=<url> npx playwright test`.

### 9.5 Mantenimiento (para el profesor)

- **Cambie las contraseñas de semilla** desde Cuentas al primer acceso.
- Respaldos periódicos: *Carga y respaldos → Respaldo completo* (JSON firmado).
- Migraciones del esquema: `DATABASE_URL=<pooler> npx drizzle-kit migrate`.
- Supervisión: `/admin/auditoria` (accesos, cambios, spam, exportaciones).
- Si el Storage de Supabase no está configurado, la app usa automáticamente
  almacenamiento local (`.storage/`): requiere filesystem persistente, por
  lo que en Vercel **Supabase Storage es obligatorio** para archivos.

### 9.6 Flujo 100 % en la nube (GitHub Codespaces)

El proyecto incluye `.devcontainer/devcontainer.json`: al crear un
**Codespace** desde el repo (botón **Code → Codespaces → Create**), GitHub
abre un VS Code en el navegador con Node 20, dependencias instaladas
(`npm ci` automático) y el puerto 3000 redirigido. Desde esa terminal se
ejecutan —sin instalar nada en tu computadora— los comandos del
despliegue: `drizzle-kit migrate`, `tsx src/db/seed.ts`, `npm run build`
y la suite `PLAYWRIGHT_BASE_URL=<url> npx playwright test` contra
producción. Recuerda hacer `git push` de cualquier cambio: los Codespaces
se pausan por inactividad y se eliminan tras el periodo de retención.
