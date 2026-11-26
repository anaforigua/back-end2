from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from fastapi import HTTPException, status
from app.models.categorias import CategoriaModel
from app.schemas.categorias import CategoriaCreate, CategoriaUpdate

CAMPOS_NO_EDITABLES = {"id_categoria"}


class CategoriaService:
    @staticmethod
    def crear(db: Session, data: CategoriaCreate) -> CategoriaModel:
        categoria_existente = (
            db.query(CategoriaModel)
            .filter(CategoriaModel.nombre_categoria == data.nombre_categoria)
            .first()
        )
        if categoria_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="❌ Categoría duplicada.",
            )

        try:
            db_item = CategoriaModel(**data.model_dump())
            db.add(db_item)
            db.commit()
            db.refresh(db_item)
            return db_item
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="❌ No se pudo crear la categoría por conflicto o regla de integridad.",
            )
        except SQLAlchemyError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="❌ Error interno al crear la categoría.",
            )

    @staticmethod
    def listar(db: Session):
        return db.query(CategoriaModel).all()

    @staticmethod
    def obtener_por_id(db: Session, id_categoria: int) -> CategoriaModel:
        db_item = (
            db.query(CategoriaModel)
            .filter(CategoriaModel.id_categoria == id_categoria)
            .first()
        )
        if not db_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoría no encontrada",
            )
        return db_item

    @staticmethod
    def actualizar(
        db: Session, id_categoria: int, data: CategoriaUpdate
    ) -> CategoriaModel:
        db_item = CategoriaService.obtener_por_id(db, id_categoria)
        datos_update = data.model_dump(exclude_unset=True)

        if "nombre_categoria" in datos_update and datos_update["nombre_categoria"] is not None:
            duplicada = (
                db.query(CategoriaModel)
                .filter(
                    CategoriaModel.nombre_categoria == datos_update["nombre_categoria"],
                    CategoriaModel.id_categoria != db_item.id_categoria,
                )
                .first()
            )
            if duplicada:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="❌ Categoría duplicada.",
                )

        for key, value in datos_update.items():
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
                detail="❌ No se pudo actualizar la categoría por regla de integridad.",
            )
        except SQLAlchemyError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="❌ Error interno al actualizar la categoría.",
            )

    @staticmethod
    def eliminar(db: Session, id_categoria: int):
        db_item = CategoriaService.obtener_por_id(db, id_categoria)
        try:
            db.delete(db_item)
            db.commit()
            return {"mensaje": "Categoría eliminada correctamente"}
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="❌ No se puede eliminar la categoría porque tiene registros asociados.",
            )
        except SQLAlchemyError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="❌ Error interno al eliminar la categoría.",
            )