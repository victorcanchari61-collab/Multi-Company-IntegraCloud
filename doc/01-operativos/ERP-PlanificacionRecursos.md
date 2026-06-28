# ERP — Enterprise Resource Planning

## Descripción General
Sistema que integra todos los procesos core del negocio en una sola plataforma unificada, eliminando silos de información y proporcionando una vista única de la empresa.

## Módulos y Submódulos

### 1. Ventas
| Submódulo | Descripción |
|-----------|-------------|
| Cotizaciones | Generación y seguimiento de cotizaciones a clientes con conversión a pedido |
| Órdenes de venta | Gestión de pedidos de clientes, validación de crédito y disponibilidad |
| Clientes | Ficha de cliente, historial de compras, crédito asignado, contactos y segmentación |
| Listas de precios | Administración de listas múltiples, precios por cliente y temporadas |
| Condiciones comerciales | Términos de pago, descuentos y condiciones especiales por cliente |
| Comisiones de vendedores | Cálculo y seguimiento de comisiones por venta |

### 2. Compras
| Submódulo | Descripción |
|-----------|-------------|
| Órdenes de compra | Generación y confirmación de órdenes a proveedores |
| Proveedores | Ficha de proveedor, RUC/datos fiscales, condiciones de pago e historial |
| Solicitudes de compra | Requisición interna con flujo de aprobación configurable |
| Evaluación de proveedores | KPIs de calidad, cumplimiento, precio y entregas a tiempo |
| Contratos de compra | Acuerdos marco con cláusulas automáticas, renovaciones y condiciones especiales |

### 3. Inventario
> Valor contable del inventario.

| Submódulo | Descripción |
|-----------|-------------|
| Valorización de stock | Cálculo del valor del inventario según método contable |
| Costo promedio / PEPS | Valoración por costo promedio ponderado o PEPS |
| Ajustes de inventario | Correcciones contables por diferencias de inventario |
| Kárdex contable | Registro detallado de entradas, salidas y saldos valorizados |
| Niveles de reposición | Puntos de reorden y cantidades óptimas de pedido |

### 4. Catálogo de productos
> Dueño: ERP — Datos maestros compartidos con WMS y POS.

| Submódulo | Descripción |
|-----------|-------------|
| Ficha maestra del producto | Datos base del producto (nombre, descripción, marca, etc.) |
| Unidades de medida | UM de compra, venta y conversiones entre ellas |
| Categorías y familias | Clasificación jerárquica de productos |
| Precio de venta | Precios base, sugeridos y configuración de listas |
| Costo estándar | Costo teórico para valoración y márgenes |
| Código de barras / SKU | Códigos GTIN, EAN, UPC y SKU interno |

### 5. Facturación
| Submódulo | Descripción |
|-----------|-------------|
| Emisión de facturas | Generación de facturas, boletas y otros comprobantes |
| Notas de crédito / débito | Ajustes a documentos emitidos |
| Cuentas por cobrar | Antigüedad de saldos, cobranza preventiva y acuerdos de pago |
| Seguimiento de pagos | Registro y conciliación de cobros |
| Factura electrónica | Envío a SUNAT / entidad tributaria y obtención de CDR |

### 6. Contabilidad
| Submódulo | Descripción |
|-----------|-------------|
| Plan de cuentas | Catálogo contable flexible por empresa |
| Asientos contables | Registro de transacciones con partida doble |
| Libro mayor | Registro histórico de movimientos por cuenta |
| Balance general | Estado de situación financiera |
| Estado de resultados | Reporte de pérdidas y ganancias |
| Cierre contable | Proceso de cierre periódico con ajustes y apertura |

### 7. Finanzas
| Submódulo | Descripción |
|-----------|-------------|
| Tesorería | Gestión de efectivo y equivalentes |
| Flujo de caja | Proyección y seguimiento de ingresos y egresos |
| Cuentas por pagar | Facturas de proveedores y programación de pagos |
| Conciliación bancaria | Cotejo de movimientos bancarios vs. registros contables |
| Presupuestos | Planificación y control presupuestario por centro de costo |

### 8. Clientes (CRM)
> Dueño: ERP.

| Submódulo | Descripción |
|-----------|-------------|
| Ficha de cliente | Datos generales, contacto y clasificación |
| Historial de compras | Registro completo de transacciones del cliente |
| Crédito asignado | Línea de crédito, saldo disponible y bloqueos |
| Contactos | Personas de contacto por cliente y roles |
| Segmentación | Agrupación de clientes por criterios comerciales |

### 9. Proveedores
> Dueño: ERP.

| Submódulo | Descripción |
|-----------|-------------|
| Ficha de proveedor | Datos generales, contacto y clasificación |
| RUC / datos fiscales | Información tributaria del proveedor |
| Condiciones de pago | Términos negociados por proveedor |
| Historial de compras | Órdenes y facturas por proveedor |
| Líneas de crédito | Crédito otorgado por proveedor y saldo disponible |

### 10. Reportes y BI
| Submódulo | Descripción |
|-----------|-------------|
| Ventas por período | Reporte de ingresos por período, cliente y producto |
| Margen por producto | Análisis de rentabilidad por SKU |
| Rotación de inventario | Indicador de eficiencia en gestión de stock |
| Cuentas por cobrar aging | Antigüedad de saldos por cliente |
| KPIs financieros | Indicadores clave de salud financiera |
