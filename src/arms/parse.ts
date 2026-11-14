/**
 * Reads a blazon: the same subset blazon.ts writes, read forgivingly. Case, commas and "and"
 * don't matter; numbers may be words or digits; "gold" is Or and "checky" is chequy; "of the
 * field" and "of the first" point back at tinctures already named. What it can't read it says
 * plainly, with the place in the text, rather than guessing.
 *
 * The promise, held by the tests: every blazon the writer can produce reads back as the arms
 * it was written from.
 */
import { charges as catalogue, roundelNames } from './catalogue';
import { arrangementWords, numberWords, ordinaryWords } from './blazon';
import { cleanArms, countsFor, type Arms, type Arrangement, type ChargeGroup, type Division, type Line, type OrdinaryType, type Pattern, type Place, type Shape } from './model';
import { tinctures, type Tincture, type TinctureId } from './tinctures';

export interface ParseProblem {
  /** For the person, in plain words. */
  message: string;
  /** Where in the text, as a character offset and a length, to point at. */
  at: number;
  length: number;
}

export type ParseResult =
  | { ok: true; arms: Arms; /** Things that were adjusted on the way in. */ notes: string[] }
  | { ok: false; problem: ParseProblem };

/** The longest blazon read; the profile holds 400 characters, and typed ones get some slack. */
export const MAX_BLAZON = 600;

interface Token {
  word: string;
  at: number;
  length: number;
}

class ParseError extends Error {
  constructor(
    message: string,
    readonly at: number,
    readonly length: number,
  ) {
    super(message);
  }
}

const numbers = new Map<string, number>([
  ...numberWords.map((word, n) => [word, n] as [string, number]),
  ['eleven', 11],
  ['twelve', 12],
]);

const wordFor = (n: number): string => [...numbers].find(([, value]) => value === n)?.[0] ?? String(n);

function tokenise(text: string): Token[] {
  const tokens: Token[] = [];
  for (const found of text.matchAll(/[a-z0-9]+/gi)) {
    let word = found[0].toLowerCase();
    // Digits become words, so "2 and 1" and "two and one" are the same tokens.
    if (/^\d+$/.test(word) && Number(word) <= 10) word = numberWords[Number(word)]!;
    tokens.push({ word, at: found.index, length: found[0].length });
  }
  return tokens;
}

const words = (phrase: string): string[] => tokenise(phrase).map((t) => t.word);

const tinctureWords = new Map<string, TinctureId>([
  ...tinctures.map((t) => [t.blazon.toLowerCase(), t.id] as [string, TinctureId]),
  ['gold', 'or'],
  ['yellow', 'or'],
  ['silver', 'argent'],
  ['white', 'argent'],
  ['red', 'gules'],
  ['blue', 'azure'],
  ['green', 'vert'],
  ['black', 'sable'],
  ['purple', 'purpure'],
]);

const lineWords = new Map<string, Line>([
  ['engrailed', 'engrailed'],
  ['indented', 'indented'],
  ['wavy', 'wavy'],
  ['undy', 'wavy'],
  ['embattled', 'embattled'],
  ['crenellated', 'embattled'],
]);

const ordinaryByWord = new Map<string, OrdinaryType>([
  ...Object.entries(ordinaryWords).map(([type, word]) => [word, type as OrdinaryType] as [string, OrdinaryType]),
  ['fesse', 'fess'],
]);

const patternByWord = new Map<string, Pattern>([
  ['barry', 'barry'],
  ['paly', 'paly'],
  ['bendy', 'bendy'],
  ['chequy', 'chequy'],
  ['checky', 'chequy'],
  ['checquy', 'chequy'],
  ['chequey', 'chequy'],
  ['chequered', 'chequy'],
]);

const ordinals = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'];
const articles = new Set(['a', 'an']);

interface Phrase<T> {
  words: string[];
  value: T;
}

/** Longest first, so "open book" is found before "book" would be. */
const phrases = <T>(list: [string, T][]): Phrase<T>[] =>
  list.map(([phrase, value]) => ({ words: words(phrase), value })).sort((a, b) => b.words.length - a.words.length);

