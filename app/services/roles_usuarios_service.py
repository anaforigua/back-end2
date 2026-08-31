from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.roles_usuarios import RolUsuarioModel as RolUsuario  # Ajusta según tu modelo real
from app.models.usuario import UsuarioModel as Usuario
# Asegúrate de importar tu modelo de rol real (ej: from app.models.rol import Rol as Rol)
from app.schemas.roles_usuarios import RolUsuarioCreate, RolUsuarioUpdate

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

        # 2. Validar que el rol exista (ajusta el filtro según tu modelo de rol)
        # rol_existente = db.query(Rol).filter(Rol.id_rol == data.id_rol).first()
        # if not rol_existente:
        #     raise HTTPException(
        #         status_code=status.HTTP_404_NOT_FOUND,
        #         detail="❌ Rol inexistente."
        #     )

        # 3. Validar si ya existe esta asignación para evitar duplicados
        asignacion_existente = db.query(RolUsuario).filter(
            RolUsuario.id_usuario == data.id_usuario,
            RolUsuario.id_rol == data.id_rol
        ).first()
        if asignacion_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="❌ La relación rol-usuario ya existe."
            )

        nuevo_registro = RolUsuario(**data.model_dump())
        db.add(nuevo_registro)
        db.commit()
        db.refresh(nuevo_registro)
        return nuevo_registro

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
            setattr(registro, key, value)

        db.commit()
        db.refresh(registro)
        return registro

    @staticmethod
    def eliminar(db: Session, id_rol_usuario: int):
        registro = RolUsuarioService.obtener_por_id(db, id_rol_usuario)
        db.delete(registro)
        db.commit()
        return {"mensaje": "Asignación de rol eliminada exitosamente"}