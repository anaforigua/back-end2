from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.pedido import PedidoCreate, PedidoUpdate, PedidoRead
from app.services.pedido_service import PedidoService

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])

@router.post("/", status_code=status.HTTP_201_CREATED)
def crear_pedido(data: PedidoCreate, db: Session = Depends(get_db)):
    pedido = PedidoService.crear(db, data)
    return {
        "mensaje": "Pedido creado exitosamente",
        "data": pedido
    }

@router.get("/")
def listar_pedidos(db: Session = Depends(get_db)):
    pedidos = PedidoService.obtener_todos(db)
    return {
        "mensaje": "Pedidos listados exitosamente",
        "data": pedidos
    }

@router.get("/{id_pedidos}")
def obtener_pedido(id_pedidos: int, db: Session = Depends(get_db)):
    pedido = PedidoService.obtener_por_id(db, id_pedidos)
    return {
        "mensaje": "Pedido encontrado",
        "data": pedido
    }

@router.put("/{id_pedidos}")
def actualizar_pedido(id_pedidos: int, data: PedidoUpdate, db: Session = Depends(get_db)):
    pedido = PedidoService.actualizar(db, id_pedidos, data)
    return {
        "mensaje": "Pedido actualizado exitosamente",
        "data": pedido
    }

@router.delete("/{id_pedidos}")
def eliminar_pedido(id_pedidos: int, db: Session = Depends(get_db)):
    resultado = PedidoService.eliminar(db, id_pedidos)
    return {
        "mensaje": "Pedido eliminado exitosamente",
        "data": resultado
    }