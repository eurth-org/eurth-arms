import { describe, expect, it } from 'vitest';
import { blazon } from '../src/arms/blazon';
import { checkTincture, clash, fixAll } from '../src/arms/check';
import { cleanArms, defaultArms } from '../src/arms/model';
import { parseBlazon } from '../src/arms/parse';
import { colours, furs, metals, tinctureIds } from '../src/arms/tinctures';
import { seeded, wildArms } from './helpers';

const check = (text: string) => {
  const result = parseBlazon(text);
  if (!result.ok) throw new Error(`${text}: ${result.problem.message}`);
  return checkTincture(result.arms);
};
const texts = (text: string) => check(text).findings.map((f) => f.text);

describe('the rule of tincture, pair by pair', () => {
  it('forbids metal on metal', () => {
    for (const upper of metals) for (const lower of metals) expect(clash(upper, [lower])).toBe(upper === lower ? 'lost' : 'metalOnMetal');
  });

  it('forbids colour on colour', () => {
    for (const upper of colours) for (const lower of colours) expect(clash(upper, [lower])).toBe(upper === lower ? 'lost' : 'colourOnColour');
  });

  it('allows metal on colour and colour on metal', () => {
    for (const metal of metals) {
      for (const colour of colours) {
        expect(clash(metal, [colour])).toBeUndefined();
        expect(clash(colour, [metal])).toBeUndefined();
      }
    }
  });

  it('lets furs lie on anything, and anything on furs, but not a fur on itself', () => {
    for (const fur of furs) {
      for (const other of tinctureIds) {
        expect(clash(fur, [other])).toBe(fur === other ? 'lost' : undefined);
        expect(clash(other, [fur])).toBe(fur === other ? 'lost' : undefined);
      }
    }
  });

  it('lets “proper” lie on anything', () => {
    for (const lower of tinctureIds) expect(clash('proper', [lower])).toBeUndefined();
  });

  it('lets anything lie on a field parted of a metal and a colour', () => {
    expect(clash('sable', ['or', 'gules'])).toBeUndefined();
    expect(clash('argent', ['or', 'gules'])).toBeUndefined();
  });

  it('still forbids a colour on a field parted of two colours, and a metal on two metals', () => {
    expect(clash('sable', ['azure', 'gules'])).toBe('colourOnColour');
    expect(clash('or', ['argent', 'or'])).toBe('lost');
    expect(clash('argent', ['or', 'or'])).toBe('metalOnMetal');
    expect(clash('or', ['azure', 'gules'])).toBeUndefined();
  });

  it('notices a layer in a tincture its parted field already has', () => {
    expect(clash('or', ['or', 'gules'])).toBe('lost');
    expect(clash('gules', ['argent', 'gules', 'azure'])).toBe('lost');
  });
});

describe('the check, layer by layer', () => {
  it('passes the mock-up’s arms with the mock-up’s words', () => {
    expect(checkTincture(defaultArms())).toEqual({ status: 'respected', summary: 'Rule of tincture respected: metal on colour, colour on metal.', findings: [] });
  });

  it('has nothing to say about a bare field', () => {
    expect(check('Azure').status).toBe('empty');
    expect(check('Per pale gules and azure').status).toBe('empty');
    expect(check('Azure').summary).toMatch(/^Nothing lies on the field/);
  });

  it('checks the ordinary, the chief and the bordure against the field', () => {
    expect(texts('Azure, a chevron gules')).toEqual(['Colour on colour: the gules chevron lies on the azure field.']);
    expect(texts('Or, a chief argent')).toEqual(['Metal on metal: the argent chief lies on the Or field.']);
    expect(texts('Vert, a bordure sable')).toEqual(['Colour on colour: the sable bordure lies on the vert field.']);
    expect(texts('Vert, a fess Or, a chief argent, a bordure ermine')).toEqual([]);
  });

  it('checks charges against what they lie on, not what is near them', () => {
    expect(texts('Azure, three mullets gules')).toEqual(['Colour on colour: the gules mullets lie on the azure field.']);
    // Around a gold chevron, silver stars lie on the blue field: fine.
    expect(texts('Azure, a chevron Or between three mullets argent')).toEqual([]);
    // On it, they are metal on metal.
    expect(texts('Azure, on a chevron Or three mullets argent')).toEqual(['Metal on metal: the argent mullets lie on the Or chevron.']);
    expect(texts('Azure, on a chevron Or three mullets gules')).toEqual([]);
    expect(texts('Azure, a chief Or')).toEqual([]);
    expect(texts('Azure, on a chief Or a lion passant argent')).toEqual(['Metal on metal: the argent lion lies on the Or chief.']);
    expect(texts('Azure, on a chief gules a lion passant Or')).toEqual(['Colour on colour: the gules chief lies on the azure field.']);
  });

  it('reads a parted or patterned field as heralds do', () => {
    expect(texts('Per pale Or and gules, a lion rampant sable')).toEqual([]);
    expect(texts('Per pale azure and gules, a lion rampant sable')).toEqual(['Colour on colour: the sable lion lies on the field of azure and gules.']);
    expect(texts('Barry of six argent and azure, a lion rampant gules')).toEqual([]);
    expect(texts('Chequy Or and argent, a fess argent')).toEqual(["Lost from sight: the argent fess can't be seen against the field of Or and argent."]);
    expect(texts('Ermine, a chief gules')).toEqual([]);
    expect(texts('Vair, a bordure vair')).toEqual(["Lost from sight: the vair bordure can't be seen against the vair field."]);
  });

  it('never minds the emu', () => {
    expect(check('Or, an emu proper').status).toBe('respected');
    expect(check('Sable, an emu proper').status).toBe('respected');
  });

  it('counts what it found', () => {
    const found = check('Azure, on a fess gules between three mullets sable, three hurts, a bordure vert');
    expect(found.status).toBe('broken');
    expect(found.summary).toBe('Rule of tincture broken in four places.');
    expect(found.findings.map((f) => f.layer)).toEqual(['ordinary', 'charges', 'onOrdinary', 'bordure']);
    expect(check('Azure, a pale gules').summary).toBe('Rule of tincture broken in one place.');
    for (const finding of found.findings) expect(finding.text.startsWith(`${finding.label}: `)).toBe(true);
  });
});

