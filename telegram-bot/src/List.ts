function deepEqual(o1: unknown, o2: unknown, _cnt = 0): boolean {
    if (_cnt > 10000) {
        console.log('Failed comparing objects, they are too big!');
        return false;
    }

    const type1 = typeof o1;
    const type2 = typeof o2;

    if (type1 !== type2) return false;

    if (['string', 'number'].includes(type1)) return o1 === o2;

    if (o1 instanceof Date && o2 instanceof Date) return +o1 === +o2;

    if (Array.isArray(o1) && Array.isArray(o2)) {
        if (o1.length !== o2.length) return false;

        return o1.every((elem, idx) => deepEqual(elem, o2[idx], _cnt + 1));
    }

    if (type1 === 'object') {
        if (o1 == null && o2 == null) return true;

        const sortFn = ([k1]: [string, unknown], [k2]: [string, unknown]) =>
            k1 > k2 ? 1 : k1 === k2 ? 0 : -1;

        const e1 = Object.entries(o1 as {}).sort(sortFn);
        const e2 = Object.entries(o2 as {}).sort(sortFn);
        return deepEqual(e1, e2, _cnt + 1);
    }

    return JSON.stringify(o1) === JSON.stringify(o2);
}

export default class List<T> {
    arr: T[];

    constructor(arr?: T[]) {
        if (!arr) this.arr = [];
        else this.arr = [...arr];
    }

    get length() {
        return this.arr.length;
    }

    get(idx: number): T {
        return this.arr[idx];
    }

    set(idx: number, value: T) {
        this.arr[idx] = value;
    }

    move(oldIdx: number, newIdx: number, newList = this) {
        const elem = this.arr[oldIdx];
        this.delete(elem);

        newList.insert(elem, newIdx);

        return this;
    }

    has(elem: T) {
        return this.arr.includes(elem);
    }

    clear() {
        this.arr = [];
        return this;
    }

    delete(elem: T) {
        const idx = this.arr.indexOf(elem);
        if (idx >= 0) this.arr.splice(idx, 1);

        return this;
    }

    insert(elem: T, idx?: number) {
        if (idx == null) return this.arr.push(elem);

        this.arr.splice(idx, 0, elem);

        return this;
    }

    forEach(cb: (arg: T, idx: number) => void) {
        for (let i = 0; i < this.length; i++) {
            cb(this.get(i), i);
        }
    }

    map<U>(cb: (arg: T, idx: number) => U): U[] {
        return this.arr.map(cb);
    }

    filter(cb: (elem: T) => boolean) {
        const newList = new List<T>();
        for (const elem of this) {
            if (cb(elem)) {
                newList.insert(elem);
            }
        }
        return newList;
    }

    sort(sortFn: (a: T, b: T) => number): List<T> {
        this.arr.sort(sortFn);
        return this;
    }

    find(cb: (elem: T) => boolean): T | null {
        for (const elem of this) {
            if (cb(elem)) return elem;
        }
        return null
    }

    sameAs(other: List<T>) {
        if (this.length !== other.length) return false;

        for (let i = 0; i < this.length; i++) {
            if (this.get(i) !== other.get(i)) {
                return false;
            }
        }

        return true;
    }

    deepSameAs(other: List<T>) {
        if (this.length !== other.length) return false;

        for (let i = 0; i < this.length; i++) {
            const myVal = this.get(i);
            const otherVal = other.get(i);

            if (!deepEqual(myVal, otherVal)) return false;
        }

        return true;
    }

    clone(): List<T> {
        return new List([...this.arr]);
    }

    // Implement the Symbol.iterator method
    *[Symbol.iterator]() {
        for (const item of this.arr) {
            yield item;
        }
    }
}
