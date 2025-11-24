import mysql.connector
import time

# Configuracion para conectarse al Data Warehouse (Maquina 3)
config = {
    'user': 'yuri',
    'password': '1234',      
    'host': '192.168.1.27',  # Revisar si esta IP es la correcta
    'database': 'soporte_decision'
}

def correr_etl():
    print("\n--- Iniciando el ETL Remoto ---")
    
    inicio = time.time()
    conn = None
    
    try:
        # 1. Nos conectamos a la base de datos destino
        print("Conectando al servidor...")
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        print("Conexion lista.")

        # 2. Ejecutamos los procedimientos almacenados
        # Estos SPs son los que jalan la info de la otra maquina
        print("Ejecutando carga de datos...")
        
        # Primero las dimensiones
        print("- Cargando Tiempos y Clientes")
        cursor.callproc('etl_carga_tiempo')
        cursor.callproc('etl_carga_clientes')
        
        # Luego la tabla de hechos (aqui tarda un poco mas)
        print("- Procesando Hechos y calculando KPIs")
        cursor.callproc('etl_carga_hechos')
        
        # Guardamos los cambios
        conn.commit()
        
        # Vemos cuantos registros quedaron para confirmar
        cursor.execute("SELECT COUNT(*) FROM Fact_Proyectos")
        total = cursor.fetchone()[0]
        
        tiempo_total = round(time.time() - inicio, 2)
        
        print(f"\nProceso terminado correctamente.")
        print(f"Tiempo: {tiempo_total} seg")
        print(f"Proyectos procesados: {total}")

    except Exception as e:
        print(f"\nHubo un error: {e}")
    finally:
        # Cerramos todo al terminar
        if conn and conn.is_connected():
            conn.close()

if __name__ == "__main__":
    correr_etl()