# Aula Docente · Prof. Wilmer — Química

Interfaz **glassmorphism** del aula docente de Química: asignaturas, repositorio de materiales, tablón de avisos, agenda académica interactiva y contacto — construida con **React 19 · Vite 7 · Tailwind CSS v4 · Framer Motion**.

---

> **Repo limpio desde cero.** Publicación: sube esta carpeta completa a un
> repositorio nuevo en GitHub (arrastrándola entera, incluidas las carpetas
> ocultas `.devcontainer/` y `.github/`), crea un codespace y despliega en
> Vercel. Sin variables de entorno, sin backend: frontend 100 % estático.

## ⚡ Inicio rápido en GitHub Codespaces — cero comandos

1. En el repositorio, pulsa **Code → Codespaces → Create codespace on main**.
2. **Eso es todo.** El contenedor instala las dependencias solo y arranca el
   servidor de desarrollo automáticamente al abrirse el editor.
3. La vista previa se abre en el **puerto 5173** por sí misma
   (o pestaña **PUERTOS** → icono del globo 🌐).

> Logs del servidor: `tail -f /tmp/aula-vite.log`

## 🧪 Comandos manuales (opcionales)

| Comando                                   | Qué hace                                                          |
| ----------------------------------------- | ----------------------------------------------------------------- |
| `bash sync.sh`                            | **Descarga de GitHub y aplica**: pull + deps + reinicia el 5173   |
| `bash sync.sh push "mensaje"`             | **Sube tus ediciones**: add + commit + pull --rebase + push       |
| `bash sync.sh server`                     | Solo reinicia el servidor de desarrollo                            |
| `bash start.sh`                           | Instala + build + dev, todo de una vez                             |
| `bash .devcontainer/codespace.sh setup`   | Instala dependencias + chequeo de TypeScript                       |
| `bash .devcontainer/codespace.sh build`   | Build de producción en `./dist`                                    |
| `bash .devcontainer/codespace.sh preview` | Previsualiza el build (puerto 4173)                                |

> Con **Vercel conectado**, `bash sync.sh push "…"` dispara también el
> redespliegue automático en producción (~1 min).

## 💻 En local

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # producción → dist/
```

## 🔁 Integración continua

Cada `push` o Pull Request a `main` ejecuta `.github/workflows/ci.yml`:
instalación limpia → chequeo de TypeScript → build de producción,
y sube `dist/` como artefacto descargable durante 14 días.

## 🚀 Despliegue en Vercel

El repo ya incluye `vercel.json` (framework Vite, build a `dist`, rewrites SPA,
caché inmutable de imágenes y cabeceras de seguridad). No hay variables de
entorno: el frontend es 100 % estático.

**Opción A · Integración con GitHub (recomendada, sin terminal)**
1. Entra en <https://vercel.com/new> e inicia sesión con GitHub.
2. **Import Git Repository** → tu repo `aula-docente-glass` (autoriza el acceso).
3. Vercel detecta **Vite** automáticamente: `npm run build` → `dist`. Pulsa **Deploy**.
4. Listo: cada `git push` a `main` = despliegue automático nuevo
   (y cada Pull Request genera su preview).

**Opción B · CLI desde el Codespace (sin subir archivos)**
```bash
npx vercel login      # se autoriza en el navegador
npx vercel --prod     # despliegue directo a producción
```
La CLI lee `vercel.json` automáticamente y sube el build creado al momento.

Dominio final editable en *Project Settings → Domains*
(por defecto: `quimica-<hash>.vercel.app`).

## 🛠️ Solución de problemas

**El codespace abre en "recovery mode" (container error) — solución solo-terminal**
```bash
rm -rf .devcontainer
git add -A && git commit -m "fix: usa la imagen por defecto de Codespaces"
git push --no-verify
```
Sin `devcontainer.json`, Codespaces usa su **imagen universal oficial**
(compatible al 100 %, incluye git-lfs y Node vía nvm). Después:
`Cmd/Ctrl + Shift + P` → **"Codespaces: Rebuild Container"** y, al arrancar:
`bash start.sh` (el script raíz es autónomo: instala y sirve en el 5173).
Si prefieres, bórralo en <https://github.com/codespaces> y crea uno nuevo:
ya no hay config rota en el repo, así que saldrá bien a la primera.

**Git dentro de un Codespace**
- **Nunca ejecutes `git init` ni `git remote add`**: el codespace ya ES el
  repositorio clonado con tu sesión autenticada. Solo `git add`, `git commit`,
  `git push`.
- Si el push se queja por el hook de **Git LFS** (repo configurado para LFS
  pero contenedor sin el binario), primero guarda tu trabajo con
  `git push --no-verify` y, tras reconstruir el contenedor, `git lfs install`
  ya quedará disponible.

> El build es un único `index.html` autocontenido (vía `vite-plugin-singlefile`):
> sirve `dist/index.html` en cualquier hosting estático.

## 🗂️ Estructura

```
src/
├── components/
│   ├── Background.tsx      # auroras + red molecular en canvas (reacciona al cursor)
│   ├── Navbar.tsx          # barra flotante de cristal con menú móvil
│   ├── Hero.tsx            # titular + tarjetas de la tabla periódica flotantes
│   ├── Courses.tsx         # asignaturas por nivel (Grado / Máster / Doctorado)
│   ├── Materials.tsx       # repositorio con filtros animados
│   ├── Announcements.tsx   # tablón de avisos con tipología
│   ├── Agenda.tsx          # calendario mensual interactivo
│   ├── Professor.tsx       # perfil del profesor
│   ├── Contact.tsx         # formulario con antispam
│   └── Footer.tsx
├── data/content.ts         # cursos, materiales, avisos, eventos y perfil
└── App.tsx

.devcontainer/
├── devcontainer.json       # Node 20 · puertos 5173/4173 · extensiones VS Code
└── codespace.sh            # script de arranque (setup · dev · build · preview)
```
