from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.producto import ProductoCreate, ProductoUpdate, ProductoRead
from app.services.producto_service import ProductoService

router = APIRouter(prefix="/productos", tags=["Productos"])

@router.post("/", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def crear_producto(data: ProductoCreate, db: Session = Depends(get_db)):
    return ProductoService.crear(db, data)

@router.get("/", response_model=list[ProductoRead])
def listar_productos(db: Session = Depends(get_db)):
    return ProductoService.obtener_todos(db)

@router.get("/{id_productos}", response_model=ProductoRead)
def obtener_producto(id_productos: int, db: Session = Depends(get_db)):
    return ProductoService.obtener_por_id(db, id_productos)

@router.put("/{id_productos}", response_model=ProductoRead)
def actualizar_producto(id_productos: int, data: ProductoUpdate, db: Session = Depends(get_db)):
    return ProductoService.actualizar(db, id_productos, data)

@router.delete("/{id_productos}")
def eliminar_producto(id_productos: int, db: Session = Depends(get_db)):
    return ProductoService.eliminar(db, id_productos)