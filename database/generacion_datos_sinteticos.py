
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
    50% proyectos terminan justo en fecha estimada
    25% antes de la fecha estimada
    25% después de la fecha estimada
bugs y actividades debe estar dentro de fecha inicio y fecha final

70% rentabilidad media
15% rentabilidad alta
15% rentabilidad baja o sobrecoste 

complejidad alta => 20-30 actividades / 8-15 bugs / 10 - 15 requerimientos
complejidad media => 10-20 actividades / 3-7 bugs / 6 - 10 requerimientos
complejidad baja => 5-10 actividades / 0-2 bugs / 3 - 5 requerimientos

80% de requerimientos con caso de prueba exitoso

70% bugs solucionados
20% bugs en revisión
10% bugs detectados

10% de proyectos no estan terminados
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
ESTADO_BUGS = ['Detectado', 'En revisión', 'Solucionado']

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

# para generar actividades viables agregamos nuestro diccionario con actividades comunes en desarrollo de software, ya que faker no nos puede proveer de buenos ejemplos
ACTIVIDADES_EJEMPLO = [
    'Diseño de la arquitectura del sistema',
    'Desarrollo del módulo de autenticación',
    'Implementación de la base de datos',
    'Creación de la interfaz de usuario',
    'Pruebas unitarias del componente X',
    'Integración con servicios externos',
    'Optimización del rendimiento',
    'Documentación del código',
    'Revisión de seguridad',
    'Despliegue en el entorno de producción',
    'Mantenimiento y actualizaciones',
    'Análisis de requisitos con el cliente',
    'Configuración del entorno de desarrollo',
    'Automatización de pruebas',
    'Capacitación para usuarios finales',
    "Diseno de pantalla",
    "Diseno de API",
    "Diseno de flujo",
    "Diseno de arquitectura",
    "Creacion de prototipo",
    "Implementacion de endpoint",
    "Implementacion de servicio",
    "Implementacion de componente frontend",
    "Refactorizacion de funcion",
    "Refactorizacion de modulo",
    "Integracion de modulo",
    "Integracion con servicio externo",
    "Implementacion de logica de negocio",
    "Escritura de documentacion",
    "Actualizacion de documentacion",
    "Revision de documentacion",
    "Pruebas de carga",
    "Pruebas de seguridad"
]

# de la misma manera para bugs, tenemos que agregar nuestro diccionario
BUGS_EJEMPLO = [
    'Error al iniciar sesión con credenciales válidas',
    'Fallo en la carga de la página principal',
    'Problema de visualización en dispositivos móviles',
    'Error al guardar cambios en el perfil de usuario',
    'Fallo en la integración con el servicio de pago',
    'Problema de rendimiento al cargar grandes volúmenes de datos',
    'Error de validación en el formulario de registro',
    'Fallo en la generación de reportes',
    'Problema de compatibilidad con navegadores antiguos',
    'Error al enviar notificaciones por correo electrónico',
    'Bloqueo de la aplicación al realizar una búsqueda avanzada',
    'Fallo en la actualización automática de la aplicación',
    'Error al exportar datos en formato CSV',
    'Problema de sincronización con la base de datos',
    'Error al cargar imágenes en la galería',
    'Fallo en la autenticación de dos factores'
]

