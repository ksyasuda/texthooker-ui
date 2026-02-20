<script lang="ts">
	import { mdiContentCopy, mdiTrophy } from '@mdi/js';
	import { createEventDispatcher, onDestroy, onMount, tick } from 'svelte';
	import { fly } from 'svelte/transition';
	import {
		displayVertical$,
		enableLineAnimation$,
		milestoneLines$,
		preserveWhitespace$,
		reverseLineOrder$,
	} from '../stores/stores';
	import type { LineItem, LineItemEditEvent } from '../types';
	import { getPlainTextFromLineMarkup } from '../line-markup';
	import { dummyFn, newLineCharacter, updateScroll } from '../util';
	import Icon from './Icon.svelte';

	export let line: LineItem;
	export let index: number;
	export let isLast: boolean;
	export let pipWindow: Window = undefined;

	export function deselect() {
		isSelected = false;
	}

	export function getIdIfSelected(range: Range) {
		return isSelected || range.intersectsNode(paragraph) ? line.id : undefined;
	}

	const dispatch = createEventDispatcher<{ deselected: string; selected: string; edit: LineItemEditEvent }>();

	let paragraph: HTMLElement;
	let originalText = '';
	let isSelected = false;
	let isEditable = false;
	let copyFeedback = false;

	$: isVerticalDisplay = !pipWindow && $displayVertical$;

	onMount(() => {
		if (isLast) {
			updateScroll(
				pipWindow || window,
				paragraph.closest('main, #pip-container'),
				$reverseLineOrder$,
				isVerticalDisplay,
				$enableLineAnimation$ ? 'smooth' : 'auto',
			);
		}
	});

	onDestroy(() => {
		document.removeEventListener('click', clickOutsideHandler, false);
		dispatch('edit', { inEdit: false });
	});

	function handleCopy() {
		navigator.clipboard.writeText(getPlainTextFromLineMarkup(line.text));
		copyFeedback = true;
		setTimeout(() => (copyFeedback = false), 1000);
	}

	function handleDblClick(event: MouseEvent) {
		if (pipWindow) {
			return;
		}

		window.getSelection()?.removeAllRanges();

		if (event.ctrlKey || event.metaKey) {
			if (isSelected) {
				isSelected = false;
				dispatch('deselected', line.id);
			} else {
				isSelected = true;
				dispatch('selected', line.id);
			}
		} else {
			originalText = paragraph.innerText;
			isEditable = true;

			dispatch('edit', { inEdit: true });

			document.addEventListener('click', clickOutsideHandler, false);

			tick().then(() => {
				paragraph.focus();
			});
		}
	}

	function clickOutsideHandler(event: MouseEvent) {
		const target = event.target as Node;

		if (!paragraph.contains(target)) {
			isEditable = false;
			document.removeEventListener('click', clickOutsideHandler, false);

			dispatch('edit', {
				inEdit: false,
				data: { originalText, newText: paragraph.innerText, lineIndex: index, line },
			});
		}
	}
</script>

{#key line.text}
	<div
		class="line-row group relative"
		in:fly={{ x: isVerticalDisplay ? 100 : -100, duration: $enableLineAnimation$ ? 250 : 0 }}
	>
		<p
			class="my-2 cursor-pointer border-2"
			class:py-4={!isVerticalDisplay}
			class:px-2={!isVerticalDisplay}
			class:py-2={isVerticalDisplay}
			class:px-4={isVerticalDisplay}
			class:border-transparent={!isSelected}
			class:cursor-text={isEditable}
			class:border-primary={isSelected}
			class:border-accent-focus={isEditable}
			class:whitespace-pre-wrap={$preserveWhitespace$}
			contenteditable={isEditable}
			on:dblclick={handleDblClick}
			on:keyup={dummyFn}
			bind:this={paragraph}
		>
			{@html line.text}
		</p>
		{#if !pipWindow && !isEditable}
			<button
				class="copy-btn"
				class:copied={copyFeedback}
				title={copyFeedback ? 'Copied!' : 'Copy line'}
				on:click|stopPropagation={handleCopy}
			>
				<Icon path={mdiContentCopy} width="1rem" height="1rem" />
			</button>
		{/if}
	</div>
{/key}
{@html newLineCharacter}
{#if $milestoneLines$.has(line.id)}
	<div
		class="flex justify-center text-xs my-2 py-2 border-primary border-dashed milestone"
		class:border-x-2={$displayVertical$}
		class:border-y-2={!$displayVertical$}
		class:py-4={!isVerticalDisplay}
		class:px-2={!isVerticalDisplay}
		class:py-2={isVerticalDisplay}
		class:px-4={isVerticalDisplay}
	>
		<div class="flex items-center">
			<Icon class={$displayVertical$ ? '' : 'mr-2'} path={mdiTrophy}></Icon>
			<span class:mt-2={$displayVertical$}>{$milestoneLines$.get(line.id)}</span>
		</div>
	</div>
	{@html newLineCharacter}
{/if}

<style>
	p:focus-visible {
		outline: none;
	}

	.line-row {
		position: relative;
	}

	.copy-btn {
		position: absolute;
		right: 0.5rem;
		top: 50%;
		transform: translateY(-50%);
		opacity: 0;
		padding: 0.35rem;
		border-radius: 6px;
		border: none;
		cursor: pointer;
		color: var(--sm-text-muted, #6e738d);
		background: var(--sm-surface-raised, #363a4f);
		transition: opacity 0.18s ease, color 0.18s ease, background 0.18s ease;
	}

	.line-row:hover .copy-btn {
		opacity: 1;
	}

	.copy-btn:hover {
		color: var(--sm-accent, #8aadf4);
		background: var(--sm-surface-bright, #494d64);
	}

	.copy-btn.copied {
		opacity: 1;
		color: var(--sm-green, #a6da95);
	}
</style>
