# CarpiNova-PC — Knowledge Explorer MVP 1

**Fecha:** 2026-10-12  
**Estado:** diseño conversacional aprobado; especificación escrita pendiente de revisión del usuario  
**Repositorio:** `sierraglobalcompany-rgb/CarpiNova-PC`  
**Repositorio de conocimiento:** `sierraglobalcompany-rgb/CarpiNova-Knowledge`  
**Knowledge objetivo:** `1.0.0`

## 1. Propósito

El primer MVP de CarpiNova-PC será un **Knowledge Explorer educativo** para principiantes absolutos en carpintería.

Su objetivo no es sustituir el libro con una simple copia del PDF ni convertirse todavía en un diseñador de muebles, CAD, Furniture Engine, chatbot o plataforma educativa completa. Su función es demostrar que `CarpiNova-Knowledge 1.0.0` puede consumirse de forma útil, simple, trazable y segura desde una interfaz web.

El usuario debe poder abrir CarpiNova en su PC, buscar un término de carpintería, filtrar resultados, abrir una ficha, entender la explicación pedagógica y comprobar de dónde proviene la información.

El principio de éxito del MVP es:

> `abrir CarpiNova → buscar → filtrar → abrir una ficha → entender → comprobar procedencia`

Si ese recorrido funciona con rapidez, claridad y sin inventar información técnica, el MVP cumple su propósito.

## 2. Usuario inicial y evolución prevista

### Usuario principal del MVP 1

Principiante absoluto: una persona con poco o ningún conocimiento previo de carpintería.

La interfaz debe favorecer:

- lenguaje claro;
- baja carga cognitiva;
- explicaciones pedagógicas antes que transcripciones técnicas;
- acceso visible a la procedencia sin obligar al usuario a leerla primero;
- navegación sencilla.

### Evolución posterior

Más adelante CarpiNova podrá atender también usuarios aficionados o intermedios, pero el MVP 1 no implementará perfiles de nivel, rutas adaptativas ni preferencias personales.

La ampliación a varios niveles deberá aprovechar la misma base de conocimiento y no duplicarla.

## 3. Principios no negociables

1. **KISS.** Arquitectura simple, directa y justificable.
2. **Una sola fuente de verdad.** `CarpiNova-Knowledge` sigue siendo la fuente canónica; CarpiNova-PC no mantiene una copia editada manualmente.
3. **Sin arquitectura hipotética.** No se añaden backend, API, base de datos, microservicios, IA, vector DB, graph DB, Docker, event bus, plugin system ni sincronizadores sin necesidad demostrada.
4. **Trazabilidad preservada.** La interfaz nunca oculta o altera silenciosamente el origen de un contenido.
5. **Pedagogía separada de fuente.** `learning_text` se presenta primero, pero `source_transcription` sigue disponible como respaldo.
6. **UNRESOLVED > INVENTED.** Los conflictos, vacíos o estados no concluyentes permanecen explícitos.
7. **La aplicación no convierte datos inciertos en instrucciones.** Un dato `CONFLICT`, `REJECTED`, no validado o una regla candidata/revisada no se transforma en una orden técnica de fabricación.
8. **Sin duplicación de conocimiento.** Los bundles generados se incorporan al entorno de ejecución, no al repositorio público como una copia mantenida manualmente.
9. **Fail closed.** Si el conocimiento esperado no puede validarse, la aplicación no finge funcionar con datos parciales o desconocidos.
10. **Evolución por evidencia.** Las mejoras posteriores se deciden tras probar el MVP y observar necesidades reales.

## 4. Alcance funcional del MVP 1

### Incluye

- aplicación web responsive;
- ejecución inicial solo en el PC Windows del usuario mediante `localhost`;
- React + Vite + TypeScript;
- consumo local de `CarpiNova-Knowledge 1.0.0`;
- preparación automática del bundle de Knowledge;
- validación de `manifest.json`, versión y hashes antes del uso;
- buscador por palabras;
- normalización de acentos y mayúsculas/minúsculas;
- filtros por `content_type`;
- exploración por categorías derivadas de `content_type`;
- resultados ordenados mediante lógica simple y determinística;
- ficha de conocimiento individual;
- `learning_text` como vista principal;
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

La aplicación será una SPA estática construida con:

- React;
- Vite;
- TypeScript;
- un único router cliente ligero;
- herramientas de prueba mínimas.

No se añadirá una librería global de estado en el MVP. React state y los parámetros de URL serán suficientes.

No se incorporarán Tailwind, Bootstrap, Material UI ni un design system grande. El estilo visual se implementará con CSS propio, pequeño y organizado.

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

