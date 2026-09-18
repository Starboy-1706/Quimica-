# 🚀 Guía de despliegue desde cero — Aula Docente Glass

Checklist definitiva para publicar este proyecto en un **repositorio nuevo**
con despliegue automático en Vercel. Sin variables de entorno, sin backend,
sin Resend: frontend 100 % estático.

---

## 1 · Sube el proyecto al repo nuevo

1. Crea el repo en <https://github.com/new> → nombre `aula-docente-glass`
   → **sin** marcar README / .gitignore / licencia (repo vacío).
2. En la página del repo vacío: **"uploading an existing file"**.
3. Arrastra **la carpeta completa del proyecto** — incluyendo las carpetas
   ocultas `.github/` y `.devcontainer/`*
   - Windows: *Ver → Mostrar elementos ocultos*
   - macOS: `Cmd + Shift + .` para ver los ocultos
4. Commit directo a `main`.

### Verificación rápida del contenido

En la portada del repo deben verse:

```
📁 .devcontainer/      📁 .github/workflows/   📁 public/images/
📁 src/                📄 index.html           📄 package.json
📄 vite.config.ts      📄 tsconfig.json        📄 vercel.json
📄 start.sh · sync.sh · README.md · DEPLOY.md
```

## 2 · Codespace del repo nuevo

Repo → **Code → Codespaces → Create codespace on main**.
La imagen universal se provisiona sola, instala dependencias y arranca el
dev server en el puerto **5173** (pestaña PUERTOS → globo 🌐).

## 3 · Vercel

**Vía dashboard:** <https://vercel.com/new> → si el repo no aparece, pulsa
**Adjust GitHub App Permissions** y dale acceso → **Import** → **Deploy**
(no toques nada: `vercel.json` ya fija Vite → `npm run build` → `dist`).

**Vía CLI (desde el codespace):**
```bash
npx vercel login
npx vercel --prod   # → Y · N · nombre · ./
```

## 4 · Flujo diario

```bash
bash sync.sh               # descargar cambios y verlos en el 5173
bash sync.sh push "…"      # subir ediciones → Vercel redespliega en ~1 min
```

## 5 · Integración continua

`.github/workflows/ci.yml` compila y typecheckea cada push a `main`,
subiendo `dist/` como artefacto.
