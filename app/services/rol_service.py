from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.rol import Rol
from app.schemas.rol import RolCreate, RolUpdate

ROLES_PERMITIDOS = {"administrador", "vendedor", "comprador"}

class RolService:

    @staticmethod
    def crear(db: Session, data: RolCreate):
        nombre_normalizado = data.nombre_rol.strip().lower()

        # 1. Validar que sea uno de los tres roles permitidos
        if nombre_normalizado not in ROLES_PERMITIDOS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Rol no permitido. Los únicos roles válidos son: Administrador, Vendedor y Comprador."
            )

        # 2. Validar que el rol de administrador solo exista una vez
        if nombre_normalizado == "administrador":
            admin_existente = db.query(Rol).filter(Rol.nombre_rol.ilike("administrador")).first()
            if admin_existente:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Ya existe el rol de Administrador y solo puede registrarse una vez."
                )

        # 3. Validar si ya existe otro rol igual
        rol_existente = db.query(Rol).filter(Rol.nombre_rol.ilike(data.nombre_rol)).first()
        if rol_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El rol ya se encuentra registrado."
            )

        nuevo_rol = Rol(**data.dict())
        db.add(nuevo_rol)
        db.commit()
        db.refresh(nuevo_rol)
        return nuevo_rol

    @staticmethod
    def obtener_todos(db: Session):
        return db.query(Rol).all()

    @staticmethod
    def obtener_por_id(db: Session, rol_id: int):
        rol = db.query(Rol).filter(Rol.id == rol_id).first()
        if not rol:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Rol no encontrado"
            )
        return rol

    @staticmethod
    def actualizar(db: Session, rol_id: int, data: RolUpdate):
        rol = RolService.obtener_por_id(db, rol_id)
        
        if data.nombre_rol:
            nombre_normalizado = data.nombre_rol.strip().lower()
            if nombre_normalizado not in ROLES_PERMITIDOS:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Rol no permitido."
                )
            if nombre_normalizado == "administrador" and rol.nombre_rol.lower() != "administrador":
                admin_existente = db.query(Rol).filter(Rol.nombre_rol.ilike("administrador")).first()
                if admin_existente:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Ya existe un rol de Administrador en el sistema."
                    )

        for key, value in data.dict(exclude_unset=True).items():
            setattr(rol, key, value)
            
        db.commit()
        db.refresh(rol)
        return rol

    @staticmethod
    def eliminar(db: Session, rol_id: int):
        rol = RolService.obtener_por_id(db, rol_id)
        if rol.nombre_rol.lower() == "administrador":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se puede eliminar el rol de Administrador."
            )
        db.delete(rol)
        db.commit()
        return {"mensaje": "Rol eliminado exitosamente"}