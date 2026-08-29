from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.detalle_pedido import DetallePedidoCreate, DetallePedidoUpdate, DetallePedidoRead
from app.services.detalle_pedido_service import DetallePedidoService

router = APIRouter(prefix="/detalles-pedido", tags=["Detalle Pedidos"])

@router.post("/", response_model=DetallePedidoRead, status_code=status.HTTP_201_CREATED)
def crear_detalle_pedido(data: DetallePedidoCreate, db: Session = Depends(get_db)):
    return DetallePedidoService.crear(db, data)

@router.get("/", response_model=list[DetallePedidoRead])
def listar_detalles_pedido(db: Session = Depends(get_db)):
    return DetallePedidoService.obtener_todos(db)

@router.get("/{detalle_pedido}", response_model=DetallePedidoRead)
def obtener_detalle_pedido(detalle_pedido: int, db: Session = Depends(get_db)):
    return DetallePedidoService.obtener_por_id(db, detalle_pedido)

@router.put("/{detalle_pedido}", response_model=DetallePedidoRead)
def actualizar_detalle_pedido(detalle_pedido: int, data: DetallePedidoUpdate, db: Session = Depends(get_db)):
    return DetallePedidoService.actualizar(db, detalle_pedido, data)

@router.delete("/{detalle_pedido}")
def eliminar_detalle_pedido(detalle_pedido: int, db: Session = Depends(get_db)):
    return DetallePedidoService.eliminar(db, detalle_pedido)