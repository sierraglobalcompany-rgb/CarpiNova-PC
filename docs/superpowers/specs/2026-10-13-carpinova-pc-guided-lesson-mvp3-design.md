# CarpiNova-PC — Lección guiada MVP 3

**Fecha:** 2026-10-13  
**Estado:** DESIGN WRITTEN — USER REVIEW REQUIRED  
**Rama de diseño:** `design/guided-lesson-mvp3-20261013`  
**Base:** `main` @ `27cb3e3346db041084898e633724861f9f8501c6`  
**Predecesor estable:** Dashboard educativo MVP 2 — CLOSED / GREEN

## 1. Propósito

MVP 1 demostró consumo local, determinístico y trazable de `CarpiNova-Knowledge 1.0.0`. MVP 2 mejoró la entrada para una persona que todavía no sabe qué buscar.

MVP 3 debe demostrar el siguiente salto de producto con el menor cambio correcto posible:

> CarpiNova no solo permite explorar conocimiento; también puede conducir a una persona por una secuencia pedagógica canónica ya existente en Knowledge.

El MVP 3 implementa una **primera lección guiada real**, sin crear todavía un sistema general de cursos, progreso, perfiles, recomendaciones o generación automática de rutas.

Recorrido objetivo:

```text
abrir CarpiNova
→ descubrir una lección guiada disponible
→ abrir la lección
→ recorrer sus pasos en orden canónico
→ leer el contenido pedagógico asociado
→ abrir una ficha canónica cuando se necesite profundizar
→ comprobar procedencia
→ volver a la lección
```

## 2. Evidencia que justifica el MVP

### 2.1 Knowledge ya contiene una lección estructurada

`CarpiNova-Knowledge` contiene:

```text
lessons/pilot/slides-x-2x.json
```

con:

- `lesson_id = LESSON-SLIDES-X-2X-PILOT`;
- título `Calcular e instalar correderas con X y 2X`;
- 5 pasos ordenados;
- referencias a `content_ids`;
- referencias a `figure_ids`;
- metadatos de interacción en algunos pasos.

La secuencia pedagógica existe en Knowledge. CarpiNova-PC no debe reconstruirla ni duplicarla.

### 2.2 El build BOOK ya contempla lecciones

El generador de Knowledge usa `_collect_lessons(...)` y agrega una lección a la distribución cuando todas sus referencias de contenido y figuras pertenecen a la distribución que se está construyendo.

`build-book-dist` genera, entre otros:

```text
knowledge.bundle.json
figures.bundle.json
lessons.bundle.json
manifest.json
```

El `manifest.json` firma los tres bundles mediante SHA-256.

### 2.3 PC ya transporta el artefacto, pero no lo consume

`scripts/prepare-knowledge.mjs` ya exige como artefactos obligatorios:

```text
knowledge.bundle.json
figures.bundle.json
lessons.bundle.json
```

y verifica sus hashes contra el manifest antes de instalar el Knowledge generado.

Sin embargo, el runtime actual de `src/knowledge/loadKnowledge.ts` solo carga:

```text
manifest.json
knowledge.bundle.json
```

Por tanto existe un hueco claro y acotado:

```text
Knowledge produce lessons.bundle.json
→ PC verifica que el archivo existe e íntegro
→ PC todavía no lo carga ni lo expone
```

MVP 3 cierra exclusivamente ese hueco y lo demuestra con una experiencia de lección.

## 3. Principios obligatorios

### 3.1 KISS

La solución debe ser:

- local-first;
- determinística;
- sin backend;
- sin base de datos;
- sin autenticación;
- sin dependencia nueva salvo necesidad demostrada;
- sin estado global adicional aparte del `KnowledgeRepository` existente;
- sin duplicar conocimiento del libro;
- sin motor genérico de cursos prematuro.

### 3.2 Cero ruido

Orden de decisión:

```text
REUTILIZAR > SIMPLIFICAR > MEJORAR > CREAR
```

No se crea una capa futura para una necesidad que todavía no existe.

La primera implementación debe reutilizar:

- `KnowledgeContext`;
- `KnowledgeRepository`;
- `ContentRecord`;
- `contentById`;
- `selectPrimaryText(...)`;
- `ContentPage`;
- React Router;
- estilos existentes.

### 3.3 Knowledge sigue siendo la única fuente de verdad

CarpiNova-PC puede decidir cómo representar una lección, pero no puede inventar:

- pasos;
- orden pedagógico;
- títulos técnicos;
- asociaciones entre pasos y contenidos;
- medidas;
- figuras;
- reglas;
- recomendaciones técnicas;
- interacciones no distribuidas.

Si Knowledge no distribuye una relación, PC no la infiere.

