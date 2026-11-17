# Estado del proyecto "Aprende con Joel" (para retomar en otra sesión)

Última actualización: 2026-11-16. Carpeta: `C:\Edu Joel` (no es repositorio git).
Respaldo previo a los cambios: `C:\Edu Joel Respaldo 2026-11-16` (sin `node_modules` ni `dist`).

## Qué es
App Electron para Windows con modo papá (PIN) y modo alumno (kiosco). El alumno es **un niño de 5-6 años (Joel)**.
Los libros **Conocimiento de Sí Mismo** (Fase A y B) son el curso principal definitivo; el curso de ejemplo ("Mi primer curso") queda como alternativo.

## Reglas de trabajo del usuario (importantes)
- Antes de construir algo con varias piezas: presentar **todas las rutas** en tabla (cómo funciona, a favor, en contra, dependencias), recomendar una con plan B y **esperar su elección** (está en su `~/.claude/CLAUDE.md`).
- Hablar en español.
- **Zonas seguras en la interfaz:** ningún botón puede pisar texto ni otro botón (ni al revés), todo debe verse completo y adaptarse solo a cualquier tamaño de pantalla. Verificar **midiendo**, no a ojo (ver "Cómo se probó").
- **No adaptar ni resumir los textos por iniciativa propia.** El padre adapta el lenguaje a mano porque él sabe qué entiende Joel. No bloquear temas por mi cuenta: él bloquea/habilita desde el modo edición.
- **No activar la visibilidad del curso de los libros** (queda oculto para Joel hasta que el padre lo revise y lo active).

## Decisiones tomadas
| Tema | Decisión |
|---|---|
| Ruta general | Ruta 5: base de lectura primero, preguntas/juegos después (aún no hechas) |
| Adaptación del lenguaje | Ruta A: manual por el padre. Nivel de lenguaje 5-6 años |
| Contenido sensible | Opción 3 reformulada: no bloquear nada yo; el padre bloquea manualmente |
| Curso de ejemplo | Alternativo, con interruptor en el inicio de Joel |
| Interruptor de cursos | En el inicio de Joel (botón ¡Jugar! abre el curso elegido) |
| Visibilidad del curso de libros | Oculto para Joel por defecto |
| Modo papá | Ruta C: edición en sitio en inicio y mapa; en la lectura, editor con vista previa |

## Lo construido
**Curso de los libros** (`build/importar-libros.js` → `src/assets/libros/curso.json` + `src/assets/libros/imagenes/`)
- 75 sesiones: Fase A = 50 (introducción "Estimado lector" + 49 conferencias; la 05 y 06 son una sola en el libro) y Fase B = 25.
- IDs fijos: curso `curso-conocimiento-si-mismo`, sesiones `libros-a-00..49`, `libros-b-01..25`, actividad `<id>-lectura`.
- Cada sesión guarda el texto original en `session.source` y el texto editable en `activities[0].md`.
- Curso con `visible:false` y `freeOrder:true`. Se siembra solo la primera vez (`data.booksSeeded`) en `core/store.js` (`seedBooks`). `addBooksCopy()` añade otra copia original (botón «📖 Cargar libros originales» en Cursos).
- Regenerar: `node build/importar-libros.js` (lee los `.md` y `imagenes/` de la raíz).

**Actividad nueva `reading` (Lectura)** — `src/js/activities/reading.js`
- Páginas con texto, imágenes y tablas, narradas con la voz de Windows por frases. La letra se reduce sola hasta que la página quepa (mínimo 50 %); si aun así no cabe, se desplaza.
- Opciones por actividad: `size` (normal/grande/enorme), `narrate`, `md`.
- Registrada en `activities/index.js`, `data/activityTypes.js` (`TYPE_ORDER`) y como no puntuada en `core/progress.js`.

**Markdown seguro** — `src/js/core/markdown.js`
- Títulos, párrafos, negrita/cursiva, listas anidadas, tablas `|`, tabla HTML con rowspan (lista blanca de etiquetas), imágenes, citas y saltos de página con `---`.
- Imágenes: `imagenes/...` (las del libro, en `assets/libros/`) y `media/<nombre>` (las que sube el padre).
- `paginate()`, `renderPage()`, `pageSentences()`, `pageAtOffset()`, `mediaInText()`. `collectMedia` (en `core/media.js`) reconoce imágenes dentro del `md` para exportar y para que «limpiar archivos sin usar» no las borre.

