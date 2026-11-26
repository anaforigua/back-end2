from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.usuario import UsuarioModel
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate, UsuarioRead, UsuarioLogin
from app.services.security import create_access_token
from app.services.usuario_service import UsuarioService

from app.schemas.calificacion import CalificacionCreate
from app.services.calificacion_service import CalificacionService

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


# ---------- Rutas públicas ----------

@router.post("/", status_code=status.HTTP_201_CREATED)
async def crear_usuario(data: UsuarioCreate, db: Session = Depends(get_db)):
    usuario = UsuarioService.crear(db, data)
    return {
        "status": "success",
        "mensaje": "Usuario creado exitosamente",
        "data": UsuarioRead.model_validate(usuario),
    }


@router.post("/login")
async def login(data: UsuarioLogin, db: Session = Depends(get_db)):
    usuario = UsuarioService.autenticar(db, data.email, data.contrasena)
    token = create_access_token(usuario.id_usuarios)
    return {
        "status": "success",
        "mensaje": "Inicio de sesión exitoso",
        "access_token": token,
        "token_type": "bearer",
        "data": UsuarioRead.model_validate(usuario),
    }


# ---------- Rutas protegidas (requieren token) ----------

@router.get("/")
async def listar_usuarios(
    db: Session = Depends(get_db),
    usuario_actual: UsuarioModel = Depends(get_current_user),
):
    usuarios = UsuarioService.obtener_todos(db)
    return {
        "status": "success",
        "mensaje": "Usuarios listados exitosamente",
        "data": [UsuarioRead.model_validate(u) for u in usuarios],
    }


@router.get("/{id_usuarios}")
async def obtener_usuario(
    id_usuarios: int = Path(..., gt=0),
    db: Session = Depends(get_db),
    usuario_actual: UsuarioModel = Depends(get_current_user),
):
    usuario = UsuarioService.obtener_por_id(db, id_usuarios)
    return {
        "status": "success",
        "mensaje": "Usuario encontrado",
        "data": UsuarioRead.model_validate(usuario),
    }


@router.put("/{id_usuarios}")
async def actualizar_usuario(
    id_usuarios: int,
    data: UsuarioUpdate,
    db: Session = Depends(get_db),
    usuario_actual: UsuarioModel = Depends(get_current_user),
):
    if usuario_actual.id_usuarios != id_usuarios:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No puedes modificar a otro usuario.",
        )
    usuario = UsuarioService.actualizar(db, id_usuarios, data)
    return {
        "status": "success",
        "mensaje": "Usuario actualizado exitosamente",
        "data": UsuarioRead.model_validate(usuario),
    }

@router.post("/{id_usuarios}/calificacion", status_code=status.HTTP_201_CREATED)
async def calificar_usuario(
    data: CalificacionCreate,
    id_usuarios: int = Path(..., gt=0),
    db: Session = Depends(get_db),
    usuario_actual: UsuarioModel = Depends(get_current_user),
):
    resena = CalificacionService.calificar(db, usuario_actual.id_usuarios, id_usuarios, data)
    usuario = UsuarioService.obtener_por_id(db, id_usuarios)
    return {
        "status": "success",
        "mensaje": "Calificación registrada exitosamente",
        "data": {
            "puntaje": resena.puntaje,
            "comentario": resena.comentario,
            "promedio_actual": usuario.calificacion,
        },
    }


@router.delete("/{id_usuarios}")
async def eliminar_usuario(
    id_usuarios: int,
    db: Session = Depends(get_db),
    usuario_actual: UsuarioModel = Depends(get_current_user),
):
    if usuario_actual.id_usuarios != id_usuarios:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No puedes eliminar a otro usuario.",
        )
    resultado = UsuarioService.eliminar(db, id_usuarios)
    return {
        "status": "success",
        "mensaje": "Usuario eliminado exitosamente",
        "data": resultado,
    }