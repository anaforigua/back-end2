# Registro de defectos – Revenfy

Se registraron seis defectos en el flujo de pedidos durante la auditoría. **Todos fueron corregidos en esta versión de trabajo y cuentan con pruebas de regresión activas.** No se declaran como resueltos en producción hasta aplicar la migración de base de datos y desplegar el código corregido.

| ID | Defecto | Regla/caso | Severidad | Prioridad | Estado |
|---|---|---|---|---|---|
| DEF-PED-001 | El pedido no persistía ni devolvía el total | PED-05 / PED-CP-06 | Alta | Alta | Corregido; retest aprobado |
| DEF-PED-002 | Se permitía comprar producto marcado no disponible | PED-14 / PED-CP-17 | Alta | Alta | Corregido; retest aprobado |
| DEF-PED-003 | El estado final del producto no coincidía con la regla definida por el backend (Agotado) | PED-07 / PED-CP-09 | Media | Media | Aclarado y alineado con el catálogo: Agotado; retest aprobado |
| DEF-PED-004 | El precio unitario enviado por el cliente podía reemplazar el precio del catálogo | PED-04 / PED-CP-27 | Alta | Alta | Corregido; retest aprobado |
| DEF-PED-005 | Líneas repetidas del mismo producto validaban stock por separado y podían excederlo | PED-06 / PED-CP-26 | Crítica | Alta | Corregido; retest aprobado |
| DEF-PED-006 | Un pedido CANCELADO podía volver a COMPLETADO, dejando inventario inconsistente | PED-18 / PED-CP-23 | Alta | Alta | Corregido; retest aprobado |

## Evidencia y correcciones

- **DEF-PED-001:** se agregó `total` al modelo `PedidoModel`, se calcula sumando los subtotales con el precio real del producto y se expone en `PedidoRead`.
- **DEF-PED-002:** antes de registrar el pedido se exige que `estado_producto` sea `Disponible`.
- **DEF-PED-003:** se conserva el valor `Agotado` cuando la cantidad llega a cero; se ajustó la expectativa de la prueba al vocabulario que usa este backend.
- **DEF-PED-004:** el servicio ignora `precio_unitario` del cuerpo recibido y consulta `ProductoModel.precio`.
- **DEF-PED-005:** se agrupan las cantidades solicitadas por ID de producto antes de compararlas con el inventario; las validaciones ocurren antes de guardar y descontar.
- **DEF-PED-006:** se impide cualquier transición desde CANCELADO hacia otro estado. También se mantiene la restricción de no cancelar pedidos COMPLETADO o ENTREGADO.

## Pendientes fuera del flujo de pedidos

Las pruebas `DET-CP-08` y `DET-CP-09` permanecen XFAIL en `tests/test_detalle_pedido.py`: la creación independiente de detalles no está resuelta y el servicio de detalles no valida completamente la existencia del producto/pedido. Se mantienen separadas para no confundirlas con `POST /pedidos/`, que sí crea sus detalles correctamente.

## Nota de despliegue

La columna nueva requiere actualizar el esquema de la base de datos existente antes de desplegar. En PostgreSQL puede ejecutarse, previa copia de seguridad:

```sql
ALTER TABLE pedidos ADD COLUMN total DOUBLE PRECISION NOT NULL DEFAULT 0;
```

En una base SQLite ya creada, aplicar la migración equivalente o recrear el esquema si se trata de un entorno de desarrollo descartable. Las pruebas automatizadas crean el esquema desde los modelos y por eso verifican la nueva columna en una base limpia.
