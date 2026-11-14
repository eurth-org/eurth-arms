/**
 * The contact sheet: every shape, field, line, ordinary, charge and arrangement on one page,
 * to check the drawing by eye. Run `npm run sheet`, then open sheet/index.html. (It runs
 * through Vitest only because that is the TypeScript runner this project already has.)
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { it } from 'vitest';
import { blazon } from '../src/arms/blazon';
import { pickable } from '../src/arms/catalogue';
import { arrangementsFor, cleanArms, countsFor, divisions, lines, ordinaries, patterns, shapes, type Arms } from '../src/arms/model';
import { parseBlazon } from '../src/arms/parse';
import { armsSvg } from '../src/arms/render';

const azure = { kind: 'plain', tincture: 'azure' };
const read = (text: string, shape = 'heater'): Arms => {
  const result = parseBlazon(text, shape as Arms['shape']);
  if (!result.ok) throw new Error(`${text}: ${result.problem.message}`);
  return result.arms;
};

const sections: [string, Arms[]][] = [];
const section = (title: string, list: unknown[]): void => void sections.push([title, list.map(cleanArms)]);

section('Shapes', shapes.flatMap((shape) => [read('Azure, a chevron Or between three mullets argent', shape), read('Gules, on a chief argent three hurts, a bordure Or', shape), read('Vert, a lion rampant Or', shape)]));
section('Divisions', divisions.map((division) => ({ field: { kind: 'divided', division, tinctures: ['gules', 'argent', 'azure'] } })));
section('Divisions with lines', lines.slice(1).flatMap((line) => ['perPale', 'perFess', 'perBend', 'perBendSinister', 'perChevron'].map((division) => ({ field: { kind: 'divided', division, tinctures: ['or', 'sable'], line } }))));
section('Patterns and furs', [...patterns.flatMap((pattern) => [6, 8].map((count) => ({ field: { kind: 'patterned', pattern, count, tinctures: ['argent', 'azure'] } }))), read('Ermine'), read('Vair'), read('Gules, a fess ermine'), read('Or, a lion rampant vair')]);
section('Ordinaries and lines', ordinaries.flatMap((type) => lines.map((line) => ({ field: azure, ordinary: { type, tincture: 'or', line } }))));
section('Chief and bordure', lines.flatMap((line) => [{ field: { kind: 'plain', tincture: 'gules' }, chief: { tincture: 'argent', line } }, { field: { kind: 'plain', tincture: 'gules' }, bordure: { tincture: 'argent', line } }]).concat(shapes.map((shape) => ({ shape, field: { kind: 'plain', tincture: 'vert' }, bordure: { tincture: 'or', line: 'engrailed' }, chief: { tincture: 'argent', line: 'straight' } })) as never));
section('Our own charges', ['mullet', 'crescent', 'roundel', 'annulet', 'fleurDeLis', 'lion', 'eagle', 'emu'].flatMap((charge) => [{ field: azure, charges: { charge, count: 1, tincture: 'or', points: 5 } }, { field: azure, charges: { charge, count: 3, tincture: 'argent', points: 6, attitude: 'passant', arrangement: charge === 'lion' ? 'inPale' : 'twoAndOne' } }]));
section('Arrangements, on every shape', shapes.flatMap((shape) => countsFor('field').flatMap((count) => arrangementsFor(count).length ? arrangementsFor(count).map((arrangement) => ({ shape, field: { kind: 'plain', tincture: 'sable' }, charges: { charge: 'mullet', count, tincture: 'or', arrangement } })) : [{ shape, field: { kind: 'plain', tincture: 'sable' }, charges: { charge: 'mullet', count, tincture: 'or' } }])));
section('Around and on each ordinary', ordinaries.flatMap((type) => [...countsFor('field', type).map((count) => ({ field: { kind: 'plain', tincture: 'gules' }, ordinary: { type, tincture: 'or' }, charges: { charge: 'mullet', count, tincture: 'argent' } })), ...countsFor('ordinary', type).map((count) => ({ field: { kind: 'plain', tincture: 'gules' }, ordinary: { type, tincture: 'or' }, onOrdinary: { charge: 'lion', count, tincture: 'sable' } }))]));
section('Everything at once, on every shape', shapes.flatMap((shape) => [read('Per pale gules and azure, on a fess wavy argent between three crescents Or, three torteaux, on a chief ermine a lion passant gules, a bordure engrailed Or', shape), read('Or, on a bend sable between six mullets gules, three bezants, on a chief azure three fleurs-de-lis Or', shape), read('Argent, on a cross gules between four eagles displayed sable, five plates, a bordure azure', shape), read('Vert, on a chevron embattled Or between three lions rampant argent, five hurts', shape)]));
section('Modern charges', pickable.filter((c) => c.kind === 'modern').map((c) => ({ field: { kind: 'plain', tincture: 'or' }, charges: { charge: c.id, count: 1, tincture: 'sable' } })));

it('writes the contact sheet', () => {
  const html = `<!doctype html><meta charset="utf-8"><title>Arms: contact sheet</title><style>body{font:13px system-ui;margin:16px;background:#888}h2{margin:18px 0 6px}div{display:flex;flex-wrap:wrap;gap:8px}figure{margin:0;width:150px;background:#ddd;padding:4px}figcaption{font-size:10px;line-height:1.2;height:3.6em;overflow:hidden}</style>${sections
    .map(([title, list]) => `<h2>${title}</h2><div>${list.map((arms) => `<figure>${armsSvg(arms, { bare: true })}<figcaption>${blazon(arms)}</figcaption></figure>`).join('')}</div>`)
    .join('')}`;
  mkdirSync(new URL('../sheet/', import.meta.url), { recursive: true });
  writeFileSync(new URL('../sheet/index.html', import.meta.url), html);
  // The beasts on their own, large, for drawing them.
  const big = ['Azure, a lion rampant Or', 'Gules, a lion passant Or', 'Or, an eagle displayed sable', 'Azure, a fleur-de-lis Or', 'Or, an emu proper'].map((text) => read(text, 'roundel'));
  writeFileSync(new URL('../sheet/art.html', import.meta.url), `${html.slice(0, html.indexOf('<h2>')).replace('width:150px', 'width:400px')}<div>${big.map((arms) => `<figure>${armsSvg(arms, { bare: true })}</figure>`).join('')}</div>`);
  // And one page per section, small enough to take a picture of.
  const head = html.slice(0, html.indexOf('<h2>'));
  sections.forEach(([title, list], i) => {
    const page = `${head}<h2>${title}</h2><div>${list.map((arms) => `<figure>${armsSvg(arms, { bare: true })}<figcaption>${blazon(arms)}</figcaption></figure>`).join('')}</div>`;
    writeFileSync(new URL(`../sheet/${i + 1}.html`, import.meta.url), page);
  });
});
