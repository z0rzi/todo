import Dict from './Dict';

const debounceMap = new Dict<
    string,
    { fn: () => void; timeoutId: NodeJS.Timer }
>();

export function debounce(id: string, fn: () => void) {
    const timeoutId = setTimeout(fn, 200);

    const debounceInfos = debounceMap.get(id);
    if (debounceInfos) clearTimeout(debounceInfos.timeoutId);

    debounceMap.set(id, { fn, timeoutId });
}
