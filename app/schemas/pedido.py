from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class PedidoBase(BaseModel):
    fecha: datetime
    estado_pedido: str
    tipo_de_pago: str
    id_usuarios: int

class PedidoCreate(PedidoBase):
    pass

class PedidoUpdate(BaseModel):
    fecha: Optional[datetime] = None
    estado_pedido: Optional[str] = None
    tipo_de_pago: Optional[str] = None
    id_usuarios: Optional[int] = None

class PedidoRead(PedidoBase):
    id_pedido: int

    class Config:
        from_attributes = True