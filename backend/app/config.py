"""
Central configuration, loaded from environment variables (see .env.example).
Using pydantic-settings means bad/missing config fails fast at startup
instead of causing confusing errors later.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./app.db"
    secret_key: str = "dev-only-insecure-secret-change-me"
    reset_token_secret: str = "dev-only-change-me-too"
    access_token_expire_minutes: int = 120
    admin_email: str = "architect@example.com"
    admin_password: str = "change-me-please"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    upload_dir: str = "uploads"
    resend_api_key: str = ""
    resend_from_email: str = "onboarding@resend.dev"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
