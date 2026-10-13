# CarpiNova-PC — Knowledge Explorer MVP 1

**Fecha:** 2026-10-12  
**Estado:** diseño conversacional aprobado; especificación escrita pendiente de revisión del usuario  
**Repositorio:** `sierraglobalcompany-rgb/CarpiNova-PC`  
**Repositorio de conocimiento:** `sierraglobalcompany-rgb/CarpiNova-Knowledge`  
**Knowledge objetivo:** `1.0.0`

## 1. Propósito

El primer MVP de CarpiNova-PC será un **Knowledge Explorer educativo** para principiantes absolutos en carpintería.

No será una copia web del PDF, un diseñador de muebles, un CAD, un Furniture Engine, un chatbot ni una plataforma educativa completa. Su función es demostrar que `CarpiNova-Knowledge 1.0.0` puede consumirse de forma útil, simple, trazable y segura desde una interfaz web.

El recorrido esencial es:

> `abrir CarpiNova → buscar → filtrar → abrir una ficha → entender → comprobar procedencia`

Si ese recorrido funciona con rapidez, claridad y sin inventar información técnica, el MVP cumple su propósito.

## 2. Usuario inicial y evolución prevista

El usuario principal del MVP 1 es un **principiante absoluto**, con poco o ningún conocimiento previo de carpintería.

La interfaz debe favorecer lenguaje claro, baja carga cognitiva, explicaciones pedagógicas antes que transcripciones técnicas, navegación sencilla y acceso visible a la procedencia sin obligar al usuario a leerla primero.

Más adelante CarpiNova podrá atender también usuarios aficionados o intermedios. El MVP 1 no implementa perfiles de nivel, rutas adaptativas ni preferencias personales. La ampliación futura debe reutilizar la misma base de conocimiento, no duplicarla.

## 3. Principios no negociables

1. **KISS.** Arquitectura simple, directa y justificable.
2. **Una sola fuente de verdad.** `CarpiNova-Knowledge` sigue siendo la fuente canónica; CarpiNova-PC no mantiene una copia editada manualmente.
3. **Sin arquitectura hipotética.** No se añaden backend, API, base de datos, microservicios, IA, vector DB, graph DB, Docker, event bus, plugin system ni sincronizadores sin necesidad demostrada.
4. **Trazabilidad preservada.** La interfaz nunca oculta o altera silenciosamente el origen de un contenido.
5. **Pedagogía separada de fuente.** `learning_text` se presenta primero cuando existe, pero `source_transcription` sigue disponible como respaldo.
6. **UNRESOLVED > INVENTED.** Los conflictos, vacíos o estados no concluyentes permanecen explícitos.
7. **La aplicación no convierte datos inciertos en instrucciones.** Un dato `CONFLICT`, `REJECTED`, no validado o una regla candidata/revisada no se transforma en una orden técnica de fabricación.
8. **Sin duplicación de conocimiento.** Los bundles generados entran al entorno local de ejecución, no al repositorio público como una copia mantenida manualmente.
9. **Fail closed.** Si el conocimiento esperado no puede validarse, la aplicación no finge funcionar con datos parciales o desconocidos.
10. **Evolución por evidencia.** Las mejoras posteriores se deciden tras probar el MVP y observar necesidades reales.

## 4. Alcance funcional del MVP 1

### Incluye

- aplicación web responsive;
- ejecución inicial solo en el PC Windows del usuario mediante `localhost`;
- React + Vite + TypeScript;
- consumo local de `CarpiNova-Knowledge 1.0.0`;
- preparación reproducible del bundle de Knowledge;
- validación de `manifest.json`, versión y hashes antes del uso;
- buscador por palabras;
- normalización de acentos y mayúsculas/minúsculas;
- filtros por `content_type`;
- exploración por categorías derivadas de `content_type`;
- resultados ordenados mediante lógica simple y determinística;
- ficha de conocimiento individual;
- `learning_text` como vista principal cuando exista;
- procedencia y `source_transcription` accesibles bajo demanda;
- visualización de capítulo, sección y páginas cuando existan;
- comportamiento seguro ante contenido conflictivo o no concluyente;
- diseño visual “Taller moderno”;
- responsive para escritorio, tablet y móvil, aunque la primera ejecución sea local en PC;
- accesibilidad básica: contraste, foco, teclado y HTML semántico;
- pruebas automáticas mínimas;
- pruebas manuales reales de búsqueda.

