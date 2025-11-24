"""
--------------------------------------------------------------------------------
train_model.py
--------------------------------------------------------------------------------
Script de entrenamiento (Training Pipeline)
Su función es leer los datos históricos, aprender la relación matemática entre el 
tamaño del software y la cantidad de defectos, y guardar ese conocimiento en 
un archivo binario (.pkl).

Este script debe ejecutarse cada vez que se actualicen los datos
históricos en 'data/datos_historicos.csv' para mejorar la precisión del modelo
--------------------------------------------------------------------------------
Dependencias: pandas, sklearn, joblib
Uso: Ejecutar desde consola: "python train_model.py"
--------------------------------------------------------------------------------
"""

import pandas as pd
from sklearn.linear_model import LinearRegression
import joblib
import os

# ------------------------------------------------------------------------------
# Configuración de Rutas (Paths)
# ------------------------------------------------------------------------------
# Definimos las rutas relativas para mantener la portabilidad del proyecto
CSV_PATH = 'data/datos_historicos.csv'
MODEL_DIR = 'models'
MODEL_PATH = os.path.join(MODEL_DIR, 'modelo_defectos.pkl')

def train():
    """
    Se ejecuta el flujo completo de entrenamiento supervisado:
        1. Carga y validación de datos fuente
        2. Selección de variables (Feature Selection)
        3. Ajuste del modelo (Fitting)
        4. Persistencia del modelo (Saving)

    Entradas:
        - Archivo CSV en 'data/datos_historicos.csv' con columnas 'Tamano' y 'Total_Defectos'

    Salidas:
        - Archivo .pkl en 'models/modelo_defectos.pkl' listo para producción
        - Reporte en consola sobre la calidad del entrenamiento (Score R^2)
    """
    
    print("Iniciando Proceso de Entrenamiento del Modelo")

    # Primero validamos si la fuente de datos existe
    if not os.path.exists(CSV_PATH):
        print(f"Error Crítico: No se encuentra el archivo de datos en: {CSV_PATH}")
        print("Por favor, verifique que el archivo .csv existe antes de entrenar")
        return

    try:
        # Cargamos el dataset usando Pandas
        df = pd.read_csv(CSV_PATH)
        print(f"Datos cargados correctamente. Registros encontrados: {len(df)}")
    except Exception as e:
        print(f"Error al leer el CSV: {e}")
        return

    # Ahora entramos a la selección de Variables (Features & Target)
    # Variable Independiente (X): 'Tamano' (Lo que sabemos del proyecto nuevo)
    # Variable Dependiente (y): 'Total_Defectos' (Lo que queremos predecir)
    
    # Nota: Usamos doble corchete [['Tamano']] para mantener X como un DataFrame 2D, requisito de scikit-learn.
    X = df[['Tamano']]
    y = df['Total_Defectos']
    
    # Posteriormente sigue el entrenamiento del Algoritmo (Fitting)
    # Seleccionamos Regresión Lineal Simple debido a la fuerte correlación lineal (0.8) detectada en la fase de análisis 
    # exploratorio. Es un modelo ligero y explicable.
    model = LinearRegression()
    model.fit(X, y)
    
    # Persistencia del Modelo (Guardado)
    # Verificamos si existe la carpeta models, si no, la creamos. Solo es para asegurarnos, ya debería existir
    if not os.path.exists(MODEL_DIR):
        os.makedirs(MODEL_DIR)
        print(f"Directorio '{MODEL_DIR}' creado")
        
    # Usamos joblib para serializar el objeto Python en un archivo binario
    joblib.dump(model, MODEL_PATH)
    
    # Reporte de Calidad
    # El Score R^2 indica qué porcentaje de la variabilidad de los defectos es explicada por el tamaño del proyecto
    # (1.0 es perfecto, 0.0 es aleatorio)
    # En nuestro caso, tenemos un valor de 0.64, el cual es aceptable para este tipo de predicciones
    score = model.score(X, y)
    
    print(f"Modelo entrenado y guardado exitosamente en: {MODEL_PATH}")
    print(f"Calidad del Modelo (R^2 Score): {score:.4f}")

if __name__ == "__main__":
    train()