**Bloqueo y orden** — `core/progress.js`
- `session.locked`; `hasContent(s)`; `sessionUnlocked(studentId, unit, index, course)` respeta bloqueo y `course.freeOrder`; una sesión bloqueada no traba a las siguientes.
- El mapa ya no muestra sesiones sin contenido válido a Joel; en modo edición muestra todas.

**Modo edición ("Editar viendo como el alumno")**
- Estado `editState.on` en `core/store.js`. Se activa desde `parent/home.js`; el panel de papá lo apaga. El router (`core/router.js`) no activa el kiosco en modo edición y añade `parent/editBar.js` (barra superior).
- Inicio (`student/home.js`): chips de cursos (interruptor), 👁️ mostrar/ocultar y ✏️ editar curso (`parent/courseDialog.js`).
- Mapa (`student/map.js`): por conferencia 🔒/🔓, ✏️ (`parent/sessionDialog.js`), ◀ ▶; por unidad renombrar, habilitar todas, bloquear todas, ＋ conferencia; ＋ Nueva unidad.
- Reproductor (`student/player.js`): con `edit:true` muestra ✏️ que abre el editor en la página actual.
- Editor de lectura (`parent/readingEditor.js`): texto + vista de Joel en vivo, pestaña de original, restaurar original, imágenes (selector y Ctrl+V), autoguardado, ruta `readingEditor` en el router. `parent/activityEditor.js` redirige las lecturas a este editor.
- Panel clásico: candado por sesión en `courseEditor.js` y `sessionEditor.js`, toggle «Abrir en cualquier orden» por curso.

**Interfaz adaptable / zonas seguras** (CSS en `src/css/kid.css`, `activities.css`, `parent.css`)
- Nodos del mapa dimensionados con `--nw`, títulos con ancho acotado, herramientas de nodo fuera del círculo, `.editing .kid-page { padding-top: 30px }` para la barra, `.kid-title { min-width: 0 }`, chips con herramientas en línea, editor de lectura que cabe en la ventana y se apila en pantallas estrechas/verticales.

## Cómo se probó (scratchpad de la sesión; se puede rehacer)
- Lanzar `node_modules/electron/dist/electron.exe C:\Edu Joel --remote-debugging-port=9333` con `EDUJOEL_USERDATA=<carpeta temporal>`, `EDUJOEL_NOKIOSK=1`, `EDUJOEL_HIDDEN=1`, y manejar la página por CDP (Node 24 trae `WebSocket`). En la página se puede `import('/js/core/store.js')`, `router.js`, etc. para preparar estado.
- Detector de colisiones: compara cajas de botones, textos (Range por nodo, recortadas por `overflow`) y mascotas en 13 pantallas × 7 tamaños (de 900×600 a 3840×2160, incluida vertical), recorriendo el scroll del mapa y las páginas de lectura. Resultado final: **0 colisiones**.
- Pruebas funcionales (bloqueo, orden libre/secuencial, imágenes subidas en disco/texto/exportación, restaurar original, redirección del editor, regresión del curso de ejemplo): todas pasaron.
- Las páginas de lectura de varias conferencias (incluida una con tabla y otra con imágenes) caben sin desplazarse en todos los tamaños probados.

## Instaladores
`npm run dist` generó el 2026-11-16 en `dist/`:
- `Aprende con Joel Setup 1.0.0.exe` (~134 MB) y `AprendeConJoel-portable-1.0.0.exe` (~134 MB).
- Verificado en el `app.asar`: `curso.json`, 80 imágenes y los archivos nuevos. **No se instaló ni se abrió el `.exe` final** (las pruebas se hicieron con la app desde el código).
- El usuario dijo que lo instalaría y probaría. Pendiente su retroalimentación.

