// Diálogo de plantillas rápidas.
import { h } from '../core/dom.js';
import { save } from '../core/store.js';
import { openModal, toast } from '../core/modal.js';
import { TEMPLATES, unitOf } from '../data/templates.js';

function fieldControl(f, values, onChange) {
  const v = values[f.key];
  if (f.type === 'check') {
    const i = h('input', { type: 'checkbox', checked: !!v });
    i.addEventListener('change', () => { values[f.key] = i.checked; onChange(); });
    return h('label', { class: 'check-row' }, i, h('span', f.label));
  }
  if (f.type === 'multi') {
    const set = new Set(v || []);
    return h('div', { class: 'field' }, h('span', { class: 'field-label' }, f.label),
      h('div', { class: 'chips' }, ...f.options.map((o) => {
        const b = h('button', { class: `chip ${set.has(o.value) ? 'on' : ''}`, type: 'button' }, o.label);
        b.addEventListener('click', () => {
          if (set.has(o.value)) set.delete(o.value); else set.add(o.value);
          b.classList.toggle('on');
          values[f.key] = f.options.map((x) => x.value).filter((x) => set.has(x));
          onChange();
        });
        return b;
      })));
  }
  let input;
  if (f.type === 'textarea') input = h('textarea', { class: 'input', rows: 7, value: v });
  else if (f.type === 'select') input = h('select', { class: 'input' }, ...f.options.map((o) => h('option', { value: o.value, selected: o.value === v }, o.label)));
  else input = h('input', { class: 'input', type: f.type === 'number' ? 'number' : 'text', value: String(v ?? ''), min: f.min, max: f.max });
  input.addEventListener(f.type === 'select' ? 'change' : 'input', () => { values[f.key] = f.type === 'number' ? Number(input.value) : input.value; onChange(); });
  return h('label', { class: 'field' }, h('span', { class: 'field-label' }, f.label), input);
}

export function templatesDialog(course, unit, onDone) {
  let tpl = TEMPLATES[0];
  let values = {};
  const list = h('div', { class: 'tpl-list' });
  const form = h('div', { class: 'tpl-form' });
  const info = h('div', { class: 'tpl-info' });
  const dest = h('select', { class: 'input' });

  const resetValues = () => { values = Object.fromEntries(tpl.fields.map((f) => [f.key, Array.isArray(f.value) ? [...f.value] : f.value])); };

  const updateInfo = () => {
    try {
      const sessions = tpl.build(values);
      const acts = sessions.reduce((n, s) => n + s.activities.length, 0);
      info.textContent = sessions.length ? `Se crearán ${sessions.length} sesiones con ${acts} actividades en total.` : '⚠️ Revisa los datos: así no se puede crear ninguna sesión.';
      info.classList.toggle('warn', !sessions.length);
    } catch (e) {
      info.textContent = `⚠️ ${e.message}`;
      info.classList.add('warn');
    }
  };

  const drawDest = () => {
    const suggested = tpl.unit(values);
    dest.replaceChildren(
      h('option', { value: '__new', selected: !unit }, `Nueva unidad: "${suggested.title}"`),
      ...course.units.map((u) => h('option', { value: u.id, selected: unit && u.id === unit.id }, `${u.icon || '📘'} ${u.title}`)),
    );
  };

  const drawForm = () => {
    form.replaceChildren(
      h('div', { class: 'tpl-title' }, h('span', tpl.icon), ' ', tpl.name),
      h('p', { class: 'muted' }, tpl.desc),
      ...tpl.fields.map((f) => fieldControl(f, values, () => { updateInfo(); drawDestLabel(); })),
      h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Añadir a'), dest),
      info,
    );
    drawDest();
    updateInfo();
  };
  const drawDestLabel = () => {
    const first = dest.querySelector('option[value="__new"]');
    if (first) first.textContent = `Nueva unidad: "${tpl.unit(values).title}"`;
  };

  const drawList = () => list.replaceChildren(...TEMPLATES.map((t) => {
    const b = h('button', { class: `tpl-item ${t === tpl ? 'on' : ''}`, type: 'button' }, h('span', { class: 'tpl-icon' }, t.icon), h('span', t.name));
    b.addEventListener('click', () => { tpl = t; resetValues(); drawList(); drawForm(); });
    return b;
  }));

  resetValues();
  drawList();
  drawForm();

  openModal({
    title: '⚡ Plantilla rápida',
    wide: true,
    content: h('div', { class: 'tpl-dialog' }, list, form),
    actions: [
      { label: 'Cancelar', class: 'btn-ghost' },
      {
        label: 'Crear sesiones', class: 'btn-primary',
        onClick: () => {
          const sessions = tpl.build(values);
          if (!sessions.length) { updateInfo(); return false; }
          if (dest.value === '__new') {
            const u = tpl.unit(values);
            course.units.push(unitOf(u.title, u.icon, sessions));
          } else {
            course.units.find((u) => u.id === dest.value).sessions.push(...sessions);
          }
          save();
          onDone?.();
          toast(`✔ ${sessions.length} sesiones creadas`, 'ok');
          return true;
        },
      },
    ],
  });
}
