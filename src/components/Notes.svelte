<script lang="ts">
	import { mdiClose } from '@mdi/js';
	import { notesOpen$, userNotes$ } from '../stores/stores';
	import { dummyFn } from '../util';
	import Icon from './Icon.svelte';

	function handleBlur(event: FocusEvent) {
		$userNotes$ = (event.target as HTMLTextAreaElement).value;
	}
</script>

<div class="flex justify-between items-center px-5 py-3" style="border-bottom: 1px solid var(--sm-border);">
	<span class="notes-title">Notes</span>
	<div
		class="flex cursor-pointer items-center close-btn"
		on:click={() => ($notesOpen$ = false)}
		on:keyup={dummyFn}
		title="Close notes"
	>
		<Icon path={mdiClose} />
	</div>
</div>
<textarea
	class="flex-1 overflow-auto mx-4 my-3 p-1 pb-2"
	style="resize: none;"
	value={$userNotes$}
	on:blur={handleBlur}
	placeholder="Write your notes here..."
/>

<style>
	.notes-title {
		color: var(--sm-subtext, #a5adcb);
		font-size: 0.8rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.close-btn {
		padding: 0.25rem;
		border-radius: 6px;
		transition: background 0.15s ease, color 0.15s ease;
	}

	.close-btn:hover {
		background: var(--sm-hover-bg, rgba(138, 173, 244, 0.04));
		color: var(--sm-accent, #8aadf4);
	}
</style>
