declare namespace piper {
    interface IEnumerator<T> {
        MoveNext: () => boolean;
        Current: () => T;
        Reset(): void;
    }
    interface IEnumerable<T> {
        GetEnumerator: () => IEnumerator<T>;
    }
    class Enumerable<T> implements IEnumerable<T> {
        _enumerator: IEnumerator<T>;
        constructor(enumerator: IEnumerator<T>);
        Where(predicate: (item: T) => boolean): Enumerable<T>;
        First(): T;
        Last(): T;
        ToArray(): T[];
        SelectMany<T2>(selector: (item: T) => Enumerable<T2>): Enumerable<T2>;
        Select<T2>(selector: (item: T) => T2): Enumerable<T2>;
        Intersect<T2>(second: Enumerable<T2>, predicate: (item1: T, item2: T2) => boolean): Enumerable<T>;
        Except<T2>(second: Enumerable<T2>, predicate: (item1: T, item2: T2) => boolean): Enumerable<T>;
        Duplicates(predicate: (item1: T, item2: T) => boolean): Enumerable<T>;
        Distinct(predicate: (item1: T, item2: T) => boolean): Enumerable<T>;
        ForEach(action: (item: T) => void): void;
        Min<T2>(valueSelector: (item: T) => T2): T;
        Max<T2>(valueSelector: (item: T) => T2): T;
        Skip(count: number): Enumerable<T>;
        Take(count: number): Enumerable<T>;
        Join<T2, T3>(secondary: Enumerable<T2>, predicate: (item1: T, item2: T2) => boolean, selector: (item1: T, item2: T2) => T3): Enumerable<T3>;
        OrderBy<T2>(valueSelector: (item: T) => T2): Enumerable<T>;
        OrderByDescending<T2>(valueSelector: (item: T) => T2): Enumerable<T>;
        GetEnumerator(): IEnumerator<T>;
    }
    function Enumerate<T>(array: T[]): Enumerable<T>;
}
