# CarpiNova Knowledge — Diseño F0/F1

**Fecha:** 2026-10-09  
**Estado:** diseño para revisión  
**Repositorio temporal de la especificación:** `CarpiNova-PC`  
**Repositorio objetivo de implementación:** `CarpiNova-Knowledge` (privado, a crear solo después de aprobar esta especificación)

## 1. Propósito

CarpiNova necesita una única fuente maestra de conocimiento reutilizable por:

- CarpiNova Designer (web/Windows),
- CarpiNova Cell,
- el futuro Furniture Engine,
- el futuro conector de SketchUp,
- módulos de tutorial,
- futuros asistentes de IA opcionales.

La primera implementación NO consiste en entrenar un modelo ni en copiar el PDF a texto. Consiste en transformar el libro **Carpintería para no Carpinter@s — versión 2025** en conocimiento estructurado, trazable, verificable y reutilizable.

El resultado debe conservar siempre qué decía el libro, en qué página estaba, qué elementos gráficos acompañaban esa información y qué parte fue corregida o reescrita pedagógicamente.

## 2. Principios no negociables

1. **Una sola fuente de verdad.** El conocimiento no se copia manualmente entre `CarpiNova-PC` y `CarpiNova-cell`.
2. **Trazabilidad total.** Conceptos, medidas, reglas, figuras y procedimientos conservan su fuente exacta.
3. **Fuente y mejora separadas.** Nunca se reemplaza silenciosamente el texto del libro por una interpretación mejorada.
4. **Números técnicos con revisión visual.** Ninguna medida, calibre, diámetro, cantidad, ángulo, holgura o fórmula pasa a `VALIDATED` solo por OCR/extracción automática.
5. **Figuras estructuradas.** Los dibujos técnicos se describen mediante `FigureSpec`; no quedan reducidos a una imagen raster o a un prompt libre.
6. **Reglas determinísticas.** Lo que más adelante afecte medidas o fabricación debe terminar como regla estructurada y comprobable, no como prosa ambigua.
7. **Conocimiento reutilizable.** El mismo dato debe poder alimentar Designer, Cell, tutoriales, despiece y futuros agentes.
8. **Conservación de procedencia.** La consolidación de conceptos nunca elimina las referencias a las páginas originales.
9. **Sin enriquecimiento silencioso.** Si en el futuro se añade conocimiento externo al libro, debe quedar identificado como `external_enrichment` con su propia fuente.
10. **KISS.** Se empieza con un esquema pequeño y extensible; no se diseña desde F0 una ontología excesivamente compleja.

## 3. Alcance de F0/F1

### Incluye

- auditoría completa de la estructura del libro;
- mapa de páginas físicas del PDF y páginas impresas;
- índice técnico y temático;
- taxonomía inicial;
- esquemas JSON;
- extracción fiel de texto;
- normalización ortográfica/editorial;
- redacción pedagógica simplificada;
- identificación de conceptos, materiales, herrajes, sistemas y muebles;
- extracción de medidas, fórmulas, advertencias, ejemplos y procedimientos;
- identificación y descripción detallada de figuras;
- reglas candidatas;
- conflictos entre fuentes/páginas;
- piloto técnico;
- extracción del libro por lotes auditables;
- QA y reportes de cobertura.

### No incluye todavía

- interfaz 3D de CarpiNova Designer;
- motor paramétrico de muebles;
- optimización de corte;
- integración con SketchUp;
- aplicación móvil completa;
- entrenamiento/fine-tuning de una IA;
- generación automática definitiva de ilustraciones;
- reglas ejecutables de fabricación en producción.

F0/F1 prepara esos trabajos posteriores.

## 4. Repositorio maestro

Se propone crear después de aprobar esta especificación:

`sierraglobalcompany-rgb/CarpiNova-Knowledge`

Debe iniciar como **privado**. El libro fuente y sus imágenes pueden contener contenido sujeto a derechos de autor o materiales de terceros; por ello no se publicará automáticamente el PDF ni se asumirán derechos de redistribución.

`CarpiNova-Knowledge` será la fuente canónica. Las aplicaciones consumirán versiones publicadas del conocimiento; no mantendrán copias editadas manualmente.

