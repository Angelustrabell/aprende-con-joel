// Registro de actividades.
const LOADERS = {
  choose: () => import('./choose.js'),
  listen: () => import('./listen.js'),
  match: () => import('./match.js'),
  count: () => import('./count.js'),
  order: () => import('./order.js'),
  trace: () => import('./trace.js'),
  memory: () => import('./memory.js'),
  pattern: () => import('./pattern.js'),
  sort: () => import('./sort.js'),
  view: () => import('./view.js'),
  paint: () => import('./paint.js'),
  reading: () => import('./reading.js'),
};

export async function mountActivity(container, act, ctx) {
  const loader = LOADERS[act.type];
  if (!loader) throw new Error(`Actividad desconocida: ${act.type}`);
  const mod = await loader();
  return mod.default(container, act, ctx) || {};
}