## Sesión 2 (2026-11-16, después del instalador)
- **Bug de voz corregido:** la lectura se repetía sin terminar. Causa: la "ayuda por inactividad" del reproductor (`IDLE_MS = 15000` en `student/player.js`) repetía la instrucción a los 15 s y reiniciaba la narración; leer una página dura más. Arreglo: `reading.js` expone `noIdle: true` y `onIdle` lo respeta. Además `pageSentences()` (`core/markdown.js`) parte solo en finales de frase reales (no en "etc.,"). Verificado con la app real registrando cada `speechSynthesis.speak/cancel`.
- **Instalador:** `dist/` NO incluye este arreglo; hay que correr `npm run dist` de nuevo cuando se acuerden los cambios.
- Voces de Windows en la máquina de pruebas: Microsoft Raul y Sabina (es-MX). La app elige Sabina automáticamente (`core/speech.js`, `pickVoice`); se cambia en Ajustes → Voz.
- **Mascota NOUS (hecha):** dibujada en SVG por el asistente (`src/js/data/mascotArt.js`, `NOUS = 'svg:nous'`). Concepto pedido por el padre: **"el átomo del íntimo"**, un ser puro de luz de otro plano (en el temario se habla de Nous). Es una gota luminosa de rostro sereno con estrella en la frente, rayos dorados, 3 órbitas atómicas que giran lentamente, electrones y chispas que titilan (animaciones apagadas con `prefers-reduced-motion`). Colores planos, sin ids/degradados. Es la **mascota por defecto / la guía**: primera en `MASCOTS` (`data/rewards.js`), por defecto en `newStudent`, y `migrate()` cambia una sola vez (`data.nousDefault`) a los alumnos que aún tienen el Dino original sin accesorios ni compras; si luego eligen otra mascota se respeta. Las mascotas SVG se pintan con `glyph(kind)` (mascot.js, shop.js, onboarding.js, studentsTab.js); CSS `.m-art` ajusta la posición de los accesorios.
- **Voz híbrida (hecha):** la voz de Windows (Sabina por defecto, cambiable en Ajustes → Voz) lee todo, salvo las páginas donde el padre grabó su propia voz. Nivel elegido por recomendación del asistente (el padre no eligió): **grabación por página atada al texto**.
  - Datos: `activity.audios = { [pageKey]: { f: archivo.webm, t: resumen, at, s: segundos } }`. `pageKey(blocks)` (markdown.js) = hash del texto de la página: si el padre cambia ese texto, la grabación queda como "texto anterior" y esa página vuelve a Windows; las demás no se alteran.
  - `activity.pagination = 'auto' | 'manual'`: en `manual` las páginas son exactamente las separadas por `---` (recomendado para grabar, porque nada se reparte solo). Cambiar tamaño de letra o modo pide confirmación si hay grabaciones.
  - Código: `parent/voicePanel.js` (panel en `readingEditor.js`: Grabar/Terminar, Escuchar como la oirá Joel, Quitar, chips de páginas con 🎙, lista de "texto anterior" con ▶ / ↪ Usar aquí / 🗑; máx. 10 min por grabación; bloquea el texto mientras graba); `activities/reading.js` reproduce `playFile` y cae a Windows si falla; `speech.playFile` ahora devuelve true/false; `collectMedia` incluye los audios (exportar/copias/limpieza).
- **No se hizo:** cambiar la voz de Windows por una de nube; el padre no eligió voz de respaldo (queda Sabina; Raul también está instalada en la máquina de pruebas).
- **Pruebas de esta sesión:** micrófono simulado (tono por `MediaStreamDestination`) para grabar de verdad con `MediaRecorder` dentro de la app; reproducción híbrida verificada registrando `Audio` y `speechSynthesis.speak`; migración de Nous; regresión completa (0 colisiones en 13+ pantallas × 5-6 tamaños, pruebas funcionales OK). El detector ignora a propósito accesorios superpuestos de una mascota, emojis (caja de línea de la fuente) y el contenido de `<details>` cerrados.
- **Instalador:** el `.exe` de `dist/` NO incluye nada de la sesión 2 (arreglo de voz, Nous, voz híbrida). Falta `npm run dist` cuando el padre lo pida.

