from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.usuario import UsuarioModel
from app.models.roles_usuarios import RolUsuarioModel
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate

class UsuarioService:
    @staticmethod
    def crear(db: Session, data: UsuarioCreate) -> UsuarioModel:
        correo_existente = db.query(UsuarioModel).filter(UsuarioModel.email == data.email).first()
        if correo_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="El correo repetido no está permitido."
            )

        datos_usuario = data.model_dump(exclude={"id_roles"})
        db_item = UsuarioModel(**datos_usuario)
        
        db.add(db_item)
        db.commit()
        db.refresh(db_item)

        if data.id_roles:
            for rol_id in data.id_roles:
                nuevo_rol_usuario = RolUsuarioModel(
                    id_usuario=db_item.id_usuarios,
                    id_rol=rol_id
                )
                db.add(nuevo_rol_usuario)
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
        
        datos_actualizacion = data.model_dump(exclude_unset=True, exclude={"id_roles"})
        
        if "contrasena" in datos_actualizacion and datos_actualizacion["contrasena"]:
            if datos_actualizacion["contrasena"] == db_item.contrasena:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="La nueva contraseña no puede ser igual a la anterior."
                )
        
        for key, value in datos_actualizacion.items():
            setattr(db_item, key, value)
            
        if data.id_roles is not None:
            db.query(RolUsuarioModel).filter(RolUsuarioModel.id_usuario == id_usuarios).delete()
            
            for rol_id in data.id_roles:
                nuevo_rol_usuario = RolUsuarioModel(
                    id_usuario=id_usuarios,
                    id_rol=rol_id
                )
                db.add(nuevo_rol_usuario)
            
        db.commit()
        db.refresh(db_item)
        return db_item

    @staticmethod
    def eliminar(db: Session, id_usuarios: int) -> dict:
        db_item = UsuarioService.obtener_por_id(db, id_usuarios)
        
        db.query(RolUsuarioModel).filter(RolUsuarioModel.id_usuario == id_usuarios).delete()
        
        db.delete(db_item)
        db.commit()
        return {"mensaje": "Usuario eliminado exitosamente"}