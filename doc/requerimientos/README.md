# Requerimientos del Sistema — Distribuidora de Menestras

Este directorio contiene la documentación detallada de los 4 requerimientos funcionales principales del sistema, basados en la operación real de una distribuidora mayorista de menestras (frejol, lenteja, garbanzo, arveja, etc.).

## Requerimientos

| ID | Nombre | Descripción | Archivo |
|----|--------|-------------|---------|
| **R01** | Control de Inventario y Espacios Físicos | Gestión de stock en planta, almacén PT, camiones en ruta y tiendas | [R01-Control-Inventario-Espacios-Fisicos.md](R01-Control-Inventario-Espacios-Fisicos.md) |
| **R02** | Fraccionamiento de Mercadería (Menestras) | Transformación de sacos a bolsas con control de merma | [R02-Fraccionamiento-Mercaderia-Menestras.md](R02-Fraccionamiento-Mercaderia-Menestras.md) |
| **R03** | Ciclo de Pedidos y Despacho (48h) | Flujo preventa → pesaje/carga → reparto en 3 días | [R03-Ciclo-Pedidos-Despacho-48h.md](R03-Ciclo-Pedidos-Despacho-48h.md) |
| **R04** | Operación en Tiendas Físicas | Ventas, caja, abastecimiento y stock en sucursales | [R04-Operacion-Tiendas-Fisicas.md](R04-Operacion-Tiendas-Fisicas.md) |

## Estructura de cada documento

Cada requerimiento incluye:

1. **Descripción general** — contexto del requerimiento
2. **Entidades de datos** — modelos con campos y tipos
3. **Reglas de negocio** — lógica que debe cumplir el sistema (RN01...RNn)
4. **Flujos de trabajo** — paso a paso de cada proceso
5. **Reportes requeridos** — qué información se necesita extraer
6. **Validaciones y restricciones** — reglas técnicas (V01...Vn)
7. **Actores involucrados** — quién participa y qué hace

## Relación entre requerimientos

```
R01 (Inventario) ←→ R02 (Fraccionamiento): los sacos se fraccionan y el inventario se mueve de planta a PT
R01 (Inventario) ←→ R03 (Pedidos): el stock disponible valida los pedidos de preventa
R01 (Inventario) ←→ R04 (Tiendas): las tiendas reciben stock desde el almacén PT
R03 (Pedidos) ←→ R02 (Fraccionamiento): el consolidado de pedidos determina cuánto fraccionar
R03 (Pedidos) ←→ R04 (Tiendas): coexistencia de reparto mayorista (R03) y venta directa en tienda (R04)
```
