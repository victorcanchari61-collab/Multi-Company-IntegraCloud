# R03 — Ciclo de Pedidos y Despacho (Flujo de 48 Horas)

## 1. Descripción General
La distribución sigue un ciclo de 3 días (48 horas hábiles) que comienza con la preventa y termina con la rendición del reparto. Cada día tiene actividades específicas y roles definidos.

---

## 2. Línea de Tiempo del Ciclo

| Día | Nombre | Actividad Principal | Quién |
|-----|--------|-------------------|-------|
| **Día 1** — Martes | **Preventa** | Vendedores toman pedidos en ruta | Vendedores |
| **Día 2** — Miércoles | **Pesaje y Carga** | Consolidar pedidos, pesar bolsas, cargar camiones | Pescador / Almacén |
| **Día 3** — Jueves | **Reparto** | Entregar mercadería, cobrar, rendir cuentas | Repartidores |

---

## 3. Día 1 — Preventa (Martes)

### 3.1 Descripción
Los vendedores recorren rutas y distritos específicos visitando clientes (mercados, bodegas, tiendas) y tomando pedidos.

### 3.2 Flujo de Preventa
```
Vendedor inicia ruta asignada →
  Visita cliente →
  Consulta catálogo de productos + precios →
  Cliente solicita productos + cantidades →
  Vendedor registra pedido en sistema (móvil) →
  Sistema valida: stock disponible en ALM-PT →
  Pedido queda en estado "PREVENTA" →
  Vendedor continúa a siguiente cliente →
  Fin de ruta → Cierra su preventa del día
```

### 3.3 Datos del Pedido (Preventa)
```
Pedido {
  id: GUID
  codigo: string (P-2024-MMDD-NNNN)
  fecha: datetime
  vendedor_id: GUID
  ruta_id: GUID
  cliente_id: GUID
  estado: enum (preventa, en_pesaje, en_carga, en_reparto, entregado, anulado)
  total_productos: int (cantidad de líneas)
  total_bolsas: int (suma de cantidades)
  total_kg: decimal
  total_precio: decimal
  notas: string
}
```

```
DetallePedido {
  id: GUID
  pedido_id: GUID
  presentacion_id: GUID (producto + formato)
  cantidad: int (número de bolsas)
  precio_unitario: decimal
  subtotal: decimal
}
```

### 3.4 Reglas de Preventa
| # | Regla |
|---|-------|
| RN01 | Cada vendedor tiene una ruta/distrito asignado |
| RN02 | El vendedor consulta disponibilidad antes de confirmar |
| RN03 | El pedido descuenta **stock comprometido** del ALM-PT al confirmarse |
| RN04 | Si no hay stock suficiente, se notifica al vendedor y al supervisor |

---

## 4. Día 2 — Pesaje y Carga (Miércoles)

### 4.1 Descripción
Se consolidan todos los pedidos del Día 1, se pesa y embolsa la mercadería necesaria, se atienden aumentos de última hora, y se cargan los camiones.

### 4.2 Subflujo: Consolidación de Pedidos
```
Al inicio del día →
  Sistema consolida todos los pedidos en estado "PREVENTA" →
  Genera:
    - Resumen por producto: total de bolsas por presentación
    - Resumen por ruta: total de mercadería por camión
    - Total de sacos requeridos para fraccionamiento (si aplica)
  Estado de pedidos → "EN_PESAJE"
```

### 4.3 Subflujo: Pesaje y Armado
```
Según resumen consolidado →
  Almacén solicita fraccionamiento de sacos (R02) si es necesario →
  Pesador arma las bolsas por pedido (o por ruta) →
  Registra peso real de cada bolsa →
  Etiqueta mercadería (opcional: pedido / ruta / cliente) →
  Stock: ALM-PT comprometido → bloqueado para despacho
```

### 4.4 Subflujo: Aumentos de Última Hora
Los clientes llaman durante el Día 2 para solicitar más mercadería.

```
Cliente llama a vendedor o a central →
  Solicita aumento al pedido existente →
  Se registra en sistema como "AUMENTO" →
  Genera alerta/alarma al área de pesaje →
  Se imprime reporte de aumentos del día →
  Pesador agrega productos extra al lote del camión →
  Pedido original se actualiza (nuevas líneas) →
  Estado: "PREVENTA" + "AUMENTO"
```

### 4.5 Reporte de Aumentos (crítico)
```
ReporteAumentos {
  fecha: datetime
  items: [
    {
      pedido: "P-2024-0320-0015",
      cliente: "Bodega Los Andes",
      ruta: "R-005 - Mercado Central",
      producto_adicional: "Frejol canario x 5kg - 3 bolsas",
      hora_solicitud: "10:32 AM",
      atendido: bool (sí/no)
    },
    ...
  ]
}
```

