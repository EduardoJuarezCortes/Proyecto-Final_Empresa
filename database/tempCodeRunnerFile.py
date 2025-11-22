
"""
# para llenar la base de datos debemos seguir el siguiente orden: 

Clientes
    Proyectos
        Actividades
        Bugs
        Requerimientos
            Casos_Prueba

Fecha inicio < fecha estimada
fheca final puede ser mayuor a la estimada para simular retrasos
bugs y actividades debe estar dentro de fecha inicio yu fecha final

70% proyectos normales con rentabilidad media, y algunos bugs
15% de proyectos excelentes con finalización antes de fecha estimada, alta satisfacción y 0 bugs criticos
15% deproyectos malos con >20 días de retraso, presupuesto excedido, muchos bugs y baja satisfacción+

si la complejidad es alta, más probabilidad de bugs 
si complejidad es baja,  menos probabilidad de bugs
"""


print("""
    ███        ▄████████ ████████▄   ███    █▄   ▄█   ▄███████▄     ▄████████ 
▀█████████▄   ███    ███ ███    ███  ███    ███ ███  ██▀     ▄██   ███    ███ 
   ▀███▀▀██   ███    ███ ███    ███  ███    ███ ███▌       ▄███▀   ███    ███ 
    ███   ▀   ███    ███ ███    ███  ███    ███ ███▌  ▀█▀▄███▀▄▄   ███    ███ 
    ███     ▀███████████ ███    ███  ███    ███ ███▌   ▄███▀   ▀ ▀███████████ 
    ███       ███    ███ ███    ███  ███    ███ ███  ▄███▀         ███    ███ 
    ███       ███    ███ ███  ▀ ███  ███    ███ ███  ███▄     ▄█   ███    ███ 
   ▄████▀     ███    █▀   ▀██████▀▄█ ████████▀  █▀    ▀████████▀   ███    █▀  
""")

## --------------------------------------------------------------------------------------------------------

import random, faker
from datetime import date, datetime
import mysql.connector

fake = faker.Faker("es_MX")

# CUANTOS DATOS VAMOS A GENERAR
NUM_CLIENTES = 20
NUM_PROYECTOS = 60

#Constantes
OPCIONES_SECTOR = ['Salud', 'Educación', 'Finanzas', 'Comercio', 'Tecnología', 'Manufactura', 'Transporte', 'Energía']
IMPORTANCIA_EN_SECTOR = ['Baja', 'Media', 'Alta']

COMPLEJIDAD_PROYECTO = ['Baja', 'Media', 'Alta']
SEVERIDAD_BUG = ['Baja', 'Media', 'Alta', 'Crítica']

#como los nombres de la empresa son en español, no tiene sentido que una empresa con nombre en español sea de un país que no sea hispanoablante
# la manera de hacerlo internacional sería hacer una función que genere nombres de empresas (en inglés) y en función de el sector aleatorio pasado como parámetro
# por practicidad nos quedamos con paises hispanos
PAISES_HISPANOS = [
    'España', 
    'México', 'Colombia', 'Argentina', 'Chile', 'Perú', 
    'Brasil', 'Ecuador', 'Bolivia', 'Paraguay', 'Uruguay',
    'Venezuela', 'Costa Rica', 'Panamá', 'Guatemala', 
    'Honduras', 'El Salvador', 'Nicaragua', 'República Dominicana'
]

configuracion_db = {
    'user': 'root',
    'password': '',
    'host': 'localhost',
    'database': 'gestion_proyectos'
}

# ---------------------------------------------------------------------------------------------------------

conexion = mysql.connector.connect(**configuracion_db)
cursor = conexion.cursor()

#autocommit desactivado por sii queremos cancelar!
conexion.autocommit = False

#opción para ver si borrar toda la base de datos jeje
borrar_todo = input("¿Desea borrar todos los datos existentes en la base de datos? (s/n): ").strip().lower()
if borrar_todo == 's':
    tablas = ['Casos_Prueba', 'Requerimientos', 'Bugs', 'Actividades', 'Proyectos', 'Clientes']
    for tabla in tablas:
        cursor.execute(f"DELETE FROM {tabla};")
    conexion.commit()
    print("Todos los datos existentes han sido borrados.")
