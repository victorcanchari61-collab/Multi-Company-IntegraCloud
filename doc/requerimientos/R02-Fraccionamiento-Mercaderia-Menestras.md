# R02 — Fraccionamiento de Mercadería (Menestras)

## 1. Descripción General
El producto se compra en sacos grandes (materia prima a granel) y se vende en formatos pequeños. El proceso de fraccionamiento transforma los sacos en bolsas de presentaciones fijas, generando una merma controlada.

---

## 2. Formatos de Venta

| Código | Presentación | Descripción |
|--------|-------------|-------------|
| PRES-3 | Bolsa 3 kg | Paquete pequeño para consumo minorista |
| PRES-5 | Bolsa 5 kg | Paquete mediano |
| PRES-10 | Bolsa 10 kg | Paquete grande |
| PRES-20 | Bolsa 20 kg | Bolsa familiar / pequeño comercio |
| PRES-30 | Bolsa 30 kg | Presentación mayorista |
| SACO | Saco completo | Solo aplica en compras (materia prima) |

---

## 3. Reglas de Negocio

### RN01 — Peso de referencia por saco
Cada saco tiene un peso teórico (ej. 50 kg, 60 kg, 70 kg según proveedor). El peso real se registra al ingresar a planta (báscula).

### RN02 — Conversión con merma
Al fraccionar, la suma del peso de las bolsas obtenidas **siempre será menor** al peso del saco original. La diferencia es merma.

```
Peso_saco_bruto = Suma(pesos_bolsas) + Merma
```

### RN03 — Merma esperada vs real
- **Merma esperada**: porcentaje histórico configurable por tipo de menestra (ej. 1.5% para frejol, 2% para lenteja)
- **Merma real**: calculada automáticamente al registrar la producción:
  ```
  Merma_real = Peso_saco_real - Suma_total_bolsas_fraccionadas
  ```
- Si `Merma_real > Merma_esperada * 1.2` se genera una alerta de merma excesiva.

### RN04 — Lote de fraccionamiento
Cada proceso de fraccionamiento genera un **lote de producción** que asocia:
- Saco(s) de origen (número de lote)
- Bolsas producidas (cantidad por presentación)
- Merma registrada
- Operador responsable
- Fecha y hora

### RN05 — Producto base vs presentaciones
- **Producto base**: el tipo de menestra (frejol, lenteja, garbanzo, arveja, etc.)
- **Presentación**: la combinación de producto base + formato de bolsa

Ejemplo: `Frejol canario → Bolsa 3kg`, `Frejol canario → Bolsa 5kg`, etc.

---

## 4. Entidades de Datos

### Producto Base (tipo de menestra)
```
ProductoBase {
  id: GUID
  codigo: string (FRE-CAN, LEN-COR, GAR, ARV, ...)
  nombre: string (Frejol canario, Lenteja corriente, Garbanzo, ...)
  unidad_compra: string (saco)
  peso_saco_standar_kg: decimal
  merma_esperada_porcentaje: decimal
  activo: bool
}
```

### Presentación
```
Presentacion {
  id: GUID
  producto_base_id: GUID
  codigo: string (FRE-CAN-3, FRE-CAN-5, ...)
  nombre: string (Frejol canario x 3kg)
  formato_kg: decimal (3, 5, 10, 20, 30)
  activo: bool
}
```

### Lote de Fraccionamiento
```
LoteFraccionamiento {
  id: GUID
  codigo: string (LF-2024-0001)
  fecha: datetime
  operador_id: GUID
  producto_base_id: GUID
  peso_total_sacos_kg: decimal (suma de sacos procesados)
  peso_total_producido_kg: decimal (suma de bolsas)
  merma_real_kg: decimal
  merma_esperada_kg: decimal
  merma_porcentaje: decimal
  alerta_merma: bool
  observaciones: string
  estado: enum (en_proceso, completado, anulado)
}
```

