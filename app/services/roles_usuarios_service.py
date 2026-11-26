from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from fastapi import HTTPException, status
from app.models.roles_usuarios import RolUsuarioModel as RolUsuario
from app.models.usuario import UsuarioModel as Usuario
from app.schemas.roles_usuarios import RolUsuarioCreate, RolUsuarioUpdate

CAMPOS_NO_EDITABLES = {"id_rol_usuario"}


class RolUsuarioService:

    @staticmethod
    def crear(db: Session, data: RolUsuarioCreate):
        # 1. Validar que el usuario exista
        usuario_existente = db.query(Usuario).filter(Usuario.id_usuarios == data.id_usuario).first()
        if not usuario_existente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="❌ Usuario inexistente."
            )

        # 2. Validar si ya existe esta asignación para evitar duplicados
        asignacion_existente = db.query(RolUsuario).filter(
            RolUsuario.id_usuario == data.id_usuario,
            RolUsuario.id_rol == data.id_rol
        ).first()
        if asignacion_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="❌ La relación rol-usuario ya existe."
            )

        try:
            nuevo_registro = RolUsuario(**data.model_dump())
            db.add(nuevo_registro)
            db.commit()
            db.refresh(nuevo_registro)
            return nuevo_registro
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="❌ No se pudo asignar el rol por conflicto o regla de integridad."
            )
        except SQLAlchemyError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="❌ Error interno al registrar la asignación de rol."
            )

    @staticmethod
    def obtener_todos(db: Session):
        return db.query(RolUsuario).all()

    @staticmethod
    def obtener_por_id(db: Session, id_rol_usuario: int):
        registro = db.query(RolUsuario).filter(RolUsuario.id_rol_usuario == id_rol_usuario).first()
        if not registro:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Registro de rol-usuario no encontrado."
            )
        return registro

    @staticmethod
    def actualizar(db: Session, id_rol_usuario: int, data: RolUsuarioUpdate):
        registro = RolUsuarioService.obtener_por_id(db, id_rol_usuario)

        # Validar usuario si se intenta actualizar
        if data.id_usuario is not None:
            usuario_existente = db.query(Usuario).filter(Usuario.id_usuarios == data.id_usuario).first()
            if not usuario_existente:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="❌ Usuario inexistente."
                )

        datos_actualizacion = data.model_dump(exclude_unset=True)
        for key, value in datos_actualizacion.items():
            if key not in CAMPOS_NO_EDITABLES and hasattr(registro, key):
                setattr(registro, key, value)

        try:
            db.commit()
            db.refresh(registro)
            return registro
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="❌ No se pudo actualizar la asignación por regla de integridad."
            )
        except SQLAlchemyError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="❌ Error interno al actualizar la asignación de rol."
            )

    @staticmethod
    def eliminar(db: Session, id_rol_usuario: int):
        registro = RolUsuarioService.obtener_por_id(db, id_rol_usuario)
        try:
            db.delete(registro)
            db.commit()
            return {"mensaje": "Asignación de rol eliminada exitosamente"}
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="❌ No se puede eliminar la asignación porque está en uso."
            )
        except SQLAlchemyError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="❌ Error interno al eliminar la asignación de rol."
            )