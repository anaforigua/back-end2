from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from app.models.producto import ProductoModel as Producto
from app.models.categorias import CategoriaModel as Categoria
# Importa tu modelo de país de origen según corresponda (ejemplo: from app.models.pais import PaisModel as Pais)
from app.models.detalle_pedido import DetallePedidoModel as DetallePedido
from app.schemas.producto import ProductoCreate, ProductoUpdate
from app.models.pais_de_origen import PaisDeOrigenModel as Pais # Asegúrate de importar el modelo de país arriba

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
        # pais_existente = db.query(Pais).filter(Pais.id_pais == data.id_pais_de_origen).first()
        # if not pais_existente:
        #     raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="❌ País inexistente.")

        nuevo_producto = Producto(**data.model_dump())
        db.add(nuevo_producto)
        db.commit()
        db.refresh(nuevo_producto)
        
        # Retornamos buscando por ID para asegurar que traiga las relaciones cargadas para el esquema de lectura
        return ProductoService.obtener_por_id(db, nuevo_producto.id_productos)

    @staticmethod
    def obtener_todos(db: Session):
        return (
            db.query(Producto)
            .options(
                joinedload(Producto.categoria),
                joinedload(Producto.pais_de_origen)
            )
            .all()
        )

    @staticmethod
    def obtener_por_id(db: Session, producto_id: int):
        producto = (
            db.query(Producto)
            .options(
                joinedload(Producto.categoria),
                joinedload(Producto.pais_de_origen)
            )
            .filter(Producto.id_productos == producto_id)
            .first()
        )
        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado."
            )
        return producto

    @staticmethod
    def actualizar(db: Session, producto_id: int, data: ProductoUpdate):
        producto = db.query(Producto).filter(Producto.id_productos == producto_id).first()
        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado."
            )

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

        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(producto, key, value)

        db.commit()
        db.refresh(producto)
        
        # Retornamos asegurando las relaciones cargadas
        return ProductoService.obtener_por_id(db, producto_id)

    @staticmethod
    def eliminar(db: Session, producto_id: int):
        producto = db.query(Producto).filter(Producto.id_productos == producto_id).first()
        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado."
            )

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