### Distribución prevista

```text
CarpiNova-Knowledge
       │
       ├── source + schemas + normalized knowledge
       │
       └── dist / releases versionadas
              ├── Designer
              └── Cell
```

Versionado semántico:

- `0.x`: esquema y contenido aún evolutivos;
- `1.0`: primera base revisada con cobertura completa del libro y conflictos/documentos pendientes explícitamente reportados;
- posteriores versiones incrementan contenido, reglas o correcciones.

## 5. Estructura del repositorio

```text
CarpiNova-Knowledge/
├── README.md
├── docs/
│   ├── methodology.md
│   ├── editorial-policy.md
│   ├── visual-spec-policy.md
│   └── validation-policy.md
├── schemas/
│   ├── source.schema.json
│   ├── page.schema.json
│   ├── content.schema.json
│   ├── figure.schema.json
│   ├── measurement.schema.json
│   ├── rule.schema.json
│   ├── concept.schema.json
│   ├── lesson.schema.json
│   └── batch.schema.json
├── books/
│   └── cpnc-2025/
│       ├── manifest.json
│       ├── page-map.json
│       ├── index.json
│       ├── batches/
│       └── pages/
│           ├── pdf-0001/
│           │   ├── page.json
│           │   ├── source.md
│           │   ├── normalized.md
│           │   ├── learning.md
│           │   ├── content.json
│           │   ├── measurements.json
│           │   ├── rules.json
│           │   └── figures/
│           │       ├── fig-001.json
│           │       └── ...
│           └── ...
├── taxonomy/
│   ├── materials.json
│   ├── hardware.json
│   ├── furniture.json
│   ├── construction-systems.json
│   ├── procedures.json
│   └── glossary.json
├── concepts/
├── figures/
│   └── consolidated/
├── rules/
│   ├── candidates/
│   ├── reviewed/
│   ├── validated/
│   └── conflicts/
├── lessons/
├── audits/
├── tests/
└── dist/
```

No se guardarán imágenes pesadas duplicadas sin necesidad. Las referencias visuales se conservarán mediante localizadores de página/figura y, cuando legal y técnicamente proceda, assets derivados específicos.

## 6. Identidad y localización de páginas

Cada página debe distinguir como mínimo:

```json
{
  "book_id": "cpnc-2025",
  "pdf_page": 94,
  "printed_page": 91,
  "printed_label": "91",
  "chapter": "Herrajes",
  "section": "Bisagras y correderas"
}
```

`pdf_page` es la posición física 1-based dentro del archivo y es el identificador estable de la página. `printed_page` es la numeración impresa visible cuando sea numérica. `printed_label` conserva etiquetas no numéricas si existieran. Para portadas, separadores u otras páginas sin número impreso, `printed_page` será `null`.

Nunca se asume que `pdf_page` y `printed_page` son iguales.

La F0.1 debe construir `page-map.json` antes de procesar masivamente el libro.

## 7. Tres capas de texto

Cada contenido textual conserva tres representaciones separadas.

### 7.1 `source_transcription`

Transcripción fiel del contenido de la fuente. Se corrigen solo errores técnicos de extracción/OCR evidentes cuando exista evidencia visual, dejando registro del ajuste.

### 7.2 `normalized_text`

Versión editorial del mismo contenido:

- ortografía;
- puntuación;
- separación de párrafos;
- normalización de símbolos;
- unidades consistentes;
- nombres terminológicos consistentes cuando no cambia el significado.

No añade conocimiento nuevo.

### 7.3 `learning_text`

Versión diseñada para principiantes:

- lenguaje simple;
- frases más cortas;
- explicación de términos;
- secuencia pedagógica;
- ejemplos derivados de la misma fuente cuando sean pertinentes;
- separación de ideas sobrecargadas;
- advertencias claras;
- explicación de “qué”, “para qué” y “por qué” cuando la fuente lo permita.

Cada bloque de `learning_text` debe declarar los `content_id` de los que deriva. Si para aclarar un vacío técnico hiciera falta una fuente externa, esa ampliación no se integra silenciosamente: se registra aparte como `external_enrichment`.

