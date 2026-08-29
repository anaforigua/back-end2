from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base

class PaisDeOrigenModel(Base):
    __tablename__ = "pais_de_origen"

    id_pais_de_origen = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre_pais = Column(String, nullable=False)