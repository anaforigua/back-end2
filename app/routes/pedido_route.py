from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.pedido import PedidoCreate, PedidoUpdate, PedidoRead
from app.services.pedido_service import PedidoService

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])

@router.post("/", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(data: PedidoCreate, db: Session = Depends(get_db)):
    return PedidoService.crear(db, data)

@router.get("/", response_model=list[PedidoRead])
def listar_pedidos(db: Session = Depends(get_db)):
    return PedidoService.obtener_todos(db)

@router.get("/{id_pedidos}", response_model=PedidoRead)
def obtener_pedido(id_pedidos: int, db: Session = Depends(get_db)):
    return PedidoService.obtener_por_id(db, id_pedidos)

@router.put("/{id_pedidos}", response_model=PedidoRead)
def actualizar_pedido(id_pedidos: int, data: PedidoUpdate, db: Session = Depends(get_db)):
    return PedidoService.actualizar(db, id_pedidos, data)

@router.delete("/{id_pedidos}")
def eliminar_pedido(id_pedidos: int, db: Session = Depends(get_db)):
    return PedidoService.eliminar(db, id_pedidos)