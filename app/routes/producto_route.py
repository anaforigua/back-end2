from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.producto import ProductoCreate, ProductoUpdate, ProductoRead
from app.services.producto_service import ProductoService

router = APIRouter(prefix="/productos", tags=["Productos"])

@router.post("/", status_code=status.HTTP_201_CREATED)
def crear_producto(data: ProductoCreate, db: Session = Depends(get_db)):
    producto = ProductoService.crear(db, data)
    return {
        "status": "success",
        "code": status.HTTP_201_CREATED,
        "mensaje": "Producto creado exitosamente",
        "data": producto
    }

@router.get("/")
def listar_productos(db: Session = Depends(get_db)):
    productos = ProductoService.obtener_todos(db)
    return {
        "status": "success",
        "code": status.HTTP_200_OK,
        "mensaje": "Productos listados exitosamente",
        "data": productos
    }

@router.get("/{id_productos}")
def obtener_producto(id_productos: int, db: Session = Depends(get_db)):
    producto = ProductoService.obtener_por_id(db, id_productos)
    return {
        "status": "success",
        "code": status.HTTP_200_OK,
        "mensaje": "Producto encontrado",
        "data": producto
    }

@router.put("/{id_productos}")
def actualizar_producto(id_productos: int, data: ProductoUpdate, db: Session = Depends(get_db)):
    producto = ProductoService.actualizar(db, id_productos, data)
    return {
        "status": "success",
        "code": status.HTTP_200_OK,
        "mensaje": "Producto actualizado exitosamente",
        "data": producto
    }

@router.delete("/{id_productos}")
def eliminar_producto(id_productos: int, db: Session = Depends(get_db)):
    resultado = ProductoService.eliminar(db, id_productos)
    return {
        "status": "success",
        "code": status.HTTP_200_OK,
        "mensaje": "Producto eliminado exitosamente",
        "data": resultado
    }