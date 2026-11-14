import { describe, expect, it } from 'vitest';
import { blazon } from '../src/arms/blazon';
import { charges } from '../src/arms/catalogue';
import { cleanArms, defaultArms, divisions, lines, ordinaries, patterns, shapes, countsFor, arrangementsFor, linedDivisions, type Arms } from '../src/arms/model';
import { MAX_BLAZON, parseBlazon } from '../src/arms/parse';
import { tinctureIds } from '../src/arms/tinctures';
import { seeded, wildArms } from './helpers';

const read = (text: string): Arms => {
  const result = parseBlazon(text);
  if (!result.ok) throw new Error(`${text}: ${result.problem.message}`);
  return result.arms;
};
const problem = (text: unknown): string => {
  const result = parseBlazon(text);
  return result.ok ? '' : result.problem.message;
};
/** Written and read back, a design must be the same arms. */
const roundTrip = (design: unknown): string => {
  const arms = cleanArms(design);
  const text = blazon(arms);
  const result = parseBlazon(text, arms.shape);
  if (!result.ok) throw new Error(`${text}: ${result.problem.message}`);
  expect(result.arms, text).toEqual(arms);
  expect(result.notes, text).toEqual([]);
  expect(blazon(result.arms)).toBe(text);
  return text;
};

const azure = { kind: 'plain', tincture: 'azure' };

describe('writing a blazon', () => {
  it('writes the mock-up’s arms', () => {
    expect(blazon(defaultArms())).toBe('Azure, a chevron Or between three mullets argent');
  });

  it('follows the herald’s order: field, ordinary and charges, chief, bordure', () => {
    expect(
      blazon(
        cleanArms({
          field: { kind: 'divided', division: 'perPale', tinctures: ['gules', 'azure'] },
          ordinary: { type: 'fess', tincture: 'argent', line: 'wavy' },
          charges: { charge: 'crescent', count: 3, tincture: 'or' },
          onOrdinary: { charge: 'roundel', count: 3, tincture: 'gules' },
          chief: { tincture: 'ermine' },
          onChief: { charge: 'lion', count: 1, tincture: 'gules', attitude: 'passant' },
          bordure: { tincture: 'or', line: 'engrailed' },
        }),
      ),
    ).toBe('Per pale gules and azure, on a fess wavy argent between three crescents Or, three torteaux, on a chief ermine a lion passant gules, a bordure engrailed Or');
  });

  it('names fields', () => {
    const field = (f: unknown) => blazon(cleanArms({ field: f }));
    expect(field({ kind: 'plain', tincture: 'or' })).toBe('Or');
    expect(field({ kind: 'divided', division: 'perFess', tinctures: ['azure', 'argent'], line: 'wavy' })).toBe('Per fess wavy azure and argent');
    expect(field({ kind: 'divided', division: 'quarterly', tinctures: ['gules', 'or'] })).toBe('Quarterly gules and Or');
    expect(field({ kind: 'divided', division: 'tiercedPale', tinctures: ['vert', 'argent', 'gules'] })).toBe('Tierced per pale vert, argent and gules');
    expect(field({ kind: 'patterned', pattern: 'barry', count: 8, tinctures: ['argent', 'azure'] })).toBe('Barry of eight argent and azure');
    expect(field({ kind: 'patterned', pattern: 'chequy', tinctures: ['or', 'azure'] })).toBe('Chequy Or and azure');
  });

  it('names charges, their number and how they lie', () => {
    const group = (g: object) => blazon(cleanArms({ field: azure, charges: { tincture: 'or', count: 1, ...g } }));
    expect(group({ charge: 'eagle' })).toBe('Azure, an eagle displayed Or');
    expect(group({ charge: 'lion', attitude: 'passant', count: 3, arrangement: 'inPale' })).toBe('Azure, three lions passant in pale Or');
    expect(group({ charge: 'mullet', points: 6, count: 2 })).toBe('Azure, two mullets of six points in pale Or');
    expect(group({ charge: 'fleurDeLis', count: 3 })).toBe('Azure, three fleurs-de-lis Or');
    expect(group({ charge: 'annulet', count: 5, arrangement: 'inCross' })).toBe('Azure, five annulets in cross Or');
    expect(group({ charge: 'wheat', count: 3, arrangement: 'inFess' })).toBe('Azure, three ears of wheat in fess Or');
    expect(group({ charge: 'hourglass' })).toBe('Azure, an hourglass Or');
  });

  it('gives roundels their own names', () => {
    const roundels = (tincture: string, count = 3) => blazon(cleanArms({ field: { kind: 'plain', tincture: 'ermine' }, charges: { charge: 'roundel', count, tincture } }));
    expect(roundels('or')).toBe('Ermine, three bezants');
    expect(roundels('argent', 1)).toBe('Ermine, a plate');
    expect(roundels('gules')).toBe('Ermine, three torteaux');
    expect(roundels('azure', 1)).toBe('Ermine, a hurt');
    expect(roundels('vair')).toBe('Ermine, three roundels vair');
  });

  it('stays within what the profile can hold', () => {
    const rng = seeded(7);
    for (let i = 0; i < 500; i++) expect(blazon(wildArms(rng)).length).toBeLessThanOrEqual(400);
  });
});

