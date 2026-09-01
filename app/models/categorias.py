from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database import Base

class CategoriaModel(Base):
    __tablename__ = "categorias"

    id_categoria = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre_categoria = Column("nombre", String, unique=True, index=True)    
    descripcion = Column(Text, nullable=False)
    icono_categoria = Column(String(120), nullable=False)

    # Relación opcional con productos si aplica
    productos = relationship("ProductoModel", back_populates="categoria")