### Detalle de Fraccionamiento (por presentación)
```
DetalleFraccionamiento {
  id: GUID
  lote_fraccionamiento_id: GUID
  presentacion_id: GUID
  cantidad_producida: int (número de bolsas)
  peso_unitario_kg: decimal
  peso_total_kg: decimal
}
```

### Saco Consumido en Fraccionamiento
```
SacoFraccionamiento {
  id: GUID
  lote_fraccionamiento_id: GUID
  lote_saco_id: GUID (referencia al lote de compra)
  peso_real_kg: decimal
}
```

---

## 5. Flujo de Trabajo

```
1. Seleccionar producto base y sacos a fraccionar
   ↓
2. Registrar peso real de cada saco en báscula
   ↓
3. Definir cuántas bolsas de cada presentación producir
   ↓
4. Ejecutar fraccionamiento (pesaje y embolsado)
   ↓
5. Registrar producción:
   - Cantidad de bolsas por presentación
   - Peso real de cada bolsa (control de calidad)
   ↓
6. Sistema calcula:
   - Peso total producido
   - Merma real (kg y %)
   - Comparación vs merma esperada
   ↓
7. Si merma excesiva → alerta al supervisor
   ↓
8. Cerrar lote de fraccionamiento
   ↓
9. Stock: ALM-PL (-sacos) → ALM-PT (+bolsas)
```

---

## 6. Escenarios de Fraccionamiento

### Escenario Normal
```
Saco de 50 kg de frejol canario
→ 10 bolsas de 3 kg  = 30 kg
→  3 bolsas de 5 kg  = 15 kg
→ Total producido    = 45 kg
→ Merma              = 5 kg (10%)
→ ¿Alerta?           = Depende del % esperado
```

### Escenario con Variedad
```
Saco de 60 kg de lenteja
→  5 bolsas de 3 kg  = 15 kg
→  3 bolsas de 5 kg  = 15 kg
→  2 bolsas de 10 kg = 20 kg
→ Total producido    = 50 kg
→ Merma              = 10 kg (16.7%)
```

### Escenario Exacto
```
Saco de 50 kg de garbanzo
→ 10 bolsas de 5 kg  = 50 kg
→ Merma              = 0 kg (ideal, poco realista)
```

---

## 7. Reportes Requeridos

| Reporte | Descripción | Frecuencia |
|---------|-------------|------------|
| Producción diaria | Bolsas producidas por producto y presentación | Diario |
| Merma por lote | % de merma real vs esperada por lote | Por lote |
| Merma acumulada | Tendencia de merma por producto (día/semana/mes) | Semanal |
| Eficiencia de fraccionamiento | Kg producidos / hora / operador | Semanal |
| Costo de fraccionamiento | Mano de obra + merma = costo por bolsa | Mensual |

---

## 8. Validaciones y Restricciones

| # | Restricción |
|---|-------------|
| V01 | La suma total de bolsas producidas no puede exceder el peso del saco |
| V02 | No se puede fraccionar un saco que ya fue fraccionado previamente |
| V03 | Las presentaciones permitidas son solo: 3, 5, 10, 20, 30 kg |
| V04 | La merma real no puede ser negativa (no se puede producir más peso del que se ingresó) |
| V05 | Si merma_real excede merma_esperada en +20% → alerta obligatoria |
| V06 | Todo lote de fraccionamiento debe cerrarse antes de iniciar el siguiente |

---

## 9. Actores Involucrados

| Actor | Rol | Acciones |
|-------|-----|---------|
| Operador de planta | Ejecuta el fraccionamiento | Pesar, embolsar, registrar producción |
| Supervisor de planta | Supervisa calidad y merma | Revisar alertas, aprobar lotes, ajustar parámetros |
| Administrador de almacén | Gestiona stock de sacos y producto terminado | Seleccionar sacos, recibir producto terminado |
| Jefe de producción | Planifica la producción diaria | Definir cantidades por presentación según pedidos |