### 3.4 Fail closed

Ante datos inválidos no se completa la información manualmente.

Preferencia obligatoria:

```text
UNRESOLVED > INVENTED
```

Una lección inválida debe producir un error de carga verificable, no una experiencia parcialmente inventada.

## 4. Gate previo a implementación

Antes de modificar código de producto se debe ejecutar el flujo real de preparación de Knowledge desde `CarpiNova-Knowledge 1.0.0` y comprobar el `generated/knowledge/lessons.bundle.json` resultante.

Debe verificarse específicamente que el bundle BOOK contiene:

```text
LESSON-SLIDES-X-2X-PILOT
```

con sus 5 pasos esperados.

La lógica actual del builder indica que la lección debe entrar cuando todas sus referencias están dentro de la distribución, pero esta spec no sustituye la comprobación del artefacto generado.

Si la lección no está en el bundle BOOK 1.0.0:

```text
STOP
→ no hardcodear la lección en PC
→ no copiar lessons/pilot manualmente
→ investigar Knowledge
```

## 5. Alcance exacto

MVP 3 contiene cuatro cambios funcionales y nada más:

1. cargar y validar `lessons.bundle.json`;
2. exponer lecciones desde `KnowledgeRepository`;
3. mostrar lecciones disponibles desde la portada;
4. añadir una página de lección guiada.

Nueva ruta permitida:

```text
/lecciones/:lessonId
```

Rutas existentes que permanecen:

```text
/
/buscar
/contenido/:contentId
```

## 6. Contrato mínimo de datos en PC

PC debe tipar solamente la parte del contrato que necesita consumir.

Contrato objetivo conceptual:

```ts
interface LessonStep {
  order: number;
  title: string;
  content_ids: string[];
  figure_ids?: string[];
  interaction?: Record<string, unknown>;
}

interface LessonRecord {
  lesson_id: string;
  title: string;
  source_content_ids: string[];
  steps: LessonStep[];
}

interface LessonsBundle {
  schema_version?: string;
  knowledge_version?: string;
  book_id?: string;
  scope?: string;
  lessons: LessonRecord[];
}
```

`interaction` permanece opaco en MVP 3. No se diseña una jerarquía de tipos para interacciones que todavía no serán ejecutadas.

El `KnowledgeRepository` se amplía conceptualmente con:

```ts
lessons: LessonRecord[];
lessonsById: Map<string, LessonRecord>;
```

No se crea un segundo contexto React.

## 7. Carga y validación

### 7.1 Archivos runtime

`loadKnowledge(...)` debe cargar desde el mismo `baseUrl`:

```text
manifest.json
knowledge.bundle.json
lessons.bundle.json
```

No se requiere cargar `figures.bundle.json` en MVP 3 porque las figuras todavía no se representan en la UI de la lección.

La integridad física de `figures.bundle.json` continúa protegida por `prepare-knowledge.mjs` y el manifest.

### 7.2 Validación mínima obligatoria

El loader debe rechazar:

- `lessons.bundle.json` que no sea objeto;
- `lessons` que no sea array;
- `lesson_id` faltante o no string;
- `lesson_id` duplicado;
- título faltante o no string;
- `source_content_ids` que no sea array de strings;
- `steps` que no sea array;
- paso sin `order` numérico entero positivo;
- órdenes duplicados dentro de una misma lección;
- paso sin título string;
- `content_ids` que no sea array de strings;
- `figure_ids`, si existe, que no sea array de strings;
- `interaction`, si existe, que no sea objeto;
- referencias `source_content_ids` inexistentes en `contentById`;
- referencias `steps[].content_ids` inexistentes en `contentById`.

Los pasos se presentan ordenados por `order` ascendente.

No se inventan pasos faltantes si la secuencia numérica contiene huecos.

### 7.3 Coherencia de identidad

Si `lessons.bundle.json` declara `knowledge_version`, `book_id` o `scope`, esos valores deben ser coherentes con el `manifest` activo.

No se acepta mezclar una lección de otro libro o versión con el Knowledge cargado.

## 8. Portada

La portada mantiene intacto el propósito del MVP 2.

Se añade una única zona, solamente cuando `repository.lessons.length > 0`:

```text
Aprende paso a paso
```

Ubicación recomendada:

```text
encabezado
buscador
Empieza aquí
Aprende paso a paso
Explora todo
```

Cada lección disponible se representa con:

- su título canónico;
- un enlace a `/lecciones/:lessonId`.

No se hardcodea `LESSON-SLIDES-X-2X-PILOT` en `HomePage`.

La portada consume `repository.lessons`.

No se crean:

- rankings;
- dificultad inventada;
- duración inventada;
- imagen promocional inventada;
- texto técnico adicional;
- badges de progreso;
- recomendación personalizada.

