from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from fastapi import HTTPException, status
from app.models.detalle_pedido import DetallePedidoModel
from app.schemas.detalle_pedido import DetallePedidoCreate, DetallePedidoUpdate

CAMPOS_NO_EDITABLES = {"detalle_pedido"}


class DetallePedidoService:
    @staticmethod
    def crear(db: Session, data: DetallePedidoCreate) -> DetallePedidoModel:
        try:
            db_item = DetallePedidoModel(**data.model_dump())
            db.add(db_item)
            db.commit()
            db.refresh(db_item)
            return db_item
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo crear el detalle de pedido por restricción de integridad o datos inválidos",
            )
        except SQLAlchemyError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error interno al crear el detalle de pedido",
            )

    @staticmethod
    def obtener_todos(db: Session) -> list[DetallePedidoModel]:
        return db.query(DetallePedidoModel).all()

    @staticmethod
    def obtener_por_id(db: Session, detalle_pedido: int) -> DetallePedidoModel:
        db_item = (
            db.query(DetallePedidoModel)
            .filter(DetallePedidoModel.detalle_pedido == detalle_pedido)
            .first()
        )
        if not db_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Detalle de pedido no encontrado",
            )
        return db_item

    @staticmethod
    def actualizar(db: Session, detalle_pedido: int, data: DetallePedidoUpdate) -> DetallePedidoModel:
        db_item = DetallePedidoService.obtener_por_id(db, detalle_pedido)
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
                detail="No se pudo actualizar el detalle de pedido por restricción de integridad",
            )
        except SQLAlchemyError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error interno al actualizar el detalle de pedido",
            )

    @staticmethod
    def eliminar(db: Session, detalle_pedido: int) -> dict:
        db_item = DetallePedidoService.obtener_por_id(db, detalle_pedido)
        try:
            db.delete(db_item)
            db.commit()
            return {"mensaje": "Detalle de pedido eliminado exitosamente"}
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="No se puede eliminar el detalle de pedido porque está asociado a otros registros",
            )
        except SQLAlchemyError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error interno al eliminar el detalle de pedido",
            )