<script lang="ts">
	import { onMount, getContext } from "svelte";
	import type { AccordeonContext } from "./context";

	export let id: string = "" + Math.random();

	let isOpened: boolean = false;

	/**
	 * - Create context in panel
	 * - child component takes context.
	 * -
	 */

	onMount(() => {
		const context = getContext<AccordeonContext>("accordeon");
		context.register(id);
		context.activeId.subscribe((activeId) => (isOpened = activeId === id));
	});

	let className = "panel" + (isOpened ? " open" : "");
</script>

<div class={className} {id}>
	{#if isOpened}
		<slot></slot>
	{/if}
</div>
