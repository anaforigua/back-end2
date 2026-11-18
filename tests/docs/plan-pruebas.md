# Plan de pruebas – Revenfy (backend)

- **Proyecto:** Revenfy – API de gestión de productos, usuarios, categorías y pedidos.
- **Versión auditada:** copia de trabajo basada en `back-end2.zip`, con correcciones de pedidos aplicadas.
- **Fecha de ejecución:** 17 de noviembre de 2026.
- **Responsable:** Felipe (aprendiz ADSO – SENA).
- **Tecnologías:** Python, FastAPI, SQLAlchemy, Pydantic y pytest.

## 1. Objetivo

Verificar el comportamiento funcional de los endpoints del backend, con énfasis en el ciclo de compra: validación del comprador y productos, cálculo de subtotales/total, descuento y restitución de inventario, estados del pedido y consistencia de datos. También se cubren categorías, productos, usuarios y detalles de pedido.

## 2. Alcance

- Categorías: crear, listar, consultar por ID y rechazar nombres inválidos/duplicados.
- Pedidos: crear y consultar pedidos, calcular total y subtotales, validar usuario/producto/cantidad/stock, descontar inventario, cancelar y restituir stock, controlar transiciones de estado, actualizar y eliminar.
- Detalles de pedido: consultar, listar, actualizar y eliminar; el endpoint de creación independiente queda identificado como pendiente.
- Productos y usuarios: pruebas de integración usadas como datos y precondiciones del flujo de pedidos, además de sus pruebas específicas.

### Fuera de alcance

Pruebas de carga, penetración, autenticación/autorización exhaustiva, interfaz gráfica, despliegue productivo y pruebas contra una base de datos real de producción.

## 3. Endpoints bajo prueba

| Recurso | Métodos y rutas |
|---|---|
| Categorías | `POST/GET /categorias/`, `GET /categorias/{id}` |
| Pedidos | `POST/GET /pedidos/`, `GET/PUT/DELETE /pedidos/{id}` |
| Detalles | `GET/POST /detalles-pedido/`, `GET/PUT/DELETE /detalles-pedido/{id}` |
| Productos | `/productos/` y `/productos/{id}` |
| Usuarios | `/usuarios/` y `/usuarios/{id}` |

## 4. Estrategia

- **Positivas:** operaciones válidas y respuestas satisfactorias.
- **Negativas:** IDs inexistentes, usuario inválido, producto no disponible, stock insuficiente y cantidades inválidas.
- **Frontera:** cantidad cero, cantidad negativa, compra exacta del stock, y múltiples líneas del mismo producto que exceden el inventario en conjunto.
- **Integración:** flujo completo comprador → pedido → detalle → inventario.
- **Regresión:** toda la suite después de corregir las seis fallas detectadas en pedidos.

##  5. Riesgos

| Riesgo | Probabilidad | Impacto | Prioridad | Mitigación |
|---|---|---|---|---|
| Inventario negativo por líneas repetidas | Media | Alto | Alta | Agrupar cantidades por producto antes de validar stock |
| Manipulación del precio desde el cliente | Media | Alto | Alta | Tomar precio exclusivamente del catálogo |
| Pedido creado sin total persistido | Alta | Medio | Alta | Columna `total` y prueba de suma de subtotales |
| Compra de producto no disponible | Media | Alto | Alta | Validar `estado_producto` antes de crear |
| Transición inválida desde CANCELADO | Media | Alto | Alta | Bloquear cambios posteriores desde estado cancelado |
| Restitución doble de inventario | Media | Alto | Alta | Restituir solo en la transición inicial a CANCELADO |

## 6. Ambiente y datos

Las pruebas se ejecutan con `pytest` y `fastapi.testclient.TestClient`. `tests/conftest.py` crea una base SQLite temporal en memoria por prueba; no modifica la base de datos del usuario. Se crean fixtures de roles, comprador, categoría, país y producto.

Datos relevantes: producto con precio 50.000 y cantidad 5; cantidades 0, -1, 1, 2, 5 y 6; ID inexistente 9999; estados PENDIENTE, CANCELADO, COMPLETADO y ENTREGADO.

## 7. Criterios

- **Entrada:** dependencias instaladas, modelos y routers importables, fixtures disponibles.
- **Suspensión:** error de inicialización, esquema incompatible o fallo de infraestructura que impida interpretar resultados.
- **Reanudación:** corregir configuración/esquema y repetir desde entorno limpio.
- **Salida:** suite reproducible, pruebas críticas de pedidos aprobadas, defectos conocidos documentados y migración de esquema aplicada en el entorno real.

## 8. Ejecución

Desde la raíz del repositorio: `pytest -v` o `pytest -q`. Para módulos: `pytest tests/test_pedidos.py -v` y `pytest tests/test_categorias.py -v`.
