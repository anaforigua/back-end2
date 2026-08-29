from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.categorias import CategoriaModel
from app.schemas.categorias import CategoriaCreate, CategoriaUpdate

class CategoriaService:
    @staticmethod
    def crear(db: Session, data: CategoriaCreate) -> CategoriaModel:
        db_item = CategoriaModel(**data.model_dump())
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item

    @staticmethod
    def listar(db: Session):
        return db.query(CategoriaModel).all()

    @staticmethod
    def obtener_por_id(db: Session, id_categoria: int) -> CategoriaModel:
        db_item = db.query(CategoriaModel).filter(CategoriaModel.id_categoria == id_categoria).first()
        if not db_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoría no encontrada"
            )
        return db_item

    @staticmethod
    def actualizar(db: Session, id_categoria: int, data: CategoriaUpdate) -> CategoriaModel:
        db_item = CategoriaService.obtener_por_id(db, id_categoria)
        datos_update = data.model_dump(exclude_unset=True)
        
        for key, value in datos_update.items():
            setattr(db_item, key, value)
            
        db.commit()
        db.refresh(db_item)
        return db_item

    @staticmethod
    def eliminar(db: Session, id_categoria: int):
        db_item = CategoriaService.obtener_por_id(db, id_categoria)
        db.delete(db_item)
        db.commit()
        return {"mensaje": "Categoría eliminada correctamente"}