REQUERIMIENTOS_EJEMPLO = [
    'El sistema debe permitir la autenticación de usuarios mediante correo electrónico y contraseña.',
    'La aplicación debe ser compatible con dispositivos móviles y tablets.',
    'El sistema debe generar reportes mensuales de actividad de usuarios.',
    'La plataforma debe integrarse con servicios de pago externos como PayPal y Stripe.',
    'El sistema debe permitir la recuperación de contraseñas mediante correo electrónico.',
    'La aplicación debe tener una interfaz intuitiva y fácil de usar.',
    'El sistema debe soportar múltiples idiomas, incluyendo español e inglés.',
    'La plataforma debe cumplir con las normativas de protección de datos vigentes.',
    'El sistema debe permitir la exportación de datos en formatos CSV y PDF.',
    'La aplicación debe tener un tiempo de respuesta inferior a 2 segundos para operaciones comunes.',
    'El sistema debe permitir la gestión de roles y permisos para diferentes tipos de usuarios.',
    'La plataforma debe contar con un sistema de notificaciones en tiempo real.',
    'El sistema debe realizar copias de seguridad automáticas diarias de la base de datos.',
    'La aplicación debe ser escalable para soportar un crecimiento en el número de usuarios.',
    'El sistema debe permitir la integración con redes sociales para compartir contenido.'
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
elif borrar_todo == 'n':
    print("No se han borrado los datos existentes.")
elif borrar_todo != 's' and borrar_todo != 'n':
    print("Entrada no válida, continuando sin borrar datos existentes.")
time.sleep(1)

# generamos clientes ---------------------------------------------------------------------------------
print("\n\nGenerando datos sintéticos de Clientes (～﹃～)~zZ")
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

print("\n\nDatos sintéticos de Clientes generados correctamente. (￣o￣) . z Z")
time.sleep(1)

# generamos  proytectos ---------------------------------------------------------------------------------
print("\n\nGenerando datos sintéticos de Proyectos (～﹃～)~zZ")
time.sleep(1)

id_proyecto_creados = []
id_actividades_creadas = []
id_bugs_creados = []
id_requerimientos_creados = []
id_casos_prueba_creados = []

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
            fecha_real = fecha_estimada + timedelta(days=random.randint(-10, -1))  # puede terminar hasta 10 días antes
        else: # 25% probabilidad de terminar después de la fecha estimada
            fecha_real = fecha_estimada + timedelta(days=random.randint(1, 20))  # puede terminar  10 antes o 20 después
    else:
        fecha_real = None  # proyecto no terminado

    presupuesto = round(random.uniform(5000, 50000), 2) # presupuesto entre 5,000 y 50,000

    # 70% rentabilidad media, 15% alta, 15% baja
    if random.random() < 0.7:
        costo_final = round(presupuesto * random.uniform(0.8,0.9),2) # entre 10 y 20 de rentabilidad
    elif random.random() < 0.85:
        costo_final = round(presupuesto * random.uniform(0.6,0.79),2) # más de 20 de rentabilidad con tope en 40%
    else:
        costo_final = round(presupuesto * random.uniform(0.91,1.2),2) # menos de 10 de rentabilidad con posibilidad de sobrecoste topando en 20

    tamano_proyecto = random.randint(1000,150000) # en líneas de código 1000 a 10000 pequeño 10000 a 100000 mediano 100000 a 150000 grande

    if tamano_proyecto < 10000:
        complejidad = 'Baja'
        tamano_equipo = random.randint(3,7)
    elif tamano_proyecto < 100000:
        complejidad = 'Media'
        tamano_equipo = random.randint(7,15)
    elif tamano_proyecto >= 100000:
        complejidad = 'Alta'
        tamano_equipo = random.randint(15,30)

    porcentaje_modularizacion = round(random.uniform(25, 100), 1)  # entre 25% y 100%

    a = random.uniform(1, 100)
    b = random.uniform(1, 100)
    nivel_satisfaccion = round(max(a, b), 1) # agarra el máximo de a o b para tendencia a más proyectos con alta satisfacción  
    
    args = (id_cliente, nombre_proyecto, fecha_inicio, fecha_estimada, fecha_real, presupuesto, costo_final, tamano_proyecto, complejidad, tamano_equipo, porcentaje_modularizacion, nivel_satisfaccion, 0) # 0 es para después obtener el id_Proyecto generado por el return del sp
    resultado_proyectos = cursor.callproc('insertar_proyecto', args)

    id_proyecto_creados.append(resultado_proyectos[12])

    print(f"\nProyecto {i}: Cliente ID:{id_cliente}, Nombre Proyecto: {nombre_proyecto}, Fecha Inicio: {fecha_inicio}, Fecha Estimada: {fecha_estimada}, Fecha Real: {fecha_real}, Presupuesto: {presupuesto}, Costo Final: {costo_final}, Tamaño Proyecto: {tamano_proyecto}, Complejidad: {complejidad}, Tamaño Equipo: {tamano_equipo}, % Modularización: {porcentaje_modularizacion}, Nivel Satisfacción: {nivel_satisfaccion}")

    # actividades ----------------------------------------------------------------------------------
    # Para que sea más preciso, generaremos más o menos actividades en función de la complejidad del proyecto, por lo tanto, se realiza en este loop
    if complejidad == 'Baja':
        num_actividades = random.randint(5, 10)
    elif complejidad == 'Media':
        num_actividades = random.randint(10, 20)
    else:  # Alta
        num_actividades = random.randint(20, 30)
    
    actividades_disponibles = ACTIVIDADES_EJEMPLO.copy() # PARA NO REPETIR ACTIVIDADES
    random.shuffle(actividades_disponibles)

    for j in range(1, num_actividades + 1):
        nombre = actividades_disponibles.pop() 
        fecha_limite = fecha_estimada - timedelta(days= random.randint(0, 15))  # fecha límite antes de la fecha estimada para que no haya actividades que duren un día o menos
        fecha_aprobacion = fake.date_between(start_date=fecha_inicio, end_date=fecha_limite)
        fecha_finalizacion = fake.date_between(start_date=fecha_aprobacion, end_date=fecha_limite)
        
        resultado_actividades = cursor.callproc('insertar_actividad', (resultado_proyectos[12], nombre, fecha_aprobacion, fecha_finalizacion, 0))
        id_actividades_creadas.append(resultado_actividades[4])
        print(f"----Actividad {j}: Nombre: {nombre}, Fecha Aprobación: {fecha_aprobacion}, Fecha Finalización: {fecha_finalizacion}")
    
    # fin actividades ----------------------------------------------------------------------------------

    # bugs -----------------------------------------------------------------------------------
    # la probabilidad de bugs aumenta con la complejidad del proyecto
    if complejidad == 'Baja':
        num_bugs = random.choices([0,1,2], weights=[0.5,0.25,0.25])[0]  # 50% sin bugs, 25% un bug, 25% dos bugs
    elif complejidad == 'Media':
        num_bugs = random.randint(3, 7)
    else:  # Alta
        num_bugs = random.randint(8, 15)
    
    #DE LA MISMA MANERA TENEMOS QUE EVITAR REPETIR BUGS
    bugs_disponibles = BUGS_EJEMPLO.copy()
    random.shuffle(bugs_disponibles)

    for k in range(1, num_bugs + 1):
        descripcion = bugs_disponibles.pop()

        fecha_limite = fecha_estimada - timedelta(days= random.randint(0, 5))  # bugs no pueden detectarse en los últimos 5 días antes de la fecha estimada
        fecha_deteccion = fake.date_between(start_date=fecha_inicio, end_date=fecha_limite)

        # estado del bug
        if random.random() < 0.7:
            estado_bug = 'Solucionado'
        elif random.random() < 0.9:
            estado_bug = 'En revisión'
        else:
            estado_bug = 'Detectado'
        
        if estado_bug == 'Solucionado':
            fecha_solucion = fake.date_between(start_date=fecha_deteccion, end_date=fecha_limite)
        else:
            fecha_solucion = None
        
        severidad = random.choice(SEVERIDAD_BUG)

        resultado_bugs = cursor.callproc('insertar_bug', (resultado_proyectos[12], descripcion, fecha_deteccion, fecha_solucion, severidad, estado_bug, 0))
        id_bugs_creados.append(resultado_bugs[6])

        print(f"----Bug {k}: Descripción: {descripcion}, Fecha Detección: {fecha_deteccion}, Fecha Solución: {fecha_solucion}, Severidad: {severidad}, Estado: {estado_bug}")
    #fin bugs -----------------------------------------------------------------------------------

    # requerimientos -----------------------------------------------------------------------------------
    # número de requerimientos en función de la complejidad del proyecto
    if complejidad == 'Baja':
        num_requerimientos = random.randint(3, 5)
    elif complejidad == 'Media':
        num_requerimientos = random.randint(6, 10)
    else:  # Alta
        num_requerimientos = random.randint(10, 15)   

    #EVITAR REPETIR REQUERIMIENTOS 
    requerimientos_disponibles = REQUERIMIENTOS_EJEMPLO.copy()
    random.shuffle(requerimientos_disponibles)

    for l in range(1, num_requerimientos + 1):
        descripcion = requerimientos_disponibles.pop()

        resultado_requerimientos = cursor.callproc('insertar_requerimiento', (resultado_proyectos[12], descripcion, 0))
        id_requerimientos_creados.append(resultado_requerimientos[2])
        
        print(f"----Requerimiento {l}: Descripción: {descripcion}")

        #insert casos prueba ------------------------------------------------------------------------------
        #insertamos un caso de prueba por requerimiento con probabilidad de éxito del 80%
        exito = fake.boolean(chance_of_getting_true=80)
        resultado_casos_prueba = cursor.callproc('insertar_caso_prueba', (resultado_requerimientos[2], exito, 0))
        id_casos_prueba_creados.append(resultado_casos_prueba[2])
        print(f"--------Caso Prueba: Requerimiento ID: {resultado_requerimientos[2]}, Éxito: {exito}")
        #fin casos prueba ---------------------------------------------------------------------------------
    #fin requerimientos -----------------------------------------------------------------------------------

#debug
print("\n\nDatos sintéticos de Proyectos generados correctamente. (￣o￣) . z Z")
# print(f"\nID's de clientes: {id_cliente_creados}")
# print(f"\nID's de proyectos: {id_proyecto_creados}")
# print(f"\nID's de actividades: {id_actividades_creadas}")
# print(f"\nID's de bugs: {id_bugs_creados}")
# print(f"\nID's de requerimientos: {id_requerimientos_creados}")
# print(f"\nID's de casos de prueba: {id_casos_prueba_creados}")

time.sleep(1)



# confirmación de commit o rollback ----------------------------------------------------------------
confirmar = input("\n\n¿Deseas hacer commit de inserción o rollback? (s/n): ").strip().lower()
if confirmar == 's':
    conexion.commit()
    print("Cambios confirmados en la base de datos.")
elif confirmar == 'n':
    conexion.rollback()
    print("Cambios revertidos, no se han guardado en la base de datos.")
else:
    print("Entrada no válida, no se han realizado cambios en la base de datos.")

cursor.close()
conexion.close()

print("\n\nBYE!")

# ---------------------------------------------------------------------------------------------------------
