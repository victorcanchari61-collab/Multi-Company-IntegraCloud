# ERP — Enterprise Resource Planning

## Descripción General
Sistema que integra todos los procesos core del negocio en una sola plataforma unificada, eliminando silos de información y proporcionando una vista única de la empresa.

## Módulos y Submódulos

### 1. Finanzas
| Submódulo | Descripción | Flujo de trabajo | Requisitos clave |
|-----------|-------------|------------------|------------------|
| Contabilidad general | Registro de transacciones contables, libro diario, mayor general | Captura de asientos → Aprobación → Contabilización → Generación de balances | Soporte multi-moneda, plan de cuentas flexible, períodos contables |
| Cuentas por pagar | Gestión de facturas de proveedores y programación de pagos | Recepción de factura → Validación → Aprobación → Programación de pago → Desembolso | Conciliación automática, descuento por pronto pago, retenciones |
| Cuentas por cobrar | Gestión de facturas a clientes y cobranzas | Emisión de factura → Seguimiento → Cobranza → Conciliación bancaria | Antigüedad de saldos, cobranza preventiva, acuerdos de pago |
| Activos fijos | Control de activos tangibles e intangibles | Alta de activo → Depreciación → Revaluación → Baja | Métodos de depreciación múltiples, cálculo automático |
| Gestión de presupuesto | Planificación y control presupuestario | Elaboración → Aprobación → Ejecución → Seguimiento → Desviaciones | Presupuesto por centro de costo, versiones, alertas de desviación |
| Cierre financiero | Proceso de cierre contable periódico | Pre-cierre → Ajustes → Cierre de períodos → Apertura de nuevo período | Automatización de asientos de cierre, checklist de cierre |
| Consolidación | Consolidación de estados financieros multi-empresa | Eliminación de saldos intercompañía → Ajustes → Consolidación → Reportes | Reglas de consolidación, tipos de cambio, eliminaciones automáticas |
| Informes NIIF | Generación de reportes bajo Normas Internacionales | Extracción de datos → Ajustes NIIF → Generación de estados financieros | Cumplimiento NIIF, notas a los estados financieros |

### 2. Compras
| Submódulo | Descripción | Flujo de trabajo | Requisitos clave |
|-----------|-------------|------------------|------------------|
| Solicitudes de compra | Requisición interna de materiales/servicios | Creación → Aprobación → Asignación a comprador → Seguimiento | Flujo de aprobación configurable, presupuesto disponible |
| Órdenes de compra | Generación de órdenes a proveedores | Solicitud → Cotización → Selección → OC → Confirmación | Órdenes abiertas/cerradas, envío automático al proveedor |
| Gestión de proveedores | Administración del maestro de proveedores | Registro → Evaluación → Categorización → Mantenimiento | Datos fiscales, condiciones de pago, historial de compras |
| Catálogo de materiales | Gestión de productos y servicios comprables | Creación → Clasificación → Precios → Actualización | Códigos de barras, categorías, unidades de medida |
| Contratos de compra | Acuerdos marco con proveedores | Negociación → Redacción → Aprobación → Seguimiento | Cláusulas automáticas, renovaciones, condiciones especiales |
| Evaluación de proveedores | Desempeño de proveedores | Recolección de datos → KPIs → Scorecard → Plan de mejora | Calidad, cumplimiento, precio, entregas a tiempo |

### 3. Ventas
| Submódulo | Descripción | Flujo de trabajo | Requisitos clave |
|-----------|-------------|------------------|------------------|
| Cotizaciones | Generación de cotizaciones a clientes | Solicitud → Configuración → Cálculo → Cotización → Seguimiento | Precios por volumen, vigencia, conversión a pedido |
| Órdenes de venta | Gestión de pedidos de clientes | Cotización → Pedido → Validación de crédito → Confirmación | Bloqueo por crédito, disponibilidad de inventario |
| Gestión de precios | Administración de listas de precios | Definición → Segmentación → Actualización → Promociones | Listas múltiples, precios por cliente, temporadas |
| Descuentos y promociones | Configuración de descuentos | Reglas → Aprobación → Aplicación → Control | Descuentos por volumen, pronto pago, promociones combinadas |
| Facturación | Emisión de facturas y documentos tributarios | Pedido → Despacho → Factura → Envío → CXC | Factura electrónica, notas de crédito/débito, retenciones |
| Devoluciones | Gestión de devoluciones de clientes | Solicitud → Autorización → Recepción → Nota de crédito → Re-stock | Motivos de devolución, política de cambios, estado del producto |

### 4. Producción
| Submódulo | Descripción | Flujo de trabajo | Requisitos clave |
|-----------|-------------|------------------|------------------|
| Planificación de producción | Plan maestro de producción | Demanda → Plan agregado → MPS → Liberación de órdenes | Horizonte de planificación, capacidad finita/infinita |
| Órdenes de fabricación | Ejecución de órdenes de producción | MPS → OF → Liberación → Ejecución → Cierre | Materiales, mano de obra, tiempos de proceso |
| Listas de materiales (BOM) | Estructura de fabricación de productos | Diseño → BOM → Actualización → Versiones | BOM multinivel, sustituciones, productos co-productos |
| Rutas de producción | Secuencia de operaciones de fabricación | Secuencia → Centro de trabajo → Tiempos → Costos | Operaciones paralelas, tiempos de preparación/ejecución |
| Control de piso | Monitoreo en tiempo real | Reporte de producción → Consumo → Scrap → Avance | Terminales de piso, integración con maquinaria, SCADA |
| Capacidad de planta | Gestión de capacidad productiva | Carga de trabajo → Cuello de botella → Nivelación → Optimización | OEE, calendarización por centro de trabajo |

### 5. Proyectos
| Submódulo | Descripción | Flujo de trabajo | Requisitos clave |
|-----------|-------------|------------------|------------------|
| Planificación de proyectos | Estructuración de proyectos | Alcance → EDT → Cronograma → Recursos → Presupuesto | WBS, dependencias, ruta crítica |
| Costeo de proyectos | Seguimiento de costos | Presupuesto → Costos reales → Desviaciones → Proyección | Costos directos e indirectos, horas por recurso |
| Recursos del proyecto | Asignación de recursos humanos/materiales | Disponibilidad → Asignación → Carga → Optimización | Habilidad del recurso, disponibilidad, costo |
| Hitos y entregables | Seguimiento de hitos del proyecto | Definición → Fechas → % Avance → Aceptación | Alertas de vencimiento, approval gates |
| Facturación por proyecto | Facturación basada en avance | Hitos → % Completado → Factura → Reconocimiento de ingreso | Facturación por avance, anticipos, retenciones |