describe('reading a blazon', () => {
  it('reads the mock-up’s blazon', () => {
    expect(read('Azure, a chevron Or between three mullets argent')).toEqual(defaultArms());
  });

  it('is forgiving about case, commas, digits and plain words', () => {
    const want = read('Azure, a chevron Or between three mullets argent');
    for (const text of [
      'azure a chevron or between 3 mullets argent',
      'AZURE, A CHEVRON OR BETWEEN THREE MULLETS ARGENT.',
      'Blue, a chevron gold between three stars silver',
      'Azure; a chevron Or, between three mullets, argent',
      'Azure, a chevron Or and three mullets argent',
    ]) {
      expect(read(text), text).toEqual(want);
    }
  });

  it('follows “of the field” and “of the first”', () => {
    expect(blazon(read('Gules, on a fess argent three mullets of the field'))).toBe('Gules, on a fess argent three mullets gules');
    expect(blazon(read('Per pale Or and sable, a chevron gules between three crescents of the second'))).toBe('Per pale Or and sable, a chevron gules between three crescents sable');
    expect(blazon(read('Azure, a bend Or, a chief of the last'))).toBe('Azure, a bend Or, a chief Or');
    expect(problem('Per pale Or and sable, a lion rampant of the field')).toContain('one tincture');
    expect(problem('Azure, a lion rampant of the third')).toContain('no third tincture');
  });

  it('knows the old spellings and other ways of saying things', () => {
    expect(blazon(read('Checky or and azure'))).toBe('Chequy Or and azure');
    expect(blazon(read('Party per fesse argent and vert'))).toBe('Per fess argent and vert');
    expect(blazon(read('Per pall gules, argent and azure'))).toBe('Tierced per pall gules, argent and azure');
    expect(blazon(read('Tierced in pale vert argent gules'))).toBe('Tierced per pale vert, argent and gules');
    expect(blazon(read('Barry argent and azure'))).toBe('Barry of six argent and azure');
    expect(blazon(read('Or, three fleurs de lys azure, all within a bordure gules'))).toBe('Or, three fleurs-de-lis azure, a bordure gules');
    expect(blazon(read('Vert, three roundels Or 2 and 1'))).toBe('Vert, three bezants');
    expect(blazon(read('Gules, a lion Or'))).toBe('Gules, a lion rampant Or');
    expect(blazon(read('Azure, a fess argent wavy'))).toBe('Azure, a fess wavy argent');
  });

  it('draws the emu, and only the emu, proper', () => {
    const emu = read('Or, an emu proper');
    expect(emu.charges).toEqual({ charge: 'emu', count: 1, tincture: 'proper' });
    expect(blazon(emu)).toBe('Or, an emu proper');
    expect(problem('Or, a lion rampant proper')).toContain('Only the emu');
    expect(problem('Proper, a lion rampant Or')).toContain('Only the emu');
  });

  it('says what it adjusted', () => {
    const result = parseBlazon('Azure, a chevron Or between two mullets argent');
    expect(result.ok && result.notes).toEqual(['Arms can place three charges around a chevron, so two became three.']);
    const many = parseBlazon('Azure, twelve mullets argent');
    expect(many.ok && many.arms.charges?.count).toBe(6);
    expect(many.ok && many.notes[0]).toContain('twelve became six');
  });

  it('says plainly what it can’t read, and where', () => {
    expect(problem('')).toContain('Type a blazon');
    expect(problem(42)).toContain('Type a blazon');
    expect(problem('!!!')).toContain('Type a blazon');
    expect(problem('x'.repeat(MAX_BLAZON + 1))).toContain('longer');
    expect(problem('Azure, a wyvern Or')).toBe('I don\'t know the charge "wyvern".');
    expect(problem('Azure, a chevron')).toBe('The blazon stops early: I expected a tincture for the chevron.');
    expect(problem('Azure, a chevron between three mullets')).toBe('I expected a tincture for the chevron here, but found "between".');
    expect(problem('Azure, three mullets')).toBe('The blazon stops early: I expected a tincture for the mullet.');
    expect(problem('Azure, a bend sinister Or')).toContain('bend sinister');
    expect(problem('Azure, a canton Or')).toBe('Arms can\'t draw "canton" as a charge yet.');
    expect(problem('Azure, two bars Or')).toBe('Arms can\'t draw "bars" as a charge yet.');
    expect(problem('Azure, a lion sejant Or')).toBe('Arms can\'t draw "sejant" yet.');
    expect(problem('Azure, a mullet rampant Or')).toBe('Only a lion can be rampant here.');
    expect(problem('Azure, a mullet of seven points Or')).toBe('A mullet has five, six or eight points here.');
    expect(problem('Azure, a fess Or, a pale argent')).toContain('one principal ordinary');
    expect(problem('Azure, a chief Or, a chief argent')).toBe('These arms already have a chief.');
    expect(problem('Azure, a fess Or, in chief three mullets argent')).toContain('on a chief');
    expect(problem('Azure gules')).toBe('I didn\'t expect the tincture "gules" here.');
    expect(problem('Per banana Or and gules')).toContain('after "per"');
    const where = parseBlazon('Azure, a wyvern Or');
    expect(!where.ok && [where.problem.at, where.problem.length]).toEqual([9, 6]);
  });

  it('never throws, whatever it is fed', () => {
    const rng = seeded(11);
    const scraps = 'azure or a an on between per pale fess bend chevron chief bordure three mullets lion rampant of the field first and in wavy barry six , . emu proper 9 within all sinister'.split(' ');
    for (let i = 0; i < 2000; i++) {
      const text = Array.from({ length: 1 + Math.floor(rng() * 12) }, () => scraps[Math.floor(rng() * scraps.length)]).join(' ');
      expect(() => parseBlazon(text)).not.toThrow();
    }
  });
});

