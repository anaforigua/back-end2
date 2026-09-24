from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.detalle_pedido import DetallePedidoCreate, DetallePedidoUpdate, DetallePedidoRead
from app.services.detalle_pedido_service import DetallePedidoService

router = APIRouter(prefix="/detalles-pedido", tags=["Detalle Pedidos"])

@router.post("/", status_code=status.HTTP_201_CREATED)
def crear_detalle_pedido(data: DetallePedidoCreate, db: Session = Depends(get_db)):
    detalle = DetallePedidoService.crear(db, data)
    return {
        "status": "success",
        "code": status.HTTP_201_CREATED,
        "mensaje": "Detalle de pedido creado exitosamente",
        "data": detalle
    }

@router.get("/")
def listar_detalles_pedido(db: Session = Depends(get_db)):
    detalles = DetallePedidoService.obtener_todos(db)
    return {
        "status": "success",
        "code": status.HTTP_200_OK,
        "mensaje": "Detalles de pedido listados exitosamente",
        "data": detalles
    }

@router.get("/{detalle_pedido}")
def obtener_detalle_pedido(detalle_pedido: int, db: Session = Depends(get_db)):
    detalle = DetallePedidoService.obtener_por_id(db, detalle_pedido)
    return {
        "status": "success",
        "code": status.HTTP_200_OK,
        "mensaje": "Detalle de pedido encontrado",
        "data": detalle
    }

@router.put("/{detalle_pedido}")
def actualizar_detalle_pedido(detalle_pedido: int, data: DetallePedidoUpdate, db: Session = Depends(get_db)):
    detalle = DetallePedidoService.actualizar(db, detalle_pedido, data)
    return {
        "status": "success",
        "code": status.HTTP_200_OK,
        "mensaje": "Detalle de pedido actualizado exitosamente",
        "data": detalle
    }

@router.delete("/{detalle_pedido}")
def eliminar_detalle_pedido(detalle_pedido: int, db: Session = Depends(get_db)):
    resultado = DetallePedidoService.eliminar(db, detalle_pedido)
    return {
        "status": "success",
        "code": status.HTTP_200_OK,
        "mensaje": "Detalle de pedido eliminado exitosamente",
        "data": resultado
    }