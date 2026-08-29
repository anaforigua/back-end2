from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.detalle_pedido import DetallePedidoModel
from app.schemas.detalle_pedido import DetallePedidoCreate, DetallePedidoUpdate

class DetallePedidoService:
    @staticmethod
    def crear(db: Session, data: DetallePedidoCreate) -> DetallePedidoModel:
        db_item = DetallePedidoModel(**data.model_dump())
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item

    @staticmethod
    def obtener_todos(db: Session) -> list[DetallePedidoModel]:
        return db.query(DetallePedidoModel).all()

    @staticmethod
    def obtener_por_id(db: Session, detalle_pedido: int) -> DetallePedidoModel:
        db_item = db.query(DetallePedidoModel).filter(DetallePedidoModel.detalle_pedido == detalle_pedido).first()
        if not db_item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Detalle de pedido no encontrado")
        return db_item

    @staticmethod
    def actualizar(db: Session, detalle_pedido: int, data: DetallePedidoUpdate) -> DetallePedidoModel:
        db_item = DetallePedidoService.obtener_por_id(db, detalle_pedido)
        datos_actualizacion = data.model_dump(exclude_unset=True)
        
        for key, value in datos_actualizacion.items():
            setattr(db_item, key, value)
            
        db.commit()
        db.refresh(db_item)
        return db_item

    @staticmethod
    def eliminar(db: Session, detalle_pedido: int) -> dict:
        db_item = DetallePedidoService.obtener_por_id(db, detalle_pedido)
        db.delete(db_item)
        db.commit()
        return {"mensaje": "Detalle de pedido eliminado exitosamente"}