import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { blazon } from '../src/arms/blazon';
import { roundelNames } from '../src/arms/catalogue';
import { arrangements, attitudes, divisions, lines, ordinaries, patterns, shapes } from '../src/arms/model';
import { parseBlazon } from '../src/arms/parse';
import { tinctureIds } from '../src/arms/tinctures';
import { glossary } from '../src/content/glossary';

const dir = new URL('../src/content/guide/', import.meta.url);
const pages = readdirSync(dir)
  .filter((name) => name.endsWith('.md'))
  .sort()
  .map((name) => {
    const text = readFileSync(new URL(name, dir), 'utf8');
    const [, front = '', body = ''] = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(text) ?? [];
    return { name, slug: name.replace(/^\d+-/, '').replace(/\.md$/, ''), front, body };
  });

/** A blazon the tool itself would write: it reads cleanly and comes back word for word. */
function expectCanonical(text: string, where: string): void {
  const result = parseBlazon(text);
  if (!result.ok) throw new Error(`${where}: "${text}": ${result.problem.message}`);
  expect(result.notes, `${where}: "${text}"`).toEqual([]);
  expect(blazon(result.arms), where).toBe(text);
}

const kebab = (id: string): string => id.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const ids = new Set(glossary.map((entry) => entry.id));

describe('the guide', () => {
  it('has its eight pages, in order', () => {
    expect(pages.map((p) => p.slug)).toEqual(['tinctures', 'divisions', 'ordinaries', 'charges', 'blazon', 'marshalling', 'cadency', 'designing']);
  });

  it('gives every page a title, a description, a date and its sources', () => {
    for (const page of pages) {
      expect(page.front, page.name).toMatch(/^title: .{10,70}$/m);
      expect(page.front, page.name).toMatch(/^description: .{50,160}$/m);
      expect(page.front, page.name).toMatch(/^order: [1-8]$/m);
      expect(page.front, page.name).toMatch(/^updated: 2026-\d\d-\d\d$/m);
      expect(page.front.match(/^ {2}- author: .+$/gm)?.length ?? 0, `${page.name} sources`).toBeGreaterThanOrEqual(2);
      expect(page.front.match(/^ {4}title: .+$/gm)?.length ?? 0, `${page.name} sources`).toBeGreaterThanOrEqual(2);
      for (const url of page.front.match(/^ {4}url: (.+)$/gm) ?? []) expect(url, page.name).toMatch(/url: https:\/\/\S+$/);
    }
  });

  it('is long enough to be a guide and short enough to be read', () => {
    for (const page of pages) {
      const count = page.body.replace(/```[\s\S]*?```/g, '').split(/\s+/).length;
      expect(count, page.name).toBeGreaterThan(450);
      expect(count, page.name).toBeLessThan(1400);
    }
  });

  it('draws every figure from a blazon the maker would write', () => {
    let figures = 0;
    for (const page of pages) {
      const blocks = page.body.match(/```arms\n[\s\S]*?```/g) ?? [];
      expect(blocks.length, `${page.name} figures`).toBeGreaterThanOrEqual(2);
      for (const block of blocks) {
        for (const line of block.split('\n').slice(1, -1)) {
          const [text = '', caption = '', shape] = line.split('|').map((part) => part.trim());
          expectCanonical(text, page.name);
          expect(caption.length, `${page.name}: a caption for "${text}"`).toBeGreaterThan(2);
          if (shape !== undefined) expect(shapes, page.name).toContain(shape);
          figures++;
        }
      }
      // Nothing but arms figures is fenced, and no figure is left unclosed.
      expect((page.body.match(/```/g) ?? []).length, page.name).toBe(blocks.length * 2);
    }
    expect(figures).toBeGreaterThan(40);
  });

  it('links only to glossary terms and guide pages that exist', () => {
    const slugs = new Set(pages.map((p) => p.slug));
    for (const page of pages) {
      const links = [...page.body.matchAll(/\]\(([^)]+)\)/g)].map((found) => found[1]!);
      for (const link of links) {
        const term = /^\/glossary\/#([a-z0-9-]+)$/.exec(link)?.[1];
        const guide = /^\/guide\/([a-z-]+)\/$/.exec(link)?.[1];
        if (term) expect(ids, `${page.name} links to ${link}`).toContain(term);
        else if (guide) expect(slugs, `${page.name} links to ${link}`).toContain(guide);
        else expect(link, `${page.name}: links go to the glossary, the guide, the maker or https`).toMatch(/^(\/|\/templates\/|https:\/\/\S+)$/);
      }
      expect(links.filter((link) => link.startsWith('/glossary/#')).length, `${page.name} glossary links`).toBeGreaterThanOrEqual(5);
    }
  });

  it('uses headings in sentence case, one level deep', () => {
    for (const page of pages) {
      expect(page.body, page.name).not.toMatch(/^#\s/m);
      expect(page.body, page.name).not.toMatch(/^#{4,}\s/m);
      for (const [, heading = ''] of page.body.matchAll(/^#{2,3} (.+)$/gm)) {
        const shouting = heading.split(' ').slice(1).filter((word) => /^[A-Z][a-z]/.test(word));
        // Proper names may keep their capitals; a heading in Title Case would have several.
        expect(shouting.length, `${page.name}: "${heading}"`).toBeLessThanOrEqual(2);
      }
    }
  });
});

describe('the glossary', () => {
  it('has unique anchors and terms, in alphabetical order', () => {
    expect(ids.size).toBe(glossary.length);
    expect(new Set(glossary.map((entry) => entry.term.toLowerCase())).size).toBe(glossary.length);
    for (const entry of glossary) expect(entry.id).toMatch(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/);
    const terms = glossary.map((entry) => entry.term.toLowerCase());
    expect(terms).toEqual([...terms].sort((a, b) => a.localeCompare(b, 'en')));
  });

  it('defines every term briefly and in plain text', () => {
    for (const entry of glossary) {
      expect(entry.definition.length, entry.id).toBeGreaterThan(30);
      expect(entry.definition.length, entry.id).toBeLessThan(420);
      expect(entry.definition, entry.id).not.toMatch(/[<>\[\]*_`]/);
      for (const other of entry.see ?? []) expect(ids, `${entry.id} sees ${other}`).toContain(other);
      expect(entry.see ?? [], entry.id).not.toContain(entry.id);
      if (entry.figure) expectCanonical(entry.figure, `glossary ${entry.id}`);
    }
    expect(glossary.filter((entry) => entry.figure).length).toBeGreaterThan(40);
  });

  it('has every term the maker uses', () => {
    const maker = [
      ...tinctureIds,
      ...shapes.map((shape) => (shape === 'lozenge' || shape === 'roundel' ? shape : `${shape}-shield`)),
      ...lines.filter((line) => line !== 'straight'),
      ...divisions.filter((division) => !division.startsWith('tierced')).map(kebab),
      'tierced',
      ...patterns,
      ...ordinaries,
      'chief',
      'bordure',
      ...arrangements.filter((a) => a !== 'threeTwoOne' && a !== 'oneAndTwo' && a !== 'twoAndTwo').map(kebab),
      ...attitudes.map(kebab),
      'mullet',
      'crescent',
      'annulet',
      'fleur-de-lis',
      'lion',
      'eagle',
      ...Object.values(roundelNames).map((n) => n.name),
      // The words the maker's own labels and messages use.
      ...['blazon', 'tincture', 'metal', 'colour', 'fur', 'proper', 'rule-of-tincture', 'field', 'division', 'line-of-partition', 'ordinary', 'charge', 'attitude', 'shield', 'between'],
      ...['dexter', 'sinister', 'base', 'coat-of-arms', 'achievement', 'crest', 'helm', 'mantling', 'supporters', 'motto', 'marshalling', 'impalement', 'quartering', 'cadency', 'label'],
    ];
    for (const id of maker) expect(ids, `the glossary lacks "${id}"`).toContain(id);
    expect(glossary.length).toBeGreaterThanOrEqual(80);
  });
});