interface ChargeWord {
  charge: string;
  name: string;
  tincture?: TinctureId;
}

const chargePhrases = phrases<ChargeWord>([
  ...catalogue.flatMap((c) => [
    [c.name, { charge: c.id, name: c.name }] as [string, ChargeWord],
    [c.plural, { charge: c.id, name: c.name }] as [string, ChargeWord],
  ]),
  ...Object.entries(roundelNames).flatMap(([tincture, n]) => [
    [n.name, { charge: 'roundel', name: n.name, tincture: tincture as TinctureId }] as [string, ChargeWord],
    [n.plural, { charge: 'roundel', name: n.name, tincture: tincture as TinctureId }] as [string, ChargeWord],
  ]),
  ['star', { charge: 'mullet', name: 'mullet' }],
  ['stars', { charge: 'mullet', name: 'mullet' }],
  ['fleur de lys', { charge: 'fleurDeLis', name: 'fleur-de-lis' }],
  ['fleurs de lys', { charge: 'fleurDeLis', name: 'fleur-de-lis' }],
  ['fleur de lis', { charge: 'fleurDeLis', name: 'fleur-de-lis' }],
  ['fleurs de lis', { charge: 'fleurDeLis', name: 'fleur-de-lis' }],
]);

const arrangementPhrases = phrases<Arrangement>([
  ...Object.entries(arrangementWords).map(([id, phrase]) => [phrase, id as Arrangement] as [string, Arrangement]),
  ['two one', 'twoAndOne'],
  ['one two', 'oneAndTwo'],
  ['two two', 'twoAndTwo'],
  ['three two one', 'threeTwoOne'],
  ['palewise', 'inPale'],
  ['fesswise', 'inFess'],
]);

/** Heraldry the tool knows of but can't draw yet: worth a kinder message than "unknown word". */
const notYet = new Set(
  words(
    'sinister pall canton orle label tressure flaunches flanches gyronny lozengy fusil fusils billet billets escallop escallops martlet martlets ' +
      'guardant regardant sejant statant couchant salient dormant rising nebuly dancetty raguly dovetailed invected counterchanged erminois pean ermines ' +
      'bar bars barrulet pallet pallets bendlet bendlets chevronel chevronels chevrons bends pales piles crosses saltires estoile estoiles rose roses ' +
      'impaled impaling dimidiated overall surmounted debruised fimbriated cotised voided couped',
  ),
);

class Parser {
  private pos = 0;
  /** Tinctures in the order they were first named, for "of the first". */
  private named: Tincture[] = [];
  private plainField = false;

  constructor(
    private readonly tokens: Token[],
    private readonly end: number,
  ) {}

  private peek(offset = 0): string | undefined {
    return this.tokens[this.pos + offset]?.word;
  }

  private eat(...expected: string[]): boolean {
    if (expected.some((word, i) => this.peek(i) !== word)) return false;
    this.pos += expected.length;
    return true;
  }

  private eatPhrase<T>(list: Phrase<T>[]): T | undefined {
    const found = list.find((p) => p.words.every((word, i) => this.peek(i) === word));
    if (found) this.pos += found.words.length;
    return found?.value;
  }

  /** Fails at the next token (or at the end of the text). */
  private fail(message: string, offset = 0): never {
    const token = this.tokens[this.pos + offset];
    throw new ParseError(message, token ? token.at : this.end, token ? token.length : 0);
  }

  /** "I expected X here", in the kindest form that fits what was found instead. */
  private expected(what: string): never {
    const word = this.peek();
    if (word === undefined) this.fail(`The blazon stops early: I expected ${what}.`);
    if (notYet.has(word)) this.fail(`Arms can't draw "${word}" yet.`);
    this.fail(`I expected ${what} here, but found "${word}".`);
  }

  private skipJoiners(): void {
    while (this.peek() === 'and' || this.peek() === 'with') this.pos++;
  }

  private line(): Line | undefined {
    const word = this.peek();
    const line = word === undefined ? undefined : lineWords.get(word);
    if (line) this.pos++;
    return line;
  }

