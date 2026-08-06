#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/projects/sait-mls9990777"
REPO_URL="https://github.com/SiteCraftorCPP/sait-mls9990777.git"
SERVICE_NAME="sait-mls9990777"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Запускайте от root: sudo bash deploy/install-vps.sh"
  exit 1
fi

if [[ ! -d "${APP_DIR}/.git" ]]; then
  mkdir -p "${APP_DIR}"
  git clone "${REPO_URL}" "${APP_DIR}"
fi

cd "${APP_DIR}"
git pull --ff-only

if ! command -v python3 >/dev/null 2>&1; then
  apt-get update
  apt-get install -y python3 python3-venv python3-pip git
fi

python3 -m venv .venv
.venv/bin/pip install --upgrade pip
.venv/bin/pip install -r requirements.txt

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Создан ${APP_DIR}/.env — заполните SITE_URL и YOOKASSA_SECRET_KEY"
fi

cp deploy/sait-mls9990777.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable "${SERVICE_NAME}"
systemctl restart "${SERVICE_NAME}"

echo "Статус: $(systemctl is-active ${SERVICE_NAME})"
echo "Проверка: curl -s http://127.0.0.1:8090/api/health"
