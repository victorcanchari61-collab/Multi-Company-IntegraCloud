# Rendimiento en Angular — causas comunes de lentitud

Angular puede volverse muy lento cuando se programa mal, principalmente por cómo funciona su **detección de cambios** (change detection). Estas son las causas más comunes y las reglas a seguir en este proyecto para evitarlas.

## 1. Detección de cambios excesiva (Zone.js)

Por defecto, Angular usa `Zone.js` para detectar cambios cada vez que ocurre un evento (click, timer, HTTP, etc.), y revisa **todo el árbol de componentes**, no solo el que cambió. Si hay muchos componentes, esto se vuelve costoso.

**Solución:** usar `ChangeDetectionStrategy.OnPush` en los componentes, para que Angular solo revise cuando cambian los `@Input()`/`input()` o se dispara un evento dentro del componente. Con signals (el patrón que usa este proyecto en `core/state/`), esto se vuelve aún más simple: los componentes reaccionan solo cuando la signal que leen cambia.

## 2. Llamar funciones directamente en el template

```html
<!-- MAL -->
<div>{{ calcularTotal() }}</div>
```

Esto ejecuta `calcularTotal()` en **cada ciclo de detección de cambios**, aunque nada haya cambiado. Si esa función hace cálculos pesados o filtra arrays grandes, el rendimiento se destruye.

**Solución:** usar `computed()` (signals), pipes puros, o precalcular el valor y guardarlo en una propiedad.

## 3. `*ngFor` / `@for` sin `track`

Sin una clave de tracking, Angular destruye y recrea **todos** los elementos del DOM cada vez que la lista cambia, en lugar de solo actualizar lo necesario.

```html
<!-- sintaxis moderna (@for), obligatorio indicar track -->
@for (item of items; track item.id) { ... }
```

## 4. Suscripciones a Observables sin desuscribirse

Si no se usa `async pipe`, `firstValueFrom`/`lastValueFrom` (para llamadas únicas, como en `auth.service.ts`), o no se hace `unsubscribe()` en `ngOnDestroy`, se acumulan múltiples suscripciones activas (memory leaks) cada vez que el componente se recrea.

## 5. Abuso de bindings y watchers innecesarios

Cientos de bindings `{{ }}` o `[ ]` en una sola vista, especialmente dentro de listas grandes, multiplican el trabajo de cada ciclo de detección.

## 6. No usar lazy loading

Cargar todos los módulos de una app grande de una sola vez aumenta el bundle inicial y ralentiza el arranque. Este proyecto ya carga cada página con `loadComponent`/`loadChildren` (ver `app.routes.ts`); mantener ese patrón al añadir nuevas features (`users`, `roles`, `companies`, etc.).

## Resumen

| Problema | Impacto |
|---|---|
| Funciones en templates | Alto |
| Sin `OnPush` / sin signals | Alto |
| Sin `track` en `@for` | Alto |
| Suscripciones sin limpiar | Medio-Alto (leaks) |
| Sin lazy loading | Medio (carga inicial) |
