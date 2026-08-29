from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.red_social import RedSocialModel
from app.schemas.red_social import RedSocialCreate, RedSocialUpdate

class RedSocialService:
    @staticmethod
    def crear(db: Session, data: RedSocialCreate) -> RedSocialModel:
        db_item = RedSocialModel(**data.model_dump())
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item

    @staticmethod
    def obtener_todos(db: Session) -> list[RedSocialModel]:
        return db.query(RedSocialModel).all()

    @staticmethod
    def obtener_por_id(db: Session, id_red_social: int) -> RedSocialModel:
        db_item = db.query(RedSocialModel).filter(RedSocialModel.id_red_social == id_red_social).first()
        if not db_item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Red social no encontrada")
        return db_item

    @staticmethod
    def actualizar(db: Session, id_red_social: int, data: RedSocialUpdate) -> RedSocialModel:
        db_item = RedSocialService.obtener_por_id(db, id_red_social)
        datos_actualizacion = data.model_dump(exclude_unset=True)
        
        for key, value in datos_actualizacion.items():
            setattr(db_item, key, value)
            
        db.commit()
        db.refresh(db_item)
        return db_item

    @staticmethod
    def eliminar(db: Session, id_red_social: int) -> dict:
        db_item = RedSocialService.obtener_por_id(db, id_red_social)
        db.delete(db_item)
        db.commit()
        return {"mensaje": "Red social eliminada exitosamente"}