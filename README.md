# Aprende con Joel 🌟

App educativa para Windows con dos modos:

- **Modo papá** (protegido con PIN): creas cursos, unidades, sesiones y actividades; ves el progreso; ajustas límites.
- **Modo alumno** (Joel): pantalla completa, todo con voz y dibujos grandes, mascota, estrellas, pegatinas y premios. Funciona con ratón y pantalla táctil.

## Cómo usarla

| Qué | Cómo |
|---|---|
| Arrancar en desarrollo | `npm start` |
| Crear el instalador | `npm run dist` → en `dist/` quedan el instalador (`Aprende con Joel Setup 1.0.0.exe`) y una versión portable |
| Entrar al modo papá desde el modo Joel | Mantener pulsado el candado 🔒 (esquina inferior derecha) 2 segundos y escribir el PIN |
| Olvidé el PIN | En la pantalla del PIN: «¿Olvidaste el PIN?» (pide escribir *BORRAR PIN* y resolver una multiplicación) |

La primera vez la app pide crear el PIN, el nombre del niño, la mascota y si quieres cargar el **curso de ejemplo** (vocales, números 1–5, colores, animales, formas, patrones, emociones, rutina, sumas y láminas para colorear: 29 sesiones).

## Juego y cursos (G2)

Todos los cursos funcionan como una **aventura por mundos**: cada unidad es un mundo con su progreso, su historia (la cuenta la guía del curso) y, si tiene preguntas, un **jefe** al final. Se gana experiencia (XP) y se sube de nivel; hay **racha** de días, una **misión diaria**, **cofres** sorpresa e **insignias** (pantalla «Logros»). Todo premia el esfuerzo y la constancia, y el límite de tiempo diario sigue mandando.

- **Guía por curso:** cada curso tiene su mascota. Conocimiento de Sí Mismo → **Nous**; Camino a primero → **Cosmo**. Se cambia en «Editar curso».
- **Mundos que se abren:** algunos mundos piden vencer al jefe de otro. Desde el modo edición puedes abrirlos a Joel con «🌍 Abrir mundo a Joel».
- **Camino a primero:** temario de primero de primaria para llegar adelantado a su ritmo: Español, Matemáticas, Inglés, Ciencias, Sociales (Colombia), Valores y Arte/Tecnología (18 mundos, 150 sesiones). Empieza con una «Misión de exploración» para ver qué sabe hoy. Para oír bien el inglés, instala una voz en inglés en Windows (Configuración → Hora e idioma → Voz); Ajustes avisa si falta.
- **Revisa el contenido:** las preguntas de primero las redactó el asistente; todo se puede editar desde el modo edición.

## Curso «Conocimiento de Sí Mismo» (los libros)

Al abrir la app por primera vez con esta versión se añade solo el curso con las 75 conferencias (Fase A: 50, Fase B: 25), **oculto para Joel** hasta que lo actives (Cursos → «Visible para el alumno»).

- Cada conferencia es una sesión con una actividad nueva, **Lectura**: páginas con texto, imágenes y tablas que la voz va leyendo. La letra se ajusta sola para que la página quepa completa en cualquier pantalla.
- El texto original queda guardado aparte en cada conferencia: en el editor, pestaña «Texto original del libro» o botón «↶ Restaurar original». «📖 Cargar libros originales» (en Cursos) añade otra copia limpia.
- Para regenerar el curso desde los `.md` y las imágenes: `node build/importar-libros.js`.

### Voz híbrida (tu voz + la voz de Windows)

En el editor de lectura, bajo la vista de Joel, el panel **🎙 Tu voz** deja grabar cada página con tu propia voz. Las páginas sin grabación las lee la voz de Windows (se elige en Ajustes → Voz). La grabación se liga al *texto* de la página: si lo cambias, esa grabación queda en «texto anterior» (puedes reutilizarla con «↪ Usar aquí» o quitarla) y las demás páginas no se afectan. Para grabar con calma, elige **Páginas: Las separo yo (---)** y marca cada página con «⏎ Página nueva».

### Mascota Nous

**Nous** es la guía por defecto: el «átomo íntimo», un ser de luz con órbitas atómicas, dibujado en SVG. Joel puede cambiarla y vestirla en la tienda como a las demás.

### Modo edición («Editar viendo como el alumno»)

En el panel de papá, el botón **✏️ Editar viendo como el alumno** abre las mismas pantallas que ve Joel, con herramientas encima:

| Pantalla | Qué puedes hacer |
|---|---|
| Inicio | Cambiar de curso (interruptor), mostrar u ocultar un curso a Joel, editar su título, icono y color |
| Mapa | En cada conferencia: 🔒/🔓 bloquear o habilitar, ✏️ editar (título, icono, eliminar), ◀ ▶ mover. Por unidad: renombrar, habilitar todas, bloquear todas, ＋ conferencia. ＋ Nueva unidad |
| Lectura | Botón ✏️ arriba: abre el editor en la página que estás viendo |
| Editor de lectura | Texto a la izquierda y lo que ve Joel a la derecha (se guarda solo). Negrita, títulos, listas, imágenes (también con Ctrl+V), salto de página con `---`, tamaño de letra, voz sí/no |

