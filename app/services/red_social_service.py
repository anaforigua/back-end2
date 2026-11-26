from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from fastapi import HTTPException, status
from app.models.red_social import RedSocialModel
from app.schemas.red_social import RedSocialCreate, RedSocialUpdate

CAMPOS_NO_EDITABLES = {"id_red_social"}


class RedSocialService:
    @staticmethod
    def crear(db: Session, data: RedSocialCreate) -> RedSocialModel:
        try:
            db_item = RedSocialModel(**data.model_dump())
            db.add(db_item)
            db.commit()
            db.refresh(db_item)
            return db_item
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo crear la red social por restricción de integridad o datos inválidos",
            )
        except SQLAlchemyError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error interno al crear la red social",
            )

    @staticmethod
    def obtener_todos(db: Session) -> list[RedSocialModel]:
        return db.query(RedSocialModel).all()

    @staticmethod
    def obtener_por_id(db: Session, id_red_social: int) -> RedSocialModel:
        db_item = (
            db.query(RedSocialModel)
            .filter(RedSocialModel.id_red_social == id_red_social)
            .first()
        )
        if not db_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Red social no encontrada",
            )
        return db_item

    @staticmethod
    def actualizar(
        db: Session, id_red_social: int, data: RedSocialUpdate
    ) -> RedSocialModel:
        db_item = RedSocialService.obtener_por_id(db, id_red_social)
        datos_actualizacion = data.model_dump(exclude_unset=True)

        for key, value in datos_actualizacion.items():
            if key not in CAMPOS_NO_EDITABLES and hasattr(db_item, key):
                setattr(db_item, key, value)

        try:
            db.commit()
            db.refresh(db_item)
            return db_item
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo actualizar la red social por restricción de integridad",
            )
        except SQLAlchemyError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error interno al actualizar la red social",
            )

    @staticmethod
    def eliminar(db: Session, id_red_social: int) -> dict:
        db_item = RedSocialService.obtener_por_id(db, id_red_social)
        try:
            db.delete(db_item)
            db.commit()
            return {"mensaje": "Red social eliminada exitosamente"}
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="No se puede eliminar la red social porque está asociada a otros registros",
            )
        except SQLAlchemyError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error interno al eliminar la red social",
            )