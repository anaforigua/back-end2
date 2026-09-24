from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.services.roles_usuarios_service import RolUsuarioService
from app.schemas.roles_usuarios import RolUsuarioCreate, RolUsuarioUpdate, RolUsuarioRead

router = APIRouter(prefix="/roles-usuarios", tags=["Roles Usuarios"])

@router.post("/", status_code=status.HTTP_201_CREATED)
def crear_rol_usuario(data: RolUsuarioCreate, db: Session = Depends(get_db)):
    rol_usuario = RolUsuarioService.crear(db=db, data=data)
    return {
        "status": "success",
        "code": status.HTTP_201_CREATED,
        "mensaje": "Rol de usuario creado exitosamente",
        "data": rol_usuario
    }

@router.get("/")
def listar_roles_usuarios(db: Session = Depends(get_db)):
    roles_usuarios = RolUsuarioService.obtener_todos(db=db)
    return {
        "status": "success",
        "code": status.HTTP_200_OK,
        "mensaje": "Roles de usuarios listados exitosamente",
        "data": roles_usuarios
    }

@router.get("/{id_rol_usuario}")
def obtener_rol_usuario(id_rol_usuario: int, db: Session = Depends(get_db)):
    rol_usuario = RolUsuarioService.obtener_por_id(db=db, id_rol_usuario=id_rol_usuario)
    return {
        "status": "success",
        "code": status.HTTP_200_OK,
        "mensaje": "Rol de usuario encontrado",
        "data": rol_usuario
    }

@router.put("/{id_rol_usuario}")
def actualizar_rol_usuario(id_rol_usuario: int, data: RolUsuarioUpdate, db: Session = Depends(get_db)):
    rol_usuario = RolUsuarioService.actualizar(db=db, id_rol_usuario=id_rol_usuario, data=data)
    return {
        "status": "success",
        "code": status.HTTP_200_OK,
        "mensaje": "Rol de usuario actualizado exitosamente",
        "data": rol_usuario
    }

@router.delete("/{id_rol_usuario}")
def eliminar_rol_usuario(id_rol_usuario: int, db: Session = Depends(get_db)):
    resultado = RolUsuarioService.eliminar(db=db, id_rol_usuario=id_rol_usuario)
    return {
        "status": "success",
        "code": status.HTTP_200_OK,
        "mensaje": "Rol de usuario eliminado exitosamente",
        "data": resultado
    }