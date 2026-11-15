/**
 * The guide's pages, read from src/content/guide/*.md at build time. The pages are written in
 * a small, fixed part of Markdown (headings, paragraphs, lists, bold, links, and fenced "arms"
 * blocks for figures), and this reads exactly that part into data the pages lay out. Nothing
 * here turns text into markup: a page built from it can only ever show text as text.
 */
import type { Shape } from '../arms/model';

export interface Source {
  author: string;
  title: string;
  year: string;
  url?: string;
}

export type Inline = { type: 'text'; text: string } | { type: 'strong'; children: Inline[] } | { type: 'link'; href: string; children: Inline[] };

export interface FigureItem {
  blazon: string;
  caption: string;
  shape: Shape;
}

export type Block =
  | { type: 'heading'; level: 2 | 3; id: string; text: string }
  | { type: 'paragraph'; children: Inline[] }
  | { type: 'list'; ordered: boolean; items: Inline[][] }
  | { type: 'figures'; items: FigureItem[] };

export interface GuidePage {
  /** For the address: /guide/tinctures/. */
  slug: string;
  title: string;
  description: string;
  order: number;
  /** An ISO date: 2026-11-15. */
  updated: string;
  sources: Source[];
  blocks: Block[];
}

const unquote = (value: string): string => value.trim().replace(/^"(.*)"$/, '$1');

/** The front matter: a few "key: value" lines and the list of sources. */
function parseFront(front: string): Pick<GuidePage, 'title' | 'description' | 'order' | 'updated' | 'sources'> {
  const fields: Record<string, string> = {};
  const sources: Source[] = [];
  for (const line of front.split('\n')) {
    const top = /^([a-z]+): (.+)$/.exec(line);
    const first = /^ {2}- ([a-z]+): (.+)$/.exec(line);
    const more = /^ {4}([a-z]+): (.+)$/.exec(line);
    if (top) fields[top[1]!] = unquote(top[2]!);
    else if (first) sources.push({ author: '', title: '', year: '', [first[1]!]: unquote(first[2]!) });
    else if (more && sources.length) Object.assign(sources[sources.length - 1]!, { [more[1]!]: unquote(more[2]!) });
  }
  return { title: fields.title ?? '', description: fields.description ?? '', order: Number(fields.order), updated: fields.updated ?? '', sources };
}

/** Bold and links, and nothing else. */
export function parseInline(text: string): Inline[] {
  const nodes: Inline[] = [];
  const pattern = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  for (const found of text.matchAll(pattern)) {
    if (found.index > last) nodes.push({ type: 'text', text: text.slice(last, found.index) });
    if (found[1] !== undefined) nodes.push({ type: 'strong', children: parseInline(found[1]) });
    else nodes.push({ type: 'link', href: found[3]!, children: parseInline(found[2]!) });
    last = found.index + found[0].length;
  }
  if (last < text.length) nodes.push({ type: 'text', text: text.slice(last) });
  return nodes;
}

export const headingId = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export function parseGuide(file: string, raw: string): GuidePage {
  const [, front = '', body = ''] = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raw) ?? [];
  const blocks: Block[] = [];
  const lines = body.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (!line.trim()) continue;
    const heading = /^(#{2,3}) (.+)$/.exec(line);
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1]!.length as 2 | 3, id: headingId(heading[2]!), text: heading[2]! });
    } else if (line.startsWith('```arms')) {
      const items: FigureItem[] = [];
      for (i++; i < lines.length && !lines[i]!.startsWith('```'); i++) {
        const [blazon = '', caption = '', shape = 'heater'] = lines[i]!.split('|').map((part) => part.trim());
        if (blazon) items.push({ blazon, caption, shape: shape as Shape });
      }
      blocks.push({ type: 'figures', items });
    } else if (/^(- |\d+\. )/.test(line)) {
      const ordered = /^\d/.test(line);
      const items: Inline[][] = [];
      for (; i < lines.length && /^(- |\d+\. )/.test(lines[i]!); i++) items.push(parseInline(lines[i]!.replace(/^(- |\d+\. )/, '')));
      i--;
      blocks.push({ type: 'list', ordered, items });
    } else {
      blocks.push({ type: 'paragraph', children: parseInline(line) });
    }
  }
  return { slug: file.replace(/^.*\//, '').replace(/^\d+-/, '').replace(/\.md$/, ''), ...parseFront(front), blocks };
}

const files = import.meta.glob<string>('../content/guide/*.md', { query: '?raw', import: 'default', eager: true });

/** The guide, in reading order. */
export const guidePages: readonly GuidePage[] = Object.entries(files)
  .map(([file, raw]) => parseGuide(file, raw))
  .sort((a, b) => a.order - b.order);

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** An ISO date as prose writes it: "15 November 2026". */
export function longDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return `${day} ${months[(month ?? 1) - 1]} ${year}`;
}
