from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.categorias import CategoriaCreate, CategoriaUpdate, CategoriaRead
from app.services.categorias_service import CategoriaService

router = APIRouter(prefix="/categorias", tags=["Categorias"])

@router.post("/", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def crear_categoria(data: CategoriaCreate, db: Session = Depends(get_db)):
    return CategoriaService.crear(db, data)

@router.get("/", response_model=list[CategoriaRead])
def listar_categorias(db: Session = Depends(get_db)):
    return CategoriaService.listar(db)

@router.get("/{id_categoria}", response_model=CategoriaRead)
def obtener_categoria(id_categoria: int, db: Session = Depends(get_db)):
    return CategoriaService.obtener_por_id(db, id_categoria)

@router.put("/{id_categoria}", response_model=CategoriaRead)
def actualizar_categoria(id_categoria: int, data: CategoriaUpdate, db: Session = Depends(get_db)):
    return CategoriaService.actualizar(db, id_categoria, data)

@router.delete("/{id_categoria}")
def eliminar_categoria(id_categoria: int, db: Session = Depends(get_db)):
    return CategoriaService.eliminar(db, id_categoria)