from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.pais_de_origen import PaisDeOrigenCreate, PaisDeOrigenUpdate, PaisDeOrigenRead
from app.services.pais_de_origen_service import PaisDeOrigenService

router = APIRouter(prefix="/paises-de-origen", tags=["Países de Origen"])

@router.post("/", status_code=status.HTTP_201_CREATED)
def crear_pais(data: PaisDeOrigenCreate, db: Session = Depends(get_db)):
    pais = PaisDeOrigenService.crear(db, data)
    return {
        "mensaje": "País de origen creado exitosamente",
        "data": pais
    }

@router.get("/")
def listar_paises(db: Session = Depends(get_db)):
    paises = PaisDeOrigenService.obtener_todos(db)
    return {
        "mensaje": "Países de origen listados exitosamente",
        "data": paises
    }

@router.get("/{id_pais_de_origen}")
def obtener_pais(id_pais_de_origen: int, db: Session = Depends(get_db)):
    pais = PaisDeOrigenService.obtener_por_id(db, id_pais_de_origen)
    return {
        "mensaje": "País de origen encontrado",
        "data": pais
    }

@router.put("/{id_pais_de_origen}")
def actualizar_pais(id_pais_de_origen: int, data: PaisDeOrigenUpdate, db: Session = Depends(get_db)):
    pais = PaisDeOrigenService.actualizar(db, id_pais_de_origen, data)
    return {
        "mensaje": "País de origen actualizado exitosamente",
        "data": pais
    }

@router.delete("/{id_pais_de_origen}")
def eliminar_pais(id_pais_de_origen: int, db: Session = Depends(get_db)):
    resultado = PaisDeOrigenService.eliminar(db, id_pais_de_origen)
    return {
        "mensaje": "País de origen eliminado exitosamente",
        "data": resultado
    }