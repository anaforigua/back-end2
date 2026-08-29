from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.red_social import RedSocialCreate, RedSocialUpdate, RedSocialRead
from app.services.red_social_service import RedSocialService

router = APIRouter(prefix="/redes-sociales", tags=["Redes Sociales"])

@router.post("/", response_model=RedSocialRead, status_code=status.HTTP_201_CREATED)
def crear_red_social(data: RedSocialCreate, db: Session = Depends(get_db)):
    return RedSocialService.crear(db, data)

@router.get("/", response_model=list[RedSocialRead])
def listar_redes_sociales(db: Session = Depends(get_db)):
    return RedSocialService.obtener_todos(db)

@router.get("/{id_red_social}", response_model=RedSocialRead)
def obtener_red_social(id_red_social: int, db: Session = Depends(get_db)):
    return RedSocialService.obtener_por_id(db, id_red_social)

@router.put("/{id_red_social}", response_model=RedSocialRead)
def actualizar_red_social(id_red_social: int, data: RedSocialUpdate, db: Session = Depends(get_db)):
    return RedSocialService.actualizar(db, id_red_social, data)

@router.delete("/{id_red_social}")
def eliminar_red_social(id_red_social: int, db: Session = Depends(get_db)):
    return RedSocialService.eliminar(db, id_red_social)