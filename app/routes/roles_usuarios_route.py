from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db  # Ajusta esta ruta según la ubicación de tu función de sesión de base de datos
from app.services.roles_usuarios_service import RolUsuarioService
from app.schemas.roles_usuarios import RolUsuarioCreate, RolUsuarioUpdate, RolUsuarioRead

router = APIRouter(prefix="/roles-usuarios", tags=["Roles Usuarios"])

@router.post("/", response_model=RolUsuarioRead, status_code=status.HTTP_201_CREATED)
def crear_rol_usuario(data: RolUsuarioCreate, db: Session = Depends(get_db)):
    return RolUsuarioService.crear(db=db, data=data)

@router.get("/", response_model=List[RolUsuarioRead])
def listar_roles_usuarios(db: Session = Depends(get_db)):
    return RolUsuarioService.obtener_todos(db=db)

@router.get("/{id_rol_usuario}", response_model=RolUsuarioRead)
def obtener_rol_usuario(id_rol_usuario: int, db: Session = Depends(get_db)):
    return RolUsuarioService.obtener_por_id(db=db, id_rol_usuario=id_rol_usuario)

@router.put("/{id_rol_usuario}", response_model=RolUsuarioRead)
def actualizar_rol_usuario(id_rol_usuario: int, data: RolUsuarioUpdate, db: Session = Depends(get_db)):
    return RolUsuarioService.actualizar(db=db, id_rol_usuario=id_rol_usuario, data=data)

@router.delete("/{id_rol_usuario}")
def eliminar_rol_usuario(id_rol_usuario: int, db: Session = Depends(get_db)):
    return RolUsuarioService.eliminar(db=db, id_rol_usuario=id_rol_usuario)