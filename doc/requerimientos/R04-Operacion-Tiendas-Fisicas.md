# R04 — Operación en Tiendas Físicas (Sucursales)

## 1. Descripción General
Las tiendas propias (sucursales) atienden público directo y tienen su propio movimiento de ventas, caja y abastecimiento. Operan de forma semi-independiente pero integradas al sistema central.

---

## 2. Componentes de la Operación en Tienda

| Área | Descripción |
|------|-------------|
| Venta rápida | Registro instantáneo de ventas al público |
| Caja | Control de dinero: apertura, cobros, cierres |
| Stock | Inventario físico en estantes con control de entradas y salidas |
| Abastecimiento | Recepción de mercadería enviada desde almacén central |

---

## 3. Módulo de Ventas

### 3.1 Flujo de Venta en Tienda
```
Cliente llega a tienda →
  Atendedor registra productos (por código / báscula / selección) →
  Sistema muestra precio y total →
  Cliente paga (efectivo / tarjeta / mixto) →
  Sistema registra el pago y genera comprobante →
  Stock: ALM-TD descuenta producto(-bolsas) →
  Entrega mercadería al cliente
```

### 3.2 Datos de Venta
```
Venta {
  id: GUID
  tienda_id: GUID
  caja_id: GUID (sesión de caja activa)
  fecha: datetime
  cliente_identificado: bool (opcional: cliente registrado)
  subtotal: decimal
  descuento: decimal
  total: decimal
  metodo_pago: enum (efectivo, tarjeta, transferencia, mixto)
  estado: enum (activa, anulada)
}
```

```
DetalleVenta {
  id: GUID
  venta_id: GUID
  presentacion_id: GUID
  cantidad: int
  precio_unitario: decimal
  subtotal: decimal
}
```

```
PagoVenta {
  id: GUID
  venta_id: GUID
  metodo: enum (efectivo, tarjeta_debito, tarjeta_credito, transferencia, yape, plin)
  monto: decimal
  referencia: string? (últimos dígitos tarjeta, voucher, etc.)
}
```

---

## 4. Módulo de Caja

### 4.1 Apertura de Caja
Cada tienda maneja cajas independientes. Día a día se apertura una sesión.

```
Inicio del día →
  Cajero apertura caja →
  Registra monto inicial (fondo fijo / base) →
  Sesión de caja se activa →
  Solo ventas registradas en esta caja se asocian
```

### 4.2 Cierre de Caja
```
Fin del día (o turno) →
  Cajero solicita cierre →
  Sistema calcula:
    - Total ventas (efectivo, tarjeta, transferencia)
    - Total ingresos por método de pago
    - Debe haber = fondo_inicial + ventas_efectivo
  Cajero cuenta físico y registra montos reales →
  Sistema compara:
    - Debe haber = haber real → CIERRE_OK
    - Diferencia > 0 → SOBRANTE
    - Diferencia < 0 → FALTANTE
  Si hay diferencia → registrar observación
  Cerrar sesión de caja
  Generar reporte de cierre
```

### 4.3 Datos de Caja
```
Caja {
  id: GUID
  tienda_id: GUID
  codigo: string (CAJA-TD-001-A, CAJA-TD-001-B, ...)
  nombre: string (Caja 1 - Principal, Caja 2 - Auxiliar)
  activo: bool
}
```

```
SesionCaja {
  id: GUID
  caja_id: GUID
  fecha_apertura: datetime
  fecha_cierre: datetime?
  fondo_inicial: decimal
  total_ventas_efectivo: decimal
  total_ventas_tarjeta: decimal
  total_ventas_transferencia: decimal
  total_ventas_otros: decimal
  debe_haber: decimal (fondo_inicial + total_ventas_efectivo)
  haber_real: decimal? (ingresado al cerrar)
  diferencia: decimal?
  estado: enum (abierta, cerrada, con_diferencia)
  cajero_id: GUID
  observaciones_cierre: string?
}
```

### 4.4 Reglas de Caja
| # | Regla |
|---|-------|
| RN01 | Una caja solo puede tener una sesión abierta a la vez |
| RN02 | No se puede registrar una venta sin una sesión de caja activa |
| RN03 | No se puede cerrar caja si hay ventas sin completar pago |
| RN04 | Una diferencia de caja requiere justificación obligatoria |
| RN05 | Las diferencias se registran para seguimiento (no se ajustan automáticamente) |
| RN06 | Solo el supervisor de tienda puede autorizar un cierre con diferencia significativa (> umbral configurable) |

---

## 5. Módulo de Abastecimiento Interno

### 5.1 Descripción
Las tiendas reciben mercadería desde el almacén central (o planta) para reponer su stock y mantener sus estantes abastecidos.