## 8. Modelo de contenido

Los fragmentos extraídos se etiquetan con uno o más tipos:

- `CONCEPT`
- `DEFINITION`
- `MATERIAL`
- `HARDWARE`
- `FURNITURE_PATTERN`
- `CONSTRUCTION_PATTERN`
- `RULE`
- `FORMULA`
- `DIMENSION`
- `TOLERANCE`
- `PROCEDURE`
- `WARNING`
- `RECOMMENDATION`
- `EXAMPLE`
- `CHECKLIST`
- `TABLE`
- `FORM`
- `REFERENCE`

Un mismo fragmento puede ser, por ejemplo, `DIMENSION + RULE`.

## 9. SourceSpec y trazabilidad

Todo objeto estructurado debe poder apuntar a su evidencia:

```json
{
  "source": {
    "book_id": "cpnc-2025",
    "pdf_page": 94,
    "printed_page": 91,
    "region": {
      "x": 0.07,
      "y": 0.12,
      "width": 0.86,
      "height": 0.31
    }
  },
  "extraction": {
    "method": "text|visual|ocr|manual",
    "confidence": 0.98,
    "review_status": "EXTRACTED"
  }
}
```

Las coordenadas se normalizan de 0 a 1 respecto a la página para que sobrevivan a cambios de resolución.

## 10. FigureSpec

Los dibujos y diagramas son datos de primera clase.

### 10.1 Objetivo

`FigureSpec` debe describir una figura con suficiente detalle para que posteriormente se pueda:

- reconstruir como SVG;
- convertir a una ilustración moderna;
- llevar a una escena 3D;
- animar en Cell;
- usar en un tutorial web;
- generar texto alternativo accesible;
- comprobar qué medidas/relaciones muestra.

No se pretende describir cada píxel. Se pretende conservar **semántica, geometría relevante, relaciones, cotas, composición y secuencia pedagógica**.

No se garantiza que toda figura sea regenerable automáticamente desde F1, pero su especificación debe conservar la información necesaria para poder planificar una reconstrucción sin volver a interpretar semánticamente desde cero la página original.

### 10.2 Tipos

- `technical_diagram`
- `dimensioned_drawing`
- `exploded_view`
- `process_diagram`
- `assembly_sequence`
- `illustration`
- `photo`
- `table`
- `form`
- `3d_reference`
- `mixed`

### 10.3 Identidad y campos mínimos

Los IDs de figuras se basan en `pdf_page`, no en la numeración impresa:

`FIG-CPNC-2025-PDF0094-001`

Ejemplo:

```json
{
  "figure_id": "FIG-CPNC-2025-PDF0094-001",
  "type": "technical_diagram",
  "purpose": "Mostrar la instalación de una corredera telescópica",
  "source": {},
  "bounding_box": {},
  "entities": [],
  "relationships": [],
  "measurements": [],
  "annotations": [],
  "layers": [],
  "camera": {},
  "visual_style": {},
  "educational_sequence": [],
  "reconstruction": {},
  "accessibility": {},
  "review": {}
}
```

### 10.4 Entidades

Cada elemento relevante de una figura tendrá identidad:

```json
{
  "id": "cabinet_side",
  "type": "panel",
  "label": "Lateral del mueble",
  "geometry": {
    "primitive": "box",
    "dimensions": {}
  },
  "transform": {
    "position": {},
    "rotation": {},
    "scale": {}
  },
  "material": {},
  "visibility": "visible"
}
```

Si la geometría exacta no puede inferirse de la fuente, se marca como `unknown` o `approximate`; nunca se inventa precisión.

### 10.5 Relaciones

Ejemplos:

- `mounted_on`
- `inside`
- `attached_to`
- `parallel_to`
- `perpendicular_to`
- `aligned_with`
- `slides_along`
- `rotates_about`
- `supports`
- `fastened_with`

### 10.6 Medidas y cotas

Cada cota debe registrar:

- valor;
- unidad;
- elemento origen;
- elemento destino o anclajes;
- orientación;
- propósito;
- fuente exacta;
- confianza;
- estado de validación.

Los valores numéricos no se validan automáticamente.

