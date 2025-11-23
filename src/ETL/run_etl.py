import mysql.connector
import time

# Datos de conexion a tu base de datos local
config = {
    'user': 'root',
    'password': '',       # Si tienes pass, ponla aqui
    'host': 'localhost',
    'database': 'soporte_decision'
}

def correr_etl():
    print("\n--- Iniciando proceso ETL ---")
    
    start_time = time.time()
    conn = None
    
    try:
        # Nos conectamos a MySQL
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        print("Conexion exitosa.")

        # Ejecutamos los procedimientos en orden
        
        # 1. Dimensiones basicas
        print("Cargando tiempos y clientes...")
        cursor.callproc('etl_carga_tiempo')
        cursor.callproc('etl_carga_clientes')
        
        # 2. Tabla de hechos (la pesada)
        print("Calculando KPIs y llenando hechos...")
        cursor.callproc('etl_carga_hechos')
        
        # Guardamos los cambios
        conn.commit()
        
        # Vemos cuantas filas quedaron para confirmar
        cursor.execute("SELECT COUNT(*) FROM Fact_Proyectos")
        total = cursor.fetchone()[0]
        
        # Calculamos cuanto tardo
        duracion = round(time.time() - start_time, 2)
        
        print(f"\nProceso terminado correctamente.")
        print(f"Tiempo: {duracion} segundos")
        print(f"Total de proyectos procesados: {total}")

    except mysql.connector.Error as err:
        print(f"Error de base de datos: {err}")
    except Exception as e:
        print(f"Error general: {e}")
    finally:
        # Cerramos la conexion si esta abierta
        if conn and conn.is_connected():
            cursor.close()
            conn.close()
            print("Conexion cerrada.")

if __name__ == "__main__":
    correr_etl()