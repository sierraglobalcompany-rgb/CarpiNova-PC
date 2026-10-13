# CarpiNova-PC — Dashboard educativo MVP 2

**Fecha:** 2026-10-13  
**Estado:** DESIGN APPROVED — pendiente de revisión del documento por el usuario  
**Rama de diseño:** `design/dashboard-mvp2-20261013`  
**Base:** `main` @ `61cd87c452db4a308fe8e5fe926e6987b8c83eea`  
**Predecesor estable:** Knowledge Explorer MVP 1 — CLOSED / GREEN

## 1. Propósito

El MVP 1 demostró que `CarpiNova-Knowledge 1.0.0` puede consumirse de forma local, determinística, trazable y segura mediante búsqueda, filtros y fichas pedagógicas.

El MVP 2 mejora exclusivamente la **entrada a esa experiencia**.

El objetivo es que una persona que no sabe qué buscar pueda abrir CarpiNova y entender inmediatamente por dónde comenzar, sin introducir una taxonomía paralela, recomendaciones inventadas, rutas educativas completas ni infraestructura nueva.

Recorrido objetivo:

```text
abrir CarpiNova
→ entender por dónde empezar
→ elegir un bloque principal
→ entrar al explorador ya existente filtrado por categoría
→ abrir una ficha
→ aprender
→ comprobar procedencia
```

## 2. Principios obligatorios

### 2.1 KISS

La solución debe ser:

- simple;
- local-first;
- determinística;
- reutilizar las rutas y servicios existentes;
- sin infraestructura adicional;
- sin nueva dependencia salvo necesidad demostrada;
- sin estado global nuevo;
- sin duplicar conocimiento.

La implementación preferida modifica la portada existente y reutiliza el Knowledge Explorer actual.

### 2.2 Cero ruido

No se crea una nueva capa si el comportamiento ya existe.

Prioridad de decisión:

```text
REUTILIZAR > SIMPLIFICAR > MEJORAR > CREAR
```

No se introduce código para funciones futuras.

### 2.3 Knowledge es la única fuente de verdad

`CarpiNova-Knowledge` sigue siendo la única fuente canónica del contenido educativo.

CarpiNova-PC puede decidir **cómo presentar accesos de interfaz**, pero no puede inventar:

- contenido técnico;
- relaciones entre registros;
- medidas;
- jerarquías de conocimiento no distribuidas;
- recomendaciones técnicas;
- reglas de fabricación;
- estados de validación.

## 3. Alcance exacto

El MVP 2 convierte la ruta `/` en un dashboard educativo para principiantes compuesto por tres zonas simples:

1. encabezado pedagógico;
2. bloque prioritario **“Empieza aquí”**;
3. bloque **“Explora todo”**.

El buscador actual continúa siendo una acción principal visible.

No se crean nuevas rutas obligatorias.

Las rutas existentes permanecen:

```text
/
/buscar
/contenido/:contentId
```

## 4. Experiencia de la portada

### 4.1 Encabezado

La portada debe comunicar que CarpiNova sirve para aprender y explorar carpintería desde cero.

Copy objetivo, sujeto únicamente a ajustes menores de redacción:

```text
Aprende carpintería desde cero

Explora materiales, herrajes, procedimientos y otros conceptos con información trazable de CarpiNova.
```

El buscador del MVP 1 permanece visible inmediatamente después del encabezado.

No se crea un segundo buscador ni un segundo flujo de búsqueda.

### 4.2 Empieza aquí

Debajo del buscador aparece una sección:

```text
Empieza aquí
```

Su finalidad es reducir la carga inicial de decisión para un principiante.

Los tipos prioritarios son, en este orden:

| Prioridad | `content_type` canónico | Etiqueta existente |
|---|---|---|
| 1 | `material` | Materiales |
| 2 | `hardware` | Herrajes |
| 3 | `procedure` | Procedimientos |
| 4 | `construction_pattern` | Sistemas constructivos |
| 5 | `warning` | Advertencias |