### 10.7 Estrategia de reconstrucción

Cada figura declara su mejor destino:

```json
{
  "preferred_renderer": "svg|html|3d|image|hybrid",
  "deterministic_required": true,
  "generative_image_allowed": false
}
```

Regla inicial:

- cotas, planos y esquemas funcionales → determinísticos;
- tablas → datos/HTML;
- formularios → datos/componentes UI;
- secuencias → SVG/3D/animación;
- ilustraciones conceptuales → pueden admitir generación gráfica;
- fotos → se tratan como referencias visuales, no como geometría inventada.

## 11. EducationalSequence dentro de FigureSpec

Para reutilizar una figura en Cell o tutorial web se registra una secuencia didáctica opcional:

```json
{
  "educational_sequence": [
    {"step": 1, "show": ["cabinet_side"]},
    {"step": 2, "show": ["drawer_slide"]},
    {"step": 3, "animate": "drawer_slide.slides_along"},
    {"step": 4, "highlight_measurement": "M-001"}
  ]
}
```

F1 solo documenta la secuencia; la reproducción interactiva pertenece a fases posteriores.

## 12. MeasurementSpec

Toda medida técnica se extrae como objeto independiente:

```json
{
  "measurement_id": "MEAS-PDF0094-001",
  "kind": "diameter",
  "value": 35,
  "unit": "mm",
  "applies_to": "hinge.cup",
  "source": {},
  "confidence": 0.99,
  "status": "EXTRACTED"
}
```

Estados:

- `EXTRACTED`
- `VISUALLY_VERIFIED`
- `REVIEWED`
- `VALIDATED`
- `CONFLICT`
- `REJECTED`

Solo información `VALIDATED` podrá alimentar reglas de fabricación posteriormente.

## 13. RuleSpec

Una regla candidata se separa de la prosa:

```json
{
  "rule_id": "RULE-HINGE-CUP-DIAMETER",
  "category": "hardware",
  "subject": "hinge.cup",
  "predicate": "diameter",
  "value": 35,
  "unit": "mm",
  "applicability": {},
  "exceptions": [],
  "sources": [],
  "status": "CANDIDATE"
}
```

Estados:

`CANDIDATE → REVIEWED → VALIDATED → EXECUTABLE`

F0/F1 no obliga a convertir todas las reglas a `EXECUTABLE`.

## 14. Conflictos

Si dos páginas contienen datos aparentemente incompatibles, no se elige uno silenciosamente.

```json
{
  "status": "CONFLICT",
  "subject": "...",
  "claims": [
    {"value": "...", "source": {}},
    {"value": "...", "source": {}}
  ]
}
```

El conflicto entra en `rules/conflicts/` para revisión posterior.

## 15. Conceptos consolidados

La extracción ocurre por página, pero el conocimiento final se consolida por concepto.

Ejemplo conceptual:

```json
{
  "concept_id": "drawer_slide",
  "sources": [
    {"printed_page": 49},
    {"printed_page": 91},
    {"printed_page": 96}
  ]
}
```

Ninguna fuente se elimina aunque varias expliquen el mismo concepto.

## 16. PageSpec

Cada página debe declarar qué contiene:

```json
{
  "pdf_page": 94,
  "printed_page": 91,
  "topics": ["bisagras", "correderas"],
  "contains": {
    "text": true,
    "figures": true,
    "tables": false,
    "measurements": true,
    "rules": true,
    "forms": false
  },
  "complexity": {
    "level": "high",
    "score": 8
  }
}
```

## 17. Procesamiento por lotes

No se procesará el libro completo en una sola operación.

### Estrategia adaptativa

La unidad real es la **complejidad**, no un número rígido de páginas.

- lote ligero: hasta 8 páginas;
- lote normal: 5–6 páginas;
- lote técnico denso: 3–4 páginas;
- una página excepcionalmente compleja puede constituir un lote individual.

Objetivo medio inicial: **6 páginas por lote**.

Cada lote debe cerrarse completamente antes de iniciar el siguiente: extracción, figuras, números, reescritura, validación de esquemas y reporte.

## 18. Índice de complejidad

Puntuación propuesta por página:

