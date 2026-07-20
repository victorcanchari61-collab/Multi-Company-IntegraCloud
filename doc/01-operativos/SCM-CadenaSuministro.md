# SCM — Supply Chain Management

## Descripción General
Sistema que coordina el flujo de bienes, información y finanzas a lo largo de toda la cadena de suministro, desde proveedores hasta clientes.

## Módulos y Submódulos

### 1. Planificación de demanda
| Submódulo | Descripción | Flujo de trabajo | Requisitos clave |
|-----------|-------------|------------------|------------------|
| Pronóstico estadístico | Predicción cuantitativa de demanda | Histórico → Modelo → Ajuste → Pronóstico → Validación | Modelos (ARIMA, Holt-Winters, ML), MAPE, bias |
| Consenso de demanda | Alineación de pronósticos internos | Ventas → Marketing → Finanzas → Operaciones → Consenso | Promedio ponderado, reuniones S&OP, ajuste colaborativo |
| Gestión de temporadas | Manejo de estacionalidad | Patrones → Factores → Ajuste → Pronóstico | Índices estacionales, eventos promocionales, lanzamientos |
| Segmentación ABC-XYZ | Clasificación de productos por valor y variabilidad | ABC (valor) → XYZ (variabilidad) → Matriz → Estrategia | Políticas de inventario por segmento, priorización |

### 2. Planificación de suministro
| Submódulo | Descripción | Flujo de trabajo | Requisitos clave |
|-----------|-------------|------------------|------------------|
| Plan maestro de producción (MPS) | Plan de producción a mediano plazo | Demanda → MPS → Validación de capacidad → Liberación | Horizonte rodante, tasa de producción, inventario disponible |
| Política de inventarios | Estrategia de niveles de stock | Clasificación → Parámetros → Cálculo → Revisión | Stock de seguridad, punto de reorden, lote óptimo (EOQ) |
| Gestión de restricciones | Identificación y manejo de cuellos de botella | Mapeo → Capacidad → Simulación → Optimización | TOC, DRUM-BUFFER-ROPE, throughput |
| Colaboración con proveedores | Integración con proveedores | Demanda compartida → Visibilidad → Reposición → Evaluación | CPFR, VMI, EDI, forecast sharing |

### 3. Aprovisionamiento
| Submódulo | Descripción | Flujo de trabajo | Requisitos clave |
|-----------|-------------|------------------|------------------|
| Selección de proveedores | Evaluación y selección | RFI → RFP → RFQ → Evaluación → Selección | Criterios (calidad, precio, capacidad), scoring, auditoría |
| Negociación de contratos | Gestión de acuerdos comerciales | Propuesta → Negociación → Contrato → Seguimiento | Términos, condiciones, cláusulas de desempeño, renovación |
| Monitoreo de entregas | Seguimiento de cumplimiento | OC → Producción → Embarque → Recepción → Evaluación | OTIF, lead time, calidad, incidencias |
| Scorecard de proveedor | Evaluación periódica de desempeño | KPIs → Ponderación → Cálculo → Reporte → Retroalimentación | Calidad (PPM), entrega (OTIF), precio, servicio |

### 4. Logística
| Submódulo | Descripción | Flujo de trabajo | Requisitos clave |
|-----------|-------------|------------------|------------------|
| Gestión de transporte | Coordinación de movimientos | Pedido → Selección de modo → Ruta → Ejecución → Seguimiento | Multimodal (terrestre, marítimo, aéreo), consolidación |
| Freight management | Gestión de fletes | Cotización → Selección → Documentación → Pago → Auditoría | Tarifas por ruta, contratos de flete, facturación electrónica |
| Aduana e importaciones | Gestión de comercio exterior | Documentación → Clasificación arancelaria → Declaración → Desaduanaje | HS codes, INCOTERMS, régimen aduanero, broker |
| Reverse logistics | Gestión de devoluciones y retornos | Solicitud → Autorización → Recolección → Clasificación → Disposición | RMA, refurbish, recycle, disposición final |
