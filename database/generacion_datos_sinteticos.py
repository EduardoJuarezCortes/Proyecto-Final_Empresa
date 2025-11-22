
"""
# para llenar la base de datos debemos seguir el siguiente orden: 

Clientes
    Proyectos
        Actividades
        Bugs
        Requerimientos
            Casos_Prueba

Fecha inicio < fecha estimada
fecha final puede ser mayuor a la estimada para simular retrasos
bugs y actividades debe estar dentro de fecha inicio yu fecha final

70% proyectos normales con rentabilidad media, y algunos bugs
15% de proyectos excelentes con finalización antes de fecha estimada, alta satisfacción y 0 bugs criticos
15% deproyectos malos con >20 días de retraso, presupuesto excedido, muchos bugs y baja satisfacción+

si la complejidad es alta, más probabilidad de bugs 
si complejidad es baja,  menos probabilidad de bugs

10% de proyectos no estan terminados
de los proyectos terminados, 50% justo en la fecha estimada, 25% antes y 25% después
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

import random, faker, time
from datetime import date, datetime, timedelta
import mysql.connector

fake = faker.Faker("es_MX")
fake_eng = faker.Faker("en_US")

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

### para generar nombres de proyecto viables agregamos palabras asociadas a proyectos de software para poder generar nombres más realistas
PALABRAS_PROYECTOS = [ 'Sistema', 'Aplicación', 'Plataforma', 'Red', 'Portal', 'Gestor', 'Administrador', 'Controlador', 'Monitor', 'Analizador', 'API', 'Web']

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
elif borrar_todo == 'n':
    print("No se han borrado los datos existentes.")
elif borrar_todo != 's' and borrar_todo != 'n':
    print("Entrada no válida, continuando sin borrar datos existentes.")
time.sleep(1)

# generamos clientes ---------------------------------------------------------------------------------
print("Generando datos sintéticos de Clientes (～﹃～)~zZ")
time.sleep(1)

id_cliente_creados = []

for i in range(1, NUM_CLIENTES + 1):
    nombre = fake.company()
    sector = random.choice(OPCIONES_SECTOR)
    importancia = random.choice(IMPORTANCIA_EN_SECTOR)
    pais = random.choice(PAISES_HISPANOS)

    #debug
    print(f"Cliente {i}: {nombre}, Sector: {sector}, Importancia: {importancia}, País: {pais}")

    args = (nombre, sector, importancia, pais, 0) # 0 es para después obtener el id_Cliente generado por el return del sp

    resultado = cursor.callproc('insertar_cliente', args)    
    returned_id = resultado[4]

    id_cliente_creados.append(returned_id)

print("Datos sintéticos de Clientes generados correctamente. (￣o￣) . z Z")
print(id_cliente_creados)
time.sleep(1)

# generamos  proytectos ---------------------------------------------------------------------------------
print("Generando datos sintéticos de Proyectos (～﹃～)~zZ")
time.sleep(1)

for i in range(1, NUM_PROYECTOS + 1):
    #seleccionamos un cliente aleatorio
    id_cliente = random.choice(id_cliente_creados)
    nombre_proyecto = random.choice(PALABRAS_PROYECTOS) + ' "' + fake_eng.domain_word().title() + '"'
    fecha_inicio = fake.date_between(start_date='-2y', end_date='today')
    fecha_estimada = fecha_inicio + timedelta(days=random.randint(30, 180)) # todo proyecto será de uno a seis meses
    # esta terminado?
    if random.random() < 0.9:  # 90% de probabilidad de que el proyecto esté terminado
        r = random.random()
        #50% probabilidad de terminar justo en fecha
        if r < 0.5:
            fecha_real = fecha_estimada
        elif r < 0.75: # 25% probabilidad de terminar antes de la fecha estimada
            fecha_real = fecha_estimada - timedelta(days=random.randint(-10, -1))  # puede terminar hasta 10 días antes
        else: # 25% probabilidad de terminar después de la fecha estimada
            fecha_real = fecha_estimada + timedelta(days=random.randint(1, 20))  # puede terminar  10 antes o 20 después
    else:
        fecha_real = None  # proyecto no terminado
    presupuesto = round(random.uniform(5000, 50000), 2)
    
    # print(f"Proyecto {i}: Cliente ID: {id_cliente}, Nombre Proyecto: {nombre_proyecto}")