En el **inicio de Joel** hay un interruptor entre cursos: el botón ¡Jugar! abre el curso elegido. Las conferencias bloqueadas se ven con 🔒 y la voz dice «Esta la abre papá».

## Tipos de actividad (12)

1. **Toca la correcta**: una o varias correctas, con tarjeta de pregunta opcional.
2. **Escucha y elige**: suena una palabra o sonido y hay que tocar su imagen.
3. **Arrastra y une**: parejas (también funciona tocando una y luego la otra).
4. **Cuenta**: tocar para contar y elegir el número; también sumas y restas con dibujos.
5. **Ordena**: tocar o arrastrar en el orden correcto.
6. **Traza**: repasar letras o números con el dedo o el ratón (hay que repasar la letra entera).
7. **Memoria**: parejas iguales o distintas (letra y dibujo).
8. **Patrones**: ¿qué viene después?
9. **Clasifica**: arrastrar cada cosa a su cesta.
10. **Lámina o video**: para presentar algo nuevo.
11. **Colorear**: dibujo libre o lámina con cubeta de pintura. Los dibujos se guardan en *Progreso*.
12. **Lectura**: páginas de texto con imágenes y tablas, narradas por voz (para las conferencias).

Cada tarjeta puede tener emoji, imagen propia (subida o pegada con Ctrl+V), color, texto y voz (automática o **grabada por ti**). La instrucción de cada actividad también se puede grabar.

## Herramientas del modo papá

- **Plantillas rápidas**: letras, números, palabras e imágenes, colores, formas, patrones, sumas y restas, emociones, rutinas y colorear. Generan sesiones completas en segundos.
- **Crear con IA** (opcional): escribe un tema y Claude crea una sesión. Necesita una clave de API de Anthropic (console.anthropic.com), que se guarda cifrada. Solo se envía el tema que escribes. El modelo se cambia en *Ajustes*.
- **Vista previa** en vivo mientras editas, y botón ▶ para probar actividades o sesiones completas.
- **Exportar e importar cursos** (archivo `.joelcurso`, incluye imágenes y grabaciones).
- **Copia de seguridad** completa (`.joelcopia`), más una copia automática diaria (se guardan las últimas 14).
- **Progreso**: minutos por día, sesiones, estrellas, lo que le cuesta (se repasa más a menudo), últimas sesiones y galería de dibujos.
- **Ajustes**: kiosco, límite diario de minutos o sesiones, desbloqueo en orden, número de actividades de repaso, ayuda si se queda quieto, palabras bajo los dibujos, voz (velocidad y tono), y tus frases grabadas de ánimo («¡Muy bien, Joel!»).
- Varios alumnos con su propia mascota, estrellas, pegatinas y progreso.

## Cómo aprende Joel

- La mascota le lee cada instrucción; el botón 🔊 la repite.
- Si se equivoca: «¡Casi!», la opción incorrecta se apaga, y tras 2 errores aparece una pista.
- Si se queda quieto 15 s se repite la instrucción, y luego aparece una pista.
- Cada sesión empieza con un pequeño **repaso** de lo que más le costó.
- Al terminar: 1 a 3 estrellas, confeti y una pegatina nueva para el álbum. Con las estrellas viste a su mascota.
- Al llegar al límite diario termina la sesión en curso y aparece «¡Por hoy terminamos!». Con el PIN puedes darle 10 minutos más.

## Voces

Usa las voces de Windows. Si no hay voces en español: *Configuración → Hora e idioma → Voz → Agregar voces → Español*. En *Ajustes* de la app se elige la voz, y se prefiere una femenina latinoamericana si existe.

## Dónde se guardan los datos

En `%APPDATA%\Aprende con Joel\`:

- `data.json`: cursos, alumnos, progreso y ajustes.
- `media\`: imágenes, audios, videos y dibujos.
- `copias\`: copias automáticas diarias.
- `clave-ia.bin`: la clave de la IA, cifrada con el sistema.

También se puede abrir desde *Ajustes → Abrir carpeta*.

## Estructura del código

```
main.js            Proceso principal: ventana, kiosco, protocolo app://, datos, archivos, IA
preload.js         Puente seguro con la interfaz
src/index.html     Página única
src/css/           base.css · kid.css (modo Joel) · activities.css · parent.css
src/js/core/       store, progress, router, speech, sfx, fx, media, modal, card, drag, util
src/js/core/game.js Experiencia, niveles, racha, misión, cofres, insignias y jefes
src/js/data/primero*.js El curso «Camino a primero» (se genera por código)
src/js/activities/ Las 12 actividades
src/js/student/    Inicio, mapa, reproductor, premio, álbum, tienda, límite, mascota
src/js/parent/     Configuración inicial, PIN, panel, editores, plantillas, IA, ajustes
src/js/data/       Tipos de actividad, plantillas y curso de ejemplo, emojis, pegatinas y tienda
src/assets/coloring/  Láminas para colorear (SVG)
build/             Icono (make-icon.js) y conversor de los libros (importar-libros.js)
```

## Variables solo para pruebas

- `EDUJOEL_USERDATA=carpeta`: usa otra carpeta de datos.
- `EDUJOEL_NOKIOSK=1`: no activa el kiosco.
- `EDUJOEL_HIDDEN=1`: ventana fuera de la pantalla y sin robar el foco.
