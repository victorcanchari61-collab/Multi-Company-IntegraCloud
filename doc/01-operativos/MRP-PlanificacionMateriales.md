# MRP — Material Requirements Planning

## Descripción General
Sistema que calcula los materiales necesarios para la producción basándose en la demanda, las listas de materiales y los niveles de inventario actuales.

## Módulos y Submódulos

### 1. Planificación
| Submódulo | Descripción | Flujo de trabajo | Requisitos clave |
|-----------|-------------|------------------|------------------|
| Explosión de BOM | Descomposición de producto final en materiales | Producto terminado → BOM → Niveles → Componentes → Subcomponentes | BOM multinivel, cantidades por unidad, merma |
| Cálculo de necesidades netas | Demanda neta de materiales | Demanda bruta → Inventario → Recepciones → Necesidad neta | Netting por período, lead time offset, tamaño de lote |
| Órdenes planificadas | Sugerencias de órdenes de compra/fabricación | Necesidad neta → Lote → Plazos → Liberación sugerida | Firmar/replanificar, horizonte de planificación, acción sugerida |
| Mensajes de acción | Alertas y recomendaciones | Excepción → Regla → Mensaje → Acción | Adelantar/retrasar, cancelar, aumentar/reducir cantidad |

### 2. Control de inventarios
| Submódulo | Descripción | Flujo de trabajo | Requisitos clave |
|-----------|-------------|------------------|------------------|
| Stock de seguridad | Buffer contra variabilidad | Demanda → Lead time → Servicio → Cálculo | Nivel de servicio, desviación estándar, revisión periódica |
| Lote económico (EOQ) | Cantidad óptima de pedido | Demanda anual → Costo de pedido → Costo de mantener → EOQ | Costos logísticos, descuentos por volumen, capacidad |
| Puntos de reorden | Nivel que dispara nueva orden | Lead time → Demanda → Stock seguridad → ROP | Monitoreo continuo, revisión periódica, demanda variable |
| Inventario en tránsito | Material en proceso de traslado | Origen → Tránsito → ETA → Destino | Tracking, visibilidad, seguro, lead time de transporte |

### 3. Capacidad
| Submódulo | Descripción | Flujo de trabajo | Requisitos clave |
|-----------|-------------|------------------|------------------|
| Plan de capacidad aproximada (RCCP) | Validación gruesa de capacidad | MPS → Rutas → Centro de trabajo → Carga → Validación | Perfiles de capacidad, carga histórica, cuellos de botella |
| Plan de requerimientos de capacidad (CRP) | Validación detallada de capacidad | Órdenes planificadas → Rutas → Tiempos → Carga → Nivelación | Centros de trabajo, calendarios, capacidad finita/infinita |
| Centros de trabajo | Unidades productivas con capacidad | Definición → Capacidad → Eficiencia → Disponibilidad | Máquinas, líneas, células, turnos, calendarios |
| Calendarios de producción | Días y turnos laborales | Días → Turnos → Horas → Mantenimiento → Festivos | Capacidad por día, turnos múltiples, paradas programadas |
