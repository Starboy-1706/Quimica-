#!/usr/bin/env bash
# =============================================================================
#  Aula Docente · Química — Script único de arranque
#  Toda la lógica vive AQUÍ (raíz del repo). Funciona con o sin .devcontainer.
#
#  Uso:
#     bash start.sh            → instala (si falta) + servidor de desarrollo
#     bash start.sh setup      → instalar + verificar
#     bash start.sh build      → build de producción en ./dist
#     bash start.sh preview    → previsualizar el build (puerto 4173)
#     bash start.sh all        → setup + build + dev
#     bash start.sh autostart  → arranque en segundo plano (uso devcontainer)
# =============================================================================
set -euo pipefail
cd "$(dirname "$0")"

CYAN='\033[0;36m'
VIOLET='\033[0;35m'
GREEN='\033[0;32m'
AMBER='\033[0;33m'
BOLD='\033[1m'
RESET='\033[0m'

banner() {
  echo -e "${CYAN}"
  echo "   ┌───────────────────────────────────────────────┐"
  echo "   │   ⚗  AULA DOCENTE · QUÍMICA · GLASSMORPHISM   │"
  echo "   │   Codespaces · React 19 + Vite 7 + Tailwind 4 │"
  echo "   └───────────────────────────────────────────────┘"
  echo -e "${RESET}"
}

step() { echo -e "${VIOLET}▸${RESET} ${BOLD}$1${RESET}"; }
ok()   { echo -e "${GREEN}✔${RESET} $1"; }
warn() { echo -e "${AMBER}⚠${RESET} $1"; }

require_node() {
  # nvm (imagen por defecto de Codespaces) puede no cargarse en shells no-login
  export NVM_DIR="${NVM_DIR:-/usr/local/share/nvm}"
  # shellcheck disable=SC1091
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" || true

  if ! command -v node >/dev/null 2>&1; then
    echo "Node.js no encontrado. La imagen por defecto de Codespaces lo incluye vía nvm."
    exit 1
  fi

  # Vite 7 exige Node ^20.19 o >=22.12
  local major minor
  major=$(node -p 'process.versions.node.split(".")[0]')
  minor=$(node -p 'process.versions.node.split(".")[1]')
  if [ "$major" -lt 20 ] || { [ "$major" -eq 20 ] && [ "$minor" -lt 19 ]; } || { [ "$major" -eq 22 ] && [ "$minor" -lt 12 ]; }; then
    if command -v nvm >/dev/null 2>&1; then
      step "Node $(node -v) es insuficiente para Vite 7 → subiendo a Node 20 LTS…"
      nvm install 20 >/dev/null 2>&1 && nvm alias default 20 >/dev/null 2>&1 || true
    fi
  fi

  ok "Node $(node -v) · npm $(npm -v)"

  # hooks LFS del repo requieren el binario git-lfs (la imagen universal lo trae)
  if command -v git-lfs >/dev/null 2>&1 && [ -d .git ]; then
    git lfs install --local >/dev/null 2>&1 || true
  fi
}

install_deps() {
  if [ -d node_modules ]; then
    ok "Dependencias ya instaladas"
    return 0
  fi
  step "Instalando dependencias…"
  if [ -f package-lock.json ]; then
    npm ci --no-audit --no-fund && ok "Dependencias instaladas (npm ci)"
  else
    npm install --no-audit --no-fund && ok "Dependencias instaladas (npm install)"
  fi
}

type_check() {
  step "Verificando TypeScript…"
  if npx tsc --noEmit 2>/dev/null; then
    ok "TypeScript sin errores"
  else
    warn "TypeScript reportó avisos (no bloquean el dev server)"
  fi
}

build_app() {
  step "Compilando producción…"
  npm run build
  ok "Build listo en ./dist (single-file inline)"
}

run_dev() {
  echo ""
  echo -e "${CYAN}${BOLD}  Servidor de desarrollo arrancando…${RESET}"
  echo -e "  ${GREEN}➜${RESET} Local:      http://localhost:5173"
  echo -e "  ${GREEN}➜${RESET} Codespaces: pestaña ${BOLD}PUERTOS${RESET} → puerto ${BOLD}5173${RESET} → icono del globo"
  echo ""
  exec npx vite --host 0.0.0.0 --port 5173 --strictPort
}

run_preview() {
  [ -d dist ] || build_app
  echo -e "  ${GREEN}➜${RESET} Preview del build en puerto ${BOLD}4173${RESET}"
  exec npx vite preview --host 0.0.0.0 --port 4173 --strictPort
}

autostart() {
  require_node
  install_deps
  if curl -sf --max-time 2 http://localhost:5173 >/dev/null 2>&1; then
    ok "El servidor ya está en marcha → http://localhost:5173"
    return 0
  fi
  step "Arrancando Vite en segundo plano…"
  nohup npx vite --host 0.0.0.0 --port 5173 --strictPort >/tmp/aula-vite.log 2>&1 &
  sleep 4 || true
  if curl -sf --max-time 3 http://localhost:5173 >/dev/null 2>&1; then
    ok "Servidor activo → pestaña PUERTOS → 5173 → globo. Logs: tail -f /tmp/aula-vite.log"
  else
    warn "Todavía arrancando… revisa con: tail -f /tmp/aula-vite.log"
  fi
}

CMD="${1:-dev}"
banner
case "$CMD" in
  autostart) autostart ;;
  setup)     require_node; install_deps; type_check ;;
  dev)       require_node; install_deps; run_dev ;;
  build)     require_node; install_deps; build_app ;;
  preview)   require_node; install_deps; run_preview ;;
  all)       require_node; install_deps; type_check; build_app; run_dev ;;
  *)
    echo "Comando desconocido: $CMD"
    echo "Uso: bash start.sh [autostart|setup|dev|build|preview|all]"
    exit 1
    ;;
esac
