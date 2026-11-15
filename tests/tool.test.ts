import { describe, expect, it } from 'vitest';
import { blazon } from '../src/arms/blazon';
import { pickable } from '../src/arms/catalogue';
import { checkTincture } from '../src/arms/check';
import { describeArms } from '../src/arms/describe';
import { compact, expand, LINK_VERSION, MAX_LINK, openLink } from '../src/arms/link';
import { arrangements, attitudes, cleanArms, defaultArms, divisions, lines, ordinaries, patterns, shapes, type Arms } from '../src/arms/model';
import { parseBlazon } from '../src/arms/parse';
import { fromSection, HOME, LIMITS, toSection } from '../src/arms/profile';
import { randomArms, randomSimple } from '../src/arms/random';
import { armsSvg } from '../src/arms/render';
import { cleanSimple, defaultSimple, fieldPresets, fromSimple, isPrincipal, ordinaryPresets, toSimple } from '../src/arms/simple';
import { templates } from '../src/arms/templates';
import { tinctureIds } from '../src/arms/tinctures';
import { seeded, wildArms } from './helpers';

const read = (text: string, shape: Arms['shape'] = 'heater'): Arms => {
  const result = parseBlazon(text, shape);
  if (!result.ok) throw new Error(`${text}: ${result.problem.message}`);
  return result.arms;
};

/** What the site does around the compact form: JSON, base64url, a version in front. */
const encode = (state: unknown): string => `${LINK_VERSION}.${Buffer.from(JSON.stringify(state)).toString('base64url')}`;
const decode = (value: string): unknown => {
  try {
    return JSON.parse(Buffer.from(value.replace(/^\d+\./, ''), 'base64url').toString());
  } catch {
    return null;
  }
};

describe('simple mode', () => {
  it('starts with the mock-up’s arms', () => {
    expect(fromSimple(defaultSimple())).toEqual(defaultArms());
    expect(toSimple(defaultArms())).toEqual(defaultSimple());
  });

  it('offers every field and each of the nine ordinaries', () => {
    expect(fieldPresets.map((p) => p.id)).toEqual(['plain', ...divisions, ...patterns]);
    expect(ordinaryPresets.map((p) => p.id).sort()).toEqual(['none', 'chief', 'bordure', ...ordinaries].sort());
    expect(ordinaryPresets.filter((p) => isPrincipal(p.id)).map((p) => p.id).sort()).toEqual([...ordinaries].sort());
  });

  it('makes arms from every choice, and finds the choices again', () => {
    for (const field of fieldPresets) {
      for (const ordinary of ordinaryPresets) {
        for (const charge of ['none', 'mullet', 'lion', 'anchor']) {
          const simple = { ...defaultSimple(), field: field.id, ordinary: ordinary.id, charge, tinctures: ['or', 'gules', 'argent'] as [never, never, never] };
          const arms = fromSimple(simple);
          expect(cleanArms(arms)).toEqual(arms);
          const back = toSimple(arms);
          expect(back && fromSimple(back), blazon(arms)).toEqual(arms);
        }
      }
    }
  });

  it('puts the chief and the bordure in their own places', () => {
    expect(blazon(fromSimple({ ...defaultSimple(), ordinary: 'chief' }))).toBe('Azure, three mullets argent, a chief Or');
    expect(blazon(fromSimple({ ...defaultSimple(), ordinary: 'bordure', charge: 'none' }))).toBe('Azure, a bordure Or');
    expect(blazon(fromSimple({ ...defaultSimple(), ordinary: 'cross' }))).toBe('Azure, a cross Or between four mullets argent');
    expect(blazon(fromSimple({ ...defaultSimple(), ordinary: 'none', charge: 'lion', count: 1, attitude: 'passantGuardant' }))).toBe('Azure, a lion passant guardant argent');
  });

  it('can’t express what only Advanced mode can', () => {
    expect(toSimple(read('Azure, a fess wavy Or'))).toBeUndefined();
    expect(toSimple(read('Azure, on a fess Or three torteaux'))).toBeUndefined();
    expect(toSimple(read('Azure, a fess Or, a chief argent'))).toBeUndefined();
    expect(toSimple(read('Azure, three mullets in pale Or'))).toBeUndefined();
    expect(toSimple(read('Azure, three mullets of six points Or'))).toBeUndefined();
    expect(toSimple(read('Azure, three lions passant Or'))?.attitude).toBe('passant');
  });

  it('cleans whatever it is handed', () => {
    for (const junk of [null, 7, 'x', [], { field: 'tartan', ordinary: 'canton', charge: 'wyvern', count: 99, tinctures: ['pink'] }]) {
      const simple = cleanSimple(junk);
      expect(cleanSimple(simple)).toEqual(simple);
      expect(() => fromSimple(simple)).not.toThrow();
    }
    expect(cleanSimple({ charge: 'lion', attitude: 'displayed' }).attitude).toBe('rampant');
    expect(cleanSimple({ charge: 'mullet', attitude: 'rampant' }).attitude).toBeUndefined();
  });
});

