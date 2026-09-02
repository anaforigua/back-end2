from typing import Optional
from pydantic import BaseModel
from app.schemas.producto import ProductoRead

class DetallePedidoBase(BaseModel):
    cantidad: int
    subtotal: float
    precio_unitario: Optional[float] = None
    id_productos: int

class DetallePedidoCreate(DetallePedidoBase):
    pass

class DetallePedidoUpdate(BaseModel):
    cantidad: Optional[int] = None
    subtotal: Optional[float] = None
    precio_unitario: Optional[float] = None
    id_productos: Optional[int] = None

class DetallePedidoRead(DetallePedidoBase):
    detalle_pedido: int
    id_pedidos: Optional[int] = None
    producto: Optional[ProductoRead] = None

    class Config:
        from_attributes = True