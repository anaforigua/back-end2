from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.rol import RolCreate, RolUpdate, RolRead
from app.services.rol_service import RolService

router = APIRouter(prefix="/roles", tags=["Roles"])

@router.post("/", response_model=RolRead, status_code=status.HTTP_201_CREATED)
def crear_rol(data: RolCreate, db: Session = Depends(get_db)):
    return RolService.crear(db, data)

@router.get("/", response_model=list[RolRead])
def listar_roles(db: Session = Depends(get_db)):
    return RolService.obtener_todos(db)

@router.get("/{rol_id}", response_model=RolRead)
def obtener_rol(rol_id: int, db: Session = Depends(get_db)):
    return RolService.obtener_rol_por_id(db, rol_id) if hasattr(RolService, 'obtener_rol_por_id') else RolService.obtener_por_id(db, rol_id)

@router.put("/{rol_id}", response_model=RolRead)
def actualizar_rol(rol_id: int, data: RolUpdate, db: Session = Depends(get_db)):
    return RolService.actualizar(db, rol_id, data)

@router.delete("/{rol_id}")
def eliminar_rol(rol_id: int, db: Session = Depends(get_db)):
    return RolService.eliminar(db, rol_id)