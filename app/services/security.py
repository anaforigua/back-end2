## Importacion de bcrypt para las contraseñas
import bcrypt

## Importacion del Token
import os
from datetime import datetime, timedelta, timezone

import jwt
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

if not SECRET_KEY:
    raise RuntimeError("Falta SECRET_KEY en el archivo .env")


def create_access_token(id_usuario: int) -> str:
    ahora = datetime.now(timezone.utc)
    payload = {
        "sub": str(id_usuario),
        "iat": ahora,
        "exp": ahora + timedelta(minutes=EXPIRE_MINUTES),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])


##Funcion para regresar las contraseñas con hash
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

##Funcion para verificar estas contraseñas
def verify_password(password: str, hashed: str) -> bool:

    # Devuelve False (en vez de error) si el hash está vacío o mal formado,
    # como pasa con los usuarios que hoy tienen la contraseña vacía.
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except ValueError:
        return False
