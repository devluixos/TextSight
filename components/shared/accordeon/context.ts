import { Readable, Writable } from "svelte/store"

export type AccordeonContext = {
    activeId: Writable<string>
}

export type AccordeonItem = {
    label: string
    key: string
}