## Sesión 3 (2026-11-16): juego G2 en todos los cursos + curso "Camino a primero"
Decisión del padre: **G2 (aventura con mundos) se aplica de aquí en adelante a TODOS los cursos**, incluido Conocimiento de Sí Mismo. Su hijo pasa de transición a primero de primaria (Colombia) y debe llegar adelantado, a su ritmo.
- **Mascota/guía por curso:** `course.mascot = {kind, name}` (`courseMascot()` en `student/mascot.js`; `mascotEl(st, {course})`). Conocimiento = **Nous**; Camino a primero = **Cosmo** (astronauta, SVG hecho por el asistente en `data/mascotArt.js`, `COSMO='svg:cosmo'`). La tienda muestra la guía del curso activo y no deja cambiarla si el curso trae una. Se asigna en «Editar curso» (`parent/courseDialog.js`, que también edita la historia de bienvenida).
- **Juego** (`core/game.js`, `data/badges.js`, datos en `student.game`): XP y niveles (`levelInfo`, rangos), racha de días, misión diaria (`settings.dailyGoal`, 2 sesiones), cofres (estrellas / pegatina nueva / XP), 25 insignias, jefes de mundo y mundos que se abren al vencer al jefe de otro (`unit.requires`; papá puede abrir con `unit.open` desde el modo edición, botón «🌍 Abrir mundo a Joel»). Jefe = 8 actividades de respuesta rápida del mundo (sin trazar/colorear/leer), se vence con ≥2★, da cofre la primera vez; solo hay jefe si el mundo reúne ≥6 actividades con respuesta (`hasBoss`; Conocimiento no tiene jefe porque solo tiene lecturas). `unit.boss=false` lo desactiva. Historias: `course.story` y `unit.story` las cuenta la guía la primera vez (`student.game.seenStory`); papá las edita (botón «📜 Historia» por mundo en modo edición).
- **Pantallas nuevas:** `student/gameReward.js` (XP, nivel, racha, misión, insignias, cofre; el reproductor pasa `ev` a `reward.js` y de ahí a `gameReward`), `student/achievements.js` (Mis logros), `student/chest.js`, `student/hud.js` (nivel/racha/cofre/misión en el inicio), `css/game.css`. El mapa (`student/map.js`) muestra mundos con progreso, color, jefe y candado; el progreso de papá muestra el juego.
- **Curso «Camino a primero»** (`data/primero.js` + `primeroLengua.js` + `primeroMundo.js` + `primeroKit.js`): **18 mundos, 150 sesiones, 935 actividades**, generado por código (sin IA) con aleatorización. Mundos: Misión de exploración (diagnóstico corto, sin jefe), Calentamiento (repaso de transición), Español (Isla de las Letras 1-3, Valle de las Palabras, Pueblo de las Frases con 3 mini-cuentos usando la actividad `reading`), Matemáticas (Montaña de los Números hasta 20, Cumbre hasta 100, Valle de las Sumas y Restas hasta 20, Ciudad de las Formas y el Tiempo), Inglés (3 islas), Bosque de las Ciencias, Colombia tierra mía (símbolos patrios, bolsas de reciclaje blanca/verde/negra), Jardín de los Valores, Taller de Arte y Tecnología. `freeOrder:true` (dentro de un mundo se elige el orden); los mundos se encadenan con `requires`.
  - Se siembra solo la primera vez (`data.primeroSeeded`, `seedPrimero` en `core/store.js`), visible; el curso de ejemplo "Mi primer curso" se **oculta** (no se borra). «🚀 Cargar Camino a primero» (pestaña Cursos) añade una copia limpia.
  - **Contenido escrito por el asistente: el padre debe revisarlo** (hechos de Colombia, vocabulario, ejercicios). Todo es editable en el modo edición.
- **Inglés:** `card.lang`/`prompt.lang`='en' → `speak(text,{lang})`; `voiceForLang`/`hasVoiceFor` (`core/speech.js`). Si Windows no tiene voz en inglés se pide el idioma igualmente (nunca se lee con la voz española) y Ajustes muestra un aviso con acceso directo para instalarla. En la máquina de pruebas NO hay voz en inglés.
- **Banderas:** los emojis de bandera (🇨🇴 🇬🇧) NO se dibujan en Windows (salen como letras); no usarlos.
- **Regla aprendida (zonas seguras):** el inicio de Joel se desbordaba al añadir nivel y misión; ahora `student/home.js` tiene ajuste automático (`fitHome`: encoge la mascota y luego usa el modo `.compact`). Se verifica con DOS pruebas: la de colisiones (`run4`) y la de «todo dentro de la ventana» (`run3`); la de colisiones sola NO detecta contenido que queda fuera de la ventana.
- **Pruebas (todas OK):** lógica del juego en la app; 935/935 actividades se dibujan; recorrido sesión→premio→experiencia→mapa→jefe; 13+ pantallas × 6 tamaños sin colisiones y todo dentro de la ventana; regresión de modo edición, voz híbrida, Nous y migraciones. El validador de contenido (`validate-primero.mjs`) generó el curso 40 veces sin errores.
- **Instalador:** regenerado el 2026-11-16 (19:59) con todo lo de las sesiones 2 y 3 (verificado en el app.asar). No se instaló ni se abrió el `.exe` final; las pruebas se hicieron con la app desde el código.
- **Pendiente / siguiente:** G3 (minijuegos arcade: carrera de palabras, atrapa la sílaba…); revisión del padre del contenido de primero; que el padre instale la voz en inglés; edición en sitio de las otras 11 actividades; el diagnóstico no es adaptativo (solo da estrellas por área en Progreso).

