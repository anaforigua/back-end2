from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.pais_de_origen import PaisDeOrigenModel
from app.schemas.pais_de_origen import PaisDeOrigenCreate, PaisDeOrigenUpdate

class PaisDeOrigenService:
    @staticmethod
    def crear(db: Session, data: PaisDeOrigenCreate) -> PaisDeOrigenModel:
        db_item = PaisDeOrigenModel(**data.model_dump())
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item

    @staticmethod
    def obtener_todos(db: Session) -> list[PaisDeOrigenModel]:
        return db.query(PaisDeOrigenModel).all()

    @staticmethod
    def obtener_por_id(db: Session, id_pais_de_origen: int) -> PaisDeOrigenModel:
        db_item = db.query(PaisDeOrigenModel).filter(PaisDeOrigenModel.id_pais_de_origen == id_pais_de_origen).first()
        if not db_item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="País de origen no encontrado")
        return db_item

    @staticmethod
    def actualizar(db: Session, id_pais_de_origen: int, data: PaisDeOrigenUpdate) -> PaisDeOrigenModel:
        db_item = PaisDeOrigenService.obtener_por_id(db, id_pais_de_origen)
        datos_actualizacion = data.model_dump(exclude_unset=True)
        
        for key, value in datos_actualizacion.items():
            setattr(db_item, key, value)
            
        db.commit()
        db.refresh(db_item)
        return db_item

    @staticmethod
    def eliminar(db: Session, id_pais_de_origen: int) -> dict:
        db_item = PaisDeOrigenService.obtener_por_id(db, id_pais_de_origen)
        db.delete(db_item)
        db.commit()
        return {"mensaje": "País de origen eliminado exitosamente"}