"""
--------------------------------------------------------------------------------
rayleigh_logic.py
--------------------------------------------------------------------------------
Contiene la lógica de negocio central del módulo de predicción
Define la clase 'DefectPredictor', la cual es la encargada de:

1. Gestionar el ciclo de vida del modelo de Machine Learning (carga y persistencia)

2. Implementar la fórmula matemática de la Distribución de Rayleigh para proyectar 
la aparición de defectos en el tiempo, basándose en la predicción inicial del volumen total

--------------------------------------------------------------------------------
Dependencias: numpy, joblib, os, sklearn (implícito en el .pkl)
Uso: Importar la clase y usar el método predict_rayleigh().
--------------------------------------------------------------------------------
"""

import numpy as np
import joblib
import os

class DefectPredictor:
    """
    Clase controladora para la predicción de defectos; esta actúa como una capa de abstracción 
    sobre el modelo serializado (.pkl) y aplica transformaciones matemáticas a los resultados
    """

    def __init__(self, model_path='models/modelo_defectos.pkl'):
        """
        Constructor de la clase

        Entradas:
            - model_path (str): Ruta relativa donde se espera encontrar el archivo del modelo entrenado,
            por defecto busca en la carpeta models
        """
        self.model_path = model_path
        self.model = None
        self.is_trained = False

    def load_model(self):
        """
        Aqui se intenta cargar el modelo serializado desde el disco duro hacia la memoria RAM
        Esto es fundamental para evitar re-entrenar el modelo en cada petición
            
        Salidas:
            - bool: True si la carga fue exitosa, False si el archivo no existe.
        """
        # Primero verificamos la existencia del archivo
        if os.path.exists(self.model_path):
            try:
                # Deserialización usando joblib
                self.model = joblib.load(self.model_path)
                self.is_trained = True
                return True
            except Exception as e:
                print(f"Error crítico al leer el archivo .pkl: {e}")
                return False
        
        # Si el archivo no existe, retornamos False para que la API pueda manejar el error
        return False

    def predict_rayleigh(self, tamano_nuevo, duracion_estimada):
        """
        Realiza la predicción compuesta
        Primero estima el volumen total de defectos usando Regresión Lineal, y luego distribuye 
        ese total en el tiempo usando la Función de Densidad de Probabilidad (PDF) de Rayleigh

        Entradas:
            - tamano_nuevo (float): Tamaño del software (KLOC, PF, u otro)
            - duracion_estimada (float): Tiempo estimado del proyecto (meses)

        Salidas:
            - dict: Diccionario con la siguiente estructura:
                {
                    "total_defectos_estimados": int,
                    "distribucion_tiempo": list[float],
                    "meses_proyectados": list[int]
                }

        Excepciones:
            Solo hay una y es si el modelo no ha sido cargado previamente
        """
        
        # Validación de estado del modelo
        # Si no está cargado en memoria, intentamos cargarlo ahora
        if not self.is_trained:
            if not self.load_model():
                raise Exception("El modelo predictivo no está disponible. Verifique que el archivo .pkl exista")

        # Predicción de Volumen (K)
        # Usamos el modelo lineal (scikit-learn) para predecir la cantidad TOTAL de defectos basada únicamente en el tamaño del proyecto
        prediccion_total = self.model.predict([[tamano_nuevo]])[0]
        
        # Evitamos números negativos y redondeamos al entero más cercano
        K = max(0, int(round(prediccion_total)))

        # Configuración de la Curva de Rayleigh
        # 'sigma' determina dónde ocurre el pico de la curva.
        # En desarrollo de software, el pico de defectos suele ocurrir antes de la mitad del ciclo en metodologías ágiles o cerca del 40%
        sigma = duracion_estimada * 0.4  

        defectos_por_mes = []
        
        # Definimos un horizonte de tiempo extendido (150% de la duración), en otras palabras, solo se mapea más allá del tiempo estimado
        tiempo_total = int(duracion_estimada * 1.5) 

        # Generación de la Serie de Tiempo
        for t in range(1, tiempo_total + 1):
            # Fórmula de Rayleigh (PDF):
            # P(t) = (t / sigma^2) * e^(-t^2 / 2*sigma^2)
            termino_1 = (t / (sigma**2))
            termino_2 = np.exp(-(t**2) / (2 * (sigma**2)))
            probabilidad = termino_1 * termino_2
            
            # Calculamos los defectos esperados para este mes específico
            defectos_mes = K * probabilidad
            defectos_por_mes.append(round(defectos_mes, 2))

        # Se empaquetan los resultados en un diccionario que sera enviado como JSON a la API
        return {
            "total_defectos_estimados": K,
            "distribucion_tiempo": defectos_por_mes,
            "meses_proyectados": list(range(1, tiempo_total + 1))
        }