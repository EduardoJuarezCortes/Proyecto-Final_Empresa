"""
--------------------------------------------------------------------------------
validar_modelo.py
--------------------------------------------------------------------------------
Este es el script de Aseguramiento de Calidad (QA) del Modelo
Implementa una técnica de validación cruzada (Hold-out Validation) para medir la 
precisión real del algoritmo predictivo

Simula un escenario real ocultando el 20% de los datos históricos durante el entrenamiento, 
para luego usar ese 20% como examen y calcular el margen de error promedio (MAE)
--------------------------------------------------------------------------------
Dependencias: pandas, sklearn
Uso: Ejecutar desde consola para ver el reporte "python validar_modelo.py"
--------------------------------------------------------------------------------
"""

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score
import os

# ------------------------------------------------------------------------------
# Configuración de Rutas
# ------------------------------------------------------------------------------
CSV_PATH = 'data/datos_historicos.csv'

def validar():
    """
    Ejecuta la rutina de validación del modelo
    No genera archivos persistentes (.pkl), solo emite un reporte en consola que sirve como 
    evidencia de la confiabilidad del modelo

    Metodología
        1. Split Train/Test: División aleatoria 80% entrenamiento / 20% prueba
        2. Entrenamiento Aislado: El modelo aprende solo del 80%
        3. Predicción Ciega: El modelo intenta predecir el 20% restante
        4. Cálculo de Métricas: Comparación entre valor Real vs Predicho

    Salidas:
        - Tabla comparativa de proyectos de prueba
        - Error Medio Absoluto (MAE)
        - Coeficiente de Determinación (R^2) del set de prueba
    """
    
    print("Iniciando Validación Cruzada del Modelo (QA)")

    # Carga de Datos
    if not os.path.exists(CSV_PATH):
        print(f"Error: No se encuentra el archivo de datos en {CSV_PATH}")
        return

    df = pd.read_csv(CSV_PATH)
    
    # Definición de variables
    # X = Variable Independiente (Tamaño del Proyecto)
    # y = Variable Objetivo (Total de Defectos a predecir)
    # muy parecido a como lo definimos en train_model.py

    X = df[['Tamano']]
    y = df['Total_Defectos']

    # División del Dataset (Train/Test Split)
    # test_size=0.2 : Reservamos el 20% de los datos para el examen final
    # random_state=42 : Semilla fija para asegurar que el experimento sea reproducible (siempre separará 
    # los mismos datos al correrlo de nuevo)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print(f"Datos divididos: {len(X_train)} para entrenamiento, {len(X_test)} para pruebas")

    # Entrenamiento del Modelo de Prueba
    # Este modelo es temporal, solo existe dentro de esta función para la validación, de otro modo sería igual a train_model.py
    model = LinearRegression()
    model.fit(X_train, y_train)

    # Evaluación (Predicción sobre datos desconocidos)
    # Le pedimos al modelo que prediga los defectos de los proyectos en X_test
    y_pred = model.predict(X_test)

    # Se genera el reporte de resultados
    print("\nREPORTE DE VALIDACIÓN")
    
    # Creamos un DataFrame temporal para visualizar la comparación lado a lado
    resultados = pd.DataFrame({
        'Tamaño (KLOC)': X_test['Tamano'],
        'Defectos Reales': y_test,
        'Defectos Predichos': y_pred.round(0).astype(int), # Redondeo a enteros
        'Diferencia Absoluta': abs(y_test - y_pred.round(0)).astype(int)
    })
    
    # Imprimimos la tabla sin el índice de Pandas para que se vea limpia
    print(resultados.to_string(index=False))
    
    # Cálculo de Métricas Finales
    # MAE (Mean Absolute Error): En promedio, ¿por cuántos defectos se equivoca el modelo?
    mae = mean_absolute_error(y_test, y_pred)
    
    print("---------------------------------------------------------------------------")
    print(f"Error Promedio (MAE): {mae:.4f} defectos")
    print(f"Interpretación: El modelo suele fallar por +/- {int(mae)} bugs")
    print("---------------------------------------------------------------------------")

if __name__ == "__main__":
    validar()