from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.rol import RolCreate, RolUpdate, RolRead
from app.services.rol_service import RolService

router = APIRouter(prefix="/roles", tags=["Roles"])
    
@router.post("/", status_code=status.HTTP_201_CREATED)
def crear_rol(data: RolCreate, db: Session = Depends(get_db)):
    rol = RolService.crear(db, data)
    return {
        "mensaje": "Rol creado exitosamente",
        "data": rol
    }

@router.get("/")
def listar_roles(db: Session = Depends(get_db)):
    roles = RolService.obtener_todos(db)
    return {
        "mensaje": "Roles listados exitosamente",
        "data": roles
    }

@router.get("/{rol_id}")
def obtener_rol(rol_id: int, db: Session = Depends(get_db)):
    rol = RolService.obtener_por_id(db, rol_id)
    return {
        "mensaje": "Rol encontrado",
        "data": rol
    }

@router.put("/{rol_id}")
def actualizar_rol(rol_id: int, data: RolUpdate, db: Session = Depends(get_db)):
    rol = RolService.actualizar(db, rol_id, data)
    return {
        "mensaje": "Rol actualizado exitosamente",
        "data": rol
    }

@router.delete("/{rol_id}")
def eliminar_rol(rol_id: int, db: Session = Depends(get_db)):
    resultado = RolService.eliminar(db, rol_id)
    return {
        "mensaje": "Rol eliminado exitosamente",
        "data": resultado
    }