La interfaz no leerá directamente archivos JSON desde componentes distribuidos por toda la aplicación. Habrá una pequeña capa de consumo `knowledge/` que funcione como única puerta de entrada al bundle.

Esta capa no será una API ni un “Knowledge Engine”. Su responsabilidad será únicamente aislar la lectura del bundle de la interfaz.

## 7. Contrato con CarpiNova-Knowledge 1.0.0

La versión completa de Knowledge produce cuatro artefactos determinísticos:

- `knowledge.bundle.json`;
- `figures.bundle.json`;
- `lessons.bundle.json`;
- `manifest.json`.

Para el MVP, `knowledge.bundle.json` es la fuente principal de páginas, contenido, mediciones y reglas. Los otros bundles solo se consumirán donde tengan una utilidad real soportada por el contenido existente.

La aplicación espera:

- `knowledge_version = 1.0.0`;
- `book_id = cpnc-2025`;
- `scope = BOOK` en el manifiesto del bundle completo;
- la fuente canónica correspondiente al SHA-256:
  `318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c`;
- hashes internos coherentes con los artefactos generados.

Si cualquiera de estas condiciones falla, la preparación o carga debe fallar de forma explícita.

### Bundle generado y repositorio público

`CarpiNova-PC` es un repositorio público. El bundle completo de Knowledge no debe quedar versionado dentro de él.

Por tanto:

- los artefactos generados se almacenan en una carpeta local como `generated/knowledge/`;
- esa carpeta debe estar ignorada por Git;
- la aplicación se prepara desde el repositorio local de `CarpiNova-Knowledge`;
- no se mantiene una copia manual ni editable del conocimiento dentro de CarpiNova-PC.

## 8. Taxonomía y categorías en el MVP

`CarpiNova-Knowledge` contiene archivos canónicos de taxonomía, pero el generador actual de Knowledge 1.0.0 distribuye `taxonomy: {}` y `taxonomy_records: 0`.

El MVP no debe construir una taxonomía paralela para compensar esto.

Las categorías iniciales se derivarán de `content_type`, cuyos valores canónicos incluyen:

- `concept`;
- `definition`;
- `material`;
- `hardware`;
- `furniture_pattern`;
- `construction_pattern`;
- `rule`;
- `formula`;
- `dimension`;
- `tolerance`;
- `procedure`;
- `warning`;
- `recommendation`;
- `example`;
- `checklist`;
- `table`;
- `form`;
- `reference`;
- `external_enrichment`.

La interfaz puede traducir esos valores a etiquetas humanas en español, por ejemplo:

`hardware → Herrajes`

Eso es solo presentación visual; no constituye otra taxonomía.

### Evolución futura de taxonomía

Si las pruebas demuestran que las categorías gruesas son insuficientes, se modificará el exportador de `CarpiNova-Knowledge` para distribuir su taxonomía canónica y una nueva versión de Knowledge podrá añadir subcategorías reales.

No se anticipa ese trabajo en el MVP 1.

## 9. Búsqueda

La búsqueda será local, determinística y sin servicios externos.

### Campos indexados

El índice de búsqueda usará únicamente campos presentes en los registros de contenido:

- `learning_text`;
- `normalized_text`;
- `tags` cuando existan;
- `content_type`.

`source_transcription` no será el campo principal de ranking para evitar que ruido editorial de la fuente desplace contenido pedagógico más útil.

### Normalización

Antes de comparar consultas y contenido:

- se pasa a minúsculas;
- se eliminan diferencias de acentos para el matching;
- se normalizan espacios;
- se tokeniza de forma simple.

El texto mostrado conserva su ortografía original; la normalización solo se usa para buscar.

### Ranking mínimo

El orden será estable y explicable:

1. coincidencia exacta de la frase normalizada;
2. registros que contienen todos los términos de la consulta;
3. registros que contienen una parte de los términos;
4. desempate estable por `content_id`.

No se usará aprendizaje automático, fuzzy matching complejo ni scoring opaco en el MVP.

### Filtros

Los filtros iniciales operan sobre `content_type`.

La URL conserva la búsqueda y los filtros, por ejemplo:

```text
/buscar?q=bisagra&type=hardware
```

Esto permite recargar, volver atrás o compartir localmente una ruta sin añadir un store global.

## 10. Navegación

Rutas iniciales:

```text
/
/buscar
/contenido/:contentId
```

No se crearán rutas separadas para cada categoría.

### `/` — Inicio

Contiene:

- identidad simple de CarpiNova;
- buscador como acción principal;
- categorías visibles derivadas de `content_type`.

No tendrá dashboard avanzado en el MVP.

