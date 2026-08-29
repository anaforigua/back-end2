from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate, UsuarioRead
from app.services.usuario_service import UsuarioService

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

@router.post("/", response_model=UsuarioRead, status_code=status.HTTP_201_CREATED)
def crear_usuario(data: UsuarioCreate, db: Session = Depends(get_db)):
    return UsuarioService.crear(db, data)

@router.get("/", response_model=list[UsuarioRead])
def listar_usuarios(db: Session = Depends(get_db)):
    return UsuarioService.obtener_todos(db)

@router.get("/{id_usuarios}", response_model=UsuarioRead)
def obtener_usuario(id_usuarios: int, db: Session = Depends(get_db)):
    return UsuarioService.obtener_por_id(db, id_usuarios)

@router.put("/{id_usuarios}", response_model=UsuarioRead)
def actualizar_usuario(id_usuarios: int, data: UsuarioUpdate, db: Session = Depends(get_db)):
    return UsuarioService.actualizar(db, id_usuarios, data)

@router.delete("/{id_usuarios}")
def eliminar_usuario(id_usuarios: int, db: Session = Depends(get_db)):
    return UsuarioService.eliminar(db, id_usuarios)