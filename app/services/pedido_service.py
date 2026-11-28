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

    # --- Métodos auxiliares de crear() ---
    @staticmethod
    def _validar_usuario_y_detalles(db: Session, data: PedidoCreate):
        usuario = db.query(UsuarioModel).filter(
            UsuarioModel.id_usuarios == data.id_usuarios
        ).first()
        if not usuario:
            raise HTTPException(status_code=404, detail="El usuario especificado no existe.")
        if not data.detalles:
            raise HTTPException(status_code=400, detail="El pedido debe contener al menos un producto.")

    @staticmethod
    def _agrupar_cantidades(data: PedidoCreate) -> dict[int, int]:
        # Agrupar líneas repetidas para validar el stock acumulado por producto.
        cantidades: dict[int, int] = {}
        for detalle in data.detalles:
            if detalle.cantidad <= 0:
                raise HTTPException(status_code=400, detail="La cantidad solicitada debe ser mayor que cero.")
            cantidades[detalle.id_productos] = cantidades.get(detalle.id_productos, 0) + detalle.cantidad
        return cantidades

    @staticmethod
    def _validar_producto(db: Session, producto_id: int, cantidad_total: int) -> ProductoModel:
        producto = db.query(ProductoModel).filter(
            ProductoModel.id_productos == producto_id
        ).first()
        if not producto:
            raise HTTPException(status_code=404, detail=f"El producto con ID {producto_id} no existe.")
        if (getattr(producto, "estado_producto", "Disponible") or "").casefold() != "disponible".casefold():
            raise HTTPException(status_code=400, detail=f"El producto '{producto.nombre}' no está disponible.")
        stock = PedidoService._obtener_stock(producto)
        if stock < cantidad_total:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuficiente para el producto '{producto.nombre}'. Stock disponible: {stock}"
            )
        return producto

    @staticmethod
    def _calcular_detalles(data: PedidoCreate, productos: dict):
        total = 0.0
        detalles_calculados = []
        for detalle in data.detalles:
            producto = productos[detalle.id_productos]
            # El precio siempre procede del catálogo; nunca del payload del cliente.
            subtotal = detalle.cantidad * float(producto.precio)
            total += subtotal
            detalles_calculados.append((producto, detalle.cantidad, subtotal))
        return total, detalles_calculados

    @staticmethod
    def _guardar_pedido(db: Session, data: PedidoCreate, total: float, detalles_calculados: list) -> PedidoModel:
        pedido_data = data.model_dump(exclude={"detalles", "fecha"})
        pedido_data["estado_pedido"] = (pedido_data.get("estado_pedido") or "PENDIENTE").upper()
        pedido_data["total"] = total

        try:
            pedido = PedidoModel(**pedido_data)
            db.add(pedido)
            db.flush()
            for producto, cantidad, subtotal in detalles_calculados:
                db.add(DetallePedidoModel(
                    id_pedidos=pedido.id_pedidos,
                    id_productos=producto.id_productos,
                    cantidad=cantidad,
                    subtotal=subtotal,
                ))
                PedidoService._modificar_stock(producto, -cantidad)
                if PedidoService._obtener_stock(producto) == 0:
                    producto.estado_producto = "Agotado"
                db.add(producto)
            db.commit()
        except Exception:
            db.rollback()
            raise
        return pedido

    @staticmethod
    def crear(db: Session, data: PedidoCreate) -> PedidoModel:
        PedidoService._validar_usuario_y_detalles(db, data)
        cantidades = PedidoService._agrupar_cantidades(data)

        productos = {}
        for producto_id, cantidad_total in cantidades.items():
            productos[producto_id] = PedidoService._validar_producto(db, producto_id, cantidad_total)

        total, detalles_calculados = PedidoService._calcular_detalles(data, productos)
        pedido = PedidoService._guardar_pedido(db, data, total, detalles_calculados)
        return PedidoService.obtener_por_id(db, pedido.id_pedidos)

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

    # --- Métodos auxiliares de actualizar() ---
    @staticmethod
    def _validar_transicion_estado(actual: str, nuevo: str):
        if actual in {"COMPLETADO", "ENTREGADO"} and nuevo == "CANCELADO":
            raise HTTPException(status_code=400, detail="No se puede cancelar un pedido completado o entregado.")
        if actual == "CANCELADO" and nuevo != "CANCELADO":
            raise HTTPException(status_code=400, detail="No se puede cambiar el estado de un pedido cancelado.")

    @staticmethod
    def _restaurar_stock(db: Session, pedido: PedidoModel):
        for detalle in pedido.detalles:
            producto = db.query(ProductoModel).filter(
                ProductoModel.id_productos == detalle.id_productos
            ).first()
            if producto:
                PedidoService._modificar_stock(producto, detalle.cantidad)
                producto.estado_producto = "Disponible"
                db.add(producto)

    @staticmethod
    def _procesar_cambio_estado(db: Session, pedido: PedidoModel, estado: str) -> str:
        nuevo = estado.upper()
        actual = (pedido.estado_pedido or "").upper()
        PedidoService._validar_transicion_estado(actual, nuevo)
        if nuevo == "CANCELADO" and actual != "CANCELADO":
            PedidoService._restaurar_stock(db, pedido)
        return nuevo

    @staticmethod
    def actualizar(db: Session, id_pedidos: int, data: PedidoUpdate) -> PedidoModel:
        pedido = PedidoService.obtener_por_id(db, id_pedidos)
        cambios = data.model_dump(exclude_unset=True)
        if "estado_pedido" in cambios and cambios["estado_pedido"] is not None:
            cambios["estado_pedido"] = PedidoService._procesar_cambio_estado(
                db, pedido, cambios["estado_pedido"]
            )
        for campo, valor in cambios.items():
            setattr(pedido, campo, valor)
        db.commit()
        db.refresh(pedido)
        return PedidoService.obtener_por_id(db, pedido.id_pedidos)

    @staticmethod
    def eliminar(db: Session, id_pedidos: int) -> dict:
        db_item = PedidoService.obtener_por_id(db, id_pedidos)
        db.delete(db_item)
        db.commit()
        return {"mensaje": "Pedido eliminado exitosamente"}