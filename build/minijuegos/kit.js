// Ayudantes para escribir los minijuegos de las conferencias (misma forma que los de src/js/data/primeroKit.js).
// Una tarjeta se escribe como 'emoji|texto' o solo 'texto'. Si empieza por emoji sin '|' se usa solo el emoji.
const card = (s) => {
  s = String(s);
  let emoji = '', text = s;
  if (s.includes('|')) { [emoji, text] = s.split('|'); }
  return { emoji: emoji.trim(), image: '', text: text.trim(), color: '', say: text.trim(), audio: '' };
};
const P = (say) => ({ say, audio: '' });
const YES = card('✅|Sí');
const NO = card('❌|No');
const mk = (type, data) => ({ type, needsReview: true, ...data });

// Toca la correcta. wrong = lista de tarjetas incorrectas. target = tarjeta opcional arriba.
const choose = (prompt, right, wrong, target = null) => {
  const options = [card(right), ...wrong.map(card)];
  return mk('choose', { prompt: P(prompt), target: target ? card(target) : null, options, correct: [0] });
};
// Verdadero o falso: la frase va en la pregunta; truth = true/false.
const yesNo = (prompt, truth, target = null) => choose(prompt, truth ? YES.emoji + '|' + YES.text : NO.emoji + '|' + NO.text, [truth ? '❌|No' : '✅|Sí'], target);
// Une: pares [a, b]
const match = (prompt, pairs) => mk('match', { prompt: P(prompt), pairs: pairs.map(([a, b]) => ({ a: card(a), b: card(b) })) });
// Ordena: las tarjetas en el orden correcto
const order = (prompt, items) => mk('order', { prompt: P(prompt), items: items.map(card) });
// Clasifica: grupos [etiqueta, [cosas]]
const sort = (prompt, groups) => mk('sort', { prompt: P(prompt), groups: groups.map(([l, items]) => ({ label: card(l), items: items.map(card) })) });
// Memoria: parejas iguales
const memory = (prompt, items) => mk('memory', { prompt: P(prompt), pairs: items.map((a) => ({ a: card(a), b: null })) });
// Escucha y elige: suena la frase y se toca la imagen
const listen = (prompt, right, wrong, say) => mk('listen', { prompt: P(prompt), options: [card(right), ...wrong.map(card)], correct: 0, sound: { say, audio: '' } });

module.exports = { choose, yesNo, match, order, sort, memory, listen };
