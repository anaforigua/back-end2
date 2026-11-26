from typing import Optional
from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.usuario import UsuarioModel


def _extraer_token(authorization: Optional[str]) -> str:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales de autenticación requeridas.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    partes = authorization.strip().split(" ")
    if len(partes) != 2 or partes[0].lower() != "bearer" or not partes[1].strip():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Formato de token inválido.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return partes[1].strip()


def _verificar_y_obtener_id_usuario(token: str) -> int:
    # Aquí conectas la decodificación/verificación del token emitido en /usuarios/login
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token no válido o expirado.",
    )


def obtener_usuario_actual(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> Usuario:
    token = _extraer_token(authorization)
    usuario_id = _verificar_y_obtener_id_usuario(token)

    usuario = db.query(Usuario).filter(Usuario.id_usuarios == usuario_id).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no autorizado.",
        )

    if getattr(usuario, "estado_usuario", "").lower() in {"inactivo", "bloqueado", "suspendido"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="La cuenta de usuario no se encuentra activa.",
        )

    return usuario