Esta lista es una **prioridad de interfaz**, no una taxonomía nueva.

Cada tarjeta enlaza al flujo existente:

```text
/buscar?type=<content_type>
```

Ejemplo:

```text
Materiales → /buscar?type=material
```

### 4.3 Regla de existencia

Una tarjeta prioritaria solo puede mostrarse si ese `content_type` existe realmente en el bundle cargado.

La disponibilidad debe derivarse de la misma lógica canónica ya usada por:

```ts
getAvailableContentTypes(repository)
```

No se crean categorías vacías.

No se inventan sustitutos.

No se completa la cuadrícula con contenido manual si falta un tipo.

Si un tipo prioritario no existe, simplemente no se muestra.

### 4.4 Contenido de la tarjeta

Cada tarjeta necesita únicamente:

- nombre de categoría;
- una llamada a la acción breve;
- enlace real al explorador filtrado.

No requiere:

- imagen remota;
- iconografía de una librería nueva;
- contenido técnico escrito a mano;
- conteos;
- ranking;
- recomendación automática.

Si se usa texto secundario, debe ser puramente de navegación y no aportar hechos técnicos nuevos. Ejemplo aceptable:

```text
Explorar materiales
```

### 4.5 Explora todo

Después de “Empieza aquí” aparece:

```text
Explora todo
```

Este bloque conserva la capacidad completa del MVP 1 mostrando **todos los `content_type` realmente disponibles** mediante la lógica actual.

Debe reutilizar `CategoryFilter` o el mecanismo existente equivalente.

No debe existir una segunda implementación de categorías.

Los tipos prioritarios pueden aparecer también en “Explora todo”. Esto no se considera duplicación de conocimiento: una zona es orientación inicial y la otra es el índice completo. No se duplica contenido ni lógica de datos.

## 5. Qué NO incluye el MVP 2

Quedan fuera deliberadamente:

- contenidos destacados seleccionados manualmente;
- “recomendado para ti”;
- “lo más visto”;
- historial;
- favoritos;
- progreso;
- cuenta de usuario;
- rutas de aprendizaje completas;
- niveles principiante/intermedio/avanzado;
- backend;
- base de datos;
- autenticación;
- sincronización;
- analytics de producto;
- CMS;
- panel administrativo;
- PWA;
- versión móvil nativa;
- CarpiNova Cell;
- IA;
- LLM;
- embeddings;
- búsqueda vectorial;
- RAG;
- nuevas taxonomías;
- CAD/3D;
- Furniture Engine;
- regeneración de figuras;
- hosting/deployment.

Cualquiera de estos puntos requiere una fase posterior separada.

## 6. Arquitectura

No se cambia la arquitectura del MVP 1.

Flujo:

```text
CarpiNova-Knowledge 1.0.0
        ↓
KnowledgeRepository existente
        ↓
getAvailableContentTypes(repository)
        ↓
HomePage
        ├── SearchForm existente
        ├── Empieza aquí
        └── CategoryFilter existente / Explora todo
                     ↓
              /buscar?type=...
                     ↓
             SearchPage existente
                     ↓
             ContentPage existente
```

No se requiere nuevo servicio de dominio.

No se requiere persistencia.

No se requiere comunicación externa.

## 7. Componentes

### 7.1 `HomePage`

Responsabilidades:

- obtener `KnowledgeRepository` mediante el contexto existente;
- obtener tipos disponibles mediante `getAvailableContentTypes`;
- mantener `SearchForm`;
- calcular la intersección entre tipos disponibles y los cinco tipos prioritarios;
- renderizar “Empieza aquí”;
- renderizar “Explora todo”.

La lógica debe permanecer pequeña y explícita.

### 7.2 Componente presentacional opcional

Se permite **como máximo un componente presentacional pequeño** para las tarjetas de “Empieza aquí” si mejora claramente la legibilidad de `HomePage`.

