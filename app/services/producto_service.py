from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.producto import ProductoModel
from app.schemas.producto import ProductoCreate, ProductoUpdate

class ProductoService:
    @staticmethod
    def crear(db: Session, data: ProductoCreate) -> ProductoModel:
        db_item = ProductoModel(**data.model_dump())
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item

    @staticmethod
    def obtener_todos(db: Session) -> list[ProductoModel]:
        return db.query(ProductoModel).all()

    @staticmethod
    def obtener_por_id(db: Session, id_productos: int) -> ProductoModel:
        db_item = db.query(ProductoModel).filter(ProductoModel.id_productos == id_productos).first()
        if not db_item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
        return db_item

    @staticmethod
    def actualizar(db: Session, id_productos: int, data: ProductoUpdate) -> ProductoModel:
        db_item = ProductoService.obtener_por_id(db, id_productos)
        datos_actualizacion = data.model_dump(exclude_unset=True)
        
        for key, value in datos_actualizacion.items():
            setattr(db_item, key, value)
            
        db.commit()
        db.refresh(db_item)
        return db_item

    @staticmethod
    def eliminar(db: Session, id_productos: int) -> dict:
        db_item = ProductoService.obtener_por_id(db, id_productos)
        db.delete(db_item)
        db.commit()
        return {"mensaje": "Producto eliminado exitosamente"}