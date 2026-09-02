from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from app.models.pedido import PedidoModel
from app.models.usuario import UsuarioModel
from app.models.detalle_pedido import DetallePedidoModel
from app.models.producto import ProductoModel
from app.schemas.pedido import PedidoCreate, PedidoUpdate

class PedidoService:

    @staticmethod
    def _obtener_stock(producto: ProductoModel) -> int:
        """Obtiene la cantidad/stock del producto sin importar el nombre del atributo en el modelo."""
        if hasattr(producto, "cantidad"):
            return producto.cantidad
        elif hasattr(producto, "stock"):
            return producto.stock
        return 0

    @staticmethod
    def _modificar_stock(producto: ProductoModel, cantidad_cambio: int):
        """Suma o resta stock/cantidad de forma segura."""
        if hasattr(producto, "cantidad"):
            producto.cantidad += cantidad_cambio
        elif hasattr(producto, "stock"):
            producto.stock += cantidad_cambio

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
            stock_actual = PedidoService._obtener_stock(producto)
            if stock_actual < detalle.cantidad:
                nombre = getattr(producto, "nombre_producto", getattr(producto, "nombre", f"ID {producto.id_productos}"))
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"❌ Stock insuficiente para el producto '{nombre}'. Stock disponible: {stock_actual}"
                )

            # RB06 — Cálculo automático del total y subtotal utilizando el precio del producto
            precio_unitario = detalle.precio_unitario if getattr(detalle, "precio_unitario", None) else getattr(producto, "precio", 0.0)
            subtotal = detalle.cantidad * precio_unitario
            total_pedido += subtotal

            detalles_calculados.append({
                "producto": producto,
                "cantidad": detalle.cantidad,
                "subtotal": subtotal
            })

        # RB07 — Estado inicial PENDIENTE por defecto
        pedido_data = data.model_dump(exclude={"detalles", "fecha", "total"})
        if not pedido_data.get("estado_pedido"):
            pedido_data["estado_pedido"] = "PENDIENTE"

        # Guardar pedido principal
        db_item = PedidoModel(**pedido_data)
        db.add(db_item)
        db.commit()
        db.refresh(db_item)

        # Registrar los detalles (sin el atributo precio_unitario)
        for item in detalles_calculados:
            db_detalle = DetallePedidoModel(
                id_pedidos=db_item.id_pedidos,
                id_productos=item["producto"].id_productos,
                cantidad=item["cantidad"],
                subtotal=item["subtotal"]
            )
            db.add(db_detalle)
            
            # Descontar stock
            PedidoService._modificar_stock(item["producto"], -item["cantidad"])
            
            # Si el stock llega a 0 o menos, actualizar estado
            if PedidoService._obtener_stock(item["producto"]) <= 0:
                if hasattr(item["producto"], "estado_producto"):
                    item["producto"].estado_producto = "Agotado"
                elif hasattr(item["producto"], "estado"):
                    item["producto"].estado = "vendido"

            db.add(item["producto"])

        db.commit()
        db.refresh(db_item)
        
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
            nuevo_estado = datos_actualizacion["estado_pedido"].upper()
            estado_actual = db_item.estado_pedido.upper() if db_item.estado_pedido else ""

            # Un pedido COMPLETADO o ENTREGADO no puede pasar a CANCELADO
            if estado_actual in ["COMPLETADO", "ENTREGADO"] and nuevo_estado == "CANCELADO":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="❌ No se puede cancelar un pedido que ya ha sido completado o entregado."
                )
            
            # Si se completa o entrega, verificar disponibilidad del producto (si stock <= 0, pasa a Agotado)
            if nuevo_estado in ["COMPLETADO", "ENTREGADO"]:
                for detalle in db_item.detalles:
                    producto = db.query(ProductoModel).filter(ProductoModel.id_productos == detalle.id_productos).first()
                    if producto and PedidoService._obtener_stock(producto) <= 0:
                        if hasattr(producto, "estado_producto"):
                            producto.estado_producto = "Agotado"
                        elif hasattr(producto, "estado"):
                            producto.estado = "vendido"
                        db.add(producto)

            # Si se cancela el pedido, devolvemos el stock y cambiamos la disponibilidad a Disponible
            if nuevo_estado == "CANCELADO" and estado_actual != "CANCELADO":
                for detalle in db_item.detalles:
                    producto = db.query(ProductoModel).filter(ProductoModel.id_productos == detalle.id_productos).first()
                    if producto:
                        PedidoService._modificar_stock(producto, detalle.cantidad)
                        if hasattr(producto, "estado_producto"):
                            producto.estado_producto = "Disponible"
                        elif hasattr(producto, "estado"):
                            producto.estado = "disponible"
                        db.add(producto)

        for key, value in datos_actualizacion.items():
            setattr(db_item, key, value)
            
        db.commit()
        db.refresh(db_item)
        return PedidoService.obtener_por_id(db, db_item.id_pedidos)

    @staticmethod
    def eliminar(db: Session, id_pedidos: int) -> dict:
        db_item = PedidoService.obtener_por_id(db, id_pedidos)
        db.delete(db_item)
        db.commit()
        return {"mensaje": "Pedido eliminado exitosamente"}