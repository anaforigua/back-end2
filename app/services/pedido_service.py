from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.pedido import PedidoModel
from app.schemas.pedido import PedidoCreate, PedidoUpdate

class PedidoService:
    @staticmethod
    def crear(db: Session, data: PedidoCreate) -> PedidoModel:
        db_item = PedidoModel(**data.model_dump())
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item

    @staticmethod
    def obtener_todos(db: Session) -> list[PedidoModel]:
        return db.query(PedidoModel).all()

    @staticmethod
    def obtener_por_id(db: Session, id_pedido: int) -> PedidoModel:
        db_item = db.query(PedidoModel).filter(PedidoModel.id_pedido == id_pedido).first()
        if not db_item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado")
        return db_item

    @staticmethod
    def actualizar(db: Session, id_pedido: int, data: PedidoUpdate) -> PedidoModel:
        db_item = PedidoService.obtener_por_id(db, id_pedido)
        datos_actualizacion = data.model_dump(exclude_unset=True)
        
        for key, value in datos_actualizacion.items():
            setattr(db_item, key, value)
            
        db.commit()
        db.refresh(db_item)
        return db_item

    @staticmethod
    def eliminar(db: Session, id_pedido: int) -> dict:
        db_item = PedidoService.obtener_por_id(db, id_pedido)
        db.delete(db_item)
        db.commit()
        return {"mensaje": "Pedido eliminado exitosamente"}