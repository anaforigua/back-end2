from sqlalchemy import (
    CheckConstraint, Column, DateTime, Float, ForeignKey,
    Integer, Text, UniqueConstraint, func,
)
from app.database import Base


class CalificacionUsuarioModel(Base):
    __tablename__ = "calificacion_usuario"
    __table_args__ = (
        UniqueConstraint("id_calificador", "id_calificado", name="uq_una_resena_por_cuenta"),
        CheckConstraint("puntaje >= 1 AND puntaje <= 5", name="ck_puntaje_rango"),
        CheckConstraint("id_calificador <> id_calificado", name="ck_no_autocalificacion"),
    )

    id_calificacion = Column(Integer, primary_key=True, autoincrement=True)
    id_calificador = Column(Integer, ForeignKey("usuario.id_usuarios", ondelete="CASCADE"), nullable=False)
    id_calificado = Column(Integer, ForeignKey("usuario.id_usuarios", ondelete="CASCADE"), nullable=False)
    puntaje = Column(Float, nullable=False)
    comentario = Column(Text, nullable=True)
    fecha = Column(DateTime(timezone=True), server_default=func.now())