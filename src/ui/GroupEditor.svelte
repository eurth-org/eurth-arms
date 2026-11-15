<script lang="ts">
  /*
   * One group of charges: which charge, how many, its tincture, and (for those that have
   * them) its attitude, its points and how the charges lie. Used three times: for the charges
   * on the field, on the ordinary and on the chief.
   */
  import { faXmark } from '@fortawesome/free-solid-svg-icons';
  import Icon from '@eurth/style/components/Icon.svelte';
  import { pickable } from '../arms/catalogue';
  import { arrangementsFor, attitudesFor, mulletPoints, names, type Arrangement, type Attitude, type ChargeGroup, type MulletPoints } from '../arms/model';
  import { modernArt } from '../arms/modern';
  import type { TinctureId } from '../arms/tinctures';
  import Swatches from './Swatches.svelte';

  let {
    id,
    title,
    group,
    counts,
    arranged,
    advanced,
    thumbs,
    onchange,
  }: {
    /** Unique on the page: for labels. */
    id: string;
    title: string;
    group: ChargeGroup | undefined;
    /** How many of the charge this place can hold. */
    counts: readonly number[];
    /** Whether the charges' arrangement is the visitor's to choose here. */
    arranged: boolean;
    advanced: boolean;
    /** Small pictures of the classic charges, by id. */
    thumbs: Record<string, string>;
    /** Called with what changed, or with null to take the charges away. */
    onchange: (change: Partial<ChargeGroup> | null) => void;
  } = $props();

  let query = $state('');

  const classic = pickable.filter((c) => c.kind === 'drawn');
  const modern = pickable.filter((c) => c.kind === 'modern');
  const groups = [...new Set(modern.map((c) => c.group))];
  const found = $derived(query.trim() ? modern.filter((c) => `${c.name} ${c.group}`.toLowerCase().includes(query.trim().toLowerCase())) : modern);
  const stances = $derived(group ? attitudesFor(group.charge) : []);
  const ways = $derived(group && arranged ? arrangementsFor(group.count) : []);
  const numerals = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'];
</script>

<fieldset class="group">
  <legend class="eu-label">{title}</legend>

  <div class="eu-row">
    <button type="button" class="eu-btn" aria-pressed={!group} onclick={() => onchange(null)}><Icon icon={faXmark} /> None</button>
    {#each classic as c (c.id)}
      <button type="button" class="eu-btn pick" aria-pressed={group?.charge === c.id} onclick={() => onchange({ charge: c.id })}>
        {#if thumbs[c.id]}<img src={thumbs[c.id]} alt="" width="30" height="36" />{/if}
        {c.name.charAt(0).toUpperCase() + c.name.slice(1)}
      </button>
    {/each}
  </div>

  <details class="more">
    <summary class="eu-btn eu-btn--quiet">Modern charges ({modern.length})</summary>
    <div class="eu-stack">
      <label class="eu-field">
        <span class="eu-label">Find a charge</span>
        <input class="eu-input" type="search" bind:value={query} autocomplete="off" placeholder="anchor, tower, tree…" />
      </label>
      <div class="eu-scroll icons" role="group" aria-label="Modern charges">
        {#each groups as name (name)}
          {#if found.some((c) => c.group === name)}
            <p class="eu-kicker">{name}</p>
            <div class="eu-row">
              {#each found.filter((c) => c.group === name) as c (c.id)}
                {@const art = modernArt(c.id)}
                <button type="button" class="eu-btn eu-btn--icon" aria-pressed={group?.charge === c.id} aria-label={c.name} data-tip={c.name} onclick={() => onchange({ charge: c.id })}>
                  {#if art}<svg class="eu-icon" viewBox="0 0 {art.w} {art.h}" aria-hidden="true"><path d={art.d} fill="currentColor" /></svg>{/if}
                </button>
              {/each}
            </div>
          {/if}
        {/each}
        {#if !found.length}<p class="eu-muted">No charge by that name. Try another word, or see the roadmap's wish list.</p>{/if}
      </div>
    </div>
  </details>

  {#if group}
    {#if counts.length > 1}
      <div class="eu-row" role="group" aria-label="How many">
        {#each counts as n (n)}
          <button type="button" class="eu-btn" aria-pressed={group.count === n} onclick={() => onchange({ count: n })}>{numerals[n]}</button>
        {/each}
      </div>
    {/if}

    {#if stances.length > 1}
      <label class="eu-field">
        <span class="eu-label">Attitude</span>
        <select class="eu-select" value={group.attitude} onchange={(e) => onchange({ attitude: e.currentTarget.value as Attitude })} id="{id}-attitude">
          {#each stances as a (a)}<option value={a}>{names.attitude[a]}</option>{/each}
        </select>
      </label>
    {/if}

    {#if group.charge === 'mullet' && advanced}
      <div class="eu-row" role="group" aria-label="Points">
        {#each mulletPoints as p (p)}
          <button type="button" class="eu-btn" aria-pressed={group.points === p} onclick={() => onchange({ points: p as MulletPoints })}>{p} points</button>
        {/each}
      </div>
    {/if}

    {#if advanced && ways.length > 1}
      <label class="eu-field">
        <span class="eu-label">How they lie</span>
        <select class="eu-select" value={group.arrangement} onchange={(e) => onchange({ arrangement: e.currentTarget.value as Arrangement })} id="{id}-arrangement">
          {#each ways as way (way)}<option value={way}>{names.arrangement[way]}</option>{/each}
        </select>
      </label>
    {/if}

    {#if group.charge !== 'emu'}
      <Swatches label="Tincture of the {group.count === 1 ? 'charge' : 'charges'}" value={group.tincture === 'proper' ? undefined : group.tincture} onpick={(tincture: TinctureId) => onchange({ tincture })} />
    {/if}
  {/if}
</fieldset>

<style>
  .group {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }

  .pick img {
    display: block;
    width: auto;
    height: var(--space-6);
  }

  .more > .eu-stack {
    margin-top: var(--space-3);
  }

  .icons {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    max-height: calc(var(--size-target) * 6);
  }
</style>