- texto continuo: +1;
- tabla: +2;
- figura simple: +1;
- figura técnica con cotas: +3;
- varias figuras técnicas: +4;
- formulario: +2;
- lista de corte/despiece: +3;
- múltiples medidas/fórmulas: +3;
- OCR difícil: +2.

Un lote debería mantenerse aproximadamente en 18–24 puntos de complejidad.

El piloto validará o ajustará estos umbrales.

## 19. Fases de implementación F0/F1

### F0.0 — Repositorio y políticas

Después de aprobar esta especificación:

1. crear `CarpiNova-Knowledge` privado;
2. añadir README y estructura mínima;
3. definir política editorial y de fuentes;
4. prohibir subida automática del PDF fuente al repositorio;
5. configurar validación básica de JSON Schema Draft 2020-12.

**Salida:** repositorio listo para conocimiento.

### F0.1 — Auditoría global del libro

Sin extraer aún todo el contenido:

1. obtener cantidad física de páginas;
2. detectar numeración impresa;
3. construir mapa PDF ↔ página impresa;
4. identificar capítulos/secciones;
5. clasificar cada página por tipo y complejidad;
6. marcar páginas con figuras, tablas, listas de corte, formularios y manuales;
7. generar `manifest.json`, `page-map.json` e `index.json`.

**Salida:** mapa completo antes de la extracción profunda.

### F0.2 — Schemas v0.1

Implementar y probar:

- SourceSpec;
- PageSpec;
- ContentSpec;
- MeasurementSpec;
- FigureSpec;
- RuleSpec;
- ConceptSpec;
- LessonSpec mínimo;
- BatchSpec.

Añadir fixtures de ejemplo y validadores.

**Salida:** contrato de datos inicial.

### F0.3 — Piloto técnico

No comenzar por introducciones fáciles. El piloto debe contener texto, figuras, medidas y reglas.

Rango candidato: alrededor de las páginas impresas **88–95**, sujeto a confirmación de `page-map.json`.

La página impresa 91 del libro contiene información de instalación de bisagra de cazoleta, perforación de 35 mm, ubicación, cantidad de bisagras, correderas y clasificación de cierre; por tanto es un buen ejemplo de contenido mixto para estresar el esquema.

Procesar aproximadamente 4–8 páginas según complejidad real.

**Criterio de aprobación del piloto:** los archivos estructurados deben permitir entender la página, saber de dónde salió cada dato y tener suficiente descripción de figuras para planificar una reconstrucción sin volver a descubrir semánticamente la página desde cero.

### F0.4 — Revisión de schemas

Después del piloto:

- detectar campos faltantes;
- eliminar campos sin utilidad real;
- revisar consistencia terminológica;
- revisar suficiente detalle de FigureSpec;
- revisar trazabilidad numérica;
- congelar `schema v0.2` para extracción masiva.

### F1.0 — Extracción sistemática

Procesar el libro por lotes adaptativos hasta cubrir el **100 % de las páginas físicas del PDF**, incluidas portadas, separadores y anexos. Las páginas sin contenido técnico se clasifican, pero no requieren contenido inventado.

Cada lote produce:

- páginas estructuradas;
- source/normalized/learning text cuando aplique;
- figuras;
- measurements;
- rule candidates;
- conceptos;
- QA report;
- registro de conflictos.

### F1.1 — Auditoría periódica

Cada aproximadamente 5 lotes o 30 páginas procesadas:

- consolidar términos duplicados;
- revisar taxonomía;
- detectar contradicciones;
- revisar unidades;
- revisar calidad pedagógica;
- revisar calidad de FigureSpec;
- ejecutar validación global.

No continuar varios cientos de páginas con un error de esquema conocido.

### F1.2 — Consolidación temática

Consolidar contenidos repetidos por:

- material;
- herraje;
- sistema constructivo;
- tipo de mueble;
- procedimiento;
- concepto.

Mantener todas las fuentes.

### F1.3 — Knowledge Release 0.x

Durante la extracción se podrán publicar releases internas parciales para probar consumo desde herramientas futuras. Toda release parcial debe declarar explícitamente su cobertura.

Ejemplo:

