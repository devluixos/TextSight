import { Readable, Writable } from "svelte/store"

export type AccordeonContext = {
    activeId: Writable<string>
    key: Readable<string>
    activate: (id: string) => void
}