from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.producto import ProductoModel as Producto
from app.models.categorias import CategoriaModel as Categoria
# Importa tu modelo de país de origen según corresponda (ejemplo: from app.models.pais import PaisModel as Pais)
from app.models.detalle_pedido import DetallePedidoModel as DetallePedido
from app.schemas.producto import ProductoCreate, ProductoUpdate

class ProductoService:

    @staticmethod
    def crear(db: Session, data: ProductoCreate):
        # 1. Validación estricta de precio negativo o cantidad inválida
        if data.precio < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="❌ Precio negativo."
            )
        if data.cantidad <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="❌ Cantidad/precio inválido."
            )

        # 2. No permitir asociarlo a una categoría que no existe
        categoria_existente = db.query(Categoria).filter(Categoria.id_categoria == data.id_categoria).first()
        if not categoria_existente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="❌ Categoría inexistente."
            )

        # 3. No permitir asociarlo a un país de origen que no existe (Validación añadida)
        # Asegúrate de cambiar 'id_pais_de_origen' o el nombre del modelo si varía en tu base de datos
        # pais_existente = db.query(Pais).filter(Pais.id_pais == data.id_pais_de_origen).first()
        # if not pais_existente:
        #     raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="❌ País inexistente.")

        nuevo_producto = Producto(**data.dict())
        db.add(nuevo_producto)
        db.commit()
        db.refresh(nuevo_producto)
        return nuevo_producto

    @staticmethod
    def obtener_todos(db: Session):
        return db.query(Producto).all()

    @staticmethod
    def obtener_por_id(db: Session, producto_id: int):
        producto = db.query(Producto).filter(Producto.id_productos == producto_id).first()
        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado."
            )
        return producto

    @staticmethod
    def actualizar(db: Session, producto_id: int, data: ProductoUpdate):
        producto = ProductoService.obtener_por_id(db, producto_id)

        # Validar precio negativo o cantidad inválida en actualización
        if data.precio is not None and data.precio < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="❌ Precio negativo."
            )
        if data.cantidad is not None and data.cantidad <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="❌ Cantidad/precio inválido."
            )

        # Validar categoría existente si se intenta modificar
        if data.id_categoria is not None:
            categoria_existente = db.query(Categoria).filter(Categoria.id_categoria == data.id_categoria).first()
            if not categoria_existente:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="❌ Categoría inexistente."
                )

        for key, value in data.dict(exclude_unset=True).items():
            setattr(producto, key, value)

        db.commit()
        db.refresh(producto)
        return producto

    @staticmethod
    def eliminar(db: Session, producto_id: int):
        producto = ProductoService.obtener_por_id(db, producto_id)

        # No permitir eliminar un producto si está asociado a un detalle de pedido
        producto_en_pedidos = db.query(DetallePedido).filter(DetallePedido.id_producto == producto_id).first()
        if producto_en_pedidos:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se puede eliminar el producto porque está asociado a un pedido activo."
            )

        db.delete(producto)
        db.commit()
        return {"mensaje": "Producto eliminado exitosamente"}