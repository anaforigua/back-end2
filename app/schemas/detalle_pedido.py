from typing import Optional
from pydantic import BaseModel, Field, field_validator
from app.schemas.producto import ProductoRead


class DetallePedidoBase(BaseModel):
    cantidad: int = Field(..., gt=0)
    id_productos: int = Field(..., gt=0)
    precio_unitario: Optional[float] = Field(None, ge=0)
    subtotal: Optional[float] = Field(0.0, ge=0)

    @field_validator("subtotal", mode="before")
    @classmethod
    def normalizar_subtotal(cls, v):
        return 0.0 if v is None else v


class DetallePedidoCreate(DetallePedidoBase):
    pass


class DetallePedidoUpdate(BaseModel):
    cantidad: Optional[int] = Field(None, gt=0)
    subtotal: Optional[float] = Field(None, ge=0)
    precio_unitario: Optional[float] = Field(None, ge=0)
    id_productos: Optional[int] = Field(None, gt=0)


class DetallePedidoRead(DetallePedidoBase):
    detalle_pedido: int = Field(..., gt=0)
    id_pedidos: Optional[int] = Field(None, gt=0)
    producto: Optional[ProductoRead] = None

    class Config:
        from_attributes = True