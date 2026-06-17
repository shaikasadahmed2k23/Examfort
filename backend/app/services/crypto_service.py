import base64
from datetime import datetime, timezone
from cryptography.fernet import Fernet


def generate_key() -> bytes:
    """Generates a fresh symmetric encryption key for a single paper."""
    return Fernet.generate_key()


def encrypt_paper(content: str, key: bytes) -> str:
    """Encrypts paper content using the given key. Returns base64 ciphertext string."""
    f = Fernet(key)
    encrypted = f.encrypt(content.encode())
    return encrypted.decode()


def decrypt_paper(encrypted_content: str, key: bytes) -> str:
    """Decrypts paper content using the given key."""
    f = Fernet(key)
    decrypted = f.decrypt(encrypted_content.encode())
    return decrypted.decode()


def is_unlock_time_reached(unlock_time: datetime) -> bool:
    """
    Time-gate check: only allow decryption key release after unlock_time.

    unlock_time may arrive as either timezone-aware (e.g. parsed from an
    ISO string ending in 'Z' or '+00:00') or timezone-naive (no tzinfo).
    We normalize both sides to aware UTC before comparing, since Python
    raises a TypeError if you compare aware and naive datetimes directly.
    """
    now_utc = datetime.now(timezone.utc)

    if unlock_time.tzinfo is None:
        # Naive datetime: assume it represents UTC already
        unlock_time = unlock_time.replace(tzinfo=timezone.utc)
    else:
        unlock_time = unlock_time.astimezone(timezone.utc)

    return now_utc >= unlock_time


def encode_key_for_storage(key: bytes) -> str:
    """Store key as base64 string in DB (the key itself should be stored
    encrypted-at-rest by Supabase's own encryption, and access to this
    column should be restricted via Row Level Security policies)."""
    return base64.urlsafe_b64encode(key).decode()


def decode_key_from_storage(encoded_key: str) -> bytes:
    return base64.urlsafe_b64decode(encoded_key.encode())

def encrypt_bytes(content: bytes, key: bytes) -> str:
    """Encrypts raw file bytes using the given key. Returns base64 ciphertext string."""
    f = Fernet(key)
    encrypted = f.encrypt(content)
    return encrypted.decode()


def decrypt_bytes(encrypted_content: str, key: bytes) -> bytes:
    """Decrypts raw file bytes using the given key. Returns original bytes."""
    f = Fernet(key)
    return f.decrypt(encrypted_content.encode())