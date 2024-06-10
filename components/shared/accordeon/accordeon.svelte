<script lang="ts">
	import { getContext, onMount, setContext } from "svelte";
	import { readable, writable } from "svelte/store";
	import type { AccordeonContext, AccordeonItem } from "./context";

	export let className: string = "";
	export let initialOpen: string = "";
	/**
	 * - Create context in panel
	 * - child component takes context.
	 * -
	 */
	onMount(() => {

		let firstRegister = true
		const activeId = writable(initialOpen);
		const context: AccordeonContext = {
			activeId: activeId,

			// children panels register itself so can auto open 
			// first panel if none is specified initially
			register: (id: string) => {
				if(firstRegister && !initialOpen) {
					activeId.set(id)
					firstRegister = false
				}
			}
		};

		setContext("accordeon", context);
	});

	let _class = "accordeon " + (className || "")
</script>


<div class={_class}>
	<slot></slot>
</div>