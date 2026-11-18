# Informe de ejecución – Revenfy

## 1. Identificación

- **Proyecto:** Revenfy – backend API.
- **Versión:** copia de trabajo corregida a partir de `back-end2.zip`.
- **Fecha:** 17 de noviembre de 2026.
- **Herramienta:** pytest con FastAPI TestClient y SQLite en memoria.
- **Comando:** `pytest -q`.

## 2. Resultado de ejecución

| Resultado | Cantidad |
|---|---:|
| PASSED | 97 |
| FAILED | 0 |
| XFAILED | 2 |
| BLOCKED | 0 |
| Total reportado por pytest | 99 |

**Aprobación sobre pruebas ejecutadas sin XFAIL:** 97 / 97 = **100 %**. Las dos XFAIL son pruebas conocidas del endpoint independiente de detalles y se informan por separado; no se presentan como aprobadas.

## 3. Alcance de la ejecución

Se ejecutaron las pruebas de categorías, productos, usuarios, pedidos y detalles de pedido. Las seis pruebas que reproducían defectos del flujo de pedidos quedaron activas como pruebas normales después de corregir el servicio; todas aprobaron.

## 4. Retest y regresión

- Se corrigió el cálculo/persistencia del total.
- Se bloqueó la compra de productos no disponibles.
- Se mantuvo `Agotado` como estado de inventario al llegar a cero.
- Se impidió manipular el precio desde el cuerpo de la solicitud.
- Se validó el stock acumulado cuando hay varias líneas del mismo producto.
- Se bloqueó la reactivación de pedidos cancelados.
- Se ejecutó nuevamente la suite completa: 97 PASSED, 0 FAILED y 2 XFAILED.

## 5. Defectos

Seis defectos de pedidos quedaron corregidos en el código de esta entrega. No quedan defectos FAILED en las pruebas del flujo de pedidos. Persisten dos pendientes del endpoint independiente `/detalles-pedido/`, detallados en `registro-defectos.md` y marcados como XFAIL.

## 6. Criterios de salida

| Criterio | Evaluación |
|---|---|
| Pruebas críticas del flujo de pedidos | Cumplido en entorno de pruebas |
| Cero FAILED inesperados | Cumplido |
| Retest de los seis defectos de pedidos | Cumplido |
| Regresión completa | Ejecutada; 97 PASSED |
| Cero pendientes en toda la API | No cumplido: 2 XFAIL en creación independiente de detalles |
| Esquema de base de datos de despliegue actualizado | Pendiente de aplicar migración `total` en la BD existente |

## 7. Conclusión técnica

En el entorno automatizado aislado, el flujo principal de pedidos supera las pruebas: calcula el total con precios del catálogo, valida disponibilidad e inventario, evita stock negativo por líneas repetidas, y conserva la consistencia al cancelar pedidos. La regresión terminó con 97 pruebas aprobadas y ninguna falla inesperada.

No se recomienda declarar la API completa lista para producción todavía: deben resolverse las dos pruebas XFAIL del endpoint independiente de detalles y aplicar la migración de la columna `pedidos.total` en la base de datos real. Las pruebas se realizaron con SQLite en memoria, por lo que no sustituyen una validación de integración contra la instancia PostgreSQL/SQLite usada en despliegue.