describe('written and read back, arms stay the same', () => {
  it('for every field', () => {
    for (const tincture of tinctureIds) roundTrip({ field: { kind: 'plain', tincture } });
    for (const division of divisions) {
      for (const line of linedDivisions.includes(division) ? lines : (['straight'] as const)) {
        roundTrip({ field: { kind: 'divided', division, tinctures: ['or', 'gules', 'ermine'], line } });
      }
    }
    for (const pattern of patterns) for (const count of [4, 6, 8, 10]) roundTrip({ field: { kind: 'patterned', pattern, count, tinctures: ['argent', 'vert'] } });
  });

  it('for every ordinary, line and number of charges it takes', () => {
    for (const type of ordinaries) {
      for (const line of lines) {
        roundTrip({ field: azure, ordinary: { type, tincture: 'or', line } });
        roundTrip({ field: azure, chief: { tincture: 'or', line }, bordure: { tincture: 'argent', line } });
      }
      for (const count of countsFor('field', type)) roundTrip({ field: azure, ordinary: { type, tincture: 'or' }, charges: { charge: 'mullet', count, tincture: 'argent' } });
      for (const count of countsFor('ordinary', type)) {
        roundTrip({ field: azure, ordinary: { type, tincture: 'or' }, onOrdinary: { charge: 'roundel', count, tincture: 'gules' } });
        roundTrip({ field: azure, ordinary: { type, tincture: 'or' }, onOrdinary: { charge: 'lion', count, tincture: 'gules' }, charges: { charge: 'roundel', count: countsFor('field', type)[0], tincture: 'argent' } });
      }
    }
    for (const count of countsFor('chief')) roundTrip({ field: azure, chief: { tincture: 'or' }, onChief: { charge: 'crescent', count, tincture: 'sable' } });
  });

  it('for every charge, in every number and arrangement', () => {
    for (const def of charges) {
      for (const count of [1, 3]) roundTrip({ field: azure, charges: { charge: def.id, count, tincture: 'or' } });
    }
    for (const count of countsFor('field')) {
      for (const arrangement of [undefined, ...arrangementsFor(count)]) {
        for (const tincture of tinctureIds) roundTrip({ field: { kind: 'plain', tincture: 'ermine' }, charges: { charge: 'roundel', count, tincture, arrangement } });
        roundTrip({ field: azure, charges: { charge: 'mullet', count, tincture: 'or', arrangement, points: 8 } });
        roundTrip({ field: azure, charges: { charge: 'lion', count, tincture: 'or', arrangement, attitude: 'passant' } });
      }
    }
  });

  it('for every shield shape (which the blazon never names)', () => {
    for (const shape of shapes) {
      const arms = cleanArms({ ...defaultArms(), shape });
      const result = parseBlazon(blazon(arms), shape);
      expect(result.ok && result.arms).toEqual(arms);
    }
  });

  it('for a thousand arms with no taste at all', () => {
    const rng = seeded(1066);
    const seen = new Set<string>();
    for (let i = 0; i < 1000; i++) seen.add(roundTrip(wildArms(rng)));
    expect(seen.size).toBeGreaterThan(900);
  });
});
