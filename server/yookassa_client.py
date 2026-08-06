from __future__ import annotations

import base64
import logging
import os

import aiohttp

from server.config import Settings


class YooKassaClient:
    API_URL = "https://api.yookassa.ru/v3/payments"

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        token = base64.b64encode(
            f"{settings.shop_id}:{settings.secret_key}".encode()
        ).decode()
        self._auth_header = f"Basic {token}"

    def _receipt(self) -> dict:
        price = self.settings.course_price
        return {
            "tax_system_code": self.settings.tax_system_code,
            "items": [
                {
                    "description": "Доступ к онлайн-курсу",
                    "quantity": "1.00",
                    "amount": {"value": price, "currency": "RUB"},
                    "vat_code": self.settings.vat_code,
                    "payment_mode": "full_payment",
                    "payment_subject": "service",
                }
            ],
        }

    async def create_payment(self, session: aiohttp.ClientSession) -> str:
        payload = {
            "amount": {"value": self.settings.course_price, "currency": "RUB"},
            "confirmation": {
                "type": "redirect",
                "return_url": f"{self.settings.site_url}/success.html",
            },
            "capture": True,
            "description": "Доступ к онлайн-курсу",
            "receipt": self._receipt(),
        }
        async with session.post(
            self.API_URL,
            json=payload,
            headers={
                "Authorization": self._auth_header,
                "Content-Type": "application/json",
                "Idempotence-Key": os.urandom(16).hex(),
            },
        ) as response:
            body = await response.json(content_type=None)
            if response.status >= 400:
                logging.error("YooKassa error %s: %s", response.status, body)
                raise RuntimeError("yookassa_create_failed")
            confirmation = body.get("confirmation") or {}
            url = confirmation.get("confirmation_url")
            if not url:
                raise RuntimeError("yookassa_no_confirmation_url")
            return str(url)
