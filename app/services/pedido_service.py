from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.pedido import PedidoModel
from app.models.usuario import UsuarioModel
from app.models.detalle_pedido import DetallePedidoModel
from app.schemas.pedido import PedidoCreate, PedidoUpdate

class PedidoService:
    
    @staticmethod
    def crear(db: Session, data: PedidoCreate) -> PedidoModel:
        usuario_existente = db.query(UsuarioModel).filter(UsuarioModel.id_usuarios == data.id_usuarios).first()
        if not usuario_existente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="❌ El usuario especificado no existe."
            )

        # Extraer los datos principales del pedido (sin detalles ni fecha manual)
        pedido_data = data.model_dump(exclude={"detalles", "fecha"})
        db_item = PedidoModel(**pedido_data)
        db.add(db_item)
        db.commit()
        db.refresh(db_item)

        # Registrar los detalles del pedido
        for detalle in data.detalles:
            db_detalle = DetallePedidoModel(
                id_pedidos=db_item.id_pedidos,
                id_productos=detalle.id_productos,
                cantidad=detalle.cantidad,
                subtotal=getattr(detalle, "precio_unitario", getattr(detalle, "subtotal", 0))
            )
            db.add(db_detalle)
        
        if data.detalles:
            db.commit()
            db.refresh(db_item)

        return db_item

    @staticmethod
    def obtener_todos(db: Session) -> list[PedidoModel]:
        return db.query(PedidoModel).all()

    @staticmethod
    def obtener_por_id(db: Session, id_pedidos: int) -> PedidoModel:
        db_item = db.query(PedidoModel).filter(PedidoModel.id_pedidos == id_pedidos).first()
        if not db_item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado")
        return db_item

    @staticmethod
    def actualizar(db: Session, id_pedidos: int, data: PedidoUpdate) -> PedidoModel:
        db_item = PedidoService.obtener_por_id(db, id_pedidos)
        datos_actualizacion = data.model_dump(exclude_unset=True)
        
        for key, value in datos_actualizacion.items():
            setattr(db_item, key, value)
            
        db.commit()
        db.refresh(db_item)
        return db_item

    @staticmethod
    def eliminar(db: Session, id_pedidos: int) -> dict:
        db_item = PedidoService.obtener_por_id(db, id_pedidos)
        db.delete(db_item)
        db.commit()
        return {"mensaje": "Pedido eliminado exitosamente"}