```json
{
  "coverage": {
    "pdf_pages_total": 0,
    "pdf_pages_processed": 0,
    "complete": false
  }
}
```

### F1.4 — Cierre de extracción y Knowledge Release 1.0

F1 se considera terminado solo cuando:

1. el 100 % de páginas físicas está clasificado;
2. el 100 % de páginas con contenido relevante está extraído;
3. todas las figuras relevantes tienen FigureSpec o una razón documentada para no tenerlo;
4. las medidas técnicas están al menos en estado `EXTRACTED`, con cobertura de verificación reportada;
5. todos los conflictos conocidos están documentados;
6. se ejecutó auditoría global final;
7. se generó reporte de cobertura;
8. se publicó `Knowledge 1.0` con los pendientes explícitos, sin ocultarlos.

## 20. Flujo de trabajo de una página

```text
PDF
 ↓
inspección visual
 ↓
mapear página física/impresa
 ↓
extraer texto
 ↓
segmentar contenido
 ↓
identificar figuras/tablas/formularios
 ↓
generar FigureSpec
 ↓
extraer medidas y reglas candidatas
 ↓
normalizar texto
 ↓
generar learning_text
 ↓
validar schemas
 ↓
QA técnico
 ↓
commit del lote
```

## 21. Política editorial

La simplificación debe:

- respetar la idea técnica de la fuente;
- mejorar sintaxis y orden;
- explicar términos antes de usarlos cuando sea posible;
- evitar párrafos excesivamente largos;
- dividir procesos en pasos;
- separar definición, recomendación y regla;
- distinguir claramente una medida estándar de una obligación técnica;
- no transformar una recomendación del autor en una regla universal.

Debe evitar:

- añadir conocimiento externo sin marcarlo;
- corregir técnicamente al autor sin evidencia;
- borrar excepciones;
- cambiar unidades sin conservar valor original y conversión;
- convertir ejemplos en normas.

## 22. QA y validación

### QA estructural

- todos los JSON validan contra su schema;
- IDs únicos;
- referencias no rotas;
- páginas físicas válidas;
- unidades permitidas;
- estados válidos.

### QA editorial

- `source_transcription` conserva la fuente;
- `normalized_text` no altera significado;
- `learning_text` es más simple pero no inventa datos;
- toda ampliación externa está marcada como tal.

### QA numérico

Cada número técnico requiere:

1. fuente visible;
2. asociación con el objeto correcto;
3. unidad o motivo explícito para no tenerla;
4. confianza;
5. revisión visual antes de `VALIDATED`.

### QA visual

Cada figura debe tener:

- localización;
- tipo;
- propósito;
- entidades principales;
- relaciones relevantes;
- medidas visibles;
- estrategia de reconstrucción;
- nivel de certeza.

## 23. Pruebas del sistema de conocimiento

F0/F1 tendrá pruebas sobre datos, no sobre muebles todavía.

Como mínimo:

- schemas aceptan fixtures válidos y rechazan inválidos;
- SourceSpec no permite una regla sin procedencia;
- MeasurementSpec exige unidad o motivo explícito para no tenerla;
- FigureSpec exige `purpose`, `type` y `source`;
- referencias entre PageSpec/FigureSpec/RuleSpec son resolubles;
- el generador de distribución produce un bundle reproducible;
- un conflicto no puede promocionarse accidentalmente a `VALIDATED`;
- una página sin numeración impresa puede existir con `printed_page=null`;
- IDs no dependen de `printed_page`.

## 24. Seguridad y derechos

- `CarpiNova-Knowledge` inicia privado.
- El PDF fuente no se sube automáticamente.
- Assets de terceros se referencian antes de redistribuirse.
- Los QR/manuales de terceros se registran como referencias; no se presume permiso para republicar sus materiales.
- El contenido pedagógico derivado conserva vínculo con su fuente.
- Un FigureSpec puede describir semánticamente una figura sin obligar a almacenar o redistribuir la imagen original.

## 25. Criterios de salida de F0

F0 termina cuando:

