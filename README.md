# Сайт курса Юли

Статический лендинг + сервер оплаты ЮKassa (отдельно от Telegram-бота).

## Оплата

Используются **Shop ID** и **Secret Key** из личного кабинета ЮKassa — тот же магазин, что и для бота, но **не** `PAYMENT_PROVIDER_TOKEN` из BotFather.

1. Скопируйте `.env.example` → `.env`
2. Заполните `SITE_URL`, `YOOKASSA_SECRET_KEY`
3. В ЮKassa → **Интеграция → HTTP-уведомления** укажите:
   `https://ВАШ-ДОМЕН/api/payments/webhook`
4. Запуск локально:

```bash
python -m venv .venv
.venv/Scripts/pip install -r requirements.txt   # Windows
cp .env.example .env
python -m server.app
```

Кнопки «Оплатить» вызывают `POST /api/payments/create` и редирект на страницу ЮKassa.

## VPS (отдельная папка, не бот)

```bash
cd /opt/projects/sait-mls9990777
bash deploy/install-vps.sh
```

Бот: `/var/www/tgbot-mls9990777` — не трогается.

Домен: `https://jushvili.site` — nginx проксирует на порт `8090`.
