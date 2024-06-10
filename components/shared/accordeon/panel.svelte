<script lang="ts">
	import { onMount, getContext } from "svelte";
	import type { AccordeonContext } from "./context";

	export let id: string = "" + Math.random();
	export let label: string = "";

	let isOpened: boolean = false;
	let context: AccordeonContext;

	onMount(() => {
		context = getContext<AccordeonContext>("accordeon");
		context.activeId.subscribe((activeId) => (isOpened = activeId === id));
	});

	let className = "section" + (isOpened ? " open" : "");
</script>

<div class={className} {id}>
	<button class="section-header" on:click={() => context.activate(id)}>
		<h3>{label}</h3>
	</button>
	{#if isOpened}
		<div class="section-content">
			<slot></slot>
		</div>
	{/if}
</div>
