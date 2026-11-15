<script lang="ts">
  /*
   * The maker: one Svelte component, hydrated on the start page.
   *   - The design lives in the link (?d=…), read safely on arrival and kept in step after. A
   *     typed blazon can arrive as a link too (?blazon=…).
   *   - Nothing is stored: "save" is a link, a picture or the nation's profile file. Undo and
   *     redo live in memory, for this visit.
   *   - The blazon is written as the design changes, and a typed blazon is drawn.
   *   - The rule of tincture is checked on every change, said in words, and fixed in one click.
   *   - Simple mode shows four choices; Advanced adds lines, a chief and a bordure beside the
   *     ordinary, charges on the ordinary and the chief, and how charges lie.
   *   - The signature touch: a newly placed charge settles onto the shield with a small drop.
   *   - Only tokens and eu- classes: no colour, font or spacing of its own. The tinctures are
   *     the tool's subject, so their paints are data (tinctures.ts).
   * The tool's own actions (Random, Simple and Advanced) sit in its own toolbar, not in the header.
   */
  import { faCircleCheck, faCopy, faDice, faDownload, faPen, faRotateLeft, faRotateRight, faTrashCan, faTriangleExclamation, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
  import { createProfile, getSection, setNation, setSection, type EurthProfile } from '@eurth/profile';
  import ProfileButtons from '@eurth/profile/ProfileButtons.svelte';
  import { PICTURE_SIZES, calm, copyText, decodeState, download, fileSlug, playTones, stateFromLocation, stateLink, stateToLocation, svgToPicture, toast } from '@eurth/style';
  import Icon from '@eurth/style/components/Icon.svelte';
  import ShareButtons from '@eurth/style/components/ShareButtons.svelte';
  import { onMount } from 'svelte';
  import { loadBeast } from '../arms/beasts/lazy';
  import { blazon } from '../arms/blazon';
  import { checkTincture, fixAll, type Layer } from '../arms/check';
  import { describeArms } from '../arms/describe';
  import { cleanName, compact, expand, openLink } from '../arms/link';
  import {
    cleanArms,
    countsFor,
    defaultArms,
    linedDivisions,
    lines,
    names,
    ordinaries,
    patternCounts,
    shapes,
    type Arms,
    type ChargeGroup,
    type Edge,
    type Field,
    type Line,
    type OrdinaryType,
    type Place,
    type Shape,
  } from '../arms/model';
  import { parseBlazon, type ParseProblem } from '../arms/parse';
  import { fromSection, toSection } from '../arms/profile';
  import { randomArms } from '../arms/random';
  import { armsSvg, creditsFor, missingBeasts } from '../arms/render';
  import { fieldPresets, ordinaryPresets } from '../arms/simple';
  import type { TinctureId } from '../arms/tinctures';
  import GroupEditor from './GroupEditor.svelte';
  import Swatches from './Swatches.svelte';

  // Passed in by the page: browser code never imports eurth.config.mjs (see the note there).
  let { siteName, siteUrl }: { siteName: string; siteUrl: string } = $props();

  type Step = 'shield' | 'field' | 'ordinary' | 'charges';
  const steps: { id: Step; name: string }[] = [
    { id: 'shield', name: 'Shield' },
    { id: 'field', name: 'Field' },
    { id: 'ordinary', name: 'Ordinary' },
    { id: 'charges', name: 'Charges' },
  ];

  let arms = $state.raw<Arms>(defaultArms());
  let name = $state('');
  let advanced = $state(false);
  let step = $state<Step>('field');
  let typed = $state('');
  let problem = $state.raw<ParseProblem | null>(null);
  let profile = $state.raw<EurthProfile | null>(null);
  let ready = $state(false);
  /** The charges that have just been placed, which settle with a drop. */
  let settle = $state.raw<Place[]>([]);
  /** Counts the beasts' drawings as they arrive, so the picture is drawn again when one does. */
  let arrived = $state(0);
  let past = $state.raw<Arms[]>([]);
  let future = $state.raw<Arms[]>([]);
  let size = $state('1280');

  const uri = (svg: string): string => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  /** The picture as it is saved: still, and with its words. */
  const svg = $derived((arrived, armsSvg(arms)));
  /** The picture as it is shown: a new charge drops into place. */
  const shown = $derived((arrived, uri(armsSvg(arms, { settle }))));
  const text = $derived(blazon(arms));
  const description = $derived(describeArms(arms));
  const check = $derived(checkTincture(arms));
  const credits = $derived(creditsFor(arms).filter((credit) => credit.licence !== 'Public domain'));
  const state = $derived({ ...compact(arms), ...(name.trim() ? { n: cleanName(name) } : {}) });
  // Before the page has loaded there is no address to read: the site's own, then.
  const link = $derived(stateLink(state, { base: ready ? location.href.split('?')[0] : `${siteUrl}/` }));
  const title = $derived(name.trim() ? `The arms of ${name.trim()}` : 'A coat of arms');

  /** A change to the design. `dropped` names charges that are new, which settle into place. */
  function change(next: unknown, dropped: Place[] = []) {
    const cleaned = cleanArms(next);
    if (JSON.stringify(cleaned) === JSON.stringify(arms)) return;
    past = [...past.slice(-49), arms];
    future = [];
    arms = cleaned;
    problem = null;
    settle = calm() ? [] : dropped;
    if (dropped.length) playTones([[196, 0, 0.035], [147, 0.06, 0.03]]);
  }

  function undo() {
    const last = past.at(-1);
    if (!last) return;
    future = [arms, ...future];
    past = past.slice(0, -1);
    arms = last;
    settle = [];
  }

  function redo() {
    const next = future[0];
    if (!next) return;
    past = [...past, arms];
    future = future.slice(1);
    arms = next;
    settle = [];
  }

  onMount(() => {
    // A link is someone else's input: decodeState never throws, and expand() clamps every value.
    const query = new URLSearchParams(location.search);
    const arrivedState = stateFromLocation();
    const value = arrivedState?.value;
    const opened = openLink({ state: value, blazon: query.get('blazon'), shape: query.get('shape') });
    arms = opened.arms;
    if (typeof value === 'object' && value !== null && 'n' in value) name = cleanName((value as { n: unknown }).n);
    if (opened.problem) {
      typed = query.get('blazon') ?? '';
      problem = opened.problem;
    } else if (opened.notes.length) {
      toast(opened.notes[0]!);
    }
    // The classic lion and eagle, for the charge picker's small pictures.
    void Promise.all([loadBeast('lion-rampant'), loadBeast('eagle-displayed')]).then(() => arrived++);
    ready = true;
  });

  // The address bar follows the design, so the link can be copied from there too.
  $effect(() => {
    const next = state;
    if (ready) stateToLocation(next);
  });

  // A beast's drawing is fetched the first time a design needs it.
  $effect(() => {
    const missing = missingBeasts(arms);
    if (!ready || !missing.length) return;
    void Promise.all(missing.map(loadBeast)).then(() => arrived++);
  });

  // This tool's own easter egg.
  let spotted = false;
  $effect(() => {
    const emu = [arms.charges, arms.onOrdinary, arms.onChief].some((group) => group?.charge === 'emu');
    if (ready && emu && !spotted) toast('An emu, proper. The herald has questions, and no jurisdiction.');
    spotted = emu;
  });

  // --- Changing the design ---

  /** A new layer takes a tincture that keeps the rule of tincture, where one can be found. */
  function settled(next: unknown, layer: Layer): Arms {
    const cleaned = cleanArms(next);
    return checkTincture(cleaned).findings.find((finding) => finding.layer === layer)?.fix.arms ?? cleaned;
  }

  const fieldTinctures = $derived<TinctureId[]>(arms.field.kind === 'plain' ? [arms.field.tincture] : arms.field.tinctures);
  const fieldPreset = $derived(arms.field.kind === 'plain' ? 'plain' : arms.field.kind === 'divided' ? arms.field.division : arms.field.pattern);

  function withField(preset: string, tinctures: TinctureId[]): Field {
    const spare: TinctureId[] = ['argent', 'gules', 'or', 'azure'];
    const three = [0, 1, 2].map((i) => tinctures[i] ?? spare.find((t) => !tinctures.includes(t) && t !== tinctures[0])!) as [TinctureId, TinctureId, TinctureId];
    if (three[1] === three[0]) three[1] = spare.find((t) => t !== three[0])!;
    const field = (fieldPresets.find((p) => p.id === preset) ?? fieldPresets[0]!).make(three);
    // A line the old division had is kept where the new one can take it.
    return field.kind === 'divided' && arms.field.kind === 'divided' ? { ...field, line: arms.field.line } : field;
  }

  const setFieldTincture = (i: number, tincture: TinctureId) => {
    const field = arms.field;
    change({ ...arms, field: field.kind === 'plain' ? { ...field, tincture } : { ...field, tinctures: field.tinctures.map((t, at) => (at === i ? tincture : t)) } });
  };

  const edge = $derived<Edge | undefined>(arms.ordinary ?? arms.chief ?? arms.bordure);
  /** Simple mode's one choice of ordinary: one of the nine, or none. */
  const ordinaryChoice = $derived(arms.ordinary?.type ?? (arms.chief ? 'chief' : arms.bordure ? 'bordure' : 'none'));

  function chooseOrdinary(id: string) {
    const kept = { tincture: edge?.tincture ?? 'or', line: advanced ? (edge?.line ?? 'straight') : 'straight' };
    const next: Record<string, unknown> = { ...arms };
    if (id === 'chief' || id === 'bordure' || id === 'none') {
      // In Simple mode the choice replaces whatever was there; in Advanced the chief and the
      // bordure have switches of their own, and this choice is only the principal ordinary.
      delete next.ordinary;
      delete next.onOrdinary;
      if (!advanced) {
        delete next.chief;
        delete next.onChief;
        delete next.bordure;
        if (id !== 'none') next[id] = kept;
      }
      change(id === 'none' ? next : settled(next, id as Layer));
      return;
    }
    next.ordinary = { type: id, ...kept };
    if (!advanced) {
      delete next.chief;
      delete next.onChief;
      delete next.bordure;
    }
    change(settled(next, 'ordinary'), arms.charges ? ['field'] : []);
  }

  function toggleEdge(key: 'chief' | 'bordure') {
    const next: Record<string, unknown> = { ...arms };
    if (arms[key]) {
      delete next[key];
      if (key === 'chief') delete next.onChief;
      change(next);
    } else {
      next[key] = { tincture: 'or', line: 'straight' };
      change(settled(next, key));
    }
  }

  const setEdge = (key: 'ordinary' | 'chief' | 'bordure', patch: Partial<Edge>) => change({ ...arms, [key]: { ...arms[key], ...patch } });

  const groupKey = { field: 'charges', ordinary: 'onOrdinary', chief: 'onChief' } as const;

  function setGroup(place: Place, patch: Partial<ChargeGroup> | null) {
    const key = groupKey[place];
    const next: Record<string, unknown> = { ...arms };
    if (!patch) {
      delete next[key];
      change(next);
      return;
    }
    const current = arms[key];
    const merged = { charge: 'mullet', count: countsFor(place, arms.ordinary?.type).includes(3) ? 3 : 1, tincture: 'argent', ...current, ...patch };
    next[key] = merged;
    // A new charge, or more of them, drops into place; a new tincture just changes.
    const placed = !current || patch.charge !== undefined || patch.count !== undefined || patch.attitude !== undefined || patch.arrangement !== undefined;
    change(current ? next : settled(next, key), placed ? [place] : []);
  }

  // --- Small pictures for the choices ---

  const thumb = (design: unknown): string => uri(armsSvg(cleanArms(design), { bare: true }));
  const plain = $derived<Field>({ kind: 'plain', tincture: fieldTinctures[0]! });
  const shapeThumbs = $derived(Object.fromEntries(shapes.map((shape) => [shape, thumb({ shape, field: arms.field })])));
  const fieldThumbs = $derived(Object.fromEntries(fieldPresets.map((p) => [p.id, thumb({ shape: arms.shape, field: withField(p.id, fieldTinctures) })])));
  const ordinaryThumbs = $derived(
    Object.fromEntries(
      ordinaryPresets.map((p) => {
        const paint = { tincture: edge?.tincture ?? 'or', line: 'straight' };
        const base = { shape: arms.shape, field: arms.field };
        return [p.id, thumb(p.id === 'none' ? base : p.id === 'chief' || p.id === 'bordure' ? { ...base, [p.id]: paint } : { ...base, ordinary: { type: p.id, ...paint } })];
      }),
    ),
  );
  const chargeThumbs = $derived(
    (arrived,
    Object.fromEntries(
      ['mullet', 'crescent', 'roundel', 'annulet', 'fleurDeLis', 'lion', 'eagle'].map((charge) => [
        charge,
        thumb({ shape: 'roundel', field: plain, charges: { charge, count: 1, tincture: plain.kind === 'plain' && ['or', 'argent', 'ermine', 'vair'].includes(plain.tincture) ? 'sable' : 'or' } }),
      ]),
    )),
  );

  // --- Typing a blazon ---

  function draw(event: SubmitEvent) {
    event.preventDefault();
    const read = parseBlazon(typed, arms.shape);
    if (!read.ok) {
      problem = read.problem;
      return;
    }
    change(read.arms, ['field', 'ordinary', 'chief']);
    problem = null;
    toast(read.notes[0] ?? 'Drawn from your blazon.');
  }

  async function copyBlazon() {
    toast((await copyText(text)) ? 'Blazon copied.' : "The browser wouldn't copy it. Select the blazon and copy it by hand.");
  }

  // --- Taking it away ---

  const widths = [320, 640, 1280, 1920, 3840];
  const fileName = (ending: string): string => `${fileSlug(name, 'arms')}-coat-of-arms.${ending}`;

  async function savePicture(type: 'image/png' | 'image/webp') {
    const shared = PICTURE_SIZES.find((s) => s.id === size);
    const width = shared?.width ?? Number(size);
    const height = shared?.height ?? Math.round(width * 1.2);
    download(await svgToPicture(svg, { width, height, type }), fileName(type === 'image/png' ? 'png' : 'webp'));
  }

  function loaded(next: EurthProfile) {
    profile = next;
    name = cleanName(next.meta.nation);
    const found = fromSection(getSection(next, 'arms'), (value) => decodeState(value)?.value);
    if (found) change(found, ['field', 'ordinary', 'chief']);
    toast(found ? `The arms of ${next.meta.nation || 'your nation'} are loaded.` : `${next.meta.nation || 'Your nation'} is loaded. It has no arms yet: these could be its first.`);
  }

  // What "Save profile" writes: the nation's name and this tool's own section, and nothing else.
  const saved = $derived.by(() => {
    const nation = name.trim() || profile?.meta.nation;
    if (!nation) return null;
    const base = setNation(profile ?? createProfile(nation), nation);
    return setSection(base, 'arms', toSection(arms, link, getSection(base, 'arms')) as never);
  });

  function tabKey(event: KeyboardEvent) {
    const at = steps.findIndex((s) => s.id === step);
    const to = event.key === 'ArrowRight' ? at + 1 : event.key === 'ArrowLeft' ? at - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? steps.length - 1 : -1;
    if (to < 0 || to === at && event.key !== 'Home') return;
    event.preventDefault();
    step = steps[(to + steps.length) % steps.length]!.id;
    document.getElementById(`tab-${step}`)?.focus();
  }

  const lineOptions = lines.map((line) => ({ id: line, name: names.line[line] }));
</script>

{#snippet lineSelect(id: string, label: string, value: Line, onpick: (line: Line) => void)}
  <label class="eu-field">
    <span class="eu-label">{label}</span>
    <select class="eu-select" {id} {value} onchange={(e) => onpick(e.currentTarget.value as Line)}>
      {#each lineOptions as option (option.id)}<option value={option.id}>{option.name}</option>{/each}
    </select>
  </label>
{/snippet}

{#snippet choice(pressed: boolean, picture: string | undefined, label: string, onpick: () => void)}
  <button type="button" class="eu-btn choice" aria-pressed={pressed} onclick={onpick}>
    {#if picture}<img src={picture} alt="" width="40" height="48" />{/if}
    <span>{label}</span>
  </button>
{/snippet}

<div class="maker">
  <form class="eu-card controls" onsubmit={(e) => e.preventDefault()}>
    <div class="eu-row">
      <button type="button" class="eu-btn" data-click="tumble" onclick={() => change(randomArms(), ['field', 'ordinary', 'chief'])}><Icon icon={faDice} /> Random</button>
      <button type="button" class="eu-btn" aria-pressed={!advanced} onclick={() => (advanced = false)}>Simple</button>
      <button type="button" class="eu-btn" aria-pressed={advanced} onclick={() => (advanced = true)}>Advanced</button>
      <button type="button" class="eu-btn eu-btn--icon" aria-label="Undo" data-tip="Undo" disabled={!past.length} onclick={undo}><Icon icon={faRotateLeft} /></button>
      <button type="button" class="eu-btn eu-btn--icon" aria-label="Redo" data-tip="Redo" disabled={!future.length} onclick={redo}><Icon icon={faRotateRight} /></button>
      <button type="button" class="eu-btn eu-btn--icon" aria-label="Start again" data-tip="Start again" data-click="spin" onclick={() => (change(defaultArms()), toast('A fresh shield.'))}><Icon icon={faTrashCan} /></button>
    </div>

    <div class="tabs" role="tablist" aria-label="Steps" tabindex="-1" onkeydown={tabKey}>
      {#each steps as s (s.id)}
        <button type="button" class="eu-btn" role="tab" id="tab-{s.id}" aria-selected={step === s.id} aria-controls="panel-{s.id}" tabindex={step === s.id ? 0 : -1} onclick={() => (step = s.id)}>{s.name}</button>
      {/each}
    </div>

    <div class="panel" role="tabpanel" id="panel-shield" aria-labelledby="tab-shield" hidden={step !== 'shield'}>
      <div class="grid">
        {#each shapes as shape (shape)}
          {@render choice(arms.shape === shape, shapeThumbs[shape], names.shape[shape], () => change({ ...arms, shape: shape as Shape }))}
        {/each}
      </div>
      <p class="eu-help">The shield's shape is the artist's choice: a blazon never names it, so the same arms may be shown on any of these.</p>
      <label class="eu-field">
        <span class="eu-label">Whose arms are these?</span>
        <input class="eu-input" value={name} oninput={(e) => (name = cleanName(e.currentTarget.value))} maxlength="60" autocomplete="off" placeholder="A nation, a house, a city" aria-describedby="name-help" />
        <span class="eu-help" id="name-help">Optional. It names the files you save, and the nation in a profile file.</span>
      </label>
    </div>

    <div class="panel" role="tabpanel" id="panel-field" aria-labelledby="tab-field" hidden={step !== 'field'}>
      <div class="grid">
        {#each fieldPresets as p (p.id)}
          {@render choice(fieldPreset === p.id, fieldThumbs[p.id], p.name, () => change({ ...arms, field: withField(p.id, fieldTinctures) }))}
        {/each}
      </div>
      {#each fieldTinctures as tincture, i (i)}
        <Swatches label={fieldTinctures.length === 1 ? 'Tincture of the field' : `${['First', 'Second', 'Third'][i]} tincture`} value={tincture} onpick={(t) => setFieldTincture(i, t)} />
      {/each}
      {#if advanced && arms.field.kind === 'divided' && linedDivisions.includes(arms.field.division)}
        {@render lineSelect('field-line', 'Line of partition', arms.field.line, (line) => change({ ...arms, field: { ...arms.field, line } }))}
      {/if}
      {#if advanced && arms.field.kind === 'patterned' && patternCounts[arms.field.pattern].min !== patternCounts[arms.field.pattern].max}
        {@const range = patternCounts[arms.field.pattern]}
        <div class="eu-row" role="group" aria-label="Number of pieces">
          {#each Array.from({ length: (range.max - range.min) / 2 + 1 }, (_, k) => range.min + 2 * k) as n (n)}
            <button type="button" class="eu-btn" aria-pressed={arms.field.count === n} onclick={() => change({ ...arms, field: { ...arms.field, count: n } })}>{n} pieces</button>
          {/each}
        </div>
      {/if}
    </div>

    <div class="panel" role="tabpanel" id="panel-ordinary" aria-labelledby="tab-ordinary" hidden={step !== 'ordinary'}>
      <div class="grid">
        {#each ordinaryPresets.filter((p) => !advanced || (p.id !== 'chief' && p.id !== 'bordure')) as p (p.id)}
          {@render choice(advanced ? (arms.ordinary?.type ?? 'none') === p.id : ordinaryChoice === p.id, ordinaryThumbs[p.id], p.name, () => chooseOrdinary(p.id))}
        {/each}
      </div>
      {#if advanced}
        {#if arms.ordinary}
          <Swatches label="Tincture of the {arms.ordinary.type}" value={arms.ordinary.tincture} onpick={(tincture) => setEdge('ordinary', { tincture })} />
          {@render lineSelect('ordinary-line', `Line of the ${arms.ordinary.type}`, arms.ordinary.line, (line) => setEdge('ordinary', { line }))}
        {/if}
        <label class="eu-pill"><input type="checkbox" checked={!!arms.chief} onchange={() => toggleEdge('chief')} /> <span class="eu-check"><Icon icon={faCircleCheck} /></span> A chief</label>
        {#if arms.chief}
          <Swatches label="Tincture of the chief" value={arms.chief.tincture} onpick={(tincture) => setEdge('chief', { tincture })} />
          {@render lineSelect('chief-line', 'Line of the chief', arms.chief.line, (line) => setEdge('chief', { line }))}
        {/if}
        <label class="eu-pill"><input type="checkbox" checked={!!arms.bordure} onchange={() => toggleEdge('bordure')} /> <span class="eu-check"><Icon icon={faCircleCheck} /></span> A bordure</label>
        {#if arms.bordure}
          <Swatches label="Tincture of the bordure" value={arms.bordure.tincture} onpick={(tincture) => setEdge('bordure', { tincture })} />
          {@render lineSelect('bordure-line', 'Line of the bordure', arms.bordure.line, (line) => setEdge('bordure', { line }))}
        {/if}
      {:else if edge}
        <Swatches label="Tincture of the {ordinaryChoice}" value={edge.tincture} onpick={(tincture) => setEdge(arms.ordinary ? 'ordinary' : arms.chief ? 'chief' : 'bordure', { tincture })} />
      {/if}
    </div>

    <div class="panel" role="tabpanel" id="panel-charges" aria-labelledby="tab-charges" hidden={step !== 'charges'}>
      <GroupEditor
        id="field-charges"
        title={arms.ordinary ? `Around the ${arms.ordinary.type}` : 'On the field'}
        group={arms.charges}
        counts={countsFor('field', arms.ordinary?.type)}
        arranged={!arms.ordinary}
        {advanced}
        thumbs={chargeThumbs}
        onchange={(patch) => setGroup('field', patch)}
      />
      {#if advanced && arms.ordinary}
        <GroupEditor
          id="ordinary-charges"
          title="On the {arms.ordinary.type}"
          group={arms.onOrdinary}
          counts={countsFor('ordinary', arms.ordinary.type)}
          arranged={false}
          {advanced}
          thumbs={chargeThumbs}
          onchange={(patch) => setGroup('ordinary', patch)}
        />
      {/if}
      {#if advanced && arms.chief}
        <GroupEditor id="chief-charges" title="On the chief" group={arms.onChief} counts={countsFor('chief')} arranged={false} {advanced} thumbs={chargeThumbs} onchange={(patch) => setGroup('chief', patch)} />
      {/if}
      {#if !advanced}<p class="eu-help">Advanced mode adds charges on the ordinary and on a chief, and lets you choose how several charges lie.</p>{/if}
    </div>

    <div class="rule" role="status">
      <p class="verdict" class:broken={check.status === 'broken'}>
        <Icon icon={check.status === 'broken' ? faTriangleExclamation : faCircleCheck} />
        <span>{check.summary}</span>
      </p>
      {#if check.findings.length}
        <ul class="findings">
          {#each check.findings as finding (finding.layer)}
            <li>
              <span>{finding.text}</span>
              <button type="button" class="eu-btn" data-click="pop" onclick={() => change(finding.fix.arms)}><Icon icon={faWandMagicSparkles} /> {finding.fix.label}</button>
            </li>
          {/each}
        </ul>
        {#if check.findings.length > 1}
          <button type="button" class="eu-btn eu-btn--primary" data-click="pop" onclick={() => change(fixAll(arms))}><Icon icon={faWandMagicSparkles} /> Fix all {check.findings.length}</button>
        {/if}
        <p class="eu-help">The rule is advice, not a lock: arms that break it on purpose have a name, and a page in the <a href="/guide/tinctures/">guide</a>.</p>
      {/if}
    </div>
  </form>

  <section class="result" aria-labelledby="result-title">
    <h2 id="result-title" class="eu-visually-hidden">Your arms</h2>
    <img class="shield" src={shown} alt={description} width="600" height="720" />

    <div class="words">
      <p class="eu-kicker">Blazon</p>
      <p class="blazon" lang="en">{text}</p>
      <p class="eu-muted" aria-hidden="true">{description}</p>
      <button type="button" class="eu-btn" data-click="bounce" onclick={copyBlazon}><Icon icon={faCopy} /> Copy blazon</button>
    </div>

    <form class="typing" onsubmit={draw}>
      <label class="eu-field">
        <span class="eu-label">Or type a blazon</span>
        <input class="eu-input eu-input--data" bind:value={typed} maxlength="600" autocomplete="off" spellcheck="false" placeholder={text} aria-describedby={problem ? 'blazon-error' : 'blazon-help'} aria-invalid={problem ? 'true' : undefined} />
        {#if problem}
          <span class="eu-error" id="blazon-error">{problem.message}</span>
        {:else}
          <span class="eu-help" id="blazon-help">For example: Gules, three lions passant guardant in pale Or. The <a href="/guide/blazon/">guide</a> explains the grammar.</span>
        {/if}
      </label>
      <button type="submit" class="eu-btn" data-click="pop"><Icon icon={faPen} /> Draw it</button>
    </form>

    <ShareButtons
      url={link}
      {title}
      text={`${text}. Made with ${siteName}.`}
      description={() => `${text}. ${description}`}
      picture={() => svgToPicture(svg, { width: 1080, height: 1296 })}
      heading={name.trim() ? `Share the arms of ${name.trim()}` : 'Share your arms'}
      said={{ link: 'Link copied: the arms are in it.' }}
    />

    <div class="eu-row">
      <button type="button" class="eu-btn" data-click="bounce" onclick={() => download(svg, fileName('svg'), 'image/svg+xml')}><Icon icon={faDownload} /> SVG</button>
      <button type="button" class="eu-btn" data-click="bounce" onclick={() => savePicture('image/png')}><Icon icon={faDownload} /> PNG</button>
      <button type="button" class="eu-btn" data-click="bounce" onclick={() => savePicture('image/webp')}><Icon icon={faDownload} /> WebP</button>
      <label class="eu-field size">
        <span class="eu-visually-hidden">Size of the PNG or WebP</span>
        <select class="eu-select" bind:value={size}>
          {#each widths as width (width)}<option value={String(width)}>{width} px wide</option>{/each}
          {#each PICTURE_SIZES as shared (shared.id)}<option value={shared.id}>{shared.name}, {shared.width} × {shared.height}</option>{/each}
        </select>
      </label>
      <ProfileButtons profile={saved} onload={loaded} onerror={(errors) => toast(errors[0]?.message ?? "That file isn't a nation profile.")} />
    </div>

    {#if credits.length}
      <p class="eu-help">
        {#each credits as credit (credit.title)}
          The {credit.title.replace(/\.svg$/, '').toLowerCase()} is by {credit.author}, shared under {credit.licence}.{' '}
        {/each}
        Credit {credits[0]?.author} when you show your picture, and share it on the same terms. The SVG carries the credit already; a PNG or WebP can't, so it is yours to add.
      </p>
    {/if}
    <p class="eu-help">
      The link holds the whole design. The profile file carries your nation from one Eurth tool to the next{saved ? '' : ' (give the arms a name on the Shield step to save one)'}; nothing is kept in this browser.
    </p>
  </section>
</div>

<style>
  .maker {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
    gap: var(--space-6);
    align-items: start;
  }

  .controls {
    gap: var(--space-4);
    min-width: 0;
  }

  .tabs {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--space-1);
  }

  .tabs [aria-selected='true'] {
    border-color: var(--selected);
    background: var(--selected);
    color: var(--on-selected);
  }

  .panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    min-width: 0;
  }

  .panel[hidden] {
    display: none;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
    gap: var(--space-2);
  }

  .choice {
    flex-direction: column;
    gap: var(--space-1);
    height: auto;
    padding: var(--space-2) var(--space-1);
    font: var(--type-body-sm);
    text-align: center;
  }

  .choice img {
    display: block;
    width: 40px;
    height: 48px;
  }

  .rule {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    background: var(--surface-raised);
  }

  .verdict {
    display: flex;
    gap: var(--space-2);
    align-items: center;
    font-weight: 700;
    color: var(--success-text);
  }

  .verdict.broken {
    color: var(--caution-text);
  }

  .findings {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .findings li {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    align-items: center;
    justify-content: space-between;
  }

  .result {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    min-width: 0;
  }

  .shield {
    display: block;
    width: min(100%, 360px);
    height: auto;
    margin: 0 auto;
  }

  .words {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    align-items: center;
    text-align: center;
  }

  .blazon {
    font: var(--type-title);
    font-style: italic;
  }

  .typing {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: var(--space-2);
    align-items: start;
  }

  .typing button {
    margin-top: calc(var(--space-6) + var(--space-1));
  }

  .size {
    min-width: 0;
  }

  @media (max-width: 800px) {
    .maker {
      grid-template-columns: minmax(0, 1fr);
    }

    /* On a phone the result comes first: it is what the visitor came for. */
    .result {
      order: -1;
    }

    .typing {
      grid-template-columns: minmax(0, 1fr);
    }

    .typing button {
      margin-top: 0;
    }
  }
</style>
