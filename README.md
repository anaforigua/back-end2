# 🛒 Revenfy — Marketplace Comunitario SENA

> Plataforma web responsiva y full-stack diseñada para la publicación, consulta y gestión estructurada de compraventa de artículos de segunda mano dentro de la comunidad educativa (aprendices e instructores SENA).

---

## 📐 1. Arquitectura General del Proyecto

Revenfy utiliza una arquitectura **Decoupled (Desacoplada) Full-Stack**, separando estrictamente la interfaz de usuario del motor de lógica de negocio y persistencia de datos.

```text
 ┌─────────────────────────┐               ┌─────────────────────────┐               ┌─────────────────────────┐
 │   FRONTEND (CLIENTE)    │  HTTP / JSON  │    BACKEND (SERVIDOR)   │    SQL ORM     │  BASE DE DATOS (DATA)   │
 │                         │ ────────────> │                         │ ────────────> │                         │
 │ React 18 + TypeScript   │               │ FastAPI + Python 3.11   │               │ PostgreSQL              │
 │ Vite + Tailwind CSS     │ <──────────── │ Uvicorn + Pydantic      │ <──────────── │ SQLAlchemy              │
 └─────────────────────────┘  Async REST   └─────────────────────────┘   Driver DB   └─────────────────────────┘
```

---

## 🛠️ 2. Tecnologías y Dependencias Usadas

### **Backend (El Motor & API)**

* **Lenguaje:** Python 3.10+
* **Framework Web:** [FastAPI](https://fastapi.tiangolo.com/) (Framework asíncrono de alto rendimiento para construir APIs REST)
* **Servidor ASGI:** [Uvicorn](https://www.google.com/search?q=https://www.uvicorn.org/) (Servidor super rápido para ejecutar aplicaciones asíncronas en Python)
* **Validación de Datos:** [Pydantic v2](https://www.google.com/search?q=https://docs.pydantic.dev/) (Validación estricta de esquemas de datos JSON de entrada y salida)
* **ORM & Persistencia:** [SQLAlchemy](https://www.sqlalchemy.org/) (Mapeador objeto-relacional para la gestión de consultas y esquemas SQL)
* **Driver BD:** `psycopg` / `psycopg2-binary` (Conector de Python a PostgreSQL)
* **CORS Middleware:** `fastapi.middleware.cors` (Manejo de seguridad entre dominios para la conexión con el Frontend)

### **Frontend (La Interfaz Web Responsiva)**

* **Biblioteca UI:** [React 18](https://react.dev/)
* **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) (Tipado estático para prevenir errores en tiempo de desarrollo)
* **Build Tool / Bundler:** [Vite](https://vitejs.dev/) (Compilador ultra rápido con Hot Module Replacement)
* **Estilos & Layout Responsivo:** [Tailwind CSS](https://tailwindcss.com/) / CSS Modules (Enfoque Mobile-First, Flexbox y CSS Grid)
* **Cliente HTTP:** `Axios` / `Fetch API` (Comunicación e integración asíncrona con los endpoints REST)

---

## 🔄 3. Flujo de Trabajo y Ciclo de Datos (MVP: Gestión de Pedidos)

El flujo central del sistema optimiza el intercambio de productos evitando la dispersión de mensajes informales:

```text
[ Usuario / Comprador ]
         │
         │ 1. Selecciona productos e inicia pedido en la interfaz React
         ▼
[ Frontend (React + TS) ]
         │
         │ 2. Construye payload JSON validado y envía solicitud POST
         ▼
[ Endpoint API: POST /pedidos/ ]
         │
         │ 3. Pydantic Schema valida tipos de datos y campos requeridos
         ▼
[ Capa de Servicios / Lógica ]
         │
         │ 4. Verifica inventario, calcula subtotales/totales
         ▼
[ Capa de Modelos (SQLAlchemy) ]
         │
         │ 5. Inserta registros relacionales en tablas (pedidos y detalle_pedido)
         ▼
[ Base de Datos PostgreSQL ] ───► 6. Retorna confirmación HTTP 201 Created a la interfaz
```

---

## 📁 4. Estructura del Repositorio (Backend)

```text
back-end/
├── app/
│   ├── config/          # Configuración de base de datos y variables de entorno
│   ├── core/            # Enums, constantes globales y utilidades
│   ├── models/          # Modelos de datos relacionales (SQLAlchemy)
│   ├── schemas/         # Esquemas de validación de entradas/salidas (Pydantic)
│   ├── services/        # Lógica de negocio y operaciones CRUD
│   ├── routes/          # Endpoints HTTP (Usuarios, Productos, Pedidos, Categorías)
│   └── main.py          # Punto de entrada de la aplicación FastAPI y CORS
├── tests/               # Pruebas unitarias e integración con Pytest
├── requirements.txt     # Lista de dependencias del proyecto Python
└── README.md            # Documentación del proyecto
```

---

## 🚀 5. Guía de Instalación y Ejecución Local

### **Requisitos Previos**

* Python 3.10 o superior instalado.
* Node.js (v18+) y npm / pnpm / yarn (para el frontend).
* PostgreSQL en ejecución local o remota.

---

### **Paso A: Configuración e Instalación del Backend**

1. **Clonar el repositorio:**

```bash
git clone [https://github.com/anaforigua/bac.git](https://github.com/anaforigua/bac.git) back-end
cd back-end
```

2. **Crear el entorno virtual de Python:**

* En **Git Bash** / **Linux / macOS**:

```bash
python -m venv venv
source venv/Scripts/activate
```

* En **Windows PowerShell**:

```powershell
python -m venv venv
.\venv\Scripts\Activate
```

3. **Actualizar gestor de paquetes (opcional pero recomendado):**

```bash
python -m pip install --upgrade pip
```

4. **Instalar todas las dependencias requeridas:**

```bash
pip install -r requirements.txt
```

5. **Iniciar el servidor de desarrollo (Uvicorn):**

```bash
uvicorn main:app --reload
```

*El servidor quedará activo en:* `http://127.0.0.1:8000`

6. **Consultar la Documentación Interactiva de la API:**

* **Swagger UI:** `http://127.0.0.1:8000/docs`
* **ReDoc:** `http://127.0.0.1:8000/redoc`

---

### **Paso B: Configuración del Frontend**

1. **Navegar a la carpeta del proyecto frontend:**

```bash
cd ../front
```

2. **Instalar dependencias de Node:**

```bash
npm install
```

3. **Iniciar el servidor de desarrollo con Vite:**

```bash
npm run dev
```

*La interfaz quedará activa en:* `http://localhost:5173`

---

## 🧪 6. Pruebas Automatizadas

El backend incluye suites de pruebas preparadas con **Pytest** y `TestClient` de FastAPI para garantizar la calidad del código:

```bash
# Ejecutar todas las pruebas con detalle
python -m pytest -v
```

---

## 👥 7. Equipo de Desarrollo

* **Anamaria Forigua Murcia** — *Desarrolladora Full-Stack & Analista SENA*
* **Jhon Alex Beltrán Herrera** — *Desarrollador & Analista SENA*
* **Julián Esteban Murillo Mena** — *Desarrollador & Analista SENA*
* **Jhoan Felipe Hernández Murcia** — *Desarrollador & Analista SENA*
