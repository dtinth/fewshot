import { createStore } from "idb-keyval";

let store: ReturnType<typeof createStore>;

export const getStore = () => (store ??= createStore("fewshot", "keyval"));
