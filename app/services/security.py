## Importacion de bcrypt para las contraseñas
import bcrypt

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