Si el bundle no contiene lecciones, la sección completa desaparece.

## 9. Página de lección

Se crea un feature enfocado, por ejemplo:

```text
src/features/lessons/LessonPage.tsx
```

Responsabilidad única:

> representar una `LessonRecord` ya validada.

### 9.1 Estado encontrado

La página obtiene `lessonId` desde React Router y resuelve:

```ts
repository.lessonsById.get(lessonId)
```

Debe mostrar:

1. enlace para volver al inicio;
2. título canónico de la lección;
3. pasos ordenados por `order`;
4. título canónico de cada paso;
5. contenidos canónicos asociados al paso.

Para cada `content_id` del paso se reutiliza el `ContentRecord` existente.

Se puede reutilizar `selectPrimaryText(content)` para mostrar un texto pedagógico breve sin crear otra regla de presentación.

Cada contenido debe ofrecer enlace a:

```text
/contenido/:contentId
```

para consultar la ficha completa y su procedencia.

### 9.2 Retorno desde la ficha

Al entrar a una ficha desde una lección, el enlace debe transportar un `returnTo` local:

```text
/lecciones/<lessonId>
```

`ContentPage` se ajusta de forma mínima para aceptar como retorno seguro:

```text
/buscar
/buscar?...
/lecciones/<lessonId>
```

Cuando el retorno sea una lección, la etiqueta debe ser semánticamente correcta, por ejemplo:

```text
Volver a la lección
```

No se permite un `returnTo` arbitrario externo.

### 9.3 Estado no encontrado

Si el ID no existe:

```text
Lección no encontrada
Volver al inicio
```

No se busca una lección “parecida”.

No se redirige silenciosamente a otra lección.

## 10. Figuras e interacciones: decisión explícita

La lección canónica contiene `figure_ids` y metadatos `interaction`.

MVP 3 **no los ejecuta ni representa todavía**.

Razón:

representar figuras correctamente exigiría abrir otro problema de producto:

- cargar `figures.bundle.json` en runtime;
- resolver activos visuales;
- definir escalado;
- definir overlays por coordenadas;
- implementar tipos de interacción como `highlight_measurements` o `identify_parts`;
- verificar comportamiento responsivo y accesible.

Eso convertiría el primer slice pedagógico en un subsistema visual mucho mayor.

La decisión KISS es:

```text
MVP3 = secuencia + contenido + procedencia
MVP posterior = figuras/interacciones, si el MVP3 demuestra valor
```

PC conserva los metadatos recibidos, pero no pretende soportarlos todavía.

## 11. Manejo de errores

Errores de integridad del Knowledge son errores de bootstrap, igual que en el loader actual.

No deben degradarse silenciosamente.

Ejemplos:

```text
lesson_id duplicado
→ error de carga

content_id inexistente
→ error de carga

lesson inexistente solicitada por URL
→ estado de UI “Lección no encontrada”
```

La diferencia es deliberada:

- datos distribuidos inválidos = fallo de integridad;
- URL de usuario inexistente = estado normal de navegación.

## 12. Accesibilidad

La lección debe funcionar completamente con teclado.

Requisitos mínimos:

- un solo `h1` para el título de la lección;
- pasos con estructura semántica comprensible;
- orden DOM igual al orden pedagógico;
- enlaces accesibles por Tab;
- foco visible mediante estilos existentes;
- ningún comportamiento esencial dependiente de hover;
- sin scroll horizontal en 390 px.

No se requiere un stepper gráfico complejo.

Una lista/serie de secciones semánticas es preferible si resuelve el problema con menos código.

## 13. Cambios esperados por archivo

La implementación debe intentar mantenerse alrededor de este conjunto pequeño:

```text
src/knowledge/types.ts
src/knowledge/loadKnowledge.ts
src/features/search/HomePage.tsx
src/features/lessons/LessonPage.tsx
src/features/content/ContentPage.tsx
src/app/routes.tsx
src/styles/app.css
```

más las pruebas estrictamente necesarias.

`KnowledgeContext.tsx` no debería requerir una segunda abstracción porque ya transporta el objeto `KnowledgeRepository` completo.

Si durante implementación aparece la necesidad de muchas más capas o archivos de infraestructura, se debe parar y revisar el diseño antes de seguir.

## 14. Estrategia de pruebas

La implementación sigue TDD.

### 14.1 Loader / contrato

Pruebas para demostrar:

- `lessons.bundle.json` válido se carga;
- `lessonsById` se construye;
- IDs duplicados fallan;
- referencia a `content_id` inexistente falla;
- orden inválido falla;
- metadata incompatible falla;
- `interaction` puede permanecer opaco sin ejecutarse.