### No incluye

- IA o chatbot;
- embeddings;
- búsqueda vectorial;
- API propia;
- backend de aplicación;
- base de datos;
- Docker;
- autenticación mientras el sistema sea únicamente `localhost`;
- usuarios, roles o perfiles;
- historial, favoritos o progreso;
- dashboard avanzado;
- PWA;
- aplicación nativa Windows;
- aplicación móvil independiente;
- regeneración automática de ilustraciones;
- visor del PDF original;
- capturas de páginas del libro;
- CAD/3D;
- Furniture Engine;
- optimización de cortes;
- SketchUp;
- administración de contenido desde CarpiNova-PC;
- reglas ejecutables de fabricación.

## 5. Base técnica

La aplicación será una SPA estática construida con React, Vite y TypeScript, con un único router cliente ligero y herramientas de prueba mínimas.

No se añade una librería global de estado. React state y los parámetros de URL son suficientes para el MVP.

No se incorporan Tailwind, Bootstrap, Material UI ni un design system grande. El estilo visual se implementa con CSS propio, pequeño y organizado.

El objetivo es mantener el conjunto de dependencias tan pequeño como sea razonable.

## 6. Arquitectura de alto nivel

```text
CarpiNova-Knowledge 1.0.0
          │
          │ validar + generar bundle
          ▼
script local de preparación
          │
          │ manifest + hashes verificados
          ▼
generated/knowledge/   [ignorado por Git]
          │
          ▼
capa knowledge/ de CarpiNova-PC
          │
          ├── cargar
          ├── validar contrato de consumo
          ├── buscar
          ├── filtrar
          └── obtener ficha
          │
          ▼
React / Vite / TypeScript
          │
          ▼
localhost en navegador
```

La interfaz no lee archivos JSON directamente desde componentes repartidos por la aplicación. Una capa pequeña `knowledge/` funciona como única puerta de entrada al bundle.

Esa capa no es una API ni un “Knowledge Engine”; solo aísla lectura, validación de contrato, búsqueda, filtros y acceso por `content_id`.

## 7. Contrato con CarpiNova-Knowledge 1.0.0

La versión completa de Knowledge produce cuatro artefactos determinísticos:

- `knowledge.bundle.json`;
- `figures.bundle.json`;
- `lessons.bundle.json`;
- `manifest.json`.

El flujo de preparación genera y verifica los cuatro porque el manifiesto los identifica y protege mediante hashes.

En el MVP:

- `knowledge.bundle.json` es la fuente funcional principal;
- `figures.bundle.json` solo se usa si existe un recurso visual consumible de forma segura y explícita;
- `lessons.bundle.json` se prepara y valida, pero **no se presenta todavía en la interfaz**;
- `manifest.json` es el contrato de identidad e integridad del conjunto.

La aplicación espera:

- `knowledge_version = 1.0.0`;
- `book_id = cpnc-2025`;
- `scope = BOOK`;
- fuente canónica SHA-256 `318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c`;
- hashes internos coherentes con los artefactos generados.

Si cualquiera de estas condiciones falla, la preparación o carga falla de forma explícita.

### Bundle generado y repositorio público

`CarpiNova-PC` es público. El bundle completo de Knowledge no se versiona dentro de él.

Los artefactos generados se guardan localmente en `generated/knowledge/`, carpeta ignorada por Git. La preparación toma como entrada el repositorio local de `CarpiNova-Knowledge` y nunca una copia manual editable dentro de CarpiNova-PC.

## 8. Taxonomía y categorías en el MVP

`CarpiNova-Knowledge` contiene taxonomías canónicas, pero el generador actual de Knowledge 1.0.0 distribuye `taxonomy: {}` y `taxonomy_records: 0`.

El MVP no crea una taxonomía paralela para compensarlo.

Las categorías iniciales se derivan de `content_type`. Entre los valores canónicos están `concept`, `definition`, `material`, `hardware`, `furniture_pattern`, `construction_pattern`, `rule`, `formula`, `dimension`, `tolerance`, `procedure`, `warning`, `recommendation`, `example`, `checklist`, `table`, `form`, `reference` y `external_enrichment`.