### 4.6 Subflujo: Carga de Camiones
```
Mercadería armada por ruta → Área de carga →
  Verificar contra guía de remisión →
  Cargar camión en orden de ruta (último cliente primero) →
  Guía de Remisión Remitente (GRR) por ruta →
  Stock: ALM-PT → ALM-CAM (transferencia) →
  Camión sellado / firmado →
  Estado pedidos: "EN_CARGA" → "EN_REPARTO"
```

### 4.7 Reglas de Pesaje y Carga
| # | Regla |
|---|-------|
| RN05 | Los aumentos se atienden siempre que haya stock disponible |
| RN06 | El reporte de aumentos debe imprimirse/consultarse antes de cerrar la carga |
| RN07 | No puede salir un camión sin Guía de Remisión firmada |
| RN08 | El orden de carga debe facilitar la ruta de descarga |
| RN09 | La carga debe cerrarse a una hora límite configurable (ej. 8 PM) |

---

## 5. Día 3 — Reparto (Jueves)

### 5.1 Descripción
El camión sale a distribuir la mercadería a los distritos y mercados. Al regresar, el repartidor rinde cuentas de lo entregado y el dinero cobrado.

### 5.2 Flujo de Reparto
```
Camión sale de almacén →
  Recorre ruta: clientes en orden establecido →
  Por cada cliente:
    - Llega al punto de entrega
    - Entrega mercadería (cantidad exacta del pedido)
    - Cliente firma recepción (físico o digital)
    - Si aplica: cobra al contado
    - Registra: entregado / pendiente / rechazado
  Si hay mercadería no entregada:
    - Registrar motivo (cliente ausente, rechazo, etc.)
  Fin de ruta →
  Camión regresa al almacén →
  Rendición de cuentas
```

### 5.3 Subflujo: Rendición de Cuentas
```
Repartidor entrega:
  1. Dinero efectivo recibido
  2. Comprobantes de pago (tarjeta, transferencia)
  3. Mercadería sobrante (no entregada)
  4. Guías firmadas / evidencia de entrega

Sistema:
  - Registra entregas por pedido (estado: ENTREGADO)
  - Registra pagos y formas de cobro
  - Registra devoluciones / sobrantes
  - Stock: ALM-CAM → ALM-PT (devolución de sobrantes)
  - Cierra ruta del camión
```

### 5.4 Estados de Pedido por Cliente
| Estado | Descripción |
|--------|-------------|
| ENTREGADO | Mercadería recibida conforme |
| ENTREGADO_PARCIAL | Solo parte del pedido fue entregada |
| NO_ENTREGADO | Cliente no disponible / rechazó |
| PENDIENTE | Reprogramar para siguiente ciclo |

### 5.5 Reglas de Reparto
| # | Regla |
|---|-------|
| RN10 | Todo pedido entregado debe tener firma o evidencia |
| RN11 | El dinero cobrado debe coincidir con los pedidos marcados como pagados |
| RN12 | Los sobrantes deben devolverse físicamente al almacén PT |
| RN13 | La rendición debe completarse el mismo Día 3 |
| RN14 | Si hay diferencias (sobrante/faltante de dinero o mercadería), se registra incidencia |

---

## 6. Reportes Requeridos del Ciclo

| Reporte | Momento | Contenido |
|---------|---------|-----------|
| Consolidado de preventa | Día 2 (mañana) | Total de pedidos, productos, kg, rutas |
| Orden de pesaje | Día 2 | Por producto: cuántas bolsas de cada presentación armar |
| Reporte de aumentos | Día 2 (tiempo real) | Aumentos solicitados vs atendidos |
| Guía de remisión por ruta | Día 2 (carga) | Productos, cantidades, cliente, valor |
| Hoja de ruta del repartidor | Día 3 | Orden de visitas, direcciones, teléfonos |
| Rendición por ruta | Día 3 (cierre) | Entregado vs cargado, cobrado, devuelto |
| Incidencias de reparto | Día 3 | No entregados, rechazos, diferencias |

---

## 7. Validaciones y Restricciones

| # | Restricción |
|---|-------------|
| V01 | No se puede procesar un pedido sin cliente y vendedor asignados |
| V02 | El stock comprometido no puede ser mayor al stock disponible |
| V03 | Un aumento no puede aplicarse si el camión ya salió a ruta |
| V04 | La carga no puede cerrarse si hay aumentos pendientes por atender |
| V05 | Cada pedido solo puede tener una ruta de reparto asignada |
| V06 | La rendición debe cuadrar: Cargado = Entregado + Devuelto + Merma_transporte |
| V07 | Si hay diferencias en rendición, se requiere autorización del supervisor |

---

## 8. Actores Involucrados

| Actor | Rol | Día |
|-------|-----|-----|
| Vendedor | Preventa, toma pedidos en campo | Día 1 |
| Cliente | Compra mercadería | Día 1 y Día 3 |
| Pesador | Arma bolsas según pedidos | Día 2 |
| Supervisor de almacén | Apriba aumentos, supervisa carga | Día 2 |
| Conductor / Repartidor | Entrega mercadería y rinde cuentas | Día 3 |
| Administrador de logística | Coordina todo el ciclo | Día 1-3 |
