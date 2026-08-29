from typing import Optional
from pydantic import BaseModel

class PaisDeOrigenBase(BaseModel):
    nombre_pais: str

class PaisDeOrigenCreate(PaisDeOrigenBase):
    pass

class PaisDeOrigenUpdate(BaseModel):
    nombre_pais: Optional[str] = None

class PaisDeOrigenRead(PaisDeOrigenBase):
    id_pais_de_origen: int

    class Config:
        from_attributes = True