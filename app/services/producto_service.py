# Importación de tipos de SQLAlchemy para manejar la sesión y la carga ansiosa (joinedload)
from sqlalchemy.orm import Session, joinedload
# Importación de las excepciones de FastAPI para retornar respuestas HTTP estandarizadas
from fastapi import HTTPException, status
# Importación de los modelos ORM que representan las tablas en PostgreSQL
from app.models.producto import ProductoModel as Producto
from app.models.categorias import CategoriaModel as Categoria
from app.models.detalle_pedido import DetallePedidoModel as DetallePedido
from app.models.pais_de_origen import PaisDeOrigenModel as Pais
# Importación de los esquemas Pydantic que validan las peticiones del Frontend
from app.schemas.producto import ProductoCreate, ProductoUpdate

class ProductoService:

    @staticmethod
    def crear(db: Session, data: ProductoCreate):
        # 1. Validación de lógica de negocio para evitar precios negativos
        if data.precio < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="❌ Precio negativo."
            )
            
        # 1. Validar que el stock inicial registrado sea mayor a cero
        if data.cantidad <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="❌ Cantidad/precio inválido."
            )

        # 2. Verificar que la categoría enviada por la app exista previamente en PostgreSQL
        categoria_existente = db.query(Categoria).filter(Categoria.id_categoria == data.id_categoria).first()
        if not categoria_existente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="❌ Categoría inexistente."
            )

        # 3. Verificar que el país de origen enviado exista en PostgreSQL
        pais_existente = db.query(Pais).filter(Pais.id_pais_de_origen == data.id_pais_de_origen).first()
        if not pais_existente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="❌ País inexistente."
            )

        # 4. Convertir el esquema Pydantic en diccionario de Python
        datos_dict = data.model_dump()
        
        # Mapear 'nombre_producto' a 'nombre' en caso de que la columna en BD se llame 'nombre'
        if "nombre_producto" in datos_dict:
            datos_dict["nombre"] = datos_dict.pop("nombre_producto")

        # Crear la instancia del modelo SQLAlchemy desplegando el diccionario formateado
        nuevo_producto = Producto(**datos_dict)
        
        # Agregar la entidad a la sesión de PostgreSQL
        db.add(nuevo_producto)
        
        # Guardar y confirmar la transacción en la base de datos
        db.commit()
        
        # Recargar para obtener el identificador autogenerado por PostgreSQL
        db.refresh(nuevo_producto)
        
        # Consultar la instancia completa con relaciones precargadas para retornarla al esquema de lectura
        return ProductoService.obtener_por_id(db, nuevo_producto.id_productos)

    @staticmethod
    def obtener_todos(db: Session):
        # Consultar todos los productos cargando de forma ansiosa (JOIN) sus categorías y países
        return (
            db.query(Producto)
            .options(
                joinedload(Producto.categoria),
                joinedload(Producto.pais_de_origen)
            )
            .all()
        )

    @staticmethod
    def obtener_por_id(db: Session, productos_id: int):
        # Consultar un único producto aplicando JOIN sobre sus relaciones
        producto = (
            db.query(Producto)
            .options(
                joinedload(Producto.categoria),
                joinedload(Producto.pais_de_origen)
            )
            .filter(Producto.id_productos == productos_id)
            .first()
        )
        # Lanzar error 404 en caso de que el identificador no exista
        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado."
            )
        return producto

    @staticmethod
    def actualizar(db: Session, producto_id: int, data: ProductoUpdate):
        # Buscar el producto objetivo en PostgreSQL
        producto = db.query(Producto).filter(Producto.id_productos == producto_id).first()
        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado."
            )

        # Validar el precio únicamente si fue enviado en la actualización parcial
        if data.precio is not None and data.precio < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="❌ Precio negativo."
            )
            
        # Validar la cantidad únicamente si fue enviada en la actualización
        if data.cantidad is not None and data.cantidad <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="❌ Cantidad/precio inválido."
            )

        # Validar que la nueva categoría exista si se desea actualizar este campo
        if data.id_categoria is not None:
            categoria_existente = db.query(Categoria).filter(Categoria.id_categoria == data.id_categoria).first()
            if not categoria_existente:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="❌ Categoría inexistente."
                )

        # Validar que el nuevo país exista si se desea actualizar este campo
        if getattr(data, "id_pais_de_origen", None) is not None:
            pais_existente = db.query(Pais).filter(Pais.id_pais_de_origen == data.id_pais_de_origen).first()
            if not pais_existente:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="❌ País inexistente."
                )

        # Extraer únicamente los campos modificados/enviados por el Frontend
        datos_dict = data.model_dump(exclude_unset=True)
        
        # Normalizar la clave de nombre de producto para la base de datos
        if "nombre_producto" in datos_dict:
            datos_dict["nombre"] = datos_dict.pop("nombre_producto")

        # Iterar sobre las claves enviadas para actualizar las propiedades del objeto SQLAlchemy
        for key, value in datos_dict.items():
            setattr(producto, key, value)

        # Confirmar y guardar los cambios en la base de datos
        db.commit()
        db.refresh(producto)
        
        # Retornar la entidad recargando las relaciones para la vista
        return ProductoService.obtener_por_id(db, producto_id)

    @staticmethod
    def eliminar(db: Session, producto_id: int):
        # Buscar la entidad en la base de datos
        producto = db.query(Producto).filter(Producto.id_productos == producto_id).first()
        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado."
            )

        # Proteger integridad referencial: Prevenir borrado si el producto tiene historial en pedidos
        producto_en_pedidos = db.query(DetallePedido).filter(DetallePedido.id_productos == producto_id).first()
        if producto_en_pedidos:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se puede eliminar el producto porque está asociado a un pedido activo."
            )

        # Eliminar el producto de la sesión de PostgreSQL
        db.delete(producto)
        
        # Confirmar el borrado permanentemente
        db.commit()
        return {"mensaje": "Producto eliminado exitosamente"}