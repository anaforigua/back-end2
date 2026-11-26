from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from fastapi import HTTPException, status
from app.models.pais_de_origen import PaisDeOrigenModel
from app.schemas.pais_de_origen import PaisDeOrigenCreate, PaisDeOrigenUpdate

CAMPOS_NO_EDITABLES = {"id_pais_de_origen"}


class PaisDeOrigenService:
    @staticmethod
    def crear(db: Session, data: PaisDeOrigenCreate) -> PaisDeOrigenModel:
        try:
            db_item = PaisDeOrigenModel(**data.model_dump())
            db.add(db_item)
            db.commit()
            db.refresh(db_item)
            return db_item
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo crear el país de origen por restricción de integridad o datos inválidos",
            )
        except SQLAlchemyError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error interno al crear el país de origen",
            )

    @staticmethod
    def obtener_todos(db: Session) -> list[PaisDeOrigenModel]:
        return db.query(PaisDeOrigenModel).all()

    @staticmethod
    def obtener_por_id(db: Session, id_pais_de_origen: int) -> PaisDeOrigenModel:
        db_item = (
            db.query(PaisDeOrigenModel)
            .filter(PaisDeOrigenModel.id_pais_de_origen == id_pais_de_origen)
            .first()
        )
        if not db_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="País de origen no encontrado",
            )
        return db_item

    @staticmethod
    def actualizar(
        db: Session, id_pais_de_origen: int, data: PaisDeOrigenUpdate
    ) -> PaisDeOrigenModel:
        db_item = PaisDeOrigenService.obtener_por_id(db, id_pais_de_origen)
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
                detail="No se pudo actualizar el país de origen por restricción de integridad",
            )
        except SQLAlchemyError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error interno al actualizar el país de origen",
            )

    @staticmethod
    def eliminar(db: Session, id_pais_de_origen: int) -> dict:
        db_item = PaisDeOrigenService.obtener_por_id(db, id_pais_de_origen)
        try:
            db.delete(db_item)
            db.commit()
            return {"mensaje": "País de origen eliminado exitosamente"}
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="No se puede eliminar el país de origen porque está asociado a otros registros",
            )
        except SQLAlchemyError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error interno al eliminar el país de origen",
            )