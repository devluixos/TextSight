import { Readable, Writable } from "svelte/store"

export type AccordeonContext = {
    activeId: Writable<string>
    activate: (id: string) => void
}
