from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey
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

    # Atributos del segundo modelo agregados para la función del rol sin perder nada del primero
   
  # Cambia 'roles.id' por el nombre real de la PK de roles
    roles_usuarios = relationship("RolUsuarioModel", back_populates="usuario", cascade="all, delete-orphan")
    # Esta es la única relación directa con los pedidos (el usuario tiene muchos pedidos)
    pedidos = relationship("PedidoModel", back_populates="usuario", cascade="all, delete-orphan")
    
    # Añade esto dentro de tu clase UsuarioModel:
    @property
    def roles(self):
        # Debe retornar el objeto 'rol' completo de cada registro intermedio
        return [ru.rol for ru in self.roles_usuarios if ru.rol]