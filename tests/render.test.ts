import { describe, expect, it } from 'vitest';
import { beastCredits, beastIds, beasts } from '../src/arms/beasts';
import { blazon } from '../src/arms/blazon';
import { charges, pickable } from '../src/arms/catalogue';
import { drawnArt } from '../src/arms/charges';
import { artCredits, footerCredit } from '../src/arms/credits';
import { describeArms } from '../src/arms/describe';
import { dist, insidePolygon, distToPolygon } from '../src/arms/geometry';
import { slotsOf } from '../src/arms/layout';
import { arrangementsFor, attitudes, attitudesFor, cleanArms, countsFor, defaultArms, divisions, lines, ordinaries, patterns, shapes, type Arms } from '../src/arms/model';
import { modernArt } from '../src/arms/modern';
import { parseBlazon } from '../src/arms/parse';
import { armsSvg, creditLine, creditsFor, missingBeasts } from '../src/arms/render';
import { shield } from '../src/arms/shapes';
import { seeded, wildArms } from './helpers';

const read = (text: string, shape: Arms['shape'] = 'heater'): Arms => {
  const result = parseBlazon(text, shape);
  if (!result.ok) throw new Error(`${text}: ${result.problem.message}`);
  return result.arms;
};

const wellFormed = (svg: string, what = '') => {
  expect(svg, what).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"[^>]* viewBox="0 0 600 720"/);
  expect(svg, what).not.toMatch(/NaN|undefined|Infinity|null/);
  expect(svg.match(/<svg/g), what).toHaveLength(1);
  expect(svg.endsWith('</svg>'), what).toBe(true);
  // Nothing but the handful of elements the renderer writes, and no way to run or fetch anything.
  for (const [, tag] of svg.matchAll(/<([a-zA-Z]+)/g)) expect(['svg', 'title', 'desc', 'defs', 'clipPath', 'pattern', 'rect', 'path', 'g', 'use'], what).toContain(tag);
  expect(svg, what).not.toMatch(/<script|on[a-z]+=|javascript:|<foreignObject|<image|<style/i);
  for (const [, target] of svg.matchAll(/href="([^"]*)"/g)) expect(target, what).toMatch(/^#arms-[a-z-]+$/);
  for (const [, target] of svg.matchAll(/url\(([^)]*)\)/g)) expect(target, what).toMatch(/^#arms-[a-z-]+$/);
  // Every id that is pointed at is defined.
  for (const [, id] of svg.matchAll(/(?:href="|url\()#([a-z-]+)/g)) expect(svg, what).toContain(`id="${id}"`);
};

const azure = { kind: 'plain', tincture: 'azure' };

describe('the drawings', () => {
  it('include every charge in the catalogue', () => {
    for (const def of charges) {
      const stances = attitudesFor(def.id);
      if (stances.length) {
        for (const attitude of stances) expect(beasts[`${def.id}-${attitude.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`], `${def.id} ${attitude}`).toBeDefined();
      } else if (def.kind === 'modern') {
        expect(modernArt(def.id), def.id).toBeDefined();
      } else {
        expect(drawnArt(def.id), def.id).toBeDefined();
      }
    }
    expect(Object.keys(beasts)).toHaveLength(attitudes.length);
  });

  it('are reduced to paths and groups, with roles for colours', () => {
    for (const [id, art] of Object.entries(beasts)) {
      expect(art.w, id).toBeGreaterThan(100);
      expect(art.h, id).toBeGreaterThan(100);
      for (const [, tag] of art.body.matchAll(/<([a-zA-Z]+)/g)) expect(['g', 'path'], id).toContain(tag);
      for (const [, name] of art.body.matchAll(/\s([a-z-]+)="/g)) expect(['d', 'fill', 'stroke', 'stroke-width', 'transform'], id).toContain(name);
      for (const [, fill] of art.body.matchAll(/fill="([^"]*)"/g)) expect(fill, id).toMatch(/^%[BWTK]$/);
      expect(art.body, id).toContain('fill="%B"');
      expect(art.body.length, id).toBeLessThan(90_000);
    }
  });

  it('can be fetched one at a time, as the browser does', async () => {
    const { loadBeast } = await import('../src/arms/beasts/lazy');
    for (const id of beastIds) expect(await loadBeast(id), id).toBe(true);
    expect(await loadBeast('wyvern-volant')).toBe(false);
    expect(missingBeasts(read('Gules, three lions passant guardant in pale Or'))).toEqual([]);
  });

  it('each come with their author and licence', () => {
    for (const id of Object.keys(beasts)) {
      const credit = beastCredits[id]!;
      expect(credit.author.length, id).toBeGreaterThan(3);
      expect(credit.source, id).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:[\w.()-]+\.svg$/);
      expect(['CC BY-SA 3.0', 'Public domain'], id).toContain(credit.licence);
      if (credit.licence !== 'Public domain') expect(credit.licenceUrl, id).toMatch(/^https:\/\/creativecommons\.org\/licenses\//);
    }
    expect(footerCredit).toContain('Sodacan');
    expect(footerCredit).toContain('CC BY-SA 3.0');
    expect(artCredits.map((c) => c.author)).toContain('Font Awesome Free');
  });
});

describe('drawing arms', () => {
  it('draws the mock-up’s arms, titled with their blazon and described in plain words', () => {
    const svg = armsSvg(defaultArms());
    wellFormed(svg);
    expect(svg).toContain('role="img" aria-label="Azure, a chevron Or between three mullets argent"');
    expect(svg).toContain('<title>Azure, a chevron Or between three mullets argent</title>');
    expect(svg).toContain('<desc>A blue shield with a gold chevron between three white five-pointed stars.</desc>');
    expect(svg.match(/<g transform="translate/g)).toHaveLength(3);
  });

  it('can leave the words out, for a picture labelled where it is shown', () => {
    const svg = armsSvg(defaultArms(), { bare: true });
    wellFormed(svg);
    expect(svg).toContain('aria-hidden="true"');
    expect(svg).not.toMatch(/<title|<desc|role=/);
  });

  it('draws every shape, field, line and ordinary', () => {
    for (const shape of shapes) {
      for (const division of divisions) for (const line of lines) wellFormed(armsSvg(cleanArms({ shape, field: { kind: 'divided', division, tinctures: ['or', 'gules', 'vair'], line } })), `${shape} ${division} ${line}`);
      for (const pattern of patterns) for (const count of [4, 6, 8, 10]) wellFormed(armsSvg(cleanArms({ shape, field: { kind: 'patterned', pattern, count, tinctures: ['argent', 'azure'] } })), `${shape} ${pattern}`);
      for (const type of ordinaries) {
        for (const line of lines) {
          wellFormed(armsSvg(cleanArms({ shape, field: azure, ordinary: { type, tincture: 'or', line }, chief: { tincture: 'ermine', line }, bordure: { tincture: 'gules', line } })), `${shape} ${type} ${line}`);
        }
      }
    }
  });

  it('draws every charge, alone and in threes', () => {
    for (const def of charges) {
      for (const attitude of attitudesFor(def.id).length ? attitudesFor(def.id) : [undefined]) {
        for (const count of [1, 3]) wellFormed(armsSvg(cleanArms({ field: azure, charges: { charge: def.id, count, tincture: 'or', attitude } })), def.id);
      }
    }
  });

  it('defines the furs only where they are used', () => {
    expect(armsSvg(read('Azure, a bend Or'))).not.toContain('<pattern');
    expect(armsSvg(read('Ermine, a bend gules')).match(/<pattern/g)).toHaveLength(1);
    const both = armsSvg(read('Vair, on a chief ermine three lions rampant vair'));
    expect(both.match(/<pattern/g)).toHaveLength(2);
    wellFormed(both);
  });

  it('draws a beast once, however many of it there are', () => {
    const svg = armsSvg(read('Gules, three lions passant guardant in pale Or'));
    wellFormed(svg);
    expect(svg.match(/<g id="arms-lion-passant-guardant-or"/g)).toHaveLength(1);
    expect(svg.match(/<use /g)).toHaveLength(3);
    expect(svg).toContain('xmlns:xlink=');
    expect(armsSvg(defaultArms())).not.toContain('xlink');
  });

  it('paints a beast in its tincture, with a blue tongue on a red one and pale lines on a black one', () => {
    const paintOf = (text: string) => armsSvg(read(text));
    expect(paintOf('Azure, a lion rampant Or')).toContain('fill="#f7cf57"');
    expect(paintOf('Azure, a lion rampant Or')).toContain('fill="#b3192b"');
    expect(paintOf('Or, a lion rampant gules')).toContain('fill="#2698d4"');
    expect(paintOf('Or, a lion rampant sable')).toContain('stroke="#b9b9b9"');
    expect(paintOf('Gules, a lion rampant ermine')).toContain('fill="url(#arms-ermine)"');
    for (const svg of [paintOf('Or, a lion rampant sable'), paintOf('Or, an eagle rising gules')]) expect(svg).not.toMatch(/%[BWTK]/);
  });

  it('credits the beasts in a picture, and only where there are any', () => {
    expect(creditsFor(defaultArms())).toEqual([]);
    expect(creditLine(defaultArms())).toBe('');
    const lions = read('Gules, on a fess Or between three lions rampant argent, three lions passant gules');
    expect(creditsFor(lions).map((c) => c.title)).toEqual(['Lion Rampant.svg', 'Lion Passant.svg']);
    expect(creditLine(read('Azure, a lion rampant Or'))).toBe('"Lion Rampant" by Sodacan, from Wikimedia Commons, CC BY-SA 3.0 (https://creativecommons.org/licenses/by-sa/3.0/), recoloured.');
    expect(armsSvg(read('Azure, a lion rampant Or'))).toContain('Sodacan, from Wikimedia Commons, CC BY-SA 3.0');
    expect(creditLine(read('Or, an eagle displayed sable'))).toContain('public domain');
    expect(armsSvg(read('Azure, a lion rampant Or'), { bare: true })).not.toContain('Sodacan');
  });

  it('draws the emu in its own colours', () => {
    const svg = armsSvg(read('Or, an emu proper'));
    wellFormed(svg);
    expect(svg).toContain('#6f5237');
    expect(svg).toContain('<desc>A gold shield with an emu in its natural colours.</desc>');
  });

  it('draws whatever the model can hold, within what a profile can carry', () => {
    const rng = seeded(1066);
    for (let i = 0; i < 300; i++) {
      const arms = wildArms(rng);
      const svg = armsSvg(arms);
      wellFormed(svg, blazon(arms));
      expect(svg.length, blazon(arms)).toBeLessThan(524_288);
    }
  });

  it('draws the same arms the same way every time', () => {
    const arms = read('Per pale gules and azure, on a fess wavy argent between three crescents Or, three torteaux');
    expect(armsSvg(arms)).toBe(armsSvg(cleanArms(JSON.parse(JSON.stringify(arms)))));
  });
});

describe('placing charges', () => {
  /** Every charge has its place: inside the shield, clear of its neighbours, and big enough to see. */
  const check = (design: unknown, smallest: number): void => {
    const arms = cleanArms(design);
    const what = `${arms.shape}: ${blazon(arms)}`;
    const slots = slotsOf(arms);
    const outline = shield(arms.shape).outline;
    expect(slots.field.length, what).toBe(arms.charges?.count ?? 0);
    expect(slots.ordinary.length, what).toBe(arms.onOrdinary?.count ?? 0);
    expect(slots.chief.length, what).toBe(arms.onChief?.count ?? 0);
    const all = [...slots.field, ...slots.ordinary, ...slots.chief];
    for (const slot of all) {
      expect(slot.r, what).toBeGreaterThanOrEqual(smallest);
      expect(insidePolygon([slot.x, slot.y], outline), what).toBe(true);
      expect(distToPolygon([slot.x, slot.y], outline), what).toBeGreaterThanOrEqual(slot.r - 0.01);
    }
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) expect(dist([all[i]!.x, all[i]!.y], [all[j]!.x, all[j]!.y]), what).toBeGreaterThanOrEqual(all[i]!.r + all[j]!.r - 0.01);
    }
  };

  it('fits every number and arrangement on every shape', () => {
    for (const shape of shapes) {
      for (const count of countsFor('field')) {
        for (const arrangement of [undefined, ...arrangementsFor(count)]) {
          check({ shape, field: azure, charges: { charge: 'mullet', count, tincture: 'or', arrangement } }, count <= 3 ? 40 : 30);
        }
      }
    }
  });

  it('gives a single charge pride of place', () => {
    for (const shape of shapes) {
      const [slot] = slotsOf(cleanArms({ shape, field: azure, charges: { charge: 'lion', count: 1, tincture: 'or' } })).field;
      expect(slot!.r, shape).toBeGreaterThan(150);
      expect(slot!.x, shape).toBeCloseTo(300, 5);
    }
  });

  it('keeps pairs level and mirrored', () => {
    for (const shape of shapes) {
      const [a, b, c] = slotsOf(cleanArms({ shape, field: azure, charges: { charge: 'mullet', count: 3, tincture: 'or' } })).field;
      expect(a!.y, shape).toBeCloseTo(b!.y, 5);
      expect(a!.x + b!.x, shape).toBeCloseTo(600, 5);
      expect(c!.x, shape).toBeCloseTo(300, 5);
      expect(c!.y, shape).toBeGreaterThan(a!.y);
    }
  });

  it('fits charges around and on every ordinary, on every shape', () => {
    for (const shape of shapes) {
      for (const type of ordinaries) {
        for (const count of countsFor('field', type)) check({ shape, field: azure, ordinary: { type, tincture: 'or' }, charges: { charge: 'mullet', count, tincture: 'argent' } }, 16);
        for (const count of countsFor('ordinary', type)) check({ shape, field: azure, ordinary: { type, tincture: 'or' }, onOrdinary: { charge: 'roundel', count, tincture: 'gules' } }, shape === 'lozenge' ? 8 : 14);
      }
      for (const count of countsFor('chief')) check({ shape, field: azure, chief: { tincture: 'or' }, onChief: { charge: 'crescent', count, tincture: 'sable' } }, 18);
    }
  });

  it('turns charges on a bend to lie along it', () => {
    const slots = slotsOf(read('Or, on a bend sable three bezants'));
    expect(slots.ordinary.map((slot) => slot.rot)).toEqual([45, 45, 45]);
    expect(slots.ordinary[0]!.x).toBeLessThan(slots.ordinary[2]!.x);
    expect(slots.ordinary[0]!.y).toBeLessThan(slots.ordinary[2]!.y);
  });

  it('never loses a charge, whatever else is on the shield', () => {
    const rng = seeded(42);
    for (let i = 0; i < 400; i++) check(wildArms(rng), 5.9);
  });
});

describe('describing arms in plain words', () => {
  const say = (text: string, shape: Arms['shape'] = 'heater') => describeArms(read(text, shape));

  it('describes fields', () => {
    expect(say('Or')).toBe('A gold shield.');
    expect(say('Ermine', 'lozenge')).toBe('An ermine diamond-shaped shield.');
    expect(say('Per pale gules and azure')).toBe('A shield split down the middle, red on the left and blue on the right.');
    expect(say('Per fess wavy azure and argent')).toBe('A shield split across the middle along a wavy line, blue above and white below.');
    expect(say('Quarterly gules and Or', 'roundel')).toBe('A round shield quartered, red at the top left and bottom right and gold in the other two quarters.');
    expect(say('Tierced per pale vert, argent and gules')).toBe('A shield in three upright bands of green, white and red.');
    expect(say('Barry of eight argent and azure')).toBe('A shield of eight level stripes, white and blue by turns.');
    expect(say('Chequy Or and azure')).toBe('A shield chequered gold and blue.');
  });

  it('describes ordinaries and what lies around and on them', () => {
    expect(say('Azure, a bend Or')).toBe('A blue shield with a gold diagonal band from the top left.');
    expect(say('Azure, a fess wavy argent')).toBe('A blue shield with a wavy white band across the middle.');
    expect(say('Or, on a bend engrailed sable three bezants')).toBe('A gold shield with a scallop-edged black diagonal band from the top left, and on it three gold discs.');
    expect(say('Per pale gules and azure, a cross Or between four mullets of six points argent')).toBe(
      'A shield split down the middle, red on the left and blue on the right, with a gold cross between four white six-pointed stars.',
    );
  });

  it('describes charges, their number, attitude and arrangement', () => {
    expect(say('Gules, three lions passant guardant in pale Or')).toBe('A red shield with three gold walking lions facing the viewer, one above the other.');
    expect(say('Azure, a lion rampant Or')).toBe('A blue shield with a gold rearing lion.');
    expect(say('Or, an eagle displayed sable')).toBe('A gold shield with a black eagle with spread wings.');
    expect(say('Vert, two ears of wheat in fess Or')).toBe('A green shield with two gold ears of wheat, side by side.');
    expect(say('Sable, an annulet argent')).toBe('A black shield with a white ring.');
  });

  it('describes the chief and the bordure in sentences of their own', () => {
    expect(say('Azure, a lion rampant Or, on a chief argent three torteaux, a bordure embattled gules')).toBe(
      'A blue shield with a gold rearing lion. Across the top is a white band, with three red discs on it. A battlemented red border runs round the edge.',
    );
  });

  it('has something to say about anything, within what a profile summary can hold', () => {
    const rng = seeded(7);
    for (let i = 0; i < 500; i++) {
      const text = describeArms(wildArms(rng));
      expect(text).toMatch(/^An? .+\.$/);
      expect(text).not.toMatch(/undefined|  |,,| \./);
      expect(text.length).toBeLessThanOrEqual(600);
    }
  });

  it('names every charge the picker offers', () => {
    for (const def of pickable) expect(describeArms(cleanArms({ field: azure, charges: { charge: def.id, count: 2, tincture: 'or' } }))).toMatch(/^A blue shield with two gold .+, one above the other\.$/);
  });
});
