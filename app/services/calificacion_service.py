from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.calificacion_usuario import CalificacionUsuarioModel
from app.schemas.calificacion import CalificacionCreate
from app.services.usuario_service import UsuarioService


class CalificacionService:
    @staticmethod
    def calificar(db: Session, id_calificador: int, id_calificado: int, data: CalificacionCreate):
        if id_calificador == id_calificado:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No puedes calificarte a ti mismo.",
            )

        usuario = UsuarioService.obtener_por_id(db, id_calificado)  # 404 si no existe

        ya_existe = db.query(CalificacionUsuarioModel).filter(
            CalificacionUsuarioModel.id_calificador == id_calificador,
            CalificacionUsuarioModel.id_calificado == id_calificado,
        ).first()
        if ya_existe:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ya calificaste a este usuario.",
            )

        nueva = CalificacionUsuarioModel(
            id_calificador=id_calificador,
            id_calificado=id_calificado,
            puntaje=data.puntaje,
            comentario=data.comentario,
        )
        db.add(nueva)
        try:
            db.flush()
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ya calificaste a este usuario.",
            )

        promedio = db.query(func.avg(CalificacionUsuarioModel.puntaje)).filter(
            CalificacionUsuarioModel.id_calificado == id_calificado
        ).scalar()
        usuario.calificacion = round(float(promedio), 2)

        db.commit()
        db.refresh(nueva)
        return nueva