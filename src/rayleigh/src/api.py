"""
--------------------------------------------------------------------------------
api.py
--------------------------------------------------------------------------------
Este script implementa un microservicio REST utilizando Flask; su función principal es exponer el modelo predictivo de 
distribución de Rayleigh para que sea consumido por el Dashboard del sistema.

Se encarga de recibir peticiones HTTP, validar los datos de entrada (tamaño y duración del proyecto), invocar la lógica 
matemática y devolver las predicciones en formato JSON.
--------------------------------------------------------------------------------
Dependencias: flask, flask_cors, src.rayleigh_logic
Uso: Ejecutar directamente desde consola "python -m src.api"
--------------------------------------------------------------------------------
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from src.rayleigh_logic import DefectPredictor
import os

# ------------------------------------------------------------------------------
# Configuración Inicial
# ------------------------------------------------------------------------------

# Inicializamos la aplicación Flask
app = Flask(__name__)

# Habilitamos CORS (Cross Origin Resource Sharing)
# Esto es crítico para permitir que el Frontend que corre en otro puerto o dominio 
# pueda comunicarse con esta API sin bloqueos de seguridad
CORS(app) 

# Instanciamos el predictor cargando la ruta del modelo serializado (.pkl)
# Nota: Se asume que el modelo ya fue entrenado previamente haciendo uso de train_model.py
MODEL_PATH = 'models/modelo_defectos.pkl'
predictor = DefectPredictor(model_path=MODEL_PATH)

# ------------------------------------------------------------------------------
# Endpoints
# ------------------------------------------------------------------------------

@app.route('/predict', methods=['POST'])
def predict():
    """
    Este es el endpoint principal para realizar predicciones de defectos; recibe un 
    JSON con las características del proyecto y devuelve la curva de defectos estimada 
    usando la distribución de Rayleigh

    Método HTTP: 
    POST

    Entradas (JSON):
        - tamano (float/int): Tamaño del proyecto (KLOC o Puntos de Función)
        - duracion (float/int): Duración estimada del proyecto en meses

    Salidas (JSON):
        - status (str): "success" o "error" 
        - data (dict): Contiene 'total_defectos_estimados', 'distribucion_tiempo' y 'meses_proyectados'

    Excepciones:
        - 400 Bad Request: Si faltan parámetros obligatorios
        - 500 Internal Server Error: Si falla la lógica de predicción
    """
    try:
        # Obtenemos los datos del cuerpo de la petición (JSON)
        data = request.get_json()
        
        # Se validan los datos de entrada
        # Verificamos que existan las claves necesarias antes de procesar
        if not data or 'tamano' not in data or 'duracion' not in data:
            return jsonify({
                "status": "error",
                "message": "Faltan datos obligatorios: 'tamano' y 'duracion' son requeridos."
            }), 400
            
        # Se hace un conversión de tipos de datos
        # Debemos asegurarnos que los inputs sean números flotantes para evitar errores matemáticos
        try:
            tamano = float(data['tamano'])
            duracion = float(data['duracion'])
        except ValueError:
            return jsonify({
                "status": "error",
                "message": "Los campos 'tamano' y 'duracion' deben ser numéricos."
            }), 400
        
        # Ejecución del Modelo Predictivo
        # Llamamos a la lógica encapsulada en la clase DefectPredictor
        resultado = predictor.predict_rayleigh(tamano, duracion)
        
        # Posteriormente, se hace la construcción y retorno de la respuesta exitosa
        response = {
            "status": "success",
            "meta": {
                "modelo_utilizado": "Distribucion de Rayleigh",
                "version_api": "1.0"
            },
            "data": resultado
        }
        return jsonify(response), 200

    except Exception as e:
        # Manejo de errores no controlados
        # Capturamos cualquier excepción interna para no tirar el servidor
        return jsonify({
            "status": "error",
            "message": f"Error interno del servidor: {str(e)}"
        }), 500

# ------------------------------------------------------------------------------
# Bloque Principal de Ejecución
# ------------------------------------------------------------------------------

if __name__ == '__main__':
    """
    Bloque de entrada para la ejecución del servidor
    Verifica el estado del modelo antes de levantar el servicio
    """
    print("Inicializando API de Predicción de Defectos")
    
    # Verificación de integridad
    # Se intenta cargar el modelo al inicio
    if not predictor.load_model():
        print("Advertencia Critica: No se encontró el archivo del modelo entrenado (.pkl)")
        print(f"Por favor, ejecute el script 'train_model.py' antes de iniciar la API")
        print("La API iniciará, pero las predicciones fallarán hasta que se entrene el modelo")
    else:
        print(f"Modelo cargado correctamente desde: {MODEL_PATH}")
    
    # Iniciamos el servidor de desarrollo de Flask
    # debug=True permite ver errores detallados en consola y recarga automática
    # port=5000 es el puerto estándar para Flask
    app.run(debug=True, port=5000, host='0.0.0.0')