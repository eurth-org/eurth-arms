import { describe, expect, it } from 'vitest';
import { charges, pickable, roundelNames } from '../src/arms/catalogue';
import { arrangementsFor, cleanArms, countsFor, defaultArms, ordinaries, sameArms, tincturesOf } from '../src/arms/model';
import { contrast, tincture, tinctureClass, tinctures } from '../src/arms/tinctures';

describe('tinctures', () => {
  it('are two metals, five colours and two furs', () => {
    const count = (c: string) => tinctures.filter((t) => t.class === c).length;
    expect([count('metal'), count('colour'), count('fur')]).toEqual([2, 5, 2]);
    expect(tinctureClass('or')).toBe('metal');
    expect(tinctureClass('sable')).toBe('colour');
    expect(tinctureClass('vair')).toBe('fur');
    expect(tinctureClass('proper')).toBe('proper');
  });

  it('each carry a name, and no two share one', () => {
    for (const key of ['name', 'blazon', 'plain'] as const) expect(new Set(tinctures.map((t) => t[key])).size).toBe(tinctures.length);
  });

  it('can be told apart by lightness where hue alone would fail', () => {
    const paint = (id: Parameters<typeof tincture>[0]) => tincture(id).paint;
    // Red and green, and blue and purple, are pairs red-green colour blindness confuses; so are gold and green, below.
    expect(contrast(paint('gules'), paint('vert'))).toBeGreaterThan(2);
    expect(contrast(paint('azure'), paint('purpure'))).toBeGreaterThan(2);
    // Every metal stands clear of every colour: the rule of tincture, in numbers.
    for (const metal of tinctures.filter((t) => t.class === 'metal')) {
      for (const colour of tinctures.filter((t) => t.class === 'colour')) expect(contrast(metal.paint, colour.paint)).toBeGreaterThan(2);
    }
  });
});

describe('the catalogue of charges', () => {
  it('has unique ids, names and plurals', () => {
    expect(new Set(charges.map((c) => c.id)).size).toBe(charges.length);
    const said = [...charges.flatMap((c) => [c.name, c.plural]), ...Object.values(roundelNames).flatMap((n) => [n.name, n.plural])];
    // "fish" is its own plural; nothing else may repeat.
    expect(said.filter((word, i) => said.indexOf(word) !== i)).toEqual(['fish']);
  });

  it('keeps the emu out of the picker', () => {
    expect(pickable.some((c) => c.id === 'emu')).toBe(false);
    expect(charges.some((c) => c.id === 'emu')).toBe(true);
  });
});

describe('cleaning', () => {
  it('turns anything into valid arms', () => {
    for (const junk of [null, undefined, 42, 'gules', [], { shape: 'banana', field: { kind: 'plaid' } }, { field: { kind: 'divided', division: 7, tinctures: 'red' } }]) {
      const arms = cleanArms(junk);
      expect(arms.shape).toBe('heater');
      expect(cleanArms(arms)).toEqual(arms);
    }
  });

  it('keeps counts to what a place can hold', () => {
    const base = { field: { kind: 'plain', tincture: 'azure' }, charges: { charge: 'mullet', count: 5, tincture: 'or' } };
    expect(cleanArms(base).charges?.count).toBe(5);
    expect(cleanArms({ ...base, ordinary: { type: 'chevron', tincture: 'or' } }).charges?.count).toBe(3);
    expect(cleanArms({ ...base, ordinary: { type: 'cross', tincture: 'or' } }).charges?.count).toBe(4);
    expect(cleanArms({ ...base, charges: { ...base.charges, count: 99 } }).charges?.count).toBe(6);
    expect(cleanArms({ ...base, charges: { ...base.charges, count: Number.NaN } }).charges?.count).toBe(1);
    for (const type of ordinaries) {
      expect(countsFor('field', type).length).toBeGreaterThan(0);
      expect(countsFor('ordinary', type)).toContain(1);
    }
  });

  it('keeps each detail with the charge it belongs to', () => {
    const one = (charge: string, extra = {}) => cleanArms({ field: {}, charges: { charge, count: 3, tincture: 'or', points: 6, attitude: 'passant', arrangement: 'inPale', ...extra } }).charges!;
    expect(one('mullet')).toEqual({ charge: 'mullet', count: 3, tincture: 'or', arrangement: 'inPale', points: 6 });
    expect(one('lion')).toEqual({ charge: 'lion', count: 3, tincture: 'or', arrangement: 'inPale', attitude: 'passant' });
    expect(one('crescent', { arrangement: 'inSaltire' }).arrangement).toBe('twoAndOne');
    expect(one('emu', { tincture: 'gules' }).tincture).toBe('proper');
    expect(one('lion', { tincture: 'proper' }).tincture).toBe('or');
    expect(cleanArms({ field: {}, charges: { charge: 'wyvern', count: 1 } }).charges).toBeUndefined();
  });

  it('drops what has nothing to lie on', () => {
    const group = { charge: 'mullet', count: 1, tincture: 'or' };
    const arms = cleanArms({ field: {}, onOrdinary: group, onChief: group });
    expect(arms.onOrdinary).toBeUndefined();
    expect(arms.onChief).toBeUndefined();
  });

  it('only gives a line to divisions that have one line', () => {
    const divided = (division: string) => cleanArms({ field: { kind: 'divided', division, tinctures: ['or', 'gules'], line: 'wavy' } }).field;
    expect(divided('perFess')).toMatchObject({ line: 'wavy' });
    expect(divided('quarterly')).toMatchObject({ line: 'straight' });
    expect(divided('tiercedPall')).toMatchObject({ tinctures: ['or', 'gules', 'gules'] });
  });

  it('keeps patterns even and in range', () => {
    const barry = (count: unknown) => (cleanArms({ field: { kind: 'patterned', pattern: 'barry', count, tinctures: ['or', 'gules'] } }).field as { count: number }).count;
    expect([barry(6), barry(7), barry(2), barry(40), barry('x')]).toEqual([6, 8, 4, 10, 6]);
  });
});

describe('arms', () => {
  it('start as the mock-up shows them', () => {
    const arms = defaultArms();
    expect(arms.ordinary?.type).toBe('chevron');
    expect(tincturesOf(arms)).toEqual(['azure', 'or', 'argent']);
    expect(sameArms(arms, { ...arms, charges: { ...arms.charges!, arrangement: 'inPale' } })).toBe(true);
  });

  it('offer arrangements only where there are several charges', () => {
    expect(arrangementsFor(1)).toEqual([]);
    expect(arrangementsFor(3)[0]).toBe('twoAndOne');
    for (const n of [2, 3, 4, 5, 6]) expect(arrangementsFor(n).length).toBeGreaterThan(0);
  });
});
