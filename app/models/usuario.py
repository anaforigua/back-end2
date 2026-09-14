from sqlalchemy import Column, Integer, String, Text, Float
from sqlalchemy.orm import relationship
from app.database import Base

class UsuarioModel(Base):
    __tablename__ = "usuario"

    id_usuarios = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String, nullable=False)
    apellidos = Column(String, nullable=False)
    avatar = Column(String, nullable=False)
    
    # Nombres limpios sincronizados con PostgreSQL
    biografia = Column(Text, nullable=False)
    ubicacion = Column(String, nullable=False)
    
    email = Column(String, unique=True, index=True, nullable=False)
    contrasena = Column(String, nullable=False)
    calificacion = Column(Float, default=0.0)
    estado_usuario = Column(String, nullable=False)

    roles_usuarios = relationship("RolUsuarioModel", back_populates="usuario", cascade="all, delete-orphan")
    pedidos = relationship("PedidoModel", back_populates="usuario", cascade="all, delete-orphan")
    
    @property
    def roles(self):
        if not self.roles_usuarios:
            return []
        return [ru.rol for ru in self.roles_usuarios if getattr(ru, 'rol', None) is not None]