  private tincture(what = 'a tincture'): Tincture {
    if (this.peek() === 'of' && this.peek(1) === 'the') {
      const word = this.peek(2);
      let found: Tincture | undefined;
      if (word === 'field') {
        if (!this.plainField) this.fail('"Of the field" needs a field of one tincture.');
        found = this.named[0];
      } else if (word === 'last' || word === 'same') {
        found = this.named[this.named.length - 1];
      } else if (word !== undefined && ordinals.includes(word)) {
        found = this.named[ordinals.indexOf(word)];
        if (!found) this.fail(`There is no ${word} tincture yet: only ${numberWords[this.named.length] ?? this.named.length} named so far.`, 2);
      }
      if (found) {
        this.pos += 3;
        return found;
      }
    }
    const word = this.peek();
    const id = word === undefined ? undefined : word === 'proper' ? 'proper' : tinctureWords.get(word);
    if (!id) this.expected(what);
    this.pos++;
    if (!this.named.includes(id)) this.named.push(id);
    return id;
  }

  private tinctureId(what = 'a tincture'): TinctureId {
    if (this.peek() === 'proper') this.fail('Only the emu comes "proper" here: name a tincture instead.');
    return this.tincture(what) as TinctureId;
  }

  private field(): unknown {
    if (this.peek() === 'party' || this.peek() === 'parted') this.pos++;
    let division: Division | undefined;
    if (this.eat('per')) {
      const word = this.peek();
      if (word === 'pale') division = 'perPale';
      else if (word === 'fess' || word === 'fesse') division = 'perFess';
      else if (word === 'bend') division = this.peek(1) === 'sinister' ? 'perBendSinister' : 'perBend';
      else if (word === 'chevron') division = 'perChevron';
      else if (word === 'saltire') division = 'perSaltire';
      else if (word === 'pall' || word === 'pairle') division = 'tiercedPall';
      else this.expected('a division (pale, fess, bend, chevron, saltire or pall) after "per"');
      this.pos += division === 'perBendSinister' ? 2 : 1;
    } else if (this.eat('quarterly')) {
      division = 'quarterly';
    } else if (this.eat('tierced')) {
      if (this.eat('palewise')) division = 'tiercedPale';
      else if (this.eat('fesswise')) division = 'tiercedFess';
      else {
        if (!this.eat('per') && !this.eat('in')) this.expected('"per pale", "per fess" or "per pall" after "tierced"');
        const word = this.peek();
        if (word === 'pale') division = 'tiercedPale';
        else if (word === 'fess' || word === 'fesse') division = 'tiercedFess';
        else if (word === 'pall' || word === 'pairle') division = 'tiercedPall';
        else this.expected('"pale", "fess" or "pall"');
        this.pos++;
      }
    }
    if (division) {
      let line = this.line();
      const list = [this.tinctureId('the first tincture of the field')];
      this.skipJoiners();
      list.push(this.tinctureId('the second tincture of the field'));
      if (division.startsWith('tierced')) {
        this.skipJoiners();
        list.push(this.tinctureId('the third tincture of the field'));
      }
      line ??= this.line();
      return { kind: 'divided', division, tinctures: list, line };
    }

    const word = this.peek();
    const pattern = word === undefined ? undefined : patternByWord.get(word);
    if (pattern) {
      this.pos++;
      let count: number | undefined;
      if (this.eat('of')) {
        const n = this.number();
        if (n === undefined) this.expected('a number after "of"');
        count = n;
        if (this.peek() === 'pieces') this.pos++;
      }
      const first = this.tinctureId('the first tincture of the field');
      this.skipJoiners();
      return { kind: 'patterned', pattern, count, tinctures: [first, this.tinctureId('the second tincture of the field')] };
    }

    this.plainField = true;
    return { kind: 'plain', tincture: this.tinctureId('the tincture of the field') };
  }

  private number(): number | undefined {
    const word = this.peek();
    if (word === undefined) return undefined;
    const n = articles.has(word) ? 1 : (numbers.get(word) ?? (/^\d+$/.test(word) ? Number(word) : undefined));
    if (n !== undefined) this.pos++;
    return n;
  }

