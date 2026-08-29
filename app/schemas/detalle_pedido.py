from typing import Optional
from pydantic import BaseModel

class DetallePedidoBase(BaseModel):
    cantidad: int
    subtotal: float
    id_pedidos: int
    id_productos: int

class DetallePedidoCreate(DetallePedidoBase):
    pass

class DetallePedidoUpdate(BaseModel):
    cantidad: Optional[int] = None
    subtotal: Optional[float] = None
    id_pedidos: Optional[int] = None
    id_productos: Optional[int] = None

class DetallePedidoRead(DetallePedidoBase):
    detalle_pedido: int

    class Config:
        from_attributes = True