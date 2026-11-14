#!/usr/bin/env python3
"""
Turns the heraldic beasts in art/commons/ (SVG files from Wikimedia Commons) into the modules
in src/arms/beasts/, which the renderer paints in any tincture.

    python3 tools/beasts.py

Each source file is reduced to the only things the renderer lets through: groups with a
transform, and paths with their data, a fill role and a stroke width. Colours become roles:
%B the beast's body (its tincture), %W its claws, teeth and eyes, %T its tongue, %K its
outline. Nothing else in the source file survives: no scripts, styles, links or metadata.

To add a beast: put its SVG in art/commons/, add it to SOURCES below with its author and
licence exactly as Commons states them, and run this script. Only public-domain files and
files whose licence allows re-use and changes (CC0, CC BY, CC BY-SA) may be added.
"""
import json
import os
import re
import sys
import xml.etree.ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'art', 'commons')
OUT = os.path.join(ROOT, 'src', 'arms', 'beasts')

SODACAN = {'author': 'Sodacan', 'licence': 'CC BY-SA 3.0', 'licenceUrl': 'https://creativecommons.org/licenses/by-sa/3.0/'}
FOX_DAVIES = {'author': 'Arthur Charles Fox-Davies (A Complete Guide to Heraldry, 1909)', 'licence': 'Public domain', 'licenceUrl': ''}
MADBOY74 = {'author': 'Madboy74', 'licence': 'Public domain', 'licenceUrl': ''}

# id: (file in art/commons, which way the fills map to roles, credit)
SOURCES = {
    'lion-rampant': ('Lion_Rampant.svg', SODACAN),
    'lion-rampant-guardant': ('Lion_Rampant_Guardant.svg', SODACAN),
    'lion-passant': ('Lion_Passant.svg', SODACAN),
    'lion-passant-guardant': ('Lion_Passant_Guardant.svg', SODACAN),
    'lion-statant': ('Lion_Statant.svg', SODACAN),
    'lion-statant-guardant': ('Lion_Statant_Guardant.svg', SODACAN),
    'lion-sejant': ('Lion_Sejant.svg', SODACAN),
    'lion-sejant-erect': ('Lion_Sejant_Erect.svg', SODACAN),
    'lion-couchant': ('Lion_Couchant.svg', SODACAN),
    'lion-dormant': ('Lion_Dormant.svg', SODACAN),
    'lion-salient': ('Lion_Salient.svg', SODACAN),
    'lion-courant': ('Lion_Courant.svg', SODACAN),
    'eagle-displayed': ('Coa_Illustration_Elements_Animal_Eagle_v2.svg', MADBOY74),
    'eagle-rising': ('Coa_Illustration_Elements_Animal_Eagle_Rising_Wings_Addorsed_and_Elevated.svg', FOX_DAVIES),
}

# What each colour in the source drawings is.
ROLES = {
    '#f8de00': '%B', '#f8c300': '%B', '#fcdd09': '%B', '#ffff00': '%B',
    '#ffffff': '%W', '#fff': '%W',
    '#ff2a2a': '%T', '#ff0000': '%T', '#f00': '%T',
    '#000000': '%K', '#000': '%K',
}

NUMBER = re.compile(r'-?\d*\.\d{3,}(?:e-?\d+)?')
TRANSFORM = re.compile(r'^[\sa-zA-Z0-9.,()\-+e]*$')
PATH = re.compile(r'^[\sMmLlHhVvCcSsQqTtAaZz0-9.,\-+e]*$')
DEFAULT_WIDTH = '2.5'


def tidy(value):
    text = ('%.2f' % float(value)).rstrip('0').rstrip('.')
    return '0' if text in ('-0', '') else text


def style_of(element):
    style = {}
    for part in (element.get('style') or '').split(';'):
        if ':' in part:
            key, value = part.split(':', 1)
            style[key.strip()] = value.strip()
    for key in ('fill', 'stroke', 'stroke-width'):
        if element.get(key) is not None:
            style.setdefault(key, element.get(key))
    return style


