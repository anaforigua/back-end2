from sqlalchemy import Column, Integer, String, Text, Float
from sqlalchemy.orm import relationship
from app.database import Base

class UsuarioModel(Base):
    __tablename__ = "usuario"

    id_usuarios = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String, nullable=False)
    apellidos = Column(String, nullable=False)
    avatar = Column(String, nullable=False)
    biografía = Column(Text, nullable=False)
    ubicación = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    calificacion = Column(Float, default=0.0)
    estado_usuario = Column(String, nullable=False)

    pedidos = relationship("PedidoModel", back_populates="usuario")