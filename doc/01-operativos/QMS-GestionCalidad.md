# QMS — Quality Management System

## Descripción General
Sistema que asegura que los productos y procesos cumplan con los estándares de calidad, gestionando inspecciones, no conformidades, auditorías y documentación.

## Módulos y Submódulos

### 1. Control de calidad
| Submódulo | Descripción | Flujo de trabajo | Requisitos clave |
|-----------|-------------|------------------|------------------|
| Inspección de entrada | Control de calidad de materiales recibidos | Muestreo → Inspección → Criterio → Aprobación/Rechazo → Disposición | Planes de muestreo, especificaciones, criterios AQL |
| Control en proceso (IPQC) | Monitoreo durante la producción | Parámetros → Muestreo → Medición → Control → Ajuste | Gráficos de control SPC, Cp/Cpk, límites de control |
| Inspección de producto final | Verificación antes del despacho | Muestreo → Pruebas → Criterio → Liberación/Bloqueo | Especificaciones finales, pruebas funcionales, empaque |
| Muestreo estadístico (AQL) | Planes de muestreo basados en normas | Lote → Nivel → Plan → Muestreo → Decisión (aceptar/rechazar) | ANSI/ASQ Z1.4, ISO 2859, nivel normal/reforzado/reducido |

### 2. No conformidades
| Submódulo | Descripción | Flujo de trabajo | Requisitos clave |
|-----------|-------------|------------------|------------------|
| Registro de defectos | Captura de productos no conformes | Detección → Clasificación → Registro → Etiquetado → Cuarentena | Tipo de defecto, gravedad, responsable, ubicación física |
| Análisis de causa raíz (RCA) | Identificación de causa fundamental | Problema → Datos → Análisis → Causa raíz → Validación | 5 Whys, Ishikawa, árbol de fallas, datos objetivos |
| Acciones correctivas (CAPA) | Plan de acción correctiva y preventiva | RCA → Acción → Responsable → Plazo → Verificación → Efectividad | Plan de acción, seguimiento, cierre, verificación de eficacia |
| 8D Report | Metodología estructurada de solución | D1-D8: Equipo → Problema → Contención → RCA → PC → Implementación → Prevención → Cierre | Formato 8D estándar, equipo multidisciplinario, cliente |

### 3. Auditorías
| Submódulo | Descripción | Flujo de trabajo | Requisitos clave |
|-----------|-------------|------------------|------------------|
| Auditorías internas | Evaluación del sistema de calidad | Plan → Preparación → Ejecución → Hallazgos → Informe → Seguimiento | Programa anual, checklist, auditores calificados, hallazgos |
| Auditorías a proveedores | Evaluación de calidad de proveedores | Selección → Plan → Visita → Evaluación → Informe → Seguimiento | Cuestionario, visita in situ, calificación, plan de mejora |
| Preparación ISO 9001 | Mantenimiento de certificación | Gap analysis → Documentación → Implementación → Auditoría → Certificación | Requisitos de norma, proceso documentado, mejora continua |
| Plan de auditoría | Programa y agenda de auditorías | Alcance → Recursos → Agenda → Asignación → Comunicación | Cronograma anual, auditores, áreas/procesos, duración |

### 4. Documentación
| Submódulo | Descripción | Flujo de trabajo | Requisitos clave |
|-----------|-------------|------------------|------------------|
| Control de documentos | Gestión de documentos del SGC | Creación → Revisión → Aprobación → Publicación → Distribución → Obsoleto | Codificación, versiones, vigencia, acceso controlado |
| SOPs y procedimientos | Procedimientos operativos estándar | Identificación → Redacción → Revisión → Aprobación → Capacitación → Publicación | Formato estándar, lenguaje claro, diagramas de flujo |
| Registros de calidad | Evidencia documental de calidad | Generación → Almacenamiento → Retención → Disposición | Trazabilidad, integridad, tiempo de retención, legibilidad |
| Trazabilidad de lotes | Seguimiento de lotes en la cadena | Lote → Materia prima → Producción → Distribución → Cliente | Lotes, series, fechas, ubicaciones, rastreabilidad ascendente/descendente |
