from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_KEY: str
    GROQ_API_KEY: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    class Config:
        env_file = ".env"


settings = Settings()