describe('random arms', () => {
  const sample = (() => {
    const rng = seeded(2026);
    return Array.from({ length: 2000 }, () => randomSimple(rng));
  })();

  it('always respect the rule of tincture', () => {
    for (const simple of sample) {
      const arms = fromSimple(simple);
      expect(checkTincture(arms).status, blazon(arms)).not.toBe('broken');
    }
  });

  it('always have something on the shield or a parted field', () => {
    for (const simple of sample) expect(simple.field !== 'plain' || simple.ordinary !== 'none' || simple.charge !== 'none', JSON.stringify(simple)).toBe(true);
  });

  it('are simple choices, so Simple mode can adjust them', () => {
    for (const simple of sample) {
      expect(cleanSimple(simple)).toEqual(simple);
      expect(toSimple(fromSimple(simple)) && fromSimple(toSimple(fromSimple(simple))!)).toEqual(fromSimple(simple));
    }
  });

  it('use the whole of the maker, and never the emu', () => {
    const seen = (key: 'field' | 'ordinary' | 'charge' | 'shape') => new Set(sample.map((s) => s[key]));
    expect(seen('field').size).toBe(fieldPresets.length);
    expect(seen('ordinary').size).toBe(ordinaryPresets.length);
    expect(seen('shape').size).toBe(shapes.length);
    expect(seen('charge').size).toBeGreaterThan(60);
    expect(seen('charge').has('emu')).toBe(false);
    expect(new Set(sample.map((s) => s.attitude)).size).toBe(attitudes.length + 1);
    expect(new Set(sample.map((s) => blazon(fromSimple(s)))).size).toBeGreaterThan(1500);
  });

  it('are mostly plain fields with the old charges, as arms are', () => {
    const share = (test: (s: (typeof sample)[number]) => boolean) => sample.filter(test).length / sample.length;
    expect(share((s) => s.field === 'plain')).toBeGreaterThan(0.45);
    expect(share((s) => pickable.find((c) => c.id === s.charge)?.kind === 'modern')).toBeLessThan(0.3);
    expect(share((s) => s.shape === 'heater')).toBeGreaterThan(0.4);
  });

  it('are the same for the same seed, and draw', () => {
    expect(randomArms(seeded(5))).toEqual(randomArms(seeded(5)));
    const rng = seeded(99);
    for (let i = 0; i < 50; i++) expect(armsSvg(randomArms(rng))).toMatch(/^<svg /);
    expect(() => randomArms()).not.toThrow();
  });
});

