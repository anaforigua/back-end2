from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from app.models.pedido import PedidoModel
from app.models.usuario import UsuarioModel
from app.models.detalle_pedido import DetallePedidoModel
from app.models.producto import ProductoModel
from app.schemas.pedido import PedidoCreate, PedidoUpdate

class PedidoService:
    
    @staticmethod
    def crear(db: Session, data: PedidoCreate) -> PedidoModel:
        # RB01 — Usuario obligatorio: Verificar si el usuario existe
        usuario_existente = db.query(UsuarioModel).filter(UsuarioModel.id_usuarios == data.id_usuarios).first()
        if not usuario_existente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="❌ El usuario especificado no existe."
            )

        # RB02 — El pedido debe contener productos
        if not data.detalles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="❌ El pedido debe contener al menos un producto."
            )

        total_pedido = 0.0
        detalles_calculados = []

        for detalle in data.detalles:
            # RB04 — Cantidad válida (> 0)
            if detalle.cantidad <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="❌ La cantidad solicitada debe ser mayor que cero."
                )

            # RB03 — Solo productos disponibles (verificar existencia)
            producto = db.query(ProductoModel).filter(ProductoModel.id_productos == detalle.id_productos).first()
            if not producto:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"❌ El producto con ID {detalle.id_productos} no existe."
                )

            # RB05 — Disponibilidad (Stock suficiente)
            if producto.stock < detalle.cantidad:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"❌ Stock insuficiente para el producto '{producto.nombre_producto}'. Stock disponible: {producto.stock}"
                )

            # RB06 — Cálculo automático del total y subtotal unitario histórico
            precio_unitario = detalle.precio_unitario if detalle.precio_unitario else producto.precio
            subtotal = detalle.cantidad * precio_unitario
            total_pedido += subtotal

            detalles_calculados.append({
                "producto": producto,
                "cantidad": detalle.cantidad,
                "precio_unitario": precio_unitario,
                "subtotal": subtotal
            })

        # RB07 — Estado inicial PENDIENTE por defecto
        pedido_data = data.model_dump(exclude={"detalles", "fecha"})
        if not pedido_data.get("estado_pedido"):
            pedido_data["estado_pedido"] = "PENDIENTE"
        
        # Asignar el total calculado al modelo del pedido
        pedido_data["total"] = total_pedido

        db_item = PedidoModel(**pedido_data)
        db.add(db_item)
        db.commit()
        db.refresh(db_item)

        # Registrar los detalles, descontar stock y actualizar estado del producto si se agota
        for item in detalles_calculados:
            db_detalle = DetallePedidoModel(
                id_pedidos=db_item.id_pedidos,
                id_productos=item["producto"].id_productos,
                cantidad=item["cantidad"],
                precio_unitario=item["precio_unitario"],
                subtotal=item["subtotal"]
            )
            db.add(db_detalle)
            
            # Descontar stock
            item["producto"].stock -= item["cantidad"]
            
            # Si el stock llega a 0, actualizar estado a vendido si el modelo lo soporta
            if item["producto"].stock == 0:
                if hasattr(item["producto"], "estado"):
                    item["producto"].estado = "vendido"
                elif hasattr(item["producto"], "estado_producto"):
                    item["producto"].estado_producto = "vendido"

            db.add(item["producto"])

        db.commit()
        db.refresh(db_item)
        
        # Retornar el pedido con las relaciones cargadas
        return PedidoService.obtener_por_id(db, db_item.id_pedidos)

    @staticmethod
    def obtener_todos(db: Session) -> list[PedidoModel]:
        return db.query(PedidoModel).options(
            joinedload(PedidoModel.detalles).joinedload(DetallePedidoModel.producto)
        ).all()

    @staticmethod
    def obtener_por_id(db: Session, id_pedidos: int) -> PedidoModel:
        db_item = db.query(PedidoModel).options(
            joinedload(PedidoModel.detalles).joinedload(DetallePedidoModel.producto)
        ).filter(PedidoModel.id_pedidos == id_pedidos).first()
        
        if not db_item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado")
        return db_item

    @staticmethod
    def actualizar(db: Session, id_pedidos: int, data: PedidoUpdate) -> PedidoModel:
        db_item = PedidoService.obtener_por_id(db, id_pedidos)
        datos_actualizacion = data.model_dump(exclude_unset=True)
        
        # RB08, RB09 — Control de estados y restricciones de cancelación
        if "estado_pedido" in datos_actualizacion:
            nuevo_estado = datos_actualizacion["estado_pedido"]
            estado_actual = db_item.estado_pedido

            # Un pedido COMPLETADO no puede pasar a CANCELADO
            if estado_actual == "COMPLETADO" and nuevo_estado == "CANCELADO":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="❌ No se puede cancelar un pedido que ya ha sido completado."
                )
            
            # Si se cancela el pedido, devolvemos el stock y cambiamos el estado del producto a disponible
            if nuevo_estado == "CANCELADO" and estado_actual != "CANCELADO":
                for detalle in db_item.detalles:
                    producto = db.query(ProductoModel).filter(ProductoModel.id_productos == detalle.id_productos).first()
                    if producto:
                        producto.stock += detalle.cantidad
                        
                        # Cambiar estado de vendido a disponible de forma segura
                        if hasattr(producto, "estado"):
                            producto.estado = "disponible"
                        elif hasattr(producto, "estado_producto"):
                            producto.estado_producto = "disponible"
                            
                        db.add(producto)

        for key, value in datos_actualizacion.items():
            setattr(db_item, key, value)
            
        db.commit()
        db.refresh(db_item)
        return PedidoService.obtener_por_id(db, db_item.id_pedidos)

    @staticmethod
    def eliminar(db: Session, id_pedidos: int) -> dict:
        db_item = PedidoService.obtener_por_id(db, id_pedidos)
        
        # RB10 — Integridad del pedido
        db.delete(db_item)
        db.commit()
        return {"mensaje": "Pedido eliminado exitosamente"}