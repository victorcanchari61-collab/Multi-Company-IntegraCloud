# WMS — Warehouse Management System

## Descripción General
Sistema que controla y optimiza las operaciones dentro del almacén, desde la recepción de mercancía hasta el despacho de pedidos.

## Módulos y Submódulos

### 1. Recepción
| Submódulo | Descripción | Flujo de trabajo | Requisitos clave |
|-----------|-------------|------------------|------------------|
| Aviso de recibo anticipado (ASN) | Notificación previa de llegada | Proveedor envía ASN → Sistema registra → Planificación de recepción | Integración EDI, formato estándar, programación de muelles |
| Control de calidad en recepción | Inspección de mercancía entrante | Muestreo → Inspección → Aprobación/Rechazo → Disposición | Planes de muestreo, criterios AQL, cuarentena |
| Registro de lotes y series | Trazabilidad de productos | Lectura → Registro → Asociación a ubicación → Historial | Códigos de lote, números de serie, fechas de vencimiento |
| Ubicación en almacén | Asignación de espacio a mercancía | Sistema recomienda → Operador ubica → Confirmación → Actualización | Reglas de almacenamiento, rotación FIFO/FEFO |

### 2. Almacenamiento
| Submódulo | Descripción | Flujo de trabajo | Requisitos clave |
|-----------|-------------|------------------|------------------|
| Gestión de ubicaciones | Administración del layout del almacén | Definición → Codificación → Capacidad → Estado | Códigos de ubicación, dimensiones, peso máximo |
| Movimientos internos | Traslados entre ubicaciones | Solicitud → Ejecución → Confirmación → Actualización | Motivos de movimiento, autorizaciones, optimización de rutas |
| Reabastecimiento de picking | Reposición de zonas de picking | Umbral → Generación de tarea → Ejecución → Confirmación | Punto de reorden, cantidad óptima, prioridad por rotación |
| Control de inventario cíclico | Conteos periódicos de inventario | Programación → Conteo → Ajuste → Análisis | Ciclos ABC, frecuencia, tolerancias, causa raíz de diferencias |

### 3. Picking & Packing
| Submódulo | Descripción | Flujo de trabajo | Requisitos clave |
|-----------|-------------|------------------|------------------|
| Picking por ola | Agrupación de pedidos para eficiencia | Agrupación → Asignación → Ejecución → Consolidación | Olas por hora/ruta/prioridad, wave planning |
| Picking por zona | Asignación de zonas a pickers | Zona → Asignación → Picking → Transferencia entre zonas | Zonas geográficas, balanceo de carga, handoff |
| Cross-docking | Transferencia directa de recepción a despacho | Identificación → Desvío → Consolidación → Despacho | Sin almacenamiento intermedio, sincronización |
| Embalaje y etiquetado | Preparación de pedidos para envío | Verificación → Empaque → Etiquetado → Pesaje | Materiales de empaque, etiquetas de envío, fotos |
| Consolidación de pedidos | Agrupación de paquetes por envío | Múltiples paquetes → Unificación → Documentos → Envío | Órdenes parciales, LTL, FTL, documentos consolidados |

### 4. Despacho
| Submódulo | Descripción | Flujo de trabajo | Requisitos clave |
|-----------|-------------|------------------|------------------|
| Programación de envíos | Planificación de salidas | Pedidos → Ruta → Vehículo → Programación | Ventanas de tiempo, capacidad de vehículo, orden de carga |
| Carga de vehículos | Secuencia de carga | Plan de carga → Ejecución → Verificación → Cierre | Secuencia de descarga, peso/balance, fotos de carga |
| Documentos de embarque | Generación de documentación | Factura → Packing list → Bill of lading → Certificado de origen | Formatos por transportista, firma digital, copias |
| Track & trace | Seguimiento de envíos | Salida → Tránsito → Entregas parciales → Entrega final | GPS, eventos de tracking, ETA, POD electrónico |