describe('arms in a link', () => {
  it('say nothing when they are the default arms', () => {
    expect(compact(defaultArms())).toEqual({});
    expect(expand({})).toEqual(defaultArms());
    expect(expand(undefined)).toEqual(defaultArms());
  });

  it('come back as they went in', () => {
    const rng = seeded(1066);
    for (let i = 0; i < 1000; i++) {
      const arms = wildArms(rng);
      const state = JSON.parse(JSON.stringify(compact(arms)));
      expect(expand(state), blazon(arms)).toEqual(arms);
    }
    for (const template of templates) {
      const arms = read(template.blazon, template.shape);
      expect(expand(decode(encode(compact(arms))))).toEqual(arms);
    }
  });

  it('say only what differs', () => {
    expect(compact(cleanArms({ ...defaultArms(), shape: 'lozenge' }))).toEqual({ s: 4 });
    expect(compact(read('Azure, a chevron Or'))).toEqual({ c: 0 });
    expect(compact(read('Azure, three mullets argent'))).toEqual({ o: 0, c: ['mullet', 3, 1, 3, 5] });
    expect(compact(read('Gules, a lion rampant Or'))).toEqual({ f: 2, o: 0, c: ['lion', 1, 0, -1, 0] });
    expect(compact(read('Per fess wavy azure and argent, a chevron Or between three mullets argent'))).toEqual({ f: [0, 1, 3, 3, 1] });
  });

  it('stay short', () => {
    const rng = seeded(3);
    let longest = 0;
    for (let i = 0; i < 1000; i++) longest = Math.max(longest, encode(compact(wildArms(rng))).length);
    expect(longest).toBeLessThan(260);
    expect(longest).toBeLessThan(MAX_LINK);
    expect(encode(compact(read('Gules, a lion rampant Or'))).length).toBeLessThan(70);
  });

  it('are checked and clamped: a link is someone else’s input', () => {
    for (const junk of [null, 5, 'x', [], { s: 99, f: 'red', o: 'cross', c: 7, h: {}, b: [] }, { f: [0, 99, 99, 99], c: ['<script>', 1e9, -4] }, { c: [['a'], {}, null] }, { __proto__: { s: 1 } }]) {
      const arms = expand(junk);
      expect(cleanArms(arms)).toEqual(arms);
      expect(() => armsSvg(arms)).not.toThrow();
    }
    expect(expand({ c: ['wyvern', 3, 0] }).charges).toBeUndefined();
    expect(expand({ s: 2 }).shape).toBe('spanish');
    expect(armsSvg(expand({ c: ['"><script>alert(1)</script>', 1, 0] }))).not.toContain('script');
  });

  it('holds the order of its lists still: they are part of the format', () => {
    expect(shapes.join()).toBe('heater,french,spanish,polish,lozenge,roundel');
    expect(lines.join()).toBe('straight,engrailed,indented,wavy,embattled');
    expect(divisions.join()).toBe('perPale,perFess,perBend,perBendSinister,perChevron,perSaltire,quarterly,tiercedPale,tiercedFess,tiercedPall');
    expect(patterns.join()).toBe('barry,paly,bendy,chequy');
    expect(ordinaries.join()).toBe('pale,fess,bend,chevron,cross,saltire,pile');
    expect(arrangements.join()).toBe('inPale,inFess,inBend,twoAndOne,oneAndTwo,twoAndTwo,inCross,inSaltire,threeTwoOne');
    expect(attitudes.join()).toBe('rampant,rampantGuardant,passant,passantGuardant,statant,statantGuardant,salient,sejant,sejantErect,couchant,dormant,courant,displayed,rising');
    expect(tinctureIds.join()).toBe('or,argent,gules,azure,vert,sable,purpure,ermine,vair');
  });

  it('can carry a typed blazon instead', () => {
    const emu = openLink({ blazon: 'Or, an emu proper' });
    expect(emu.problem).toBeUndefined();
    expect(blazon(emu.arms)).toBe('Or, an emu proper');
    expect(openLink({ blazon: 'Gules, a lion Or', shape: 'roundel' }).arms.shape).toBe('roundel');
    expect(openLink({ blazon: 'Gules, a lion Or', shape: 'banana' }).arms.shape).toBe('heater');
    const wrong = openLink({ blazon: 'Azure, a wyvern Or', state: { s: 3 } });
    expect(wrong.problem?.message).toContain('wyvern');
    expect(wrong.arms).toEqual(defaultArms());
    expect(openLink({ blazon: '  ', state: { s: 3 } }).arms.shape).toBe('polish');
    expect(openLink({ state: compact(read('Vert, a bend argent')) }).arms).toEqual(read('Vert, a bend argent'));
    expect(openLink({ blazon: 'Azure, a chevron Or between two mullets argent' }).notes).toHaveLength(1);
  });
});

