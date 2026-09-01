from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class RolUsuarioModel(Base):
    __tablename__ = "roles_usuarios"

    id_rol_usuario = Column(Integer, primary_key=True, index=True)
    
    id_usuario = Column(Integer, ForeignKey("usuario.id_usuarios"), nullable=False)
    id_rol = Column(Integer, ForeignKey("roles.id_rol"), nullable=False)

    # Añade back_populates para conectar ambos lados de la relación
    usuario = relationship("UsuarioModel", back_populates="roles_usuarios")
    rol = relationship("Rol", back_populates="roles_usuarios")