### `/buscar` — Resultados

La misma vista gestiona:

- búsquedas de texto;
- filtros por categoría.

En PC los filtros pueden estar visibles lateralmente. En tamaños pequeños pasan a un panel desplegable.

Cada resultado debe mostrar solo información soportada por Knowledge:

- etiqueta humana de `content_type`;
- capítulo/sección cuando existan;
- fragmento de `learning_text`;
- referencia de página cuando esté disponible.

No se inventarán títulos que el esquema no proporciona.

### `/contenido/:contentId` — Ficha

Orden recomendado:

1. contexto del contenido;
2. `learning_text` como “Explicación sencilla”;
3. metadatos útiles soportados por Knowledge;
4. bloque plegable “Ver fuente”.

El bloque “Ver fuente” puede mostrar:

- `source_transcription`;
- `pdf_page`;
- `printed_page` cuando exista;
- capítulo;
- sección;
- datos de procedencia disponibles en `source`.

`normalized_text` puede estar disponible como información secundaria, pero no se presenta como otra experiencia principal.

## 11. Seguridad semántica y datos técnicos

CarpiNova-PC es un consumidor. No decide qué dato técnico es correcto cuando Knowledge no lo ha decidido.

### Mediciones

Los registros de `measurements` están vinculados a página y pueden tener estados como:

- `EXTRACTED`;
- `VISUALLY_VERIFIED`;
- `REVIEWED`;
- `VALIDATED`;
- `CONFLICT`;
- `REJECTED`.

El MVP no asociará automáticamente una medición a una ficha de contenido solo porque ambos compartan página.

Esa proximidad no demuestra relación semántica.

Los registros separados de `measurements` no se presentarán como instrucciones de la ficha hasta que exista una relación explícita soportada por Knowledge.

Un registro de contenido cuyo `content_type` sea `dimension` puede aparecer en búsqueda como contenido, pero su tipo por sí solo no lo convierte en una instrucción validada.

### Reglas

Los `RuleSpec` de Knowledge 1.0.0 pueden estar en estados `CANDIDATE` o `REVIEWED`.

El MVP no los presentará como reglas ejecutables de fabricación.

### Conflictos y elementos no resueltos

Todo `CONFLICT`, `UNRESOLVED`, `REJECTED` o equivalente conserva su significado.

La interfaz debe evitar cualquier lenguaje que haga parecer que un dato conflictivo es una recomendación aceptada.

CarpiNova-PC no reconcilia silenciosamente conflictos del libro.

## 12. Figuras e imágenes

El MVP no regenera ilustraciones.

No incluye el PDF original ni capturas de sus páginas.

Una figura solo se mostrará si Knowledge entrega un recurso visual consumible de forma segura y explícita. Si no existe ese recurso, la interfaz omite el espacio visual en vez de inventar una imagen o mostrar un placeholder engañoso.

La regeneración futura basada en `FigureSpec` será un proyecto separado y no bloquea el Knowledge Explorer.

## 13. Diseño visual — “Taller moderno”

La interfaz debe sentirse educativa, técnica y limpia, pero no como un ERP ni como documentación para desarrolladores.

Características:

- fondo predominantemente claro;
- tipografía legible;
- jerarquía visual simple;
- mucho espacio útil;
- acentos discretos inspirados en taller/madera/herramientas;
- tarjetas sencillas para resultados;
- iconografía solo donde aporte comprensión;
- sin carruseles;
- sin animaciones decorativas innecesarias;
- sin menús de tres niveles;
- sin saturación de componentes.

### Responsive

La misma aplicación se adapta a escritorio, tablet y móvil.

No existe una implementación móvil independiente.

En PC se aprovecha el ancho disponible sin crear líneas de lectura excesivamente largas. En tamaños pequeños el contenido se reorganiza en una columna y los filtros pasan a un control desplegable.

### Branding

El MVP puede mostrar una identidad simple y consistente de `CarpiNova`, pero el proyecto de branding/logo definitivo queda fuera del alcance funcional.

## 14. Estructura conceptual del código

La estructura objetivo es pequeña y orientativa:

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

La implementación puede ajustar nombres de archivos concretos, pero no debe convertir esta estructura pequeña en una arquitectura de capas innecesarias.

## 15. Preparación local de Knowledge

Un único flujo de preparación deberá realizar:

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

El proceso debe ser reproducible y no depender de editar JSON manualmente.

La aplicación no consultará GitHub en cada búsqueda ni descargará Knowledge dinámicamente durante el uso normal.

## 16. Ejecución inicial

La primera etapa será exclusivamente local en un PC Windows.

Durante desarrollo se usará el servidor de Vite en `localhost`.