  /** After "a chevron", "a chief" or "a bordure": its line and its tincture, in either order. */
  private edge(name: string): { tincture: TinctureId; line: Line } {
    let line = this.line();
    const tincture = this.tinctureId(`a tincture for the ${name}`);
    line ??= this.line();
    return { tincture, line: line ?? 'straight' };
  }

  private atOrdinary(offset = 0): boolean {
    const [a, b] = [this.peek(offset), this.peek(offset + 1)];
    return a !== undefined && b !== undefined && articles.has(a) && ordinaryByWord.has(b);
  }

  private ordinary(): unknown {
    this.pos++;
    const type = ordinaryByWord.get(this.peek()!)!;
    this.pos++;
    if (type === 'bend' && this.peek() === 'sinister') this.fail('Arms can\'t draw a bend sinister yet; "per bend sinister" divides the field that way.');
    return { type, ...this.edge(type) };
  }

  private atGroup(): boolean {
    const [a, b] = [this.peek(), this.peek(1)];
    if (a === undefined || b === undefined) return false;
    const counts = articles.has(a) || numbers.has(a) || /^\d+$/.test(a);
    return counts && b !== 'chief' && b !== 'bordure';
  }

  private group(what: string): Partial<ChargeGroup> {
    const count = this.number();
    if (count === undefined) this.expected(`${what}, starting with "a" or a number`);
    const found = this.eatPhrase(chargePhrases);
    if (!found) {
      const word = this.peek();
      if (word === undefined) this.fail(`The blazon stops early: I expected ${what}.`);
      if (notYet.has(word) || ordinaryByWord.has(word)) this.fail(`Arms can't draw "${word}" as a charge yet.`);
      this.fail(`I don't know the charge "${word}".`);
    }
    const group: Partial<ChargeGroup> = { charge: found.charge, count };
    let tincture: Tincture | undefined = found.tincture;

    for (;;) {
      const word = this.peek();
      if (word === undefined) break;
      const arrangement = this.eatPhrase(arrangementPhrases);
      if (arrangement) {
        group.arrangement = arrangement;
      } else if (word === 'of' && this.peek(2) === 'points') {
        const points = numbers.get(this.peek(1)!);
        if (found.charge !== 'mullet') this.fail(`Only a mullet has a number of points here, not ${found.name === 'emu' ? 'an emu' : `a ${found.name}`}.`);
        if (points !== 5 && points !== 6 && points !== 8) this.fail('A mullet has five, six or eight points here.', 1);
        group.points = points;
        this.pos += 3;
      } else if (word === 'rampant' || word === 'passant') {
        if (found.charge !== 'lion') this.fail(`Only a lion can be ${word} here.`);
        group.attitude = word;
        this.pos++;
      } else if (word === 'displayed') {
        if (found.charge !== 'eagle') this.fail('Only an eagle can be displayed here.');
        this.pos++;
      } else if (tincture === undefined && (word === 'proper' || tinctureWords.has(word) || (word === 'of' && this.peek(1) === 'the'))) {
        if (word === 'proper' && found.charge !== 'emu') this.fail(`Only the emu comes "proper" here: give the ${found.name} a tincture.`);
        tincture = this.tincture();
      } else {
        break;
      }
    }
    if (tincture === undefined) this.expected(`a tincture for the ${found.name}`);
    group.tincture = tincture;
    return group;
  }

