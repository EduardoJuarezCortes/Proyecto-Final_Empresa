# Módulo de Predicción de Defectos 

## Descripción
Este microservicio implementa un modelo de Machine Learning basado en la **Distribución de Rayleigh**. 
Su objetivo es predecir el ciclo de vida de defectos de un proyecto de software basándose en métricas históricas.

El sistema consta de dos componentes principales:
1. **Entrenador (`train_model.py`):** Aprende de los datos históricos.
2. **API REST (`src/api.py`):** Expone el modelo para ser consumido por el Dashboard.

## 📋 Requisitos Previos
Asegúrese de tener instalado Python 3.8 o superior.
Las dependencias necesarias se encuentran en `requirements.txt`.

# Guía de Uso
**Paso 1: Entrenamiento del Modelo**
Antes de iniciar la API, es necesario generar el archivo binario del modelo (.pkl). Ejecute el siguiente script para procesar los datos históricos ubicados en data/datos_historicos.csv:

`python train_model.py`

Salida: Un archivo en models/modelo_defectos.pkl y el reporte de precisión (Score R²) en consola.


**Paso 2: Ejecución de la API**
Una vez entrenado el modelo, inicie el servidor Flask para escuchar peticiones del Dashboard:

`python -m src.api`

La API estará disponible en: http://localhost:5000


**Paso 3: Validación (QA)**
Para verificar la precisión del modelo frente a datos desconocidos, ejecute:

`python validar_modelo.py`

**Paso 4: Verficar Visualización**
Si lo que se busca es ver una visualización rapida y temprana del gráfico, lo unico que se debe hacer es abrir el archivo llamado `dashboard_prueba.html`
mientras corre la API, de otra forma, no funcionará.

# Documentación de la API
POST /predict
Devuelve la curva de defectos estimada para un proyecto nuevo.

*Body (JSON):*
{
  "tamano": 80000,    // Tamaño en KLOC o Puntos de Función
  "duracion": 12      // Duración estimada en meses
}

*Respuesta (JSON):*
{
  "status": "success",
  "data": {
    "total_defectos_estimados": 25,
    "distribucion_tiempo": [1.2, 3.5, 5.0, ...],
    "meses_proyectados": [1, 2, 3, ...]
  }
}