describe('the one-click fix', () => {
  it('repaints the offending layer and nothing else', () => {
    const [finding] = check('Azure, a chevron gules between three mullets argent').findings;
    expect(finding?.fix.label).toBe('Make the chevron Or');
    expect(blazon(finding!.fix.arms)).toBe('Azure, a chevron Or between three mullets argent');
  });

  it('prefers a tincture the shield doesn’t use yet', () => {
    const [finding] = check('Azure, a chevron gules between three mullets Or').findings;
    expect(finding?.fix.label).toBe('Make the chevron argent');
    expect(check('Or, three mullets argent').findings[0]?.fix.label).toBe('Make the mullets gules');
  });

  it('doesn’t trade one clash for another where it has the choice', () => {
    // The fess may be any tincture but the field's two. Silver plates lie on it, so not silver: red.
    const [finding] = check('Per pale Or and azure, on a fess Or three plates').findings;
    expect(finding?.fix.label).toBe('Make the fess gules');
    expect(checkTincture(finding!.fix.arms).status).toBe('respected');
  });

  it('takes two steps where one can’t do it', () => {
    // The fess must turn to a metal, and then the bezants on it must turn to a colour.
    const first = check('Azure, on a fess gules three bezants').findings;
    expect(first.map((f) => f.fix.label)).toEqual(['Make the fess argent']);
    const second = checkTincture(first[0]!.fix.arms).findings;
    expect(second.map((f) => f.text)).toEqual(['Metal on metal: the Or roundels lie on the argent fess.']);
    expect(checkTincture(second[0]!.fix.arms).status).toBe('respected');
  });

  it('finds something for a layer lost on a field of every class', () => {
    const [finding] = check('Per pale Or and gules, a fess Or').findings;
    expect(finding?.clash).toBe('lost');
    expect(checkTincture(finding!.fix.arms).findings.filter((f) => f.layer === 'ordinary')).toEqual([]);
  });

  it('fixes each finding it reports', () => {
    const rng = seeded(1484);
    for (let i = 0; i < 500; i++) {
      const arms = wildArms(rng);
      for (const finding of checkTincture(arms).findings) {
        const after = checkTincture(finding.fix.arms).findings.filter((f) => f.layer === finding.layer);
        expect(after, `${blazon(arms)} → ${finding.fix.label}`).toEqual([]);
        expect(cleanArms(finding.fix.arms)).toEqual(finding.fix.arms);
      }
    }
  });

  it('can fix everything at once, and leaves passing arms alone', () => {
    const rng = seeded(1066);
    for (let i = 0; i < 1000; i++) {
      const arms = wildArms(rng);
      const fixed = fixAll(arms);
      expect(checkTincture(fixed).findings, blazon(arms)).toEqual([]);
      if (checkTincture(arms).status !== 'broken') expect(fixed).toEqual(arms);
    }
  });
});
