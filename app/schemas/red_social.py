from typing import Optional
from pydantic import BaseModel, ConfigDict

class RedSocialBase(BaseModel):
    nombre: str
    url_base: str

class RedSocialCreate(RedSocialBase):
    pass

class RedSocialUpdate(BaseModel):
    nombre: Optional[str] = None
    url_base: Optional[str] = None

class RedSocialRead(RedSocialBase):
    id_red_social: int

    model_config = ConfigDict(from_attributes=True)