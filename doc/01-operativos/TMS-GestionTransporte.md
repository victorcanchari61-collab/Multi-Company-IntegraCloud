# TMS — Transportation Management System

## Descripción General
Sistema que gestiona la planificación, ejecución y optimización del transporte de mercancías, reduciendo costos y mejorando el nivel de servicio.

## Módulos y Submódulos

### 1. Planificación
| Submódulo | Descripción | Flujo de trabajo | Requisitos clave |
|-----------|-------------|------------------|------------------|
| Optimización de rutas | Cálculo de rutas más eficientes | Orígenes → Destinos → Restricciones → Ruta óptima | Distancia, tiempo, peajes, restricciones de tráfico, ventanas |
| Selección de transportistas | Elección del mejor carrier | Pedido → Tarifas → Disponibilidad → Selección → Asignación | Tarifas por modo/ruta, scorecard, capacidad, cobertura |
| Consolidación de cargas | Agrupación de envíos | Órdenes → Consolidación → Optimización → Despacho | LTL → FTL, multi-parada, cross-dock, milk run |
| Programación de envíos | Planificación temporal de salidas | Pedidos → Ventana → Vehículo → Conductor → Schedule | Slots de carga, disponibilidad de muelles, turnos |

### 2. Ejecución
| Submódulo | Descripción | Flujo de trabajo | Requisitos clave |
|-----------|-------------|------------------|------------------|
| Dispatch | Asignación y despacho de unidades | Orden → Asignación → Confirmación → Salida | Conductor, vehículo, documentos, checklist de salida |
| Seguimiento en tiempo real | Monitoreo de flota y carga | GPS → Telemetría → Dashboard → Alertas | Geocercas, ETAs, desvíos de ruta, temperatura controlada |
| Gestión de incidencias | Manejo de eventos adversos | Detección → Notificación → Acción → Resolución → Lección | Accidentes, robos, daños, retrasos, procedimientos |
| Prueba de entrega electrónica (POD) | Confirmación digital de entrega | Llegada → Descarga → Firma → Foto → Documento | Firma digital, foto de evidencia, sello de tiempo, geolocalización |

### 3. Freight audit
| Submódulo | Descripción | Flujo de trabajo | Requisitos clave |
|-----------|-------------|------------------|------------------|
| Auditoría de fletes | Verificación de facturas de flete | Factura → Tarifa → Auditoría → Aprobación/Discrepancia → Pago | Reglas de auditoría, detección de sobrecargos, automática |
| Conciliación de facturas | Cotejo entre factura y servicio | Servicio → Factura → Diferencia → Resolución → Pago | Matching automático, excepciones, nota de crédito |
| Análisis de costos de transporte | KPIs de costo logístico | Datos → Consolidación → Análisis → Reporte → Optimización | Costo por km, costo por kg, costo por unidad, tendencias |
| KPIs de carrier | Evaluación de desempeño de transportistas | Métricas → Scorecard → Benchmark → Revisión | On-time, damage ratio, cost competitiveness, response time |
