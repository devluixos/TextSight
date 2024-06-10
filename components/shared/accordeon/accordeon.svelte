<script lang="ts">
	import { onMount, setContext } from "svelte";
	import { writable } from "svelte/store";
	import type { AccordeonContext } from "./context";

	export let className: string = "";
	export let initialOpen: string = "";

	/**
	 * - Create context in panel
	 * - child component takes context.
	 */
	onMount(() => {

		let firstRegister = true
		const activeId = writable(initialOpen);
		const context: AccordeonContext = {
			activeId: activeId,
			activate: (id: string) => activeId.set(id) ,
		};

		setContext("accordeon", context);
	});

	let _class = "accordeon " + (className || "")
</script>

<div class={_class}>
	<slot></slot>
</div>