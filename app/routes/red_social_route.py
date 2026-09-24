from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.red_social import RedSocialCreate, RedSocialUpdate, RedSocialRead
from app.services.red_social_service import RedSocialService

router = APIRouter(prefix="/redes-sociales", tags=["Redes Sociales"])

@router.post("/", status_code=status.HTTP_201_CREATED)
def crear_red_social(data: RedSocialCreate, db: Session = Depends(get_db)):
    red_social = RedSocialService.crear(db, data)
    return {
        "status": "success",
        "code": status.HTTP_201_CREATED,
        "mensaje": "Red social creada exitosamente",
        "data": red_social
    }

@router.get("/")
def listar_redes_sociales(db: Session = Depends(get_db)):
    redes_sociales = RedSocialService.obtener_todos(db)
    return {
        "status": "success",
        "code": status.HTTP_200_OK,
        "mensaje": "Redes sociales listadas exitosamente",
        "data": redes_sociales
    }

@router.get("/{id_red_social}")
def obtener_red_social(id_red_social: int, db: Session = Depends(get_db)):
    red_social = RedSocialService.obtener_por_id(db, id_red_social)
    return {
        "status": "success",
        "code": status.HTTP_200_OK,
        "mensaje": "Red social encontrada",
        "data": red_social
    }

@router.put("/{id_red_social}")
def actualizar_red_social(id_red_social: int, data: RedSocialUpdate, db: Session = Depends(get_db)):
    red_social = RedSocialService.actualizar(db, id_red_social, data)
    return {
        "status": "success",
        "code": status.HTTP_200_OK,
        "mensaje": "Red social actualizada exitosamente",
        "data": red_social
    }

@router.delete("/{id_red_social}")
def eliminar_red_social(id_red_social: int, db: Session = Depends(get_db)):
    resultado = RedSocialService.eliminar(db, id_red_social)
    return {
        "status": "success",
        "code": status.HTTP_200_OK,
        "mensaje": "Red social eliminada exitosamente",
        "data": resultado
    }