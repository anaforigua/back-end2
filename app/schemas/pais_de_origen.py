from typing import Optional
from pydantic import BaseModel, ConfigDict

class PaisDeOrigenBase(BaseModel):
    nombre_pais: str

class PaisDeOrigenCreate(PaisDeOrigenBase):
    pass

class PaisDeOrigenUpdate(BaseModel):
    nombre_pais: Optional[str] = None

class PaisDeOrigenRead(PaisDeOrigenBase):
    id_pais_de_origen: int

    model_config = ConfigDict(from_attributes=True)