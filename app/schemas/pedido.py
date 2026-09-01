from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class DetallePedidoCreate(BaseModel):
    id_productos: int
    cantidad: int
    precio_unitario: float
    subtotal: Optional[float] = None

class PedidoBase(BaseModel):
    estado_pedido: str
    tipo_de_pago: str
    id_usuarios: int

class PedidoCreate(PedidoBase):
    detalles: List[DetallePedidoCreate] = []
    fecha: Optional[datetime] = None  # Opcional al crear, la base de datos la autogenera

class PedidoUpdate(BaseModel):
    fecha: Optional[datetime] = None
    estado_pedido: Optional[str] = None
    tipo_de_pago: Optional[str] = None
    id_usuarios: Optional[int] = None

class PedidoRead(PedidoBase):
    id_pedidos: int
    fecha: datetime  # En lectura sí la devolvemos porque la BD ya la generó

    class Config:
        from_attributes = True