Ejemplo posible:

```text
BeginnerStart
```

No se crea:

- service;
- repository adicional;
- store;
- hook personalizado;
- provider;
- mapper de dominio;
- configuración JSON independiente;

salvo que una prueba real demuestre que es imprescindible.

### 7.3 `CategoryFilter`

Debe reutilizarse sin cambiar su propósito.

Solo se modifica si existe una necesidad visual o de accesibilidad concreta demostrada durante implementación.

## 8. Datos y reglas de derivación

Fuente de datos:

```text
repository.bundle.content
```

Disponibilidad de categoría:

```text
getAvailableContentTypes(repository)
```

Prioridad de dashboard:

```text
material
hardware
procedure
construction_pattern
warning
```

Algoritmo esperado conceptualmente:

```text
available = tipos realmente presentes
priority = [material, hardware, procedure, construction_pattern, warning]
startHere = priority filtrado por available
all = available
```

No se inspecciona `source_transcription` para decidir destacados.

No se escoge contenido individual automáticamente.

No se usa cantidad de registros como proxy de importancia.

No se infiere relevancia por página, capítulo, posición o frecuencia.

## 9. Estados vacíos y errores

### 9.1 Knowledge incompatible o ausente

Se conserva exactamente el comportamiento fail-closed existente del Bootstrap.

El dashboard no implementa fallback remoto ni datos embebidos.

### 9.2 Ningún tipo prioritario disponible

Si `startHere` queda vacío:

- no se muestra una sección vacía;
- el buscador continúa disponible;
- “Explora todo” sigue mostrando los tipos reales disponibles.

No se inventa una categoría para llenar el espacio.

### 9.3 Knowledge sin categorías conocidas

Se mantiene el comportamiento seguro existente. El dashboard no debe fabricar categorías a partir de texto libre.

## 10. Diseño visual

Se conserva la identidad visual “Taller moderno” aprobada en MVP 1:

- clara;
- limpia;
- pedagógica;
- profesional;
- sin decoración excesiva.

“Empieza aquí” debe tener mayor jerarquía visual que “Explora todo”, pero no debe desplazar el buscador fuera del primer viewport en escritorio de forma innecesaria.

Las tarjetas deben ser reconocibles como enlaces y funcionar sin depender únicamente de color.

No se incorpora framework CSS ni biblioteca de iconos.

Si se usan iconos, deben resolverse con recursos ya disponibles o elementos extremadamente simples; la ausencia de iconos no bloquea el MVP.

## 11. Responsive

Se mantiene aceptación aproximada en:

```text
1440 px
768 px
390 px
```

Objetivos:

- sin overflow horizontal;
- tarjetas adaptables;
- orden de lectura estable;
- buscador utilizable;
- “Empieza aquí” visible y comprensible;
- “Explora todo” usable;
- enlaces con área de interacción adecuada.

No se crean layouts independientes por dispositivo.

## 12. Accesibilidad

Requisitos mínimos:

- encabezados jerárquicos coherentes;
- sección “Empieza aquí” identificable;
- navegación por teclado completa;
- foco visible;
- tarjetas/enlaces con nombre accesible;
- no depender solo del color;
- `CategoryFilter` conserva su navegación semántica;
- el buscador conserva su label accesible actual.

No se plantea una certificación WCAG completa en este MVP.

## 13. Seguridad y procedencia

El dashboard es únicamente navegación.

No modifica:

- `learning_text`;
- `normalized_text`;
- `source_transcription`;
- procedencia;
- estados de revisión;
- conflictos;
- datos técnicos.

El usuario continúa llegando a la misma `ContentPage` certificada en MVP 1.

Reglas vigentes:

```text
UNRESOLVED > INVENTED
```

No se infieren relaciones entre medidas y contenido por compartir página.

No se convierten RuleSpec en reglas ejecutables.

