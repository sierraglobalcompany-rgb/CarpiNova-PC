# CarpiNova-PC — Knowledge Explorer + Dashboard educativo + Lección guiada MVP 3

CarpiNova-PC es el consumidor web local de `CarpiNova-Knowledge 1.0.0`. Permite buscar, filtrar y abrir fichas pedagógicas trazables sin duplicar ni reinterpretar el conocimiento canónico, añade un dashboard educativo para orientar a principiantes y consume la primera lección guiada canónica distribuida por Knowledge.

## Alcance actual

- React + Vite + TypeScript.
- Ejecución local mediante `localhost`.
- Dashboard educativo de inicio con **Empieza aquí**, **Aprende paso a paso** y **Explora todo**, reutilizando categorías y lecciones reales del Knowledge.
- Primera lección guiada canónica disponible desde Home y resuelta por `lesson_id`.
- Pasos mostrados en el orden canónico definido por `steps[].order`.
- Contenido asociado a cada paso reutilizado desde los `content_id` canónicos, con acceso a la ficha completa y su procedencia.
- Retorno seguro `lección -> contenido -> lección`, limitado a rutas locales válidas.
- Búsqueda determinística y filtros por `content_type`.
- `learning_text` como explicación principal, con fallback explícito a `normalized_text` y después `source_transcription`.
- Procedencia visible por página/fuente.
- Comportamiento fail-closed si Knowledge falta, si `lessons.bundle.json` no cumple el contrato esperado o si una referencia requerida no existe.

No incluye backend, base de datos, Docker, cuentas, progreso persistente, favoritos, IA, embeddings, búsqueda vectorial, CAD/3D, Furniture Engine, reglas automáticas de fabricación, motor de cursos ni ejecución visual de `figure_ids` o `interaction` (`highlight`, `highlight_measurements`, `identify_parts`, `guided_sequence`).

## Requisitos

- Windows para la aceptación local objetivo del MVP.
- Node.js 22 y npm. CI usa Node 22.
- El repositorio `CarpiNova-Knowledge` disponible localmente.
- Python/`uv` configurados como exige `CarpiNova-Knowledge`, porque el script de preparación ejecuta su validador y su generador canónico.

La disposición local recomendada es:

```text
<carpeta-de-trabajo>/
├── CarpiNova-PC/
└── CarpiNova-Knowledge/
```

Con esa estructura no hace falta indicar la ruta de Knowledge manualmente.

## 1. Instalar dependencias

La resolución de dependencias está fijada en `package-lock.json`. Instala de forma reproducible con:

```bash
npm ci
```

## 2. Preparar Knowledge 1.0.0

Con `CarpiNova-Knowledge` como repositorio hermano:

```bash
npm run knowledge:prepare
```

O indicando explícitamente su ruta:

```bash
npm run knowledge:prepare -- --knowledge-root "C:\ruta\a\CarpiNova-Knowledge"
```

El comando valida Knowledge, genera la distribución BOOK y solo reemplaza `generated/knowledge/` cuando todas las comprobaciones pasan.

El contrato esperado es:

```text
knowledge_version = 1.0.0
book_id = cpnc-2025
scope = BOOK
source_manifest_sha256 = 318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c
```

Además deben existir y coincidir los SHA-256 declarados para:

```text
knowledge.bundle.json
figures.bundle.json
lessons.bundle.json
```

`generated/` es reproducible y está ignorado por Git. No copies ni edites manualmente Knowledge dentro de CarpiNova-PC.

## 3. Ejecutar en desarrollo

```bash
npm run dev
```

Abre la dirección `localhost` que muestre Vite.

Si Knowledge no puede cargarse, la aplicación falla cerrada y muestra:

```text
No se pudo cargar CarpiNova Knowledge 1.0.0. Ejecuta la preparación del conocimiento y vuelve a intentar.
```

Después de corregir/preparar Knowledge basta recargar la página; el MVP no implementa retry remoto, caché obsoleta ni acceso a GitHub en runtime.

## 4. Verificaciones automáticas

```bash
npm ci
npm test
npm run typecheck
npm run build
```

## 5. Preview de producción

```bash
npm run build
npm run preview
```

Repite al menos estos dos flujos completos en preview:

```text
buscar -> filtrar -> abrir ficha -> leer explicación/fallback -> Ver fuente -> comprobar procedencia

Home -> Aprende paso a paso -> abrir lección -> recorrer pasos -> Ver contenido -> comprobar procedencia -> Volver a la lección
```

La lección piloto canónica comprobada para MVP3 es:

```text
LESSON-SLIDES-X-2X-PILOT
Calcular e instalar correderas con X y 2X
```

No se debe hardcodear una copia pedagógica de esa lección dentro de CarpiNova-PC: el título, los pasos y sus relaciones proceden de `lessons.bundle.json` y de los contenidos canónicos referenciados.

## 6. Aceptación manual obligatoria

Contra el bundle real de `CarpiNova-Knowledge 1.0.0`, probar inicialmente:

```text
bisagras
correderas
MDF
tapacanto
gabinete
```

Si uno no existe realmente en la distribución 1.0.0, se registra como ausente y se sustituye por otro término canónico presente de la misma clase general. No se añade taxonomía manual para hacer pasar la prueba.

Para la lección guiada comprobar:

```text
Home
-> Aprende paso a paso
-> Calcular e instalar correderas con X y 2X
-> pasos 1, 2, 3, 4 y 5 en orden
-> Ver contenido
-> Ver fuente / procedencia
-> Volver a la lección
```

También comprobar aproximadamente estos anchos:

```text
1440 px
768 px
390 px
```

Validar que no haya overflow horizontal, que texto/filtros/lección sean utilizables, que los enlaces esenciales estén visibles y que el foco de teclado sea perceptible. MVP3 no debe mostrar UI que finja ejecutar figuras o interacciones todavía no implementadas.

## Gate final antes de declarar MVP terminado

Todos estos pasos deben haber sido ejecutados realmente:

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run knowledge:prepare -- --knowledge-root "<ruta-real-a-CarpiNova-Knowledge>"
git check-ignore generated/knowledge/manifest.json
npm run preview
```

Y deben funcionar contra Knowledge real ambos recorridos:

```text
abrir CarpiNova -> buscar -> filtrar -> abrir una ficha -> entender -> comprobar procedencia

abrir CarpiNova -> abrir lección guiada -> recorrer 5 pasos -> abrir contenido -> comprobar procedencia -> volver a la lección
```

Una suite sintética verde por sí sola **no** certifica el MVP local.
