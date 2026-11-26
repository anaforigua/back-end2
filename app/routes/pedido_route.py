from fastapi import APIRouter, Depends, Path, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.pedido import PedidoCreate, PedidoUpdate
from app.services.pedido_service import PedidoService
from app.dependences.auth import obtener_usuario_actual

router = APIRouter(
    prefix="/pedidos",
    tags=["Pedidos"],
    dependencies=[Depends(obtener_usuario_actual)],
)


@router.post("/", status_code=status.HTTP_201_CREATED)
def crear_pedido(data: PedidoCreate, db: Session = Depends(get_db)):
    pedido = PedidoService.crear(db, data)
    return {
        "status": "success",
        "mensaje": "Pedido creado exitosamente",
        "data": pedido,
    }


@router.get("/")
def listar_pedidos(db: Session = Depends(get_db)):
    pedidos = PedidoService.obtener_todos(db)
    return {
        "status": "success",
        "mensaje": "Pedidos listados exitosamente",
        "data": pedidos,
    }


@router.get("/{id_pedidos}")
def obtener_pedido(
    id_pedidos: int = Path(..., gt=0),
    db: Session = Depends(get_db),
):
    pedido = PedidoService.obtener_por_id(db, id_pedidos)
    return {
        "status": "success",
        "mensaje": "Pedido encontrado",
        "data": pedido,
    }


@router.put("/{id_pedidos}")
def actualizar_pedido(
    data: PedidoUpdate,
    id_pedidos: int = Path(..., gt=0),
    db: Session = Depends(get_db),
):
    pedido = PedidoService.actualizar(db, id_pedidos, data)
    return {
        "status": "success",
        "mensaje": "Pedido actualizado exitosamente",
        "data": pedido,
    }


@router.delete("/{id_pedidos}")
def eliminar_pedido(
    id_pedidos: int = Path(..., gt=0),
    db: Session = Depends(get_db),
):
    resultado = PedidoService.eliminar(db, id_pedidos)
    return {
        "status": "success",
        "mensaje": "Pedido eliminado exitosamente",
        "data": resultado,
    }