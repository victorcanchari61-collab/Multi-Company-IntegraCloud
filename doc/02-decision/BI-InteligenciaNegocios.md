# BI — Business Intelligence

## Descripción General
Sistema que transforma datos en información accionable para la toma de decisiones, integrando procesos de extracción, almacenamiento, análisis y visualización.

## Módulos y Submódulos

### 1. ETL / Integración
| Submódulo | Descripción | Flujo de trabajo | Requisitos clave |
|-----------|-------------|------------------|------------------|
| Extracción de fuentes | Captura de datos desde sistemas origen | Conexión → Extracción → Validación → Staging | Múltiples fuentes (bases de datos, APIs, archivos), incremental |
| Transformación y limpieza | Procesamiento y calidad de datos | Staging → Limpieza → Transformación → Enriquecimiento → Carga | Reglas de negocio, deduplicación, validación, logging |
| Carga al Data Warehouse | Persistencia en el repositorio central | Transformado → Estrategia → Carga → Índices → Particiones | Full/Incremental, SCD tipo 1/2/3, ventana de carga |
| Orquestación de pipelines | Coordinación de flujos ETL | DAG → Scheduling → Ejecución → Monitoreo → Alertas | Dependencias, reintentos, SLA, logging centralizado |
| Calidad de datos | Monitoreo y mejora de calidad de datos | Reglas → Perfiles → Métricas → Reportes → Corrección | Completitud, consistencia, precisión, oportunidad |

### 2. Data Warehouse
| Submódulo | Descripción | Flujo de trabajo | Requisitos clave |
|-----------|-------------|------------------|------------------|
| Modelo dimensional (estrella/copo) | Diseño del esquema de datos | Hechos → Dimensiones → Relaciones → Modelo → Validación | Tablas de hechos (transaccionales, periódicas), dimensiones (conformadas, degeneradas) |
| Data marts | Subconjuntos por área de negocio | Requerimiento → Modelo → Construcción → Carga → Acceso | Data marts departamentales, OLAP, seguridad por área |
| Particionamiento | Optimización de almacenamiento | Estrategia → Clave → Rangos → Mantenimiento | Por fecha, por región, por tipo, archivo de particiones viejas |
| Gestión de metadatos | Catálogo de datos del DW | Extracción → Registro → Búsqueda → Linaje → Impacto | Business glossary, technical metadata, data lineage, impact analysis |
| Historial de datos | Mantenimiento de datos históricos | Versión → Cambio → Histórico → Purga → Archivo | SCD, snapshots periódicos, retención, compresión |

### 3. Reportes
| Submódulo | Descripción | Flujo de trabajo | Requisitos clave |
|-----------|-------------|------------------|------------------|
| Reportes estáticos | Informes predefinidos y programados | Diseño → Parámetros → Ejecución → Distribución | Formato fijo, periodicidad, suscripciones, entrega automática |
| Reportes ad hoc | Informes bajo demanda del usuario | Selección → Filtros → Visualización → Exportación | Query builder visual, guardar/reutilizar, exportar |
| Programación de envíos | Distribución automática de reportes | Reporte → Horario → Destinatarios → Formato → Envío | Calendarización, grupos de distribución, formato múltiple |
| Formatos: PDF, Excel, CSV | Múltiples formatos de salida | Datos → Formato → Render → Entrega | Formato preservado, datos abiertos, gran volumen Excel |

### 4. Dashboards
| Submódulo | Descripción | Flujo de trabajo | Requisitos clave |
|-----------|-------------|------------------|------------------|
| Dashboards ejecutivos | Vista de alto nivel de la organización | KPIs → Diseño → Visualización → Actualización → Alertas | Métricas clave, semáforos, tendencias, resumen ejecutivo |
| KPIs en tiempo real | Indicadores con actualización continua | Fuente → Streaming → Cálculo → Visualización → Alerta | Latencia baja, websockets, ticker, tableros operativos |
| Mapas geográficos | Visualización geoespacial de datos | Geodatos → Capas → Mapa → Interacción → Filtro | Mapas de calor, burbujas, regiones, drill-down geográfico |
| Drilldown interactivo | Navegación jerárquica de datos | Resumen → Click → Detalle → Más detalle → Origen | Jerarquías (año → trimestre → mes → día), cross-filtering |

### 5. Self-service analytics
| Submódulo | Descripción | Flujo de trabajo | Requisitos clave |
|-----------|-------------|------------------|------------------|
| Exploración de datos | Análisis libre del usuario | Fuente → Arrastrar → Visualizar → Filtrar → Insight | Interfaz drag & drop, campos disponibles, recomendaciones |
| Filtros y segmentación | Focalización en subconjuntos de datos | Dimensión → Valor → Filtro → Segmento → Análisis | Filtros múltiples, segmentación guardada, combinación AND/OR |
| Exportación de datos | Descarga de datos analizados | Selección → Formato → Exportar → Descargar | Límites de exportación, formatos (Excel, CSV), permisos |
| Creación de visualizaciones | Generación de gráficos por el usuario | Tipo → Campos → Configuración → Guardar → Compartir | Tipos de gráfico, personalización, galería de plantillas |
