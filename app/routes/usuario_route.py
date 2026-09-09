from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate, UsuarioRead
from app.services.usuario_service import UsuarioService

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

@router.post("/", status_code=status.HTTP_201_CREATED)
def crear_usuario(data: UsuarioCreate, db: Session = Depends(get_db)):
    usuario = UsuarioService.crear(db, data)
    return {
        "mensaje": "Usuario creado exitosamente",
        "data": usuario
    }

@router.get("/")
def listar_usuarios(db: Session = Depends(get_db)):
    usuarios = UsuarioService.obtener_todos(db)
    return {
        "mensaje": "Usuarios listados exitosamente",
        "data": usuarios
    }

@router.get("/{id_usuarios}")
def obtener_usuario(id_usuarios: int, db: Session = Depends(get_db)):
    usuario = UsuarioService.obtener_por_id(db, id_usuarios)
    return {
        "mensaje": "Usuario encontrado",
        "data": usuario
    }

@router.put("/{id_usuarios}")
def actualizar_usuario(id_usuarios: int, data: UsuarioUpdate, db: Session = Depends(get_db)):
    usuario = UsuarioService.actualizar(db, id_usuarios, data)
    return {
        "mensaje": "Usuario actualizado exitosamente",
        "data": usuario
    }

@router.delete("/{id_usuarios}")
def eliminar_usuario(id_usuarios: int, db: Session = Depends(get_db)):
    resultado = UsuarioService.eliminar(db, id_usuarios)
    return {
        "mensaje": "Usuario eliminado exitosamente",
        "data": resultado
    }