La interfaz solo muestra como categoría aquellos tipos que tengan al menos un registro distribuido. Puede traducirlos a etiquetas humanas en español, por ejemplo `hardware → Herrajes`; esa traducción es presentación visual, no otra taxonomía.

### Evolución futura

Si las pruebas demuestran que estas categorías son demasiado gruesas, se modifica el exportador de `CarpiNova-Knowledge` para distribuir su taxonomía canónica en una versión posterior. El MVP 1 no anticipa ese cambio.

## 9. Búsqueda

La búsqueda es local, determinística y sin servicios externos.

### Campos indexados

El índice usa únicamente:

- `learning_text`;
- `normalized_text`;
- `tags` cuando existan;
- `content_type`.

`source_transcription` **no se indexa en el MVP 1**. Sigue disponible en la ficha como procedencia, pero no genera resultados que luego no puedan explicarse pedagógicamente.

### Normalización

Para buscar se convierte a minúsculas, se eliminan diferencias de acentos, se normalizan espacios y se tokeniza de forma simple. El texto mostrado conserva su ortografía; la normalización afecta solo al matching.

### Ranking mínimo

El orden es estable y explicable:

1. coincidencia exacta de la frase normalizada en los campos indexados;
2. registros que contienen todos los términos;
3. registros que contienen una parte de los términos;
4. desempate estable por `content_id`.

No hay machine learning, fuzzy matching complejo ni scoring opaco.

### Filtros y exploración

Los filtros operan sobre `content_type`.

Ejemplo:

```text
/buscar?q=bisagra&type=hardware
```

Si existe filtro de tipo pero la consulta `q` está vacía, la vista actúa como explorador de categoría: muestra todos los registros de ese `content_type` ordenados de forma estable por `content_id`.

Si no hay consulta ni filtro, `/buscar` no inventa recomendaciones: invita a buscar o elegir una categoría.

## 10. Navegación

Rutas iniciales:

```text
/
/buscar
/contenido/:contentId
```

No existen rutas separadas para cada categoría.

### `/` — Inicio

Contiene identidad simple de CarpiNova, buscador como acción principal y categorías visibles derivadas de los `content_type` realmente presentes.

No contiene dashboard avanzado.

### `/buscar` — Resultados

La misma vista gestiona búsquedas y filtros. En PC los filtros pueden estar visibles lateralmente; en tamaños pequeños pasan a un panel desplegable.

Cada resultado muestra solo información soportada por Knowledge:

- etiqueta humana de `content_type`;
- capítulo/sección cuando existan;
- fragmento de `learning_text` cuando exista;
- referencia de página cuando esté disponible.

No se inventan títulos que el esquema no proporciona.

### `/contenido/:contentId` — Ficha

Orden:

1. contexto del contenido;
2. explicación principal;
3. metadatos útiles soportados por Knowledge;
4. bloque plegable “Ver fuente”.

La explicación principal usa `learning_text` si no está vacío. Si está vacío, usa `normalized_text` y lo identifica como **Texto normalizado**, no como explicación pedagógica. Si ambos están vacíos, puede mostrar `source_transcription` identificada explícitamente como **Transcripción de la fuente**. Nunca se sintetiza texto para llenar el vacío.

“Ver fuente” puede mostrar `source_transcription`, `pdf_page`, `printed_page` cuando exista, capítulo, sección y los datos de procedencia disponibles en `source`.

## 11. Seguridad semántica y datos técnicos

CarpiNova-PC es consumidor. No decide qué dato técnico es correcto cuando Knowledge no lo ha decidido.

### Mediciones

Los registros separados de `measurements` están vinculados a página y pueden tener estados `EXTRACTED`, `VISUALLY_VERIFIED`, `REVIEWED`, `VALIDATED`, `CONFLICT` o `REJECTED`.

El MVP no asocia automáticamente una medición a una ficha de contenido solo porque compartan página. La proximidad no demuestra relación semántica.

Esos registros no se presentan como instrucciones de la ficha hasta que exista una relación explícita soportada por Knowledge.

Un registro de contenido cuyo `content_type` sea `dimension` puede aparecer en búsqueda como contenido, pero su tipo por sí solo no lo convierte en instrucción validada.

### Reglas

