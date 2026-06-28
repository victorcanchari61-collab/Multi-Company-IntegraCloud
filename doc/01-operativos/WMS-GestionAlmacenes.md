# WMS — Warehouse Management System

## Descripción General
Sistema que controla y optimiza las operaciones dentro del almacén, desde la recepción de mercancía hasta el despacho de pedidos.

## Módulos y Submódulos

### 1. Recepción
| Submódulo | Descripción |
|-----------|-------------|
| Muelle de entrada | Asignación y gestión de muelles para descarga |
| Verificación vs orden de compra | Cotejo de mercancía recibida contra OC |
| Control de calidad | Inspección y aprobación/rechazo de mercancía entrante |
| Etiquetado y codificación | Asignación de etiquetas y códigos internos |
| Devoluciones de clientes | Recepción de mercancía devuelta por clientes |

### 2. Almacenamiento
| Submódulo | Descripción |
|-----------|-------------|
| Ubicaciones (pasillo/estante/nivel) | Codificación y gestión del layout del almacén |
| Zonas de almacén | Segmentación del almacén por tipo de producto o rotación |
| Reglas de ubicación | Asignación automática según reglas definidas |
| Gestión de lotes y series | Trazabilidad por lote y número de serie |
| Fechas de vencimiento | Control de vencimientos y rotación FIFO/FEFO |
| Control de temperatura | Monitoreo de zonas con temperatura controlada |

### 3. Inventario físico
> Ubicación física del stock.

| Submódulo | Descripción |
|-----------|-------------|
| Stock por ubicación | Cantidades exactas por ubicación física |
| Conteos cíclicos | Inventarios periódicos por rotación ABC |
| Inventario general | Conteo total programado del almacén |
| Diferencias y ajustes físicos | Correcciones por diferencias encontradas |
| Trazabilidad de movimientos | Historial completo de cada movimiento de producto |

### 4. Picking
| Submódulo | Descripción |
|-----------|-------------|
| Órdenes de picking | Generación de tareas de preparación |
| Asignación de operarios | Distribución de tareas según carga y zona |
| Rutas de picking optimizadas | Secuencia eficiente de recorrido |
| Picking por lote / zona | Agrupación de pedidos para eficiencia |
| Confirmación con escáner | Validación con código de barras / RFID |

### 5. Packing
| Submódulo | Descripción |
|-----------|-------------|
| Verificación de bultos | Confirmación de contenido vs. pedido |
| Empaque por tipo de producto | Material de empaque según características |
| Generación de packing list | Documento detallado del contenido del envío |
| Peso y dimensiones | Registro para cálculo de flete |
| Etiquetas de envío | Generación de etiquetas con datos logísticos |

### 6. Despacho
| Submódulo | Descripción |
|-----------|-------------|
| Órdenes de salida | Autorización y programación de salidas |
| Asignación de transportista | Selección de transportista según ruta y carga |
| Guías de remisión | Documentos de traslado y transporte |
| Manifiestos de carga | Lista consolidada de envíos por vehículo |
| Confirmación de envío | Cierre y registro de salida confirmada |

### 7. Logística inversa
| Submódulo | Descripción |
|-----------|-------------|
| Devoluciones de clientes | Proceso de retorno desde el cliente |
| Inspección de retorno | Evaluación del estado del producto devuelto |
| Reingreso al stock | Productos aptos para reintegrarse al inventario |
| Productos dañados / merma | Clasificación y disposición de producto no apto |

### 8. Transportistas
> Dueño: WMS.

| Submódulo | Descripción |
|-----------|-------------|
| Ficha de transportista | Datos generales, contacto y habilitaciones |
| Vehículos | Registro de unidades, capacidad y documentación |
| Rutas asignadas | Cobertura geográfica y frecuencias |
| Tarifas de flete | Costos por ruta, peso y tipo de carga |
| Seguimiento de entregas | Tracking de envíos en tránsito y POD |

### 9. Productos (atributos WMS)
> Lee datos maestros del ERP y agrega atributos logísticos.

| Submódulo | Descripción |
|-----------|-------------|
| Dimensiones y peso | Largo, ancho, alto y peso por unidad |
| Tipo de almacenamiento | Condiciones especiales (refrigerado, peligroso, etc.) |
| Fragilidad / peligrosidad | Clasificación para manipulación y embalaje |
| Cantidad por pallet | Unidades por pallet estándar |
| Imagen de ubicación | Fotografía referencial de la ubicación ideal |

### 10. Reportes operativos
| Submódulo | Descripción |
|-----------|-------------|
| Ocupación del almacén | Porcentaje de capacidad utilizada |
| Productividad por operario | Órdenes/hora por operario y zona |
| Tiempo de ciclo | Desde recepción hasta despacho |
| Tasa de error de picking | Precisión del proceso de preparación |
| Movimientos por período | Volumen de entradas, salidas y traslados |
