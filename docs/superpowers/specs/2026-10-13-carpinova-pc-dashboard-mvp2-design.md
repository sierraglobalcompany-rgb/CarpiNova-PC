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
- reutilizar las rutas y componentes existentes;
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

No se crean nuevas rutas.

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

| Prioridad | `content_type` conocido | Etiqueta existente |
|---|---|---|
| 1 | `material` | Materiales |
| 2 | `hardware` | Herrajes |
| 3 | `procedure` | Procedimientos |
| 4 | `construction_pattern` | Sistemas constructivos |
| 5 | `warning` | Advertencias |

Esta lista es una **prioridad de interfaz**, no una taxonomía nueva.

La sección reutiliza `CategoryFilter` con el subconjunto prioritario realmente disponible.

Cada enlace conserva el flujo ya existente:

```text
/buscar?type=<content_type>
```

Ejemplo:

```text
Materiales → /buscar?type=material
```

### 4.3 Regla de existencia

Un acceso prioritario solo puede mostrarse si ese `content_type` existe realmente en el bundle y además es reconocido por la lógica actual.

La disponibilidad debe derivarse de:

```ts
getAvailableContentTypes(repository)
```

No se crean categorías vacías.

No se inventan sustitutos.

No se completa la sección con contenido manual si falta un tipo.

Si un tipo prioritario no existe, simplemente no se muestra.

### 4.4 Presentación de los accesos

Cada acceso necesita únicamente:

- etiqueta de categoría ya existente;
- comportamiento de enlace real al explorador filtrado.

No requiere:

- imagen remota;
- iconografía de una librería nueva;
- texto técnico escrito a mano;
- conteos;
- ranking;
- recomendación automática;
- componente nuevo dedicado.

La diferencia visual frente a “Explora todo” se resuelve con CSS contextual sobre el mismo `CategoryFilter`, no mediante una segunda implementación de navegación.

### 4.5 Explora todo

Después de “Empieza aquí” aparece:

```text
Explora todo
```

Este bloque conserva la capacidad completa del MVP 1 mostrando **todos los `content_type` conocidos y realmente presentes** según `getAvailableContentTypes(repository)`.

Debe reutilizar el mismo `CategoryFilter`.

Los tipos prioritarios pueden aparecer también en “Explora todo”. Esto no se considera duplicación de conocimiento: una zona orienta y la otra funciona como índice completo. No se duplica contenido ni lógica de datos.

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
        ├── CategoryFilter(startHereTypes)
        └── CategoryFilter(allAvailableTypes)
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
- renderizar una primera instancia de `CategoryFilter` para “Empieza aquí”;
- renderizar una segunda instancia de `CategoryFilter` para “Explora todo”.

La lista de prioridad puede vivir como una constante pequeña y explícita junto a `HomePage`.

No se crea un helper, hook, servicio, store ni provider nuevo para esta operación.

### 7.2 `CategoryFilter`

Se reutiliza sin cambiar su responsabilidad ni duplicar su construcción de URLs.

Solo se modifica si una necesidad visual o de accesibilidad concreta lo exige y no puede resolverse mediante el contenedor/CSS existente.

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
available = tipos conocidos realmente presentes
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

- no se muestra el encabezado “Empieza aquí”;
- no se muestra una lista vacía;
- el buscador continúa disponible;
- “Explora todo” sigue mostrando los tipos conocidos y realmente presentes.

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

Los enlaces prioritarios deben ser reconocibles como acciones y funcionar sin depender únicamente del color.

No se incorpora framework CSS ni biblioteca de iconos.

No se requieren iconos para cerrar el MVP.

## 11. Responsive

Se mantiene aceptación aproximada en:

```text
1440 px
768 px
390 px
```

Objetivos:

- sin overflow horizontal;
- accesos prioritarios adaptables;
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
- enlaces con nombre accesible;
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
5. cada acceso mantiene `/buscar?type=<tipo>`;
6. “Explora todo” sigue mostrando todos los tipos conocidos disponibles;
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
→ ver “Empieza aquí” cuando exista al menos un tipo prioritario
→ abrir Materiales si está realmente disponible
→ comprobar /buscar?type=material
→ abrir una ficha
→ volver
→ abrir otra categoría prioritaria disponible
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
3. “Empieza aquí” presenta únicamente tipos conocidos y reales del bundle;
4. el orden prioritario es determinístico;
5. cada acceso reutiliza `/buscar?type=...`;
6. “Explora todo” conserva todos los tipos conocidos existentes;
7. ambas zonas reutilizan `CategoryFilter` en vez de duplicar la navegación;
8. no se crea taxonomía paralela;
9. no se inventa contenido destacado;
10. no se añade backend, DB, auth, IA ni infraestructura;
11. búsqueda, detalle, fuente y procedencia del MVP 1 no regresan;
12. responsive 1440/768/390 pasa;
13. accesibilidad smoke pasa;
14. tests, typecheck y build pasan;
15. Knowledge generado continúa fuera de Git;
16. una aceptación manual con Knowledge real completa el flujo principal.

## 17. Archivos que probablemente cambien

Mínimo esperado:

```text
src/features/search/HomePage.tsx
src/styles/app.css
tests/... dashboard/home focal test
```

No se espera crear un nuevo componente para el dashboard.

No se espera modificar:

```text
scripts/prepare-knowledge.mjs
src/knowledge/loadKnowledge.ts
src/knowledge/searchKnowledge.ts
src/features/content/ContentPage.tsx
src/app/routes.tsx
package.json
```

`CategoryFilter.tsx` tampoco debería necesitar cambio funcional; reutilizar dos instancias es suficiente salvo defecto demostrado.

Si durante implementación alguno de estos archivos necesita cambiar, debe existir un defecto o requisito concreto que lo justifique antes de hacerlo.

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