### 5.2 Flujo de Abastecimiento
```
ALM-PT detecta stock bajo en tienda (o tienda solicita) →
  Jefe de tienda genera solicitud de abastecimiento →
  Supervisor de logística aprueba →
  ALM-PT prepara pedido para tienda →
  Documento: Guía de Remisión (traslado interno) →
  Camión de abastecimiento traslada mercadería →
  Tienda recibe y verifica contra guía →
  Si conforme: firma recepción
  Si diferencia: registrar incidencia (faltante/sobrante/dañado)
  Stock: ALM-PT → ALM-TD (transferencia)
```

### 5.3 Datos de Abastecimiento
```
SolicitudAbastecimiento {
  id: GUID
  tienda_id: GUID
  fecha_solicitud: datetime
  solicitante_id: GUID
  estado: enum (pendiente, aprobada, en_preparacion, en_transito, recibida, rechazada)
  prioridad: enum (normal, urgente)
  observaciones: string
}
```

```
DetalleSolicitudAbastecimiento {
  id: GUID
  solicitud_id: GUID
  presentacion_id: GUID
  cantidad_solicitada: int
  cantidad_enviada: int? (puede diferir de lo solicitado)
  cantidad_recibida: int? (lo que efectivamente llegó)
}
```

### 5.4 Recepción en Tienda
```
Llega mercadería →
  Jefe de tienda (o encargado) recibe →
  Verifica físicamente: contar bolsas, revisar estado →
  Coteja contra guía de remisión →
  Si todo OK:
    - Confirma recepción en sistema
    - ALM-TD incrementa stock
  Si hay diferencia:
    - Registra incidencia: faltante / sobrante / dañado
    - Confirma recepción parcial
    - Diferencia queda pendiente de resolución
```

### 5.5 Reglas de Abastecimiento
| # | Regla |
|---|-------|
| RN07 | Una tienda no puede recibir stock sin una solicitud aprobada |
| RN08 | La cantidad recibida no puede exceder la cantidad solicitada en +10% |
| RN09 | Los productos dañados en tránsito se registran como merma de transporte |
| RN10 | El stock de tienda tiene su propia numeración de lote (independiente del central) |
| RN11 | Las devoluciones de tienda a almacén siguen el proceso inverso |

---

## 6. Inventario en Tienda

### 6.1 Control de Stock
- Cada tienda tiene su propio inventario independiente en el sistema
- Las ventas descuentan stock automáticamente
- Los abastecimientos incrementan stock
- Se pueden realizar inventarios físicos (conteos) con ajustes

### 6.2 Inventario Físico (Conteo)
```
Programación de inventario →
  Tienda congela operaciones (o selecciona horario) →
  Personal cuenta productos físicos →
  Registra conteo en sistema →
  Sistema compara: stock_sistema vs stock_físico →
  Diferencia → Ajuste con justificación →
  Reporte de ajuste para administración
```

---

## 7. Reportes Requeridos

| Reporte | Descripción | Frecuencia |
|---------|-------------|------------|
| Corte de caja diario | Resumen de ventas y cierre por caja | Diario (cierre) |
| Ventas por turno/cajero | Desempeño individual | Diario |
| Productos más vendidos | Top ventas en tienda | Semanal |
| Stock actual en tienda | Inventario disponible para venta | Tiempo real |
| Solicitudes de abastecimiento | Pendientes, aprobadas, en tránsito | Diario |
| Diferencias de inventario | Ajustes por conteo físico | Por conteo |
| Incidencias de caja | Sobrantes / faltantes por cajero | Diario |
| Rentabilidad por tienda | Margen de ventas vs abastecimiento | Mensual |

---

## 8. Validaciones y Restricciones

| # | Restricción |
|---|-------------|
| V01 | No se puede vender un producto con stock 0 en tienda |
| V02 | No se puede cerrar caja con ventas en estado "activa" sin pago completo |
| V03 | El fondo inicial de caja debe ser positivo y dentro del rango configurado |
| V04 | Una solicitud de abastecimiento no puede superar el stock disponible en ALM-PT |
| V05 | La recepción debe completarse dentro de las 24h de llegada a tienda |
| V06 | Solo el jefe de tienda puede autorizar ajustes de inventario |

---

## 9. Actores Involucrados

| Actor | Rol | Acciones |
|-------|-----|---------|
| Cajero / Atendedor | Atiende ventas, maneja caja | Registrar ventas, apertura/cierre de caja |
| Jefe de tienda | Supervisa operación de sucursal | Solicitar abastecimiento, autorizar ajustes, supervisar cierres |
| Repartidor de abastecimiento | Traslada mercadería a tiendas | Entregar, obtener firma de recepción |
| Supervisor de logística | Coordina abastecimiento a tiendas | Aprobar solicitudes, planificar rutas de abastecimiento |
| Administrador central | Supervisa todas las tiendas | Reportes, análisis, control de diferencias |
