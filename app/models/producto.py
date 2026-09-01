from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.pais_de_origen import PaisDeOrigenModel

class ProductoModel(Base):
    __tablename__ = "productos"

    id_productos = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String, nullable=False)
    descripcion = Column(Text, nullable=False)
    precio = Column(Float, nullable=False)
    imagenes_producto = Column(String, nullable=False)
    condicion_producto = Column(String, nullable=False)
    estado_producto = Column(String, nullable=False)
    cantidad = Column(Integer, nullable=False)
    fecha_publicacion = Column(DateTime, nullable=False, default=datetime.utcnow)
    id_categoria = Column(Integer, ForeignKey("categorias.id_categoria"), nullable=False)
    
    # Aquí cambiamos a "pais_de_origen" en singular para que coincida con el nombre de la tabla
    id_pais_de_origen = Column(Integer, ForeignKey("pais_de_origen.id_pais_de_origen"), nullable=False)

    # Relaciones explícitas con primaryjoin
    categoria = relationship("CategoriaModel", primaryjoin="ProductoModel.id_categoria == CategoriaModel.id_categoria", foreign_keys=[id_categoria])
    pais_de_origen = relationship("PaisDeOrigenModel", primaryjoin="ProductoModel.id_pais_de_origen == PaisDeOrigenModel.id_pais_de_origen", foreign_keys=[id_pais_de_origen])
    detalles_pedido = relationship("DetallePedidoModel", back_populates="producto")