# R01 — Control de Inventario y Espacios Físicos

## 1. Descripción General
La empresa opera con mercadería distribuida en múltiples ubicaciones geográficas y funcionales simultáneamente. Se necesita visibilidad en tiempo real del stock en cada punto para tomar decisiones de abastecimiento, venta y distribución.

---

## 2. Tipos de Almacenes / Espacios Físicos

| ID | Espacio | Descripción | Función |
|----|---------|-------------|---------|
| ALM-PL | Planta de producción | Almacén de materia prima (sacos de menestras a granel) | Recepción de compras, almacenamiento de sacos, punto de partida del fraccionamiento |
| ALM-PT | Almacén de producto terminado | Productos ya fraccionados y embolsados listos para despacho | Almacenamiento de bolsas de 3, 5, 10, 20, 30 kg/unidades |
| ALM-CAM | Camión en ruta | Stock cargado en camiones durante el reparto | Inventario móvil, venta a bordo, rendición al regreso |
| ALM-TD | Tienda / Sucursal | Punto de venta físico al público | Venta directa, stock en estantes, abastecimiento interno |

---

## 3. Reglas de Negocio

### RN01 — Separación de inventarios
Cada espacio físico mantiene su propio conteo de stock independiente. Los movimientos entre espacios requieren un documento de transferencia.

### RN02 — Unidad de medida por espacio
- **Planta**: se mide en **sacos** (kg brutos)
- **Almacén PT**: se mide en **bolsas** (unidades de 3/5/10/20/30 kg)
- **Camión**: se mide en **bolsas** (unidades)
- **Tienda**: se mide en **bolsas** (unidades)

### RN03 — Stock mínimo por espacio
Cada espacio puede configurar un stock mínimo de alerta. Por debajo de ese nivel se dispara una notificación de reabastecimiento.

### RN04 — Trazabilidad de lote
Cada saco que ingresa a planta se registra con:
- Número de lote
- Proveedor
- Fecha de ingreso
- Peso bruto
- Peso tara (saco vacío)

### RN05 — Congelamiento de stock
El stock comprometido en pedidos (preventa) se descuenta del disponible en **Almacén PT** al momento de confirmar el pedido (Día 1). No se puede asignar el mismo producto a dos pedidos diferentes.

---

## 4. Entidades de Datos

### Almacén
```
Almacen {
  id: GUID
  codigo: string (ALM-PL, ALM-PT, ALM-CAM-01, ALM-TD-001, ...)
  nombre: string
  tipo: enum (planta, producto_terminado, camion, tienda)
  ubicacion: string (dirección / distrito)
  activo: bool
  capacidad_maxima_kg: decimal?
  stock_minimo_global: decimal?
}
```

### Inventario por Almacén
```
Inventario {
  id: GUID
  almacen_id: GUID
  producto_id: GUID (menestra + presentación)
  lote_id: GUID?
  cantidad_actual: decimal
  cantidad_comprometida: decimal (pedidos confirmados no despachados)
  cantidad_disponible: decimal (actual - comprometida)
  unidad_medida: string (kg, saco, bolsa_3kg, bolsa_5kg, ...)
  ultima_actualizacion: datetime
}
```

### Movimiento entre Almacenes
```
MovimientoInventario {
  id: GUID
  tipo: enum (compra, fraccionamiento, transferencia, despacho, venta_tienda, devolucion, merma)
  origen_almacen_id: GUID
  destino_almacen_id: GUID?
  producto_id: GUID
  lote_id: GUID?
  cantidad: decimal
  unidad_medida: string
  documento_referencia: string (OC, pedido, ticket, etc.)
  fecha: datetime
  usuario_id: GUID
  observaciones: string
}
```

---

## 5. Flujos de Trabajo

### 5.1 Compra → Planta
```
Proveedor entrega sacos → Recepción en Planta →
  Registrar lote + peso bruto →
  Actualizar stock ALM-PL (+sacos/kg)
```

### 5.2 Fraccionamiento → Almacén PT
```
Sacos de Planta → Fraccionamiento (R02) →
  Sacos salen de ALM-PL (-kg) →
  Bolsas ingresan a ALM-PT (+unidades) →
  Registrar merma
```

### 5.3 Transferencia a Tienda
```
Solicitud de tienda → Autorización →
  ALM-PT descuenta stock (-bolsas) →
  ALM-TD recibe stock (+bolsas) →
  Documento: Guía de remisión interna
```

### 5.4 Carga a Camión
```
Pedidos consolidados (Día 2) →
  ALM-PT descuenta stock (-bolsas) →
  ALM-CAM incrementa stock (+bolsas) →
  Documento: Guía de remisión por ruta
```

### 5.5 Rendición de Camión
```
Camión regresa (Día 3) →
  Registrar entregas (ALM-CAM -bolsas) →
  Registrar sobrantes → Devolver a ALM-PT →
  Cerrar ruta del camión
```

### 5.6 Venta en Tienda
```
Venta al público →
  ALM-TD descuenta stock (-bolsas) →
  Registrar ingreso en caja
```

---

## 6. Reportes Requeridos

| Reporte | Descripción | Frecuencia |
|---------|-------------|------------|
| Stock consolidado | Cantidad total por producto en todos los espacios | Tiempo real |
| Stock por ubicación | Desglose de inventario por cada almacén/tienda/camión | Tiempo real |
| Alertas de stock mínimo | Productos por debajo del umbral configurado | Diario / Tiempo real |
| Transferencias pendientes | Movimientos entre almacenes no completados | Diario |
| Historial de movimientos | Trazabilidad completa de un lote/producto | Bajo demanda |
| Valor de inventario | Costo total del stock por ubicación | Semanal |

---

## 7. Validaciones y Restricciones

| # | Restricción |
|---|-------------|
| V01 | No se puede despachar un producto si `cantidad_disponible < cantidad_solicitada` |
| V02 | No se puede transferir más stock del `cantidad_actual` del origen |
| V03 | Un movimiento entre almacenes debe tener origen y destino distintos |
| V04 | El stock en camión se reinicia a cero al cerrar la ruta |
| V05 | Las tiendas solo pueden recibir transferencias del almacén PT autorizado |
| V06 | Todo movimiento debe tener un documento de referencia |

---

## 8. Actores Involucrados

| Actor | Rol | Acciones |
|-------|-----|---------|
| Administrador de almacén | Gestiona el inventario en planta y PT | Recepción, fraccionamiento, transferencias |
| Jefe de tienda | Gestiona stock de sucursal | Solicitar abastecimiento, controlar inventario |
| Conductor / Repartidor | Porta inventario en camión | Cargar, entregar, rendir |
| Supervisor de logística | Supervisa inventario general | Reportes, alertas, ajustes |
| Vendedor | Toma pedidos | Consulta disponibilidad (stock comprometido) |