## Sesión 4 (2026-11-16): minijuegos de las 75 conferencias (Ruta 5, segunda fase) + repo de GitHub
- **Instalador en GitHub:** repo público `Angelustrabell/aprende-con-joel`, Release `v1.0.0` con `Aprende.con.Joel.Setup.1.0.0.exe` y `AprendeConJoel-portable-1.0.0.exe` (las del 2026-11-16 19:59; **no incluyen los minijuegos de esta sesión**). El padre confirmó que el contenido de los libros es de dominio público. Para publicar una versión nueva: `npm run dist` y `gh release create vX.Y.Z dist/*.exe --repo Angelustrabell/aprende-con-joel`.
- **Minijuegos:** 342 actividades (233 elegir/verdadero-falso, 66 unir, 26 ordenar, 17 clasificar), 3-6 por conferencia, en las 75 sesiones, escritas a mano por el asistente (Ruta A elegida por el padre) leyendo cada conferencia. **El padre las revisará y cambiará el lenguaje/palabras** (lo pidió así); cada una lleva `needsReview: true`.
  - Archivos: `build/minijuegos/*.js` (uno por tanda; exportan `{ 'libros-a-03': [actividades] }`), ayudantes en `build/minijuegos/kit.js` (`choose`, `yesNo`, `match`, `order`, `sort`, `memory`, `listen`; una tarjeta se escribe `'emoji|texto'`), y `build/agregar-minijuegos.js` (valida y añade al curso; ids `<sesión>-mj-N`; idempotente). `build/importar-libros.js` lo llama al final: `node build/importar-libros.js` regenera todo.
  - Las actividades van **después de la lectura** (`activities[0]` sigue siendo la lectura). Validación: máx. 34 letras por ficha, 2-4 opciones, sin repetidas, etc.
  - **Contenido sexual/explícito:** por pedido del padre NO hay juegos con prácticas sexuales; en esas conferencias (sobre todo A-10, A-43, A-46, A-47, A-50 y B-09, B-14, B-24, B-25; también partes de A-01, A-17, B-07, B-08) los juegos usan solo la idea general (castidad, pureza, defectos, colores del mercurio, etc.). El texto de la lectura queda intacto.
  - **Migración:** `seedBooksGames()` en `core/store.js` (flag `data.booksGamesSeeded`) añade una sola vez los minijuegos a conferencias ya guardadas, sin tocar la lectura ni lo editado. En instalaciones nuevas el curso ya los trae.
  - Sin jefes de mundo todavía: el curso tiene solo 2 mundos (Fase A con 50 sesiones, Fase B con 25); si el padre quiere jefes, habría que partir las fases en mundos de ~10 sesiones.
  - Prueba: cada minijuego se abre en el reproductor real (`go('player', {single: id, preview: true})`) en 900×600, 1280×720, 1366×768, 1920×1080 y 800×1280, midiendo fuera de ventana, texto desbordado y pisarse (resultado en el resumen de la sesión).

## Pendiente / ideas siguientes
- Esperar el resultado de la prueba del instalador por el padre y corregir lo que encuentre. Regenerar el instalador con los cambios de la sesión 2.
- Ruta 5, segunda fase: preguntas y juegos por conferencia (elegir, ordenar, unir, clasificar) en Conocimiento de Sí Mismo, cuando el padre termine de adaptar los textos; con ellas el curso tendrá jefes de mundo (G2). Cualquier uso de IA para redactar texto infantil requiere su aprobación previa y revisión.
- Edición en sitio de las otras 11 actividades de juego (hoy abren el editor de formularios clásico).
- Posible mejora: leer curso desde archivos por conferencia si el padre prefiere editar fuera de la app.
- Nota técnica: `package.json` tiene `description`/`author` con texto mal codificado ("PapÃ¡") — confirmar si es solo cómo se leyó en consola o si el archivo está mal; revisar antes de otra publicación.
- `cleanUnusedMedia` ahora respeta imágenes dentro del `md`; revisar si se añade otro campo de texto con imágenes.

## Datos útiles
- Datos del usuario: `%APPDATA%\Aprende con Joel\` (`data.json`, `media\`, `copias\` con 14 copias diarias).
- Variables de prueba: `EDUJOEL_USERDATA`, `EDUJOEL_NOKIOSK`, `EDUJOEL_HIDDEN`.
- README actualizado con el curso de los libros y el modo edición.
- Memoria del asistente (fuera del proyecto): `C:\Users\invit\.claude\projects\C--Edu-Joel\memory\` (zonas seguras y contexto del proyecto).
