# CarpiNova Dashboard MVP2 — aceptación visual local

- **Fecha:** 2026-10-13
- **Entorno:** Microsoft Windows 11 Home Single Language
- **Repositorio:** `sierraglobalcompany-rgb/CarpiNova-PC`
- **Branch observado:** `design/dashboard-mvp2-20261013`
- **PC_SHA_VISUALLY_TESTED:** `00df0c5da5a9db41ab52ab17472fb3d2418b0e83`
- **Knowledge SHA:** `a47119aba3d4711c1ac69f33f7d236d9bc20bb78`

## Alcance y resultado local

Se cerró la observación visual local de Task 3 sobre el producto de la rama indicada, con el bundle canónico de Knowledge preparado localmente. No se modificó código de producto durante esta aceptación. No se encontraron defectos visuales ni funcionales reproducibles; defectos encontrados: **0**; defectos corregidos: **0**.

## Baseline local y Knowledge

En `CarpiNova-PC`, antes del browser gate:

- `npm ci`: PASS; 0 vulnerabilidades reportadas.
- `npm test`: PASS, **43/43** pruebas (8 archivos).
- `npm run typecheck`: PASS.
- `npm run build`: PASS.

Knowledge local comprobado limpio en `main` y en el SHA canónico `a47119aba3d4711c1ac69f33f7d236d9bc20bb78`. Preparación ejecutada con:

```text
npm run knowledge:prepare -- --knowledge-root "C:\Users\felip\Documents\ChatGPT\CarpiNova-Knowledge"
```

Resultado: PASS. Contrato generado y validado:

```text
knowledge_version = 1.0.0
book_id = cpnc-2025
scope = BOOK
source_manifest_sha256 = 318ceb94569608bfe062e3e50c7032edee79febf06102f7eec760769a6dfd90c
```

Los hashes de figuras, conocimiento y lecciones coincidieron con el manifest. `generated/knowledge/manifest.json` está ignorado por Git y `git ls-files generated` no devuelve archivos: el bundle generado no quedó versionado.

## Preview y observación del dashboard

Se observó en el navegador el preview local de producción de Vite en `http://127.0.0.1:4173/`.

### Home

- H1 observado: **Aprende carpintería desde cero**.
- Buscador visible y usable: la consulta `aglomerado`, enviada con el botón **Buscar**, abrió resultados reales en `/buscar?q=aglomerado`.
- **Empieza aquí**, en el orden observado: Materiales → Herrajes → Procedimientos → Sistemas constructivos → Advertencias.
- **Explora todo** visible y utilizable.

### Recorridos de contenido

- **Materiales:** desde Home se abrió `/buscar?type=material` con 17 resultados. Se abrió `CONTENT-CPNC-2025-P0083-001`; se leyó la explicación que conserva la discrepancia de unidades entre p. 83 y p. 84 hasta validación técnica. **Ver fuente** mostró PDF 83, página impresa 61, método visual y estado `VISUALLY_VERIFIED`. Back regresó a `/buscar?type=material`.
- **Herrajes:** desde Home se abrió `/buscar?type=hardware` con 37 resultados. Se abrió `CONTENT-CPNC-2025-P0111-002`; la ficha explicó la bisagra de cazoleta de 35 mm. **Ver fuente** mostró PDF 111, página impresa 89, método visual y estado `VISUALLY_VERIFIED`. Back regresó a `/buscar?type=hardware`.

### Explora todo

Se observaron sus 16 categorías y sus destinos `/buscar?type=...`. Se siguieron los enlaces en el navegador; cada destino quedó activo y mostró resultados con el tipo correspondiente. No hubo enlaces rotos ni tipos vacíos o inventados.

```text
Advertencias             warning
Conceptos                concept
Definiciones             definition
Dimensiones              dimension
Ejemplos                 example
Formularios              form
Fórmulas                 formula
Herrajes                 hardware
Listas de verificación   checklist
Materiales               material
Procedimientos           procedure
Recomendaciones          recommendation
Referencias              reference
Reglas                   rule
Sistemas constructivos   construction_pattern
Tablas                   table
```

Los conteos canónicos observados para las categorías prioritarias fueron: material 17, hardware 37, procedure 87, construction_pattern 15 y warning 4.

## Responsive y teclado

Se observó la interfaz en los tres anchos solicitados. En cada uno el H1 fue legible, el buscador y los controles se pudieron usar, las categorías no se cortaron ni solaparon, los enlaces se leyeron y **Explora todo** se mantuvo utilizable. En móvil, el botón del buscador y las cinco categorías prioritarias se apilaron en una columna; las categorías de **Explora todo** envolvieron en varias filas.

| Viewport observado | `clientWidth` | `scrollWidth` | Inspección visual |
|---:|---:|---:|---|
| 1440 × 900 | 1425 | 1425 | PASS, sin overflow horizontal |
| 768 × 900 | 753 | 753 | PASS, sin overflow horizontal |
| 390 × 844 | 375 | 375 | PASS, sin overflow horizontal |

Smoke de teclado: Tab mostró foco visible en el buscador, el botón **Buscar**, **Materiales** y **Herrajes**. Enter sobre **Herrajes** abrió `/buscar?type=hardware`. Los nombres fueron comprensibles y la acción no dependió solo del color.

## Auditoría de ruido

`git diff --check` pasó. La rama de la funcionalidad añade cambios de HomePage, estilos, sus pruebas y documentos de plan/spec ya aprobados; no añade rutas ni componentes nuevos ni toca manifiestos de dependencias. No introduce backend/DB/auth, IA/RAG/vector DB, taxonomía paralela ni contenido técnico manual. No se modificó `CarpiNova-Knowledge`; el bundle generado permanece ignorado y sin seguimiento.

## Evidencias de CI, separadas de la observación local

1. **CI del PR #3:** run `38357208187`, SUCCESS en el SHA de producto observado `00df0c5da5a9db41ab52ab17472fb3d2418b0e83`. Sus pasos de instalación, 43/43 pruebas, typecheck y build terminaron correctamente.
2. **Windows integration histórica:** run `38357397993`, SUCCESS. El workflow hizo checkout explícito del SHA de producto `00df0c5da5a9db41ab52ab17472fb3d2418b0e83`, completó sus comprobaciones reproducibles, la preparación/verificación del manifest y el smoke del preview con Knowledge real.
3. **Aceptación visual local:** la observación descrita en este documento se ejecutó en Windows 11 con Knowledge canónico y navegador real; constituye la evidencia local de Task 3, separada de ambos runs de CI.

## Estado de cierre

G0–G5 y la aceptación visual local: **PASS**. La verificación fresca local G6 sobre el borrador de esta evidencia también pasó: 43/43 pruebas, typecheck, build y `git diff --check`. El commit de aceptación será docs-only y no cambia el SHA del producto observado. El CI del PR sobre el SHA final y el estado final del PR se cierran después del push; el marcador global queda reservado hasta que todas las compuertas pasen.
