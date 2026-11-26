import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.usuario import UsuarioModel
from app.services.security import decode_access_token

bearer_scheme = HTTPBearer()

##### FUNCION VALIDACION DE TOKEN

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> UsuarioModel:
    cabecera = {"WWW-Authenticate": "Bearer"}
    try:
        payload = decode_access_token(credentials.credentials)
        id_usuario = int(payload["sub"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El token ha expirado.",
            headers=cabecera,
        )
    except (jwt.InvalidTokenError, KeyError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido.",
            headers=cabecera,
        )

    usuario = (
        db.query(UsuarioModel)
        .filter(UsuarioModel.id_usuarios == id_usuario)
        .first()
    )
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado.",
            headers=cabecera,
        )
    return usuario