  arms(shape: Shape): Record<string, unknown> {
    const raw: Record<string, unknown> = { shape, field: this.field() };

    this.skipJoiners();
    if (this.peek() === 'on' && this.atOrdinary(1)) {
      this.pos++;
      const ordinary = this.ordinary() as { type: OrdinaryType };
      raw.ordinary = ordinary;
      if (this.eat('between')) raw.charges = this.group(`the charges around the ${ordinary.type}`);
      raw.onOrdinary = this.group(`the charges that lie on the ${ordinary.type}`);
    } else if (this.atOrdinary()) {
      const ordinary = this.ordinary() as { type: OrdinaryType };
      raw.ordinary = ordinary;
      this.skipJoiners();
      if (this.eat('between') || (this.atGroup() && !this.atOrdinary())) raw.charges = this.group(`the charges around the ${ordinary.type}`);
    } else if (this.atGroup()) {
      raw.charges = this.group('a charge');
    }

    for (;;) {
      this.skipJoiners();
      const start = this.pos;
      if (this.peek() === 'on' && articles.has(this.peek(1) ?? '') && this.peek(2) === 'chief') {
        if (raw.chief) this.fail('These arms already have a chief.');
        this.pos += 3;
        raw.chief = this.edge('chief');
        raw.onChief = this.group('the charges that lie on the chief');
        continue;
      }
      if (articles.has(this.peek() ?? '') && this.peek(1) === 'chief') {
        if (raw.chief) this.fail('These arms already have a chief.');
        this.pos += 2;
        raw.chief = this.edge('chief');
        continue;
      }
      if (this.peek() === 'all') this.pos++;
      if (this.peek() === 'within') this.pos++;
      if (articles.has(this.peek() ?? '') && this.peek(1) === 'bordure') {
        if (raw.bordure) this.fail('These arms already have a bordure.');
        this.pos += 2;
        raw.bordure = this.edge('bordure');
        continue;
      }
      this.pos = start;
      break;
    }

    const word = this.peek();
    if (word !== undefined) {
      if (word === 'in' && this.peek(1) === 'chief') this.fail('Arms can\'t place charges "in chief" yet; try "on a chief".');
      if (this.atOrdinary() || this.atGroup()) this.fail('Arms can draw one principal ordinary, and one group of charges in each place.');
      if (notYet.has(word)) this.fail(`Arms can't draw "${word}" yet.`);
      this.fail(tinctureWords.has(word) ? `I didn't expect the tincture "${word}" here.` : `I don't know the word "${word}".`);
    }
    return raw;
  }
}

const places: [key: 'charges' | 'onOrdinary' | 'onChief', place: Place][] = [
  ['charges', 'field'],
  ['onOrdinary', 'ordinary'],
  ['onChief', 'chief'],
];

const listed = (items: string[]): string => (items.length <= 1 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} or ${items[items.length - 1]}`);

/** What cleaning changed, said plainly: a count that a place can't hold. */
function notesFor(raw: Record<string, unknown>, arms: Arms): string[] {
  const notes: string[] = [];
  for (const [key, place] of places) {
    const asked = (raw[key] as Partial<ChargeGroup> | undefined)?.count;
    const got = arms[key]?.count;
    if (asked === undefined || got === undefined || asked === got) continue;
    const allowed = countsFor(place, arms.ordinary?.type).map((n) => numberWords[n]!);
    const where = place === 'chief' ? 'on a chief' : place === 'ordinary' ? `on a ${arms.ordinary?.type}` : arms.ordinary ? `around a ${arms.ordinary.type}` : 'on a field';
    notes.push(`Arms can place ${listed(allowed)} ${allowed.length === 1 && allowed[0] === 'one' ? 'charge' : 'charges'} ${where}, so ${wordFor(asked)} became ${wordFor(got)}.`);
  }
  return notes;
}

/**
 * Reads a blazon into arms. The shield's shape is never part of a blazon, so it is passed in.
 * Never throws: what can't be read comes back as a problem with its place in the text.
 */
export function parseBlazon(text: unknown, shape: Shape = 'heater'): ParseResult {
  if (typeof text !== 'string' || !text.trim()) {
    return { ok: false, problem: { message: 'Type a blazon, such as "Azure, a bend Or".', at: 0, length: 0 } };
  }
  if (text.length > MAX_BLAZON) {
    return { ok: false, problem: { message: `That's longer than a blazon here can be (${MAX_BLAZON} characters).`, at: MAX_BLAZON, length: text.length - MAX_BLAZON } };
  }
  const tokens = tokenise(text);
  if (!tokens.length) return { ok: false, problem: { message: 'Type a blazon, such as "Azure, a bend Or".', at: 0, length: 0 } };
  try {
    const raw = new Parser(tokens, text.length).arms(shape);
    const arms = cleanArms(raw);
    return { ok: true, arms, notes: notesFor(raw, arms) };
  } catch (error) {
    if (error instanceof ParseError) return { ok: false, problem: { message: error.message, at: error.at, length: error.length } };
    throw error;
  }
}
