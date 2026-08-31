from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class RolUsuarioModel(Base):
    __tablename__ = "roles_usuarios"

    id_rol_usuario = Column(Integer, primary_key=True, index=True)
    
    # Asegúrate de que el nombre antes del punto coincida con el __tablename__ real de tu usuario
    id_usuario = Column(Integer, ForeignKey("usuario.id_usuarios"), nullable=False)
    id_rol = Column(Integer, ForeignKey("roles.id_rol"), nullable=False)

    usuario = relationship("UsuarioModel")
    rol = relationship("Rol")