### 14.2 Portada

Pruebas para demostrar:

- sección `Aprende paso a paso` aparece cuando existen lecciones;
- usa título canónico del bundle;
- no aparece cuando `lessons` está vacío;
- el enlace usa el `lesson_id` real.

### 14.3 Página de lección

Pruebas para demostrar:

- resuelve lección por ID;
- presenta pasos según `order`;
- presenta contenido relacionado sin inventarlo;
- enlaza a fichas reales;
- ID desconocido muestra `Lección no encontrada`;
- navegación por teclado alcanza los enlaces de contenido.

### 14.4 Regresión

Debe seguir pasando todo el comportamiento de MVP 1 y MVP 2:

- búsqueda;
- filtros;
- ficha;
- fuente/procedencia;
- dashboard;
- accesibilidad existente.

## 15. Verificación visual

Como MVP 3 modifica UI visible, el cierre requiere gate visual local después del GREEN funcional.

Viewport mínimo:

```text
1440 px
768 px
390 px
```

Validar:

- portada sin regresión;
- sección de lecciones legible;
- página de lección clara;
- pasos en orden visual correcto;
- enlaces distinguibles;
- sin overflow horizontal;
- recorrido teclado usable.

La aceptación visual corresponde al SHA de producto probado. Cambios posteriores de producto reabren el gate; cambios exclusivamente documentales no lo reabren.

## 16. Gates técnicos de cierre

Antes de considerar MVP 3 cerrado:

```text
Knowledge prepare real                         PASS
lesson canónica presente en BOOK 1.0.0        PASS
suite focal                                    PASS
suite completa                                 PASS
typecheck                                      PASS
build                                          PASS
CI del HEAD final                              PASS
gate visual local                              PASS
read-back de diff                              PASS
merge con expected HEAD                        PASS
CI post-merge de main                          PASS
```

Ninguna captura, README o metadata sustituye estos gates.

## 17. Fuera de alcance

MVP 3 no incluye:

- crear nuevas lecciones en PC;
- editar Knowledge;
- generar automáticamente nuevas lecciones;
- rutas de aprendizaje multi-lección;
- cursos;
- niveles principiante/intermedio/avanzado;
- progreso persistente;
- marcar pasos como completados;
- favoritos;
- cuentas;
- autenticación;
- backend;
- base de datos;
- sincronización;
- analytics;
- CMS;
- PWA;
- CarpiNova Cell;
- IA/RAG;
- embeddings;
- recomendaciones personalizadas;
- CAD/3D;
- Furniture Engine;
- ejecución de reglas de fabricación;
- render de figuras;
- overlays sobre figuras;
- `highlight`;
- `highlight_measurements`;
- `identify_parts`;
- `guided_sequence` como interacción ejecutable.

## 18. Riesgos y mitigación

### Riesgo A — asumir que la lección piloto está en BOOK 1.0.0

Mitigación: gate previo obligatorio sobre el bundle realmente generado. Si falta, parar.

### Riesgo B — duplicar contenido de Knowledge en la UI

Mitigación: títulos, pasos y asociaciones siempre salen de `LessonRecord` y `ContentRecord`.

### Riesgo C — convertir MVP 3 en un course engine

Mitigación: una ruta, un renderer pequeño y el contrato mínimo existente.

### Riesgo D — fingir soporte de interacciones

Mitigación: `interaction` permanece como metadata opaca; no se anuncia como funcionalidad soportada.

### Riesgo E — romper la navegación de fichas

Mitigación: extender de forma explícita y local la whitelist de `returnTo`; mantener `/buscar` como comportamiento actual.

## 19. Criterios de aceptación de producto

MVP 3 está completo solamente si una persona puede:

1. abrir la portada;
2. descubrir una lección realmente distribuida por Knowledge;
3. abrirla;
4. ver sus pasos en el orden canónico;
5. leer el contenido asociado a cada paso;
6. abrir una ficha de contenido;
7. comprobar su fuente;
8. volver a la misma lección;
9. completar todo el recorrido con teclado;
10. hacerlo sin que PC haya inventado una sola relación pedagógica.

## 20. Resultado esperado

Al cerrar MVP 3, CarpiNova-PC habrá demostrado tres capacidades consecutivas sobre la misma fuente canónica:

```text
MVP1 → explorar conocimiento
MVP2 → orientar al principiante
MVP3 → enseñar una secuencia guiada
```

Solo después de validar este tercer escalón se decidirá si el siguiente producto debe ampliar:

- más lecciones;
- figuras e interacciones;
- rutas multi-lección;
- CarpiNova Cell;
- u otro slice con valor demostrado.

No se preconstruye ninguna de esas opciones en MVP 3.
