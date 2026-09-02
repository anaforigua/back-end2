from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.schemas.detalle_pedido import DetallePedidoRead, DetallePedidoCreate

class PedidoBase(BaseModel):
    estado_pedido: Optional[str] = None
    tipo_de_pago: Optional[str] = None
    id_usuarios: Optional[int] = None

class PedidoCreate(PedidoBase):
    detalles: List[DetallePedidoCreate] = []
    fecha: Optional[datetime] = None

class PedidoUpdate(BaseModel):
    fecha: Optional[datetime] = None
    estado_pedido: Optional[str] = None
    tipo_de_pago: Optional[str] = None
    id_usuarios: Optional[int] = None

class PedidoRead(PedidoBase):
    id_pedido: Optional[int] = None
    id_pedidos: Optional[int] = None
    fecha: Optional[datetime] = None
    detalles: List[DetallePedidoRead] = []

    class Config:
        from_attributes = True