describe('the profile’s arms section', () => {
  const arms = read('Gules, three lions passant guardant in pale Or', 'french');
  const link = `${HOME}/?d=${encode(compact(arms))}`;
  const now = new Date('2026-12-10T00:00:00.000Z');

  it('holds the blazon, the link, the picture, a summary and the time', () => {
    const section = toSection(arms, link, {}, now);
    expect(section).toMatchObject({ link, blazon: 'Gules, three lions passant guardant in pale Or', updated: '2026-12-10T00:00:00.000Z', shape: 'french' });
    expect(section.summary).toBe(describeArms(arms));
    expect(section.svg).toBe(armsSvg(arms));
    expect(section.svg).toContain('Sodacan');
  });

  it('stays within the schema’s limits, whatever the design', () => {
    const rng = seeded(8);
    for (let i = 0; i < 200; i++) {
      const design = wildArms(rng);
      const section = toSection(design, `${HOME}/?d=${encode(compact(design))}`, {}, now);
      expect(section.link!.length).toBeLessThanOrEqual(LIMITS.link);
      expect(section.summary!.length).toBeLessThanOrEqual(LIMITS.summary);
      expect(section.blazon!.length).toBeLessThanOrEqual(LIMITS.blazon);
      expect(section.svg!.length).toBeLessThanOrEqual(LIMITS.svg);
      expect(section.updated).toMatch(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/);
    }
  });

  it('keeps keys it doesn’t know, and drops a link that isn’t https', () => {
    const section = toSection(arms, 'http://arms.eurth.org/', { motto: 'Semper emu', link: 'https://old.example/' }, now);
    expect(section.motto).toBe('Semper emu');
    expect(section.link).toBeUndefined();
    expect(toSection(arms, link, 'nonsense', now).blazon).toBeDefined();
  });

  it('brings the design back from its link', () => {
    expect(fromSection(toSection(arms, link, {}, now), decode)).toEqual(arms);
    const rng = seeded(21);
    for (let i = 0; i < 200; i++) {
      const design = wildArms(rng);
      expect(fromSection(toSection(design, `${HOME}/?d=${encode(compact(design))}`, {}, now), decode)).toEqual(design);
    }
    expect(fromSection({ link: `${HOME}/` }, decode)).toEqual(defaultArms());
    expect(fromSection({ link: `${HOME}/?blazon=Or%2C+an+emu+proper&shape=roundel` }, decode)).toEqual(read('Or, an emu proper', 'roundel'));
  });

  it('falls back on the blazon and the shape when the link is missing, foreign or broken', () => {
    const section = toSection(arms, link, {}, now);
    for (const other of [undefined, 'https://evil.example/?d=1.e30', 'not a link', `${HOME}/?d=garbage`, `${HOME}.evil.example/?d=${encode(compact(defaultArms()))}`]) {
      expect(fromSection({ ...section, link: other }, decode), String(other)).toEqual(arms);
    }
  });

  it('gives nothing for a section with nothing readable in it', () => {
    for (const junk of [null, 5, 'x', [], {}, { blazon: 'Azure, a wyvern Or' }, { blazon: 7, link: 9 }, { blazon: 'x'.repeat(LIMITS.blazon + 1) }, { link: 'https://evil.example/' }]) {
      expect(fromSection(junk, decode)).toBeUndefined();
    }
  });
});

describe('the templates', () => {
  it('are 18 to 24 arms with names and addresses of their own', () => {
    expect(templates.length).toBeGreaterThanOrEqual(18);
    expect(templates.length).toBeLessThanOrEqual(24);
    for (const key of ['id', 'nation', 'blazon', 'meaning'] as const) expect(new Set(templates.map((t) => t[key])).size).toBe(templates.length);
    for (const template of templates) {
      expect(template.id).toBe(template.nation.toLowerCase());
      expect(template.id).toMatch(/^[a-z]+$/);
      expect(template.meaning.length).toBeGreaterThan(30);
      expect(template.meaning.length).toBeLessThan(160);
      expect(template.meaning).toMatch(/[.]$/);
    }
  });

  it('each have a blazon that reads back to the same arms, word for word', () => {
    for (const template of templates) {
      const result = parseBlazon(template.blazon, template.shape);
      if (!result.ok) throw new Error(`${template.nation}: ${result.problem.message}`);
      expect(result.notes, template.nation).toEqual([]);
      expect(blazon(result.arms), template.nation).toBe(template.blazon);
      // And once more round, through the arms themselves.
      const again = parseBlazon(blazon(result.arms), template.shape);
      expect(again.ok && again.arms, template.nation).toEqual(result.arms);
      expect(result.arms.shape).toBe(template.shape);
    }
  });

  it('all respect the rule of tincture', () => {
    for (const template of templates) expect(checkTincture(read(template.blazon)).status, template.nation).toBe('respected');
  });

  it('show what the maker can do', () => {
    const all = templates.map((t) => read(t.blazon, t.shape));
    expect(new Set(all.map((a) => a.shape)).size).toBe(shapes.length);
    expect(new Set(all.map((a) => a.field.kind)).size).toBe(3);
    expect(new Set(all.flatMap((a) => (a.ordinary ? [a.ordinary.type] : []))).size).toBe(ordinaries.length);
    expect(all.some((a) => a.chief) && all.some((a) => a.bordure) && all.some((a) => a.onOrdinary) && all.some((a) => a.onChief)).toBe(true);
    expect(new Set(all.flatMap((a) => [a.ordinary?.line, a.chief?.line, a.bordure?.line, a.field.kind === 'divided' ? a.field.line : undefined])).size).toBeGreaterThanOrEqual(4);
    expect(new Set(all.flatMap((a) => (a.charges?.attitude ? [a.charges.attitude] : []))).size).toBeGreaterThanOrEqual(6);
    for (const arms of all) expect(armsSvg(arms).length).toBeGreaterThan(500);
  });
});
