# INVENTIA — Guías de Desarrollo

> Documentación técnica del proyecto — Actualizada Abril 2026
> Ubicación: `backend/guias/`

---

## Documentos Disponibles

| Archivo | Contenido | Para quién |
|---------|-----------|-----------|
| **README.md** | Este índice | Todos |
| **RESUMEN_EJECUTIVO.md** | Arquitectura, tech stack, estructura de archivos, comandos | Todos |
| **FIREBASE_STRUCTURE_AND_PYTHON_CONNECTION.md** | Estructura Firestore, Supabase schema, CRUD Python, API endpoints | Backend/Fullstack |
| **ESTRUCTURA_BACKEND_PYTHON.md** | Organización del código backend | Backend |
| **EJEMPLOS_PRACTICOS.md** | Ejemplos paso a paso de operaciones comunes | Developers |
| **DEPLOYMENT_Y_MONITOREO.md** | Deploy a producción, logging, seguridad | DevOps |
| **DIAGRAMAS_VISUALES.md** | Diagramas de flujo y arquitectura | Todos |
| **GUIA_RAPIDA_Y_COMANDOS.md** | Comandos, endpoints, troubleshooting | Referencia rápida |

---

## Por Dónde Empezar

### Primera vez en el proyecto
1. `RESUMEN_EJECUTIVO.md` — arquitectura general y tech stack real
2. `FIREBASE_STRUCTURE_AND_PYTHON_CONNECTION.md` — estructura de las dos DBs

### Quiero implementar una feature
1. `EJEMPLOS_PRACTICOS.md` — busca un ejemplo similar
2. `GUIA_RAPIDA_Y_COMANDOS.md` — endpoints disponibles

### Quiero hacer deploy
1. `DEPLOYMENT_Y_MONITOREO.md`

---

## Arquitectura en una línea

```
React (Vite) → FastAPI (Python) → Firebase Firestore + Supabase PostgreSQL
```

- **Firebase Firestore** → datos de cada restaurante (productos, movimientos, settings)
- **Supabase** → panel admin de la plataforma (empresas, usuarios, feature flags)

---

## Iniciar el proyecto (modo demo — sin configurar DBs)

```bash
# Activar venv
source C:/Users/juan/Desktop/INVENTIA/venv/Scripts/activate

# Backend
cd INVENTIA/backend && python main.py

# Frontend (otra terminal)
cd INVENTIA/frontend && npm run dev
```

Ver `RESUMEN_EJECUTIVO.md` para configuración con Firebase/Supabase real.
