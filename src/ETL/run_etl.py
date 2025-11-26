import mysql.connector
from datetime import date, datetime
import time

# Datos de la maquina de gestion (la que tiene los datos)
config_origen = {
    'user': 'yuri',
    'password': '1234',
    'host': '192.168.1.50',  # Cambiar por la IP de gestion
    'database': 'Gestion_Proyectos'
}

# Datos de la maquina de soporte (donde guardamos todo)
config_destino = {
    'user': 'yuri',
    'password': '1234',
    'host': '192.168.1.27',  # Cambiar por la IP de soporte
    'database': 'soporte_decision'
}

# --- Funciones utiles ---

# Sacar el trimestre segun el mes
def calcular_trimestre(fecha):
    return (fecha.month - 1) // 3 + 1

# Poner categoria al equipo segun cuantos sean
def clasificar_equipo(tamano):
    if tamano <= 3: return "Pequeño"
    elif tamano <= 9: return "Mediano"
    elif tamano <= 20: return "Grande"
    return "Extra Grande"

# Convertir fecha a numero entero (ej. 20251123)
def fecha_a_int(fecha):
    if not fecha: return None
    return int(fecha.strftime('%Y%m%d'))

# --- El proceso principal ---

def ejecutar_etl():
    print("\n--- Iniciando ETL con Python ---")
    inicio = time.time()
    
    try:
        # Nos conectamos a las dos bases de datos
        print("Conectando...")
        conn_origen = mysql.connector.connect(**config_origen)
        conn_destino = mysql.connector.connect(**config_destino)
        
        cursor_origen = conn_origen.cursor(dictionary=True) # Para leer mas facil
        cursor_destino = conn_destino.cursor()
        
        print("Conectado.")

        # 1. Sacar datos de la maquina origen
        print("Extrayendo datos...")
        
        # Me traigo todas las tablas a memoria
        cursor_origen.execute("SELECT * FROM Clientes")
        clientes = cursor_origen.fetchall()
        
        cursor_origen.execute("SELECT * FROM Proyectos")
        proyectos = cursor_origen.fetchall()
        
        cursor_origen.execute("SELECT * FROM Bugs")
        todos_bugs = cursor_origen.fetchall()
        
        cursor_origen.execute("SELECT * FROM Requerimientos")
        todos_reqs = cursor_origen.fetchall()
        
        cursor_origen.execute("SELECT * FROM Casos_Prueba")
        todos_casos = cursor_origen.fetchall()
        
        print(f"Se bajaron {len(proyectos)} proyectos.")

        # 2. Limpiar la base destino para no duplicar
        print("Limpiando tablas viejas...")
        cursor_destino.execute("SET FOREIGN_KEY_CHECKS=0;")
        cursor_destino.execute("TRUNCATE TABLE Fact_Proyectos;")
        cursor_destino.execute("TRUNCATE TABLE Dim_Detalles_Proyecto;")
        cursor_destino.execute("TRUNCATE TABLE Dim_Cliente;")
        cursor_destino.execute("TRUNCATE TABLE Dim_Tiempo;")
        cursor_destino.execute("SET FOREIGN_KEY_CHECKS=1;")

        # 3. Transformar y guardar en destino
        print("Calculando y guardando...")

        # Guardar clientes
        for c in clientes:
            sql = "INSERT INTO Dim_Cliente (id_cliente, nombre_empresa, sector, pais, importancia_en_sector) VALUES (%s, %s, %s, %s, %s)"
            val = (c['id_cliente'], c['nombre'], c['sector'], c['pais'], c['importancia_en_sector'])
            cursor_destino.execute(sql, val)

        # Guardar fechas (dimension tiempo)
        fechas_procesadas = set()
        
        for p in proyectos:
            # Reviso todas las fechas importantes del proyecto
            fechas = [p['fecha_inicio'], p['fecha_estimada'], p['fecha_final']]
            for f in fechas:
                if f and f not in fechas_procesadas:
                    sql = "INSERT IGNORE INTO Dim_Tiempo (id_fecha, fecha, anio, mes, trimestre) VALUES (%s, %s, %s, %s, %s)"
                    val = (fecha_a_int(f), f, f.year, f.month, calcular_trimestre(f))
                    cursor_destino.execute(sql, val)
                    fechas_procesadas.add(f)

        # Procesar cada proyecto y sacar sus KPIs
        for p in proyectos:
            p_id = p['id_proyecto']
            
            # Guardar detalles del proyecto
            cat_equipo = clasificar_equipo(p['tamano_equipo'])
            sql_dim = "INSERT INTO Dim_Detalles_Proyecto (id_proyecto, nombre_proyecto, complejidad, tamano_equipo_categoria) VALUES (%s, %s, %s, %s)"
            cursor_destino.execute(sql_dim, (p_id, p['nombre_proyecto'], p['complejidad'], cat_equipo))
            id_detalle_generado = cursor_destino.lastrowid

            # Calcular KPIs financieros
            rentabilidad = float(p['presupuesto']) - float(p['costo_final']) if p['costo_final'] else 0
            
            # Calcular dias y retrasos
            dias_estimados = (p['fecha_estimada'] - p['fecha_inicio']).days
            dias_reales = 0
            dias_retraso = 0
            if p['fecha_final']:
                dias_reales = (p['fecha_final'] - p['fecha_inicio']).days
                retraso_calc = (p['fecha_final'] - p['fecha_estimada']).days
                dias_retraso = max(0, retraso_calc)

            # KPIs de calidad (cuento los bugs de este proyecto)
            bugs_proy = [b for b in todos_bugs if b['id_proyecto'] == p_id]
            total_bugs = len(bugs_proy)
            criticos = len([b for b in bugs_proy if b['severidad'] in ['Alta', 'Crítica']])
            
            # Tiempo promedio para arreglar bugs
            tiempos_res = []
            for b in bugs_proy:
                if b['fecha_solucion'] and b['fecha_deteccion']:
                    tiempos_res.append((b['fecha_solucion'] - b['fecha_deteccion']).days)
            promedio_res = sum(tiempos_res) / len(tiempos_res) if tiempos_res else 0

            # KPIs de trazabilidad (requerimientos vs pruebas)
            reqs_proy = [r for r in todos_reqs if r['id_proyecto'] == p_id]
            total_reqs = len(reqs_proy)
            reqs_cubiertos = 0
            
            for r in reqs_proy:
                # Busco si el requerimiento tiene pruebas
                pruebas = [cp for cp in todos_casos if cp['id_requerimiento'] == r['id_requerimiento']]
                if len(pruebas) > 0:
                    reqs_cubiertos += 1
            
            cobertura = (reqs_cubiertos / total_reqs * 100) if total_reqs > 0 else 0

            # Guardar todo en la tabla de hechos final
            sql_fact = """
                INSERT INTO Fact_Proyectos (
                    id_fecha_inicio, id_fecha_fin, id_cliente, id_detalles,
                    presupuesto, costo_final, rentabilidad,
                    dias_estimados, dias_reales, dias_retraso,
                    lineas_codigo, tamano_equipo, porcentaje_modularizacion,
                    total_bugs, total_bugs_criticos, tiempo_resolucion_bugs_promedio,
                    total_requerimientos, porcentaje_cobertura_requerimientos,
                    nivel_satisfaccion
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            val_fact = (
                fecha_a_int(p['fecha_inicio']), 
                fecha_a_int(p['fecha_final']), 
                p['id_cliente'], 
                id_detalle_generado,
                p['presupuesto'], p['costo_final'], rentabilidad,
                dias_estimados, dias_reales, dias_retraso,
                p['tamano_proyecto'], p['tamano_equipo'], p['porcentaje_modularizacion'],
                total_bugs, criticos, promedio_res,
                total_reqs, cobertura,
                p['nivel_satisfaccion']
            )
            cursor_destino.execute(sql_fact, val_fact)

        conn_destino.commit()
        print("\nProceso terminado correctamente.")
        
        # Calculo cuanto tardo
        tiempo_total = round(time.time() - inicio, 2)
        print(f"Tiempo: {tiempo_total} segundos")

    except mysql.connector.Error as err:
        print(f"Error de SQL: {err}")
    except Exception as e:
        print(f"Error general: {e}")
    finally:
        # Cerrar conexiones
        if 'conn_origen' in locals() and conn_origen.is_connected(): conn_origen.close()
        if 'conn_destino' in locals() and conn_destino.is_connected(): conn_destino.close()

if __name__ == "__main__":
    ejecutar_etl()