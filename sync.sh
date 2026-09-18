#!/usr/bin/env bash
# =============================================================================
#  Aula Docente · sync.sh — sincroniza GitHub ⇄ Codespace y aplica los cambios
#
#  Uso:
#     bash sync.sh                  → DESCARGA de GitHub y APLICA:
#                                     pull + reinstala deps si cambiaron
#                                     + reinicia el servidor (5173)
#     bash sync.sh push "mensaje"   → SUBE tus ediciones:
#                                     add -A + commit + pull --rebase + push
#                                     (Vercel redespliega solo al llegar el push)
#     bash sync.sh server           → solo reinicia el dev server
#
#  Diseñado para GitHub Codespaces (git ya autenticado). Nunca necesitas
#  git init ni configurar remotes.
# =============================================================================
set -euo pipefail
cd "$(dirname "$0")"

CYAN='\033[0;36m'; VIOLET='\033[0;35m'; GREEN='\033[0;32m'
AMBER='\033[0;33m'; RED='\033[0;31m'; BOLD='\033[1m'; RESET='\033[0m'

step() { echo -e "${VIOLET}▸${RESET} ${BOLD}$1${RESET}"; }
ok()   { echo -e "${GREEN}✔${RESET} $1"; }
warn() { echo -e "${AMBER}⚠${RESET} $1"; }
die()  { echo -e "${RED}✖${RESET} $1"; exit 1; }

banner() {
  echo -e "${CYAN}┌──────────────────────────────────────────┐"
  echo -e "│      ⚗  SYNC · GITHUB ⇄ CODESPACE         │"
  echo -e "└──────────────────────────────────────────┘${RESET}"
}

check_repo() {
  git rev-parse --git-dir >/dev/null 2>&1 || \
    die "Esto no es un repositorio git. En un Codespace no necesitas clonar: créalo desde el botón Code → Codespaces."
}

current_branch() { git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main"; }
dirty() { [ -n "$(git status --porcelain)" ]; }

# nvm por si la shell no es de login (imagen universal de Codespaces)
load_nvm() {
  export NVM_DIR="${NVM_DIR:-/usr/local/share/nvm}"
  # shellcheck disable=SC1091
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" || true
}

ensure_deps() {
  load_nvm
  if [ ! -d node_modules ]; then
    step "node_modules ausente → instalando dependencias…"
    npm install --no-audit --no-fund
    ok "Dependencias instaladas"
  fi
}

# ---------------------------------------------------------------- DESCARGAR
do_pull() {
  local branch stash_note=""
  branch="$(current_branch)"
  PREV="$(git rev-parse HEAD)"

  step "Descargando refs de GitHub (origin/${branch})…"
  git fetch origin >/dev/null 2>&1 || die "git fetch falló — ¿tienes la sesión de GitHub activa en este Codespace?"

  if dirty; then
    warn "Tienes cambios locales sin guardar → los protejo con stash"
    gistamp="$(date +%H:%M:%S)"
    git stash push -u -m "sync autoguardado $gistamp" >/dev/null
    stash_note=" └── re-aplico tu stash al final"
  fi

  step "Aplicando cambios (rebase)…"
  if ! git pull --rebase origin "$branch"; then
    git rebase --abort >/dev/null 2>&1 || true
    if [ -n "$stash_note" ]; then
      warn "Hay conflicto. Tus cambios quedan a salvo en: git stash list"
      git stash pop || die "Resolución manual necesaria: edita los archivos marcados y vuelve a ejecutar."
    else
      die "Hay conflicto con el remoto. Resuelve con: git pull --rebase, edita conflictos, git rebase --continue"
    fi
  fi

  if [ -n "$stash_note" ]; then
    git stash pop >/dev/null 2>&1 || die "Conflicto al re-aplicar tu stash: resuélvelo en el editor y continúa."
  fi

  local NEW
  NEW="$(git rev-parse HEAD)"
  if [ "$PREV" = "$NEW" ]; then
    ok "Ya estabas al día con GitHub"
  else
    ok "Aplicados commits: $(git rev-list --count "$PREV".."$NEW")"
    git --no-pager log --oneline --no-decorate "$PREV".."$NEW" | sed 's/^/     · /'
    # ¿cambiaron las dependencias?
    if git diff --name-only "$PREV" "$NEW" | grep -Eq '^package(-lock)?\.json$|^package\.json$'; then
      step "Cambiaron las dependencias → reinstalando…"
      npm install --no-audit --no-fund
      ok "Dependencias al día"
    fi
  fi
}

# ---------------------------------------------------------------- SERVIDOR
do_server() {
  ensure_deps
  step "Reiniciando servidor de desarrollo…"
  pkill -f "vite.*5173" >/dev/null 2>&1 || true
  pkill -f "node.*vite" >/dev/null 2>&1 || true
  sleep 1
  nohup npx vite --host 0.0.0.0 --port 5173 --strictPort >/tmp/aula-vite.log 2>&1 &

  for _ in 1 2 3 4 5 6; do
    sleep 2
    curl -sf --max-time 2 http://localhost:5173 >/dev/null 2>&1 && break
  done

  if curl -sf --max-time 3 http://localhost:5173 >/dev/null 2>&1; then
    echo ""
    echo -e "  ${GREEN}➜${RESET} ${BOLD}Cambios aplicados y servidos en${RESET} http://localhost:5173"
    echo -e "  ${GREEN}➜${RESET} En Codespaces: pestaña ${BOLD}PUERTOS${RESET} → 5173 → icono del globo 🌐"
    echo -e "  ${GREEN}➜${RESET} Logs del servidor: tail -f /tmp/aula-vite.log"
  else
    warn "El servidor tarda en responder — mira: tail -f /tmp/aula-vite.log"
  fi
}

# ---------------------------------------------------------------- SUBIR
do_push() {
  local branch msg="${1:-}"
  branch="$(current_branch)"
  check_repo

  if dirty; then
    step "Preparando commit con tus ediciones…"
    git add -A
    msg="${msg:-Update desde Codespace ($(date '+%d %b %H:%M'))}"
    git commit -m "$msg"
    ok "Commit creado: $msg"
  else
    warn "No hay cambios nuevos que commitear"
  fi

  step "Alineando con GitHub antes de subir…"
  git pull --rebase origin "$branch" >/dev/null 2>&1 || \
    die "Conflicto al rebasear. Resuelve en el editor y ejecuta de nuevo: git rebase --continue"

  step "Subiendo a origin/${branch}…"
  if git push 2>/dev/null; then
    ok "Push completado — Vercel ya está construyendo tu nueva versión 🚀"
  else
    if ! command -v git-lfs >/dev/null 2>&1; then
      warn "Falta git-lfs (hook pre-push del repo) → reintento con --no-verify"
      git push --no-verify || die "El push falló incluso con --no-verify (¿permisos del repo?)"
      ok "Push completado (sin verificación de hooks)"
    else
      die "Push rechazado por GitHub. Revisa el mensaje de error de arriba."
    fi
  fi
}

# ---------------------------------------------------------------- MENÚ
CMD="${1:-sync}"
case "$CMD" in
  sync|pull|apply)
    banner
    check_repo
    do_pull
    do_server
    echo -e "\n${GREEN}✔ SINCRONIZADO: GitHub descargado + cambios aplicados en el 5173${RESET}\n"
    ;;
  push)
    banner
    do_push "${2:-}"
    ;;
  server)
    banner
    do_server
    ;;
  *)
    echo "Uso: bash sync.sh [sync|push \"mensaje\"|server]"
    exit 1
    ;;
esac
