from sqlalchemy import Column, Integer, String
from app.database import Base

class Rol(Base):
    __tablename__ = "roles"

    id_rol = Column(Integer, primary_key=True, index=True)
    nombre_rol = Column(String, unique=True, index=True, nullable=False)
    descripcion = Column(String, nullable=True)