Los `RuleSpec` de Knowledge 1.0.0 pueden ser `CANDIDATE` o `REVIEWED`. El MVP no los presenta como reglas ejecutables de fabricación.

### Conflictos y elementos no resueltos

Todo `CONFLICT`, `UNRESOLVED`, `REJECTED` o equivalente conserva su significado. La interfaz evita lenguaje que haga parecer que un dato conflictivo es una recomendación aceptada. CarpiNova-PC no reconcilia silenciosamente conflictos del libro.

## 12. Figuras e imágenes

El MVP no regenera ilustraciones, no incluye el PDF original y no incluye capturas de sus páginas.

Una figura solo se muestra si Knowledge entrega un recurso visual consumible de forma segura y explícita. Si no existe, la interfaz omite el espacio visual en vez de inventar una imagen o mostrar un placeholder engañoso.

La regeneración futura basada en `FigureSpec` es un proyecto separado y no bloquea el Knowledge Explorer.

## 13. Diseño visual — “Taller moderno”

La interfaz se siente educativa, técnica y limpia, no como un ERP ni como documentación para desarrolladores.

Características:

- fondo predominantemente claro;
- tipografía legible;
- jerarquía visual simple;
- espacio útil generoso;
- acentos discretos inspirados en taller/madera/herramientas;
- tarjetas sencillas para resultados;
- iconografía solo donde aporte comprensión;
- sin carruseles;
- sin animaciones decorativas innecesarias;
- sin menús de tres niveles;
- sin saturación de componentes.

### Responsive

Una única aplicación se adapta a escritorio, tablet y móvil. No existe implementación móvil independiente.

En PC se aprovecha el ancho sin generar líneas de lectura excesivamente largas. En tamaños pequeños el contenido se reorganiza en una columna y los filtros pasan a un control desplegable.

### Branding

El MVP usa una identidad simple y consistente de `CarpiNova`. El branding/logo definitivo queda fuera de alcance.

## 14. Estructura conceptual del código

```text
CarpiNova-PC/
├── src/
│   ├── app/
│   ├── features/
│   │   ├── search/
│   │   └── content/
│   ├── knowledge/
│   ├── components/
│   └── styles/
├── scripts/
│   └── prepare-knowledge
├── tests/
└── generated/
    └── knowledge/
```

`generated/` no se versiona.

Los nombres concretos de archivos pueden ajustarse durante el plan de implementación, pero no se debe convertir esta estructura pequeña en una arquitectura de capas innecesarias.

## 15. Preparación local de Knowledge

Un único flujo de preparación realiza:

```text
validar repositorio Knowledge
        ↓
generar bundle BOOK 1.0.0
        ↓
verificar manifest
        ↓
verificar hashes
        ↓
verificar fuente y versión esperadas
        ↓
copiar artefactos a generated/knowledge/
        ↓
CarpiNova listo para ejecutarse
```

El proceso es reproducible y no depende de editar JSON manualmente.

La aplicación no consulta GitHub en cada búsqueda ni descarga Knowledge dinámicamente durante el uso normal.

## 16. Ejecución inicial

La primera etapa es exclusivamente local en un PC Windows.

Durante desarrollo se usa el servidor de Vite en `localhost`. Para validar el artefacto final se usa el preview local del build de producción.

Mientras el sistema sea solo `localhost`:

- no hay login;
- no hay contraseña compartida;
- no se abre acceso a la red local;
- no se despliega a Internet.

El acceso privado a nivel de hosting se diseña después de validar el MVP local.

## 17. Manejo de errores

La estrategia es `fail closed`.

Son errores bloqueantes, entre otros:

- repositorio Knowledge no disponible durante preparación;
- bundle inexistente;
- `knowledge_version` diferente de `1.0.0`;
- `book_id` inesperado;
- fuente canónica inesperada;
- `manifest.json` inválido;
- hash de artefacto diferente del declarado;
- estructura superior del bundle no reconocida.

Ante un fallo de preparación no se publican artefactos parciales como válidos.

Ante un fallo de carga, la aplicación muestra un mensaje entendible, por ejemplo:

> No se pudo cargar CarpiNova Knowledge 1.0.0. Ejecuta la preparación del conocimiento y vuelve a intentar.

El detalle técnico puede quedar en consola durante desarrollo.

