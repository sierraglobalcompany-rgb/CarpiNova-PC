# CarpiNova-PC — Knowledge Explorer MVP 1

CarpiNova-PC es el consumidor web local de `CarpiNova-Knowledge 1.0.0`. Este MVP permite buscar, filtrar y abrir fichas pedagógicas trazables sin duplicar ni reinterpretar el conocimiento canónico.

## Alcance del MVP

- React + Vite + TypeScript.
- Ejecución local mediante `localhost`.
- Búsqueda determinística y filtros por `content_type`.
- `learning_text` como explicación principal, con fallback explícito a `normalized_text` y después `source_transcription`.
- Procedencia visible por página/fuente.
- Comportamiento fail-closed si Knowledge falta o no cumple el contrato esperado.

No incluye backend, base de datos, Docker, cuentas, IA, embeddings, búsqueda vectorial, dashboard, CAD/3D, Furniture Engine ni reglas automáticas de fabricación.

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

El gate final reproducible del MVP usa:

```bash
npm ci
```

Mientras `package-lock.json` no haya sido materializado y verificado en la aceptación Windows final de esta rama, el desarrollo/CI transitorio usa:

```bash
npm install
```

**No se debe declarar cerrado el MVP ni migrar CI a `npm ci` antes de que el lockfile real quede generado y comprometido.**

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
npm test
npm run typecheck
npm run build
```

Cuando `package-lock.json` quede materializado, el gate limpio completo empieza con:

```bash
npm ci
```

## 5. Preview de producción

```bash
npm run build
npm run preview
```

Repite al menos un flujo completo en preview:

```text
buscar -> filtrar -> abrir ficha -> leer explicación/fallback -> Ver fuente -> comprobar procedencia
```

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

También comprobar aproximadamente estos anchos:

```text
1440 px
768 px
390 px
```

Validar que no haya overflow horizontal, que texto/filtros sean utilizables y que el foco de teclado sea visible.

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

Y debe funcionar contra Knowledge real:

```text
abrir CarpiNova -> buscar -> filtrar -> abrir una ficha -> entender -> comprobar procedencia
```

Una suite sintética verde por sí sola **no** certifica el MVP local.
