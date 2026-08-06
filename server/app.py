from __future__ import annotations

import logging
from pathlib import Path

import aiohttp
from aiohttp import web

from server.config import Settings
from server.yookassa_client import YooKassaClient

ROOT_DIR = Path(__file__).resolve().parent.parent
STATIC_DIRS = ("css", "js", "images")


def create_app(settings: Settings) -> web.Application:
    app = web.Application()
    yookassa = YooKassaClient(settings)

    async def create_payment(request: web.Request) -> web.Response:
        try:
            async with aiohttp.ClientSession() as session:
                confirmation_url = await yookassa.create_payment(session)
            return web.json_response({"confirmation_url": confirmation_url})
        except Exception:
            logging.exception("create_payment failed")
            return web.json_response(
                {"error": "payment_unavailable"},
                status=500,
            )

    async def payment_webhook(request: web.Request) -> web.Response:
        if request.method == "GET":
            return web.Response(text="ok")
        try:
            payload = await request.json()
        except Exception:
            return web.Response(status=400, text="bad json")
        event = str(payload.get("event") or "")
        logging.info("YooKassa webhook: %s", event)
        return web.Response(text="ok")

    async def health(_: web.Request) -> web.Response:
        return web.json_response({"status": "ok"})

    app.router.add_post("/api/payments/create", create_payment)
    app.router.add_route("*", "/api/payments/webhook", payment_webhook)
    app.router.add_get("/api/health", health)

    # Статика только для публичных файлов — без листинга корня.
    for folder in STATIC_DIRS:
        path = ROOT_DIR / folder
        if path.is_dir():
            app.router.add_static(f"/{folder}", path, show_index=False)

    static_files = [
        "index.html",
        "success.html",
        "favicon.ico",
        "favicon.svg",
        "favicon-16x16.png",
        "favicon-32x32.png",
        "favicon-512x512.png",
        "apple-touch-icon.png",
    ]
    for name in static_files:
        file_path = ROOT_DIR / name
        if not file_path.is_file():
            continue

        async def file_handler(_: web.Request, path: Path = file_path) -> web.FileResponse:
            return web.FileResponse(path)

        if name == "index.html":
            app.router.add_get("/", file_handler)
        app.router.add_get(f"/{name}", file_handler)

    return app


def main() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(message)s",
    )
    settings = Settings.from_env()
    app = create_app(settings)
    logging.info("Site server on %s:%s", settings.app_host, settings.app_port)
    web.run_app(app, host=settings.app_host, port=settings.app_port)


if __name__ == "__main__":
    main()
