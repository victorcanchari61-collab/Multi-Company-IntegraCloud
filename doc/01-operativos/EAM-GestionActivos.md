# EAM — Enterprise Asset Management

## Descripción General
Sistema que gestiona el ciclo de vida completo de los activos físicos de la empresa, desde su adquisición hasta su disposición, maximizando su disponibilidad y confiabilidad.

## Módulos y Submódulos

### 1. Mantenimiento preventivo
| Submódulo | Descripción | Flujo de trabajo | Requisitos clave |
|-----------|-------------|------------------|------------------|
| Planes de mantenimiento | Programación de mantenimiento periódico | Activo → Frecuencia → Tareas → Recursos → Calendario | Calendario por tiempo/uso, checklist, instructivos |
| Órdenes de trabajo | Ejecución de tareas de mantenimiento | Plan/Evento → OT → Asignación → Ejecución → Cierre → Registro | Prioridad, tipo de OT, materiales, horas hombre, repuestos |
| Historial de equipos | Registro de intervenciones por equipo | Equipo → OT → Fecha → Problema → Solución → Costo → Próximo vencimiento | MTBF, MTTR, costo de mantenimiento, frecuencia de fallas |
| Mantenimiento predictivo | Monitoreo de condición del activo | Sensor → Parámetro → Tendencia → Alerta → Intervención | Vibrómetros, termografía, análisis de aceite, umbrales |

### 2. Gestión de activos
| Submódulo | Descripción | Flujo de trabajo | Requisitos clave |
|-----------|-------------|------------------|------------------|
| Registro de activos | Catálogo maestro de activos | Adquisición → Codificación → Registro → Atributos → Estado | Jerarquía de activos, ubicación, categoría, estado, documentos |
| Depreciación | Cálculo de desgaste de activos | Alta → Método → Vida útil → Cálculo → Baja | Línea recta, acelerada, unidades de producción, residual |
| Localización de activos | Ubicación física de activos | Asignación → Movimiento → Actualización → Consulta → Inventario | Ubicación jerárquica, zona, planta, área, GPS |
| Gestión de garantías | Seguimiento de cobertura | Proveedor → Vigencia → Términos → Reclamo → Seguimiento | Fecha de vencimiento, condiciones, contacto, proceso de reclamo |

### 3. Repuestos
| Submódulo | Descripción | Flujo de trabajo | Requisitos clave |
|-----------|-------------|------------------|------------------|
| Inventario de repuestos | Stock de partes de repuesto | Recepción → Almacenamiento → Consumo → Reposición → Ajuste | Ubicación en almacén, mínimos/máximos, rotación |
| Criticidad de partes | Clasificación según impacto en operación | Parte → Equipo → Impacto → Clasificación → Estrategia | A/B/C, lead time, único proveedor, costo de falta |
| Órdenes de compra MRO | Adquisición de mantenimiento, reparación y operación | Necesidad → Cotización → OC → Recepción → Pago | Materiales MRO, proveedores especializados, catálogo |

### 4. Confiabilidad
| Submódulo | Descripción | Flujo de trabajo | Requisitos clave |
|-----------|-------------|------------------|------------------|
| FMEA | Análisis de modos y efectos de falla | Función → Modo → Efecto → Causa → Control → RPN → Acción | Severidad, ocurrencia, detección, RPN, plan de acción |
| Análisis de modos de falla | Análisis de fallas recurrentes | Falla → Síntomas → Causa → Acción → Verificación | RCA, RCM, criticidad, impacto en producción |
| Indicadores OEE | Efectividad global del equipo | Disponibilidad × Rendimiento × Calidad → OEE → Análisis | Pérdidas, seis grandes pérdidas, mejora continua |
| MTBF / MTTR | Métricas de confiabilidad y mantenibilidad | Tiempo operativo → Fallas → MTBF → Tiempo reparación → MTTR | Objetivos por equipo, benchmark, tendencia, mejora |