1. existe repositorio y metodología;
2. el libro tiene mapa de páginas completo;
3. schemas v0.2 están congelados para extracción;
4. el piloto técnico está completamente procesado;
5. el piloto pasó QA;
6. FigureSpec demostró suficiente expresividad;
7. se documentaron cambios realizados tras el piloto.

No empieza F1 masivo antes de cumplir estos siete puntos.

## 26. Criterios de salida de cada lote F1

Un lote está terminado solo si:

- todas sus páginas tienen PageSpec;
- todo texto relevante fue segmentado;
- existen las tres capas de texto cuando aplique;
- figuras relevantes tienen FigureSpec;
- números técnicos están identificados y marcados con estado;
- reglas candidatas tienen fuente;
- conflictos están registrados;
- JSON valida;
- QA del lote está generado;
- el lote está versionado en Git.

## 27. Métricas

Mantener por lote y globalmente:

- páginas auditadas / total;
- páginas extraídas / total;
- figuras detectadas;
- FigureSpec completos;
- medidas extraídas;
- medidas visualmente verificadas;
- reglas candidatas;
- reglas validadas;
- conflictos abiertos;
- conceptos consolidados;
- porcentaje de páginas con `learning_text`;
- errores de schema;
- páginas/figuras bloqueadas por dudas o derechos.

## 28. Uso posterior

### CarpiNova Designer

Consumirá principalmente:

- reglas validadas;
- materiales;
- herrajes;
- sistemas constructivos;
- furniture patterns;
- procedimientos técnicos;
- figuras de referencia.

### CarpiNova Cell

Consumirá principalmente:

- `learning_text`;
- glossary;
- LessonSpec;
- FigureSpec;
- animaciones/escenas derivadas;
- ejercicios futuros.

### IA opcional

Usará la misma base como contexto y referencias, pero no sustituirá reglas determinísticas.

## 29. Riesgos principales y mitigación

### OCR o extracción numérica incorrecta

**Mitigación:** verificación visual obligatoria antes de validar.

### FigureSpec demasiado pobre

**Mitigación:** piloto técnico antes de extracción masiva.

### FigureSpec excesivamente complejo

**Mitigación:** campos opcionales, niveles de detalle y KISS; solo capturar información visible/útil.

### Contradicciones del libro

**Mitigación:** ConflictSpec y conservación de todas las fuentes.

### Reescritura pedagógica que cambia significado

**Mitigación:** mantener source/normalized/learning en paralelo y QA editorial.

### Duplicación entre apps

**Mitigación:** repositorio único + releases versionadas.

### Problemas de propiedad intelectual

**Mitigación:** repositorio privado, no subir PDF automáticamente, separar fuentes de derivados y revisar derechos antes de publicación.

### Páginas o figuras imposibles de interpretar con certeza

**Mitigación:** marcarlas `NEEDS_REVIEW`; no inventar datos ni geometría.

## 30. Decisiones congeladas por este diseño

Si esta especificación es aprobada:

1. F0/F1 precede al modelador 3D.
2. Se crea `CarpiNova-Knowledge` como repositorio privado independiente.
3. No se duplica manualmente el conocimiento en PC y Cell.
4. Se conservan tres capas textuales.
5. Toda página mantiene `pdf_page` y, cuando exista, `printed_page`.
6. Los IDs canónicos de página/figura dependen de la página física del PDF.
7. Las figuras usan FigureSpec detallado.
8. Los números técnicos requieren revisión visual.
9. Los lotes son adaptativos y basados en complejidad.
10. El piloto técnico precede la extracción masiva.
11. F1 busca cobertura completa del libro, no una muestra parcial.
12. El libro se convierte en conocimiento estructurado, no en entrenamiento de IA.

## 31. Próximo paso después de aprobación

Una vez aprobada esta especificación, el siguiente artefacto será un **plan de implementación detallado F0**. Ese plan dividirá el trabajo en tareas pequeñas y verificables para:

1. crear el repositorio `CarpiNova-Knowledge`;
2. inicializar políticas y CI de schemas;
3. auditar el libro completo a nivel de mapa;
4. implementar schemas v0.1;
5. ejecutar el lote piloto;
6. revisar y congelar schemas v0.2.

Solo después se autorizará la extracción masiva F1.
