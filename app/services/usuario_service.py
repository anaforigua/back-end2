from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.usuario import UsuarioModel
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate

class UsuarioService:
    @staticmethod
    def crear(db: Session, data: UsuarioCreate) -> UsuarioModel:
        db_item = UsuarioModel(**data.model_dump())
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item

    @staticmethod
    def obtener_todos(db: Session) -> list[UsuarioModel]:
        return db.query(UsuarioModel).all()

    @staticmethod
    def obtener_por_id(db: Session, id_usuarios: int) -> UsuarioModel:
        db_item = db.query(UsuarioModel).filter(UsuarioModel.id_usuarios == id_usuarios).first()
        if not db_item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
        return db_item

    @staticmethod
    def actualizar(db: Session, id_usuarios: int, data: UsuarioUpdate) -> UsuarioModel:
        db_item = UsuarioService.obtener_por_id(db, id_usuarios)
        datos_actualizacion = data.model_dump(exclude_unset=True)
        
        for key, value in datos_actualizacion.items():
            setattr(db_item, key, value)
            
        db.commit()
        db.refresh(db_item)
        return db_item

    @staticmethod
    def eliminar(db: Session, id_usuarios: int) -> dict:
        db_item = UsuarioService.obtener_por_id(db, id_usuarios)
        db.delete(db_item)
        db.commit()
        return {"mensaje": "Usuario eliminado exitosamente"}