## 14. Pruebas automáticas

La implementación debe agregar pruebas focales para el dashboard sin duplicar toda la suite existente.

Casos mínimos:

1. muestra el nuevo encabezado y el buscador existente;
2. “Empieza aquí” usa únicamente tipos prioritarios realmente disponibles;
3. respeta el orden fijo de prioridad;
4. omite un tipo prioritario ausente;
5. cada tarjeta enlaza a `/buscar?type=<tipo>`;
6. “Explora todo” sigue mostrando todos los tipos disponibles;
7. si no existen tipos prioritarios, no se muestra una sección vacía;
8. navegación de teclado básica sobre los accesos;
9. las pruebas existentes de búsqueda, detalle, Bootstrap y procedencia siguen verdes.

No se escriben tests de implementación interna cuando basta probar comportamiento visible.

## 15. Verificación final

Antes de cerrar MVP 2 deben pasar realmente:

```bash
npm ci
npm test
npm run typecheck
npm run build
```

Además, con Knowledge real preparado:

```text
abrir /
→ ver “Empieza aquí”
→ abrir Materiales
→ comprobar /buscar?type=material
→ abrir una ficha
→ volver
→ abrir otra categoría prioritaria
→ comprobar “Explora todo”
```

Responsive real:

```text
1440
768
390
```

Accesibilidad smoke:

```text
Tab
Enter
foco visible
nombres accesibles
```

## 16. Criterios de aceptación

MVP 2 se considera terminado únicamente si:

1. `/` funciona como dashboard para principiante;
2. el buscador del MVP 1 sigue operativo sin duplicación;
3. “Empieza aquí” presenta únicamente tipos reales del bundle;
4. el orden prioritario es determinístico;
5. cada acceso reutiliza `/buscar?type=...`;
6. “Explora todo” conserva todos los tipos existentes;
7. no se crea taxonomía paralela;
8. no se inventa contenido destacado;
9. no se añade backend, DB, auth, IA ni infraestructura;
10. búsqueda, detalle, fuente y procedencia del MVP 1 no regresan;
11. responsive 1440/768/390 pasa;
12. accesibilidad smoke pasa;
13. tests, typecheck y build pasan;
14. Knowledge generado continúa fuera de Git;
15. una aceptación manual con Knowledge real completa el flujo principal.

## 17. Archivos que probablemente cambien

Mínimo esperado:

```text
src/features/search/HomePage.tsx
src/styles/app.css
tests/... dashboard/home focal test
```

Posible, solo si mejora claridad:

```text
src/features/search/BeginnerStart.tsx
```

No se espera modificar:

```text
scripts/prepare-knowledge.mjs
src/knowledge/loadKnowledge.ts
src/knowledge/searchKnowledge.ts
src/features/content/ContentPage.tsx
src/app/routes.tsx
package.json
```

Si durante implementación alguno de estos últimos necesita cambiar, debe existir un defecto o requisito concreto que lo justifique antes de hacerlo.

## 18. Guardrail de alcance

Una mejora no entra al MVP 2 por ser atractiva o fácil de agregar.

Debe responder directamente a esta pregunta:

> ¿Ayuda a una persona que no sabe qué buscar a entrar de forma más clara al Knowledge Explorer existente?

Si la respuesta es no, se difiere.

## 19. Siguiente evolución posible, no aprobada todavía

Después de validar este dashboard con uso real, se puede evaluar separadamente:

- rutas educativas;
- contenido destacado si Knowledge distribuye una señal canónica para ello;
- progreso/favoritos;
- CarpiNova Cell.

No forman parte de esta especificación.

## 20. Resultado esperado

El MVP 2 no convierte CarpiNova en un sistema más complejo.

Convierte una portada funcional pero neutra en una **entrada pedagógica clara**, reutilizando exactamente el Knowledge Explorer ya certificado.

La mejora principal es de orientación, no de arquitectura.
