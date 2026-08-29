from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.pais_de_origen import PaisDeOrigenCreate, PaisDeOrigenUpdate, PaisDeOrigenRead
from app.services.pais_de_origen_service import PaisDeOrigenService

router = APIRouter(prefix="/paises-de-origen", tags=["Países de Origen"])

@router.post("/", response_model=PaisDeOrigenRead, status_code=status.HTTP_201_CREATED)
def crear_pais(data: PaisDeOrigenCreate, db: Session = Depends(get_db)):
    return PaisDeOrigenService.crear(db, data)

@router.get("/", response_model=list[PaisDeOrigenRead])
def listar_paises(db: Session = Depends(get_db)):
    return PaisDeOrigenService.obtener_todos(db)

@router.get("/{id_pais_de_origen}", response_model=PaisDeOrigenRead)
def obtener_pais(id_pais_de_origen: int, db: Session = Depends(get_db)):
    return PaisDeOrigenService.obtener_por_id(db, id_pais_de_origen)

@router.put("/{id_pais_de_origen}", response_model=PaisDeOrigenRead)
def actualizar_pais(id_pais_de_origen: int, data: PaisDeOrigenUpdate, db: Session = Depends(get_db)):
    return PaisDeOrigenService.actualizar(db, id_pais_de_origen, data)

@router.delete("/{id_pais_de_origen}")
def eliminar_pais(id_pais_de_origen: int, db: Session = Depends(get_db)):
    return PaisDeOrigenService.eliminar(db, id_pais_de_origen)