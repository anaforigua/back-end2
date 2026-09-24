from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.categorias import CategoriaCreate, CategoriaUpdate, CategoriaRead
from app.services.categorias_service import CategoriaService

router = APIRouter(prefix="/categorias", tags=["Categorias"])

@router.post("/", status_code=status.HTTP_201_CREATED)
def crear_categoria(data: CategoriaCreate, db: Session = Depends(get_db)):
    categoria = CategoriaService.crear(db, data)
    return {
        "status": "success",
        "code": status.HTTP_201_CREATED,
        "mensaje": "Categoría creada exitosamente",
        "data": categoria
    }

@router.get("/")
def listar_categorias(db: Session = Depends(get_db)):
    categorias = CategoriaService.listar(db)
    return {
        "status": "success",
        "code": status.HTTP_200_OK,
        "mensaje": "Categorías listadas exitosamente",
        "data": categorias
    }

@router.get("/{id_categoria}")
def obtener_categoria(id_categoria: int, db: Session = Depends(get_db)):
    categoria = CategoriaService.obtener_por_id(db, id_categoria)
    return {
        "status": "success",
        "code": status.HTTP_200_OK,
        "mensaje": "Categoría encontrada",
        "data": categoria
    }

@router.put("/{id_categoria}")
def actualizar_categoria(id_categoria: int, data: CategoriaUpdate, db: Session = Depends(get_db)):
    categoria = CategoriaService.actualizar(db, id_categoria, data)
    return {
        "status": "success",
        "code": status.HTTP_200_OK,
        "mensaje": "Categoría actualizada exitosamente",
        "data": categoria
    }

@router.delete("/{id_categoria}")
def eliminar_categoria(id_categoria: int, db: Session = Depends(get_db)):
    resultado = CategoriaService.eliminar(db, id_categoria)
    return {
        "status": "success",
        "code": status.HTTP_200_OK,
        "mensaje": "Categoría eliminada exitosamente",
        "data": resultado
    }