## 18. Pruebas del MVP

### Pruebas automáticas mínimas

Cubren como mínimo:

- validación del manifiesto esperado;
- rechazo de versión incorrecta;
- rechazo de hash incorrecto;
- carga del bundle válido;
- normalización de mayúsculas/minúsculas;
- normalización de acentos;
- búsqueda exacta;
- búsqueda por varios términos;
- orden estable;
- exploración de categoría con `q` vacío;
- filtro por `content_type`;
- ruta de ficha válida;
- ficha inexistente;
- fallback cuando `learning_text` está vacío;
- presentación de procedencia;
- comportamiento seguro ante estados técnicos conflictivos;
- protección para que `generated/` no quede versionado;
- build de producción.

Las pruebas no necesitan servicios externos.

### Pruebas reales de aceptación

Se usan como probes iniciales estos términos reales del dominio:

- `bisagras`;
- `correderas`;
- `MDF`;
- `tapacanto`;
- `gabinete`.

La prueba confirma contra el bundle generado qué términos están efectivamente distribuidos. Si alguno no aparece en el bundle 1.0.0, eso no autoriza a inventar contenido ni a importar la taxonomía manualmente: se documenta el caso y se sustituye ese probe por otro término canónico presente del mismo tipo de contenido. Un término presente en el bundle que el buscador no encuentre sí es un defecto del MVP.

## 19. Criterios de aceptación

El MVP se considera terminado cuando:

1. arranca en el PC Windows local sin infraestructura adicional compleja;
2. la preparación produce y valida Knowledge 1.0.0 de forma reproducible;
3. ningún bundle de Knowledge queda versionado por error en el repositorio público;
4. el buscador encuentra contenido distribuido por palabras;
5. las búsquedas ignoran diferencias de mayúsculas y acentos;
6. los filtros por `content_type` funcionan;
7. una categoría puede explorarse sin consulta textual;
8. los resultados son determinísticos;
9. la ficha presenta `learning_text` primero cuando existe y aplica el fallback explícito cuando no;
10. la procedencia queda disponible y trazable;
11. la aplicación no inventa títulos, relaciones, medidas o reglas;
12. los conflictos no se presentan como instrucciones aceptadas;
13. la interfaz funciona correctamente en escritorio y se adapta a tamaños pequeños;
14. navegación por teclado, estados de foco y contraste básico son funcionales;
15. las pruebas automáticas pasan;
16. el build de producción compila limpio;
17. las pruebas manuales usan términos realmente presentes en el bundle y permiten completar el recorrido principal.

## 20. Evoluciones candidatas después de validar el MVP

Son opciones futuras, no compromisos actuales:

- dashboard con contenido destacado;
- taxonomía avanzada distribuida desde Knowledge;
- subcategorías;
- rutas educativas;
- niveles de usuario;
- historial y favoritos;
- progreso de aprendizaje;
- relaciones explícitas entre contenidos;
- visuales propios/regenerados;
- hosting privado;
- autenticación real;
- búsqueda semántica;
- asistentes de IA;
- módulos de diseño, CAD/3D o Furniture Engine.

Cada una debe justificarse tras pruebas o necesidades reales.

El dashboard es una evolución especialmente deseable, pero no entra hasta verificar que aporta valor más allá del buscador y las categorías.

## 21. Decisiones deliberadamente diferidas

No son bloqueos del MVP:

- proveedor de hosting;
- sistema de autenticación para Internet;
- branding definitivo;
- paquete exacto de router cliente, siempre que siga siendo una única dependencia ligera;
- mecanismo futuro de distribución de taxonomías;
- búsqueda semántica;
- regeneración de figuras;
- soporte para niveles intermedios;
- integración con Designer/Furniture Engine.

Se difieren intencionalmente para evitar arquitectura especulativa.

## 22. Regla de cierre de alcance

Durante la implementación no se añaden funciones por el argumento de “ya que estamos”.

Una necesidad nueva fuera de esta especificación se trata como propuesta posterior, salvo que sea indispensable para cumplir un criterio de aceptación ya aprobado.

El MVP 1 se concentra únicamente en demostrar que `CarpiNova-Knowledge 1.0.0` puede convertirse en una experiencia de consulta educativa, segura, trazable y útil para un principiante absoluto.