Para validar el build final se usará el modo de preview local del artefacto de producción.

Mientras el sistema sea solo `localhost`:

- no se implementa login;
- no se implementa contraseña compartida;
- no se abre acceso a la red local;
- no se despliega a Internet.

El acceso privado a nivel de hosting se diseñará cuando el MVP local ya esté probado.

## 17. Manejo de errores

La estrategia es `fail closed`.

Errores bloqueantes incluyen:

- repositorio Knowledge no disponible durante preparación;
- bundle inexistente;
- `knowledge_version` diferente de `1.0.0`;
- `book_id` inesperado;
- fuente canónica inesperada;
- `manifest.json` inválido;
- hash de artefacto diferente del declarado;
- estructura de datos no reconocida.

Ante un fallo de preparación no se generan artefactos parciales como si fueran válidos.

Ante un fallo de carga en la aplicación se muestra un mensaje entendible, por ejemplo:

> No se pudo cargar CarpiNova Knowledge 1.0.0. Ejecuta la preparación del conocimiento y vuelve a intentar.

El detalle técnico puede quedar en consola durante desarrollo.

## 18. Pruebas del MVP

### Pruebas automáticas mínimas

Deben cubrir como mínimo:

- validación del manifiesto esperado;
- rechazo de versión incorrecta;
- rechazo de hash incorrecto;
- carga del bundle válido;
- normalización de mayúsculas/minúsculas;
- normalización de acentos;
- búsqueda exacta;
- búsqueda por varios términos;
- orden estable;
- filtro por `content_type`;
- ruta de ficha válida;
- ficha inexistente;
- presentación de procedencia;
- comportamiento seguro ante estados técnicos conflictivos;
- build de producción.

Las pruebas no deben necesitar servicios externos.

### Pruebas reales de aceptación

Antes de aprobar el MVP se realizarán búsquedas manuales con términos reales, al menos:

- `bisagras`;
- `correderas`;
- `MDF`;
- `tapacanto`;
- `gabinete`.

El objetivo no es que esos sean los únicos términos válidos, sino comprobar materiales, herrajes y procedimientos existentes en Knowledge.

## 19. Criterios de aceptación

El MVP se considera terminado cuando:

1. arranca en el PC Windows local sin infraestructura adicional compleja;
2. el flujo de preparación produce y valida Knowledge 1.0.0 de forma reproducible;
3. ningún bundle de Knowledge queda comprometido por error en el repositorio público;
4. el buscador encuentra contenido útil por palabras;
5. las búsquedas ignoran diferencias de mayúsculas y acentos;
6. los filtros por `content_type` funcionan;
7. los resultados son determinísticos;
8. la ficha presenta primero `learning_text`;
9. la procedencia queda disponible y trazable;
10. la aplicación no inventa títulos, relaciones, medidas o reglas;
11. los conflictos no se presentan como instrucciones aceptadas;
12. la interfaz funciona correctamente en escritorio y se adapta a tamaños pequeños;
13. navegación por teclado, estados de foco y contraste básico son funcionales;
14. las pruebas automáticas pasan;
15. el build de producción compila limpio;
16. las cinco búsquedas manuales de aceptación pueden completarse satisfactoriamente.

## 20. Evoluciones candidatas después de validar el MVP

Las siguientes mejoras quedan registradas como opciones, no como compromisos de implementación:

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

Cada una deberá justificarse tras pruebas o necesidades reales.

El dashboard es una evolución especialmente deseable, pero no se incorpora hasta verificar que aporta valor más allá del buscador y las categorías.

## 21. Decisiones deliberadamente diferidas

No son bloqueos del MVP y no requieren decisión antes de implementarlo:

- proveedor de hosting;
- sistema de autenticación para Internet;
- branding definitivo;
- paquete exacto de router cliente, siempre que siga siendo una única dependencia ligera;
- mecanismo futuro de distribución de taxonomías;
- búsqueda semántica;
- regeneración de figuras;
- soporte para niveles intermedios;
- integración con Designer/Furniture Engine.

Estas decisiones se difieren intencionalmente para evitar arquitectura especulativa.

## 22. Regla de cierre de alcance

Durante la implementación del MVP no se añadirán funciones por el argumento de “ya que estamos”.

Una necesidad nueva que no esté descrita aquí se trata como una propuesta posterior, salvo que sea indispensable para cumplir un criterio de aceptación ya aprobado.

El MVP 1 se concentra únicamente en demostrar que `CarpiNova-Knowledge 1.0.0` puede convertirse en una experiencia de consulta educativa, segura, trazable y útil para un principiante absoluto.
