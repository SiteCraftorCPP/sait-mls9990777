from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / ".env")


@dataclass(frozen=True)
class Settings:
    site_url: str
    shop_id: str
    secret_key: str
    course_price: str
    tax_system_code: int
    vat_code: int
    course_channel_url: str
    app_host: str
    app_port: int

    @classmethod
    def from_env(cls) -> "Settings":
        site_url = os.getenv("SITE_URL", "").strip().rstrip("/")
        shop_id = os.getenv("YOOKASSA_SHOP_ID", "").strip()
        secret_key = os.getenv("YOOKASSA_SECRET_KEY", "").strip()
        if not site_url:
            raise RuntimeError("SITE_URL is not set")
        if not shop_id or not secret_key:
            raise RuntimeError("YOOKASSA_SHOP_ID / YOOKASSA_SECRET_KEY are not set")
        return cls(
            site_url=site_url,
            shop_id=shop_id,
            secret_key=secret_key,
            course_price=os.getenv("COURSE_PRICE", "1990.00").strip(),
            tax_system_code=int(os.getenv("YOOKASSA_TAX_SYSTEM_CODE", "2") or "2"),
            vat_code=int(os.getenv("YOOKASSA_VAT_CODE", "1") or "1"),
            course_channel_url=os.getenv(
                "COURSE_CHANNEL_URL",
                "https://t.me/+0tTS-z-oXqo3NWIy",
            ).strip(),
            app_host=os.getenv("APP_HOST", "127.0.0.1").strip(),
            app_port=int(os.getenv("APP_PORT", "8090")),
        )
