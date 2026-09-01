from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.usuario import UsuarioModel
from app.models.roles_usuarios import RolUsuarioModel  # Asegúrate de importar tu modelo de la tabla intermedia
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate

class UsuarioService:
    @staticmethod
    def crear(db: Session, data: UsuarioCreate) -> UsuarioModel:
        # Validación añadida: Verificar si el correo ya está registrado en la base de datos
        correo_existente = db.query(UsuarioModel).filter(UsuarioModel.email == data.email).first()
        if correo_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="El correo repetido no está permitido."
            )

        # 1. Separamos los datos básicos del usuario excluyendo los id_roles
        datos_usuario = data.model_dump(exclude={"id_roles"})
        db_item = UsuarioModel(**datos_usuario)
        
        db.add(db_item)
        db.commit()
        db.refresh(db_item)

        # 2. Registramos los roles en la entidad intermedia RolUsuarioModel
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
        
        # Excluimos id_roles del volcado directo de atributos del usuario
        datos_actualizacion = data.model_dump(exclude_unset=True, exclude={"id_roles"})
        
        for key, value in datos_actualizacion.items():
            setattr(db_item, key, value)
            
        # Si se envían nuevos roles en la actualización, actualizamos la tabla intermedia
        if data.id_roles is not None:
            # Eliminamos los roles anteriores asociados a este usuario
            db.query(RolUsuarioModel).filter(RolUsuarioModel.id_usuario == id_usuarios).delete()
            
            # Insertamos los nuevos roles
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
        
        # Opcional por seguridad si no tienes cascada en la BD: 
        # limpiar primero los registros de la tabla intermedia
        db.query(RolUsuarioModel).filter(RolUsuarioModel.id_usuario == id_usuarios).delete()
        
        db.delete(db_item)
        db.commit()
        return {"mensaje": "Usuario eliminado exitosamente"}