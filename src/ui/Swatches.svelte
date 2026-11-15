<script lang="ts">
  /*
   * A row of tinctures to pick from. Every swatch carries its name: colour is never the only
   * way to tell them apart. The furs show their pattern.
   */
  import { tinctures, type TinctureId } from '../arms/tinctures';

  let { label, value, onpick }: { label: string; value: TinctureId | undefined; onpick: (tincture: TinctureId) => void } = $props();
</script>

<fieldset class="swatches">
  <legend class="eu-label">{label}</legend>
  <div class="eu-row">
    {#each tinctures as t (t.id)}
      <button type="button" class="eu-btn" aria-pressed={value === t.id} onclick={() => onpick(t.id)}>
        <svg class="eu-swatch" viewBox="0 0 16 16" aria-hidden="true">
          <rect width="16" height="16" fill={t.paint} />
          {#if t.id === 'ermine'}
            <path d="M4 3.5a1 1 0 1 0 .01 0ZM2.6 5.4a1 1 0 1 0 .01 0ZM5.4 5.4a1 1 0 1 0 .01 0ZM11.5 9a1 1 0 1 0 .01 0ZM10.1 10.9a1 1 0 1 0 .01 0ZM12.9 10.9a1 1 0 1 0 .01 0Z" fill={t.second} />
          {:else if t.id === 'vair'}
            <path d="M0 8L2 6V2L4 0L6 2V6L8 8ZM8 8L10 6V2L12 0L14 2V6L16 8ZM-4 16L-2 14V10L0 8L2 10V14L4 16ZM4 16L6 14V10L8 8L10 10V14L12 16ZM12 16L14 14V10L16 8L18 10V14L20 16Z" fill={t.second} />
          {/if}
        </svg>
        {t.name}
      </button>
    {/each}
  </div>
</fieldset>

<style>
  .swatches {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }
</style>
