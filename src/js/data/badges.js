// Insignias (logros). Premian constancia y esfuerzo, no solo acertar.
// test(c): c = { g, st, level, sessionsDone, readDone, worldsDone }
export const BADGES = [
  { id: 'primera', icon: '🚀', name: 'Primera misión', desc: 'Completa tu primera sesión.', test: (c) => c.sessionsDone >= 1 },
  { id: 'cinco', icon: '🧭', name: 'Explorador', desc: 'Completa 5 sesiones.', test: (c) => c.sessionsDone >= 5 },
  { id: 'veinte', icon: '🗺️', name: 'Aventurero', desc: 'Completa 20 sesiones.', test: (c) => c.sessionsDone >= 20 },
  { id: 'cincuenta', icon: '🏔️', name: 'Gran viajero', desc: 'Completa 50 sesiones.', test: (c) => c.sessionsDone >= 50 },
  { id: 'cien', icon: '🌌', name: 'Leyenda del cosmos', desc: 'Completa 100 sesiones.', test: (c) => c.sessionsDone >= 100 },
  { id: 'racha3', icon: '🔥', name: 'Racha de 3 días', desc: 'Juega 3 días seguidos.', test: (c) => c.g.streak.best >= 3 },
  { id: 'racha7', icon: '☄️', name: 'Racha de 7 días', desc: 'Juega 7 días seguidos.', test: (c) => c.g.streak.best >= 7 },
  { id: 'racha14', icon: '🌠', name: 'Racha de 14 días', desc: 'Juega 14 días seguidos.', test: (c) => c.g.streak.best >= 14 },
  { id: 'brillante', icon: '⭐', name: 'Brillante', desc: 'Saca 3 estrellas en 5 sesiones.', test: (c) => c.g.perfect >= 5 },
  { id: 'super', icon: '🌟', name: 'Súper brillante', desc: 'Saca 3 estrellas en 25 sesiones.', test: (c) => c.g.perfect >= 25 },
  { id: 'jefe1', icon: '🛡️', name: 'Vencedor', desc: 'Vence a tu primer jefe de mundo.', test: (c) => Object.values(c.g.bosses).filter((s) => s >= 2).length >= 1 },
  { id: 'jefe3', icon: '⚔️', name: 'Cazador de jefes', desc: 'Vence a 3 jefes de mundo.', test: (c) => Object.values(c.g.bosses).filter((s) => s >= 2).length >= 3 },
  { id: 'jefe6', icon: '👑', name: 'Rey de los mundos', desc: 'Vence a 6 jefes de mundo.', test: (c) => Object.values(c.g.bosses).filter((s) => s >= 2).length >= 6 },
  { id: 'mundo1', icon: '🪐', name: 'Mundo completado', desc: 'Termina todas las sesiones de un mundo.', test: (c) => c.worldsDone >= 1 },
  { id: 'mundo4', icon: '🌍', name: 'Conquistador', desc: 'Termina 4 mundos.', test: (c) => c.worldsDone >= 4 },
  { id: 'nivel3', icon: '🥉', name: 'Nivel 3', desc: 'Llega al nivel 3.', test: (c) => c.level >= 3 },
  { id: 'nivel5', icon: '🥈', name: 'Nivel 5', desc: 'Llega al nivel 5.', test: (c) => c.level >= 5 },
  { id: 'nivel10', icon: '🥇', name: 'Nivel 10', desc: 'Llega al nivel 10.', test: (c) => c.level >= 10 },
  { id: 'cofre', icon: '🎁', name: 'Cazatesoros', desc: 'Abre tu primer cofre.', test: (c) => c.g.opened >= 1 },
  { id: 'cofre5', icon: '💎', name: 'Gran tesoro', desc: 'Abre 5 cofres.', test: (c) => c.g.opened >= 5 },
  { id: 'mision3', icon: '🎯', name: 'Misión cumplida', desc: 'Cumple la misión del día 3 veces.', test: (c) => c.g.missionsDone >= 3 },
  { id: 'mision10', icon: '🏅', name: 'Constante', desc: 'Cumple la misión del día 10 veces.', test: (c) => c.g.missionsDone >= 10 },
  { id: 'pegatinas', icon: '📒', name: 'Coleccionista', desc: 'Reúne 20 pegatinas.', test: (c) => c.st.stickers.length >= 20 },
  { id: 'lector', icon: '📖', name: 'Lector', desc: 'Termina 10 lecturas.', test: (c) => c.readDone >= 10 },
  { id: 'lector40', icon: '🦉', name: 'Sabio lector', desc: 'Termina 40 lecturas.', test: (c) => c.readDone >= 40 },
];

export const RANKS = ['Aprendiz', 'Explorador', 'Aventurero', 'Valiente', 'Campeón', 'Maestro', 'Leyenda'];
