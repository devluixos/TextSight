<script lang="ts">
	import { getContext, onMount, setContext } from "svelte";
	import { readable, writable } from "svelte/store";
	import type { AccordeonContext } from "./context";

	export let className: string = "";
	export let initialOpen: string = "";

	/**
	 * - Create context in panel
	 * - child component takes context.
	 * -
	 */

	onMount(() => {

		const activeId = writable(initialOpen);

		const context: AccordeonContext = {
			activeId: activeId,
            activate: (id: string) => activeId.set(id)
		};

		setContext("accordeon" + key, context);
	});
</script>