def convert(element, inherited, warnings):
    tag = element.tag.split('}')[-1]
    style = dict(inherited)
    own = style_of(element)
    for key in ('fill', 'stroke', 'stroke-width'):
        if key in own:
            style[key] = own[key]
    if tag in ('svg', 'g'):
        inner = ''.join(convert(child, style, warnings) for child in element)
        transform = element.get('transform') if tag == 'g' else None
        if not inner:
            return ''
        if transform:
            if not TRANSFORM.match(transform):
                warnings.append('transform dropped: ' + transform[:40])
                return inner
            return '<g transform="%s">%s</g>' % (re.sub(r'\s+', ' ', transform.strip()), inner)
        return inner
    if tag != 'path':
        return ''
    d = re.sub(r'\s+', ' ', (element.get('d') or '').strip())
    if not d or not PATH.match(d) or len(re.findall(r'[0-9]', d)) < 8:
        return ''
    # Arc flags may be written without spaces, so paths with arcs keep their numbers as they are.
    if not re.search(r'[Aa]', d):
        # A rounded number is set apart by spaces: in the source a minus sign or a second decimal
        # point may be all that separates two numbers, and rounding can take either away.
        d = NUMBER.sub(lambda found: ' %s ' % tidy(found.group(0)), d)
        d = re.sub(r'\s+', ' ', d)
        d = re.sub(r'\s*([A-Za-z,])\s*', r'\1', d)
        d = re.sub(r' -', '-', d).strip()
    attributes = ' d="%s"' % d
    fill = style.get('fill', '#000000').lower()
    if fill != 'none':
        role = ROLES.get(fill)
        grey = re.match(r'^#([0-9a-f]{2})\1\1$', fill)
        if role is None and grey:
            # Drawings traced from engravings come in near-white and near-black: body and line.
            role = '%B' if int(grey.group(1), 16) > 150 else '%K'
        if role is None:
            warnings.append('unknown fill ' + fill)
            role = '%B'
        attributes += ' fill="%s"' % role
    stroke = style.get('stroke', 'none').lower()
    if stroke == 'none':
        attributes += ' stroke="none"'
    else:
        width = tidy(re.sub(r'[a-z]+$', '', style.get('stroke-width', '1')))
        if width != DEFAULT_WIDTH:
            attributes += ' stroke-width="%s"' % width
    transform = element.get('transform')
    if transform:
        if TRANSFORM.match(transform):
            attributes += ' transform="%s"' % re.sub(r'\s+', ' ', transform.strip())
        else:
            warnings.append('transform dropped: ' + transform[:40])
    return '<path%s/>' % attributes


def size_of(root):
    box = root.get('viewBox')
    if box:
        parts = [float(v) for v in re.split(r'[\s,]+', box.strip())]
        return parts[2], parts[3]
    number = lambda v: float(re.sub(r'[a-z%]+$', '', v))
    return number(root.get('width')), number(root.get('height'))


def main():
    os.makedirs(OUT, exist_ok=True)
    made = []
    for name, (file, credit) in SOURCES.items():
        path = os.path.join(SRC, file)
        if not os.path.exists(path):
            print('missing, skipped:', file)
            continue
        root = ET.parse(path).getroot()
        if root.tag.split('}')[-1] != 'svg':
            print('not an SVG, skipped:', file)
            continue
        warnings = []
        body = convert(root, {}, warnings)
        w, h = size_of(root)
        if "'" in body or '\\' in body or '<script' in body:
            sys.exit('unsafe output for ' + file)
        title = file.replace('_', ' ')
        source = 'https://commons.wikimedia.org/wiki/File:' + file
        with open(os.path.join(OUT, name + '.ts'), 'w') as out:
            out.write('// Generated by tools/beasts.py from "%s" on Wikimedia Commons, by %s (%s).\n' % (title, credit['author'], credit['licence']))
            out.write('// %s\n' % source)
            out.write("import type { BeastArt } from './types';\n\n")
            out.write("const art: BeastArt = { w: %s, h: %s, body: '%s' };\n\nexport default art;\n" % (tidy(w), tidy(h), body))
        made.append((name, title, source, credit))
        print('%-24s %4d paths %6d bytes %s' % (name, body.count('<path'), len(body), '; '.join(sorted(set(warnings)))))

    identifier = lambda name: re.sub(r'-([a-z])', lambda found: found.group(1).upper(), name)
    with open(os.path.join(OUT, 'index.ts'), 'w') as out:
        out.write('// Generated by tools/beasts.py. Do not edit: change the script and run it again.\n')
        for name, _, _, _ in made:
            out.write("import %s from './%s';\n" % (identifier(name), name))
        out.write("import type { BeastArt, BeastCredit } from './types';\n\n")
        out.write('/** Every beast drawing, by id: "lion-rampant", "eagle-displayed". */\n')
        out.write('export const beasts: Readonly<Record<string, BeastArt>> = {\n')
        for name, _, _, _ in made:
            out.write("  '%s': %s,\n" % (name, identifier(name)))
        out.write('};\n\n/** Where each drawing comes from, and on what terms. */\n')
        out.write('export const beastCredits: Readonly<Record<string, BeastCredit>> = {\n')
        for name, title, source, credit in made:
            out.write("  '%s': %s,\n" % (name, json.dumps({'title': title, 'source': source, **credit}, ensure_ascii=False)))
        out.write('};\n')


if __name__ == '__main__':
    main()
