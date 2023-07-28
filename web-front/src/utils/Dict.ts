export default class Dict<K, T> {
    obj: Map<K, T>;

    constructor(obj?: Record<any, T> | Map<K, T>) {
        if (!obj) this.obj = new Map();
        else {
            if (obj instanceof Map) {
                this.obj = new Map(obj) as Map<K, T>;
            } else {
                this.obj = new Map(Object.entries(obj)) as Map<K, T>;
            }
        }
    }

    get length() {
        return this.obj.size;
    }

    get(key: K, defaultValue: T): T;
    get(key: K): T | null;
    get(key: K, defaultValue?: T): T | null {
        if (!this.has(key)) return defaultValue ?? null;
        return this.obj.get(key) ?? null;
    }

    set(key: K, value: T) {
        this.obj.set(key, value);
        return this;
    }

    has(key: K) {
        return this.obj.has(key);
    }

    hasVal(value: T): boolean {
        for (const val of this.obj.values()) {
            if (val === value) return true;
        }
        return false;
    }

    clear() {
        this.obj.clear();
        return this;
    }

    delete(key: K) {
        this.obj.delete(key);
        return this;
    }

    forEach(cb: (arg: T, key: K) => void) {
        for (const key of this.obj.keys()) {
            cb(this.get(key) as T, key);
        }
    }

    map<U>(cb: (val: T, key: K) => U): U[] {
        const out = [] as U[];
        for (const key of this.obj.keys()) {
            out.push(cb(this.get(key) as T, key));
        }
        return out;
    }

    find(cb: (val: T, key: K) => boolean): [K, T] | null {
        for (const [key, val] of this) {
            if (cb(val, key)) {
                return [key, val];
            }
        }
        return null;
    }

    clone(): Dict<K, T> {
        return new Dict(this.obj);
    }

    // Implement the Symbol.iterator method
    *[Symbol.iterator]() {
        for (const [key, value] of this.obj) {
            yield [key, value] as [K, T];
        }
    }
}
