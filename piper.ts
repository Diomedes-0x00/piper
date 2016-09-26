
namespace piper {



    export interface IEnumerator<T> {
        MoveNext: () => boolean;
        Current: () => T;
        Reset(): void;
    }


    export interface IEnumerable<T> {
        GetEnumerator: () => IEnumerator<T>;
    }


    class First<T>{
        _previous: IEnumerator<T>;

        constructor(previous: IEnumerator<T>) {
            this._previous = previous;
        }
        GetResults<T>(): T {
            if (this._previous.MoveNext()) {
                return <any>this._previous.Current();
            }
            return null;
        }
    }

    class Last<T>{
        _previous: IEnumerator<T>;

        constructor(previous: IEnumerator<T>) {
            this._previous = previous;
        }
        GetResults<T>(): T {
            while (this._previous.MoveNext()) {

            }
            return <any>this._previous.Current();
        }
    }


    class ToArray<T>{
        _previous: IEnumerator<T>;

        constructor(previous: IEnumerator<T>) {
            this._previous = previous;
        }
        GetResults<T>(): T[] {
            var results: T[] = [];

            while (this._previous.MoveNext()) {
                var current: any = this._previous.Current();

                results.push(current);
            }

            return results;
        }
    }

    class SelectMany<T, T2> implements IEnumerator<T2>{
        _previous: IEnumerator<T>;
        _selector: (item: T) => Enumerable<T2>;
        _current: T;
        _currentEnumerator: IEnumerator<T2>;

        _selected: T2;

        constructor(previous: IEnumerator<T>, selector: (item: T) => Enumerable<T2>) {
            this._previous = previous;
            this._selector = selector;
        }
        MoveNext = () => {
            if (this._current == null) {
                var r = this._previous.MoveNext();
                if (!r) return false;
                this._current = this._previous.Current();
            }
            if (this._currentEnumerator == null) {
                this._currentEnumerator = this._selector(this._current).GetEnumerator();
            }

            while (this._currentEnumerator.MoveNext()) {
                this._selected = this._currentEnumerator.Current();
                return true;
            }

            var r = this._previous.MoveNext();

            if (!r) return false;
            this._current = this._previous.Current();
            this._currentEnumerator = this._selector(this._current).GetEnumerator();
            return this.MoveNext();
        };

        Current = () => {
            return this._selected;
        };


        Reset() {
            return this._previous.Reset();
        }


    }

    class Except<T, T2> implements IEnumerator<T>{
        _previous: IEnumerator<T>;
        _predicate: (item1: T, item2: T2) => boolean;
        _current: T;
        _match: T;
        _secondDataList: IEnumerator<T2>;

        constructor(previous: IEnumerator<T>, secondDataList: IEnumerator<T2>, predicate: (item1: T, item2: T2) => boolean) {
            this._previous = previous;
            this._predicate = predicate;
            this._secondDataList = secondDataList;
        }

        MoveNext = () => {
            var r = this._previous.MoveNext();
            if (!r) return false;

            this._current = this._previous.Current();
            this._secondDataList.Reset(); //resetting to beginning because we only need one match to satisfy this logic

            while (this._secondDataList.MoveNext()) {
                if (this._predicate(this._current, this._secondDataList.Current())) {
                    //match found, move next
                    return this.MoveNext();
                }
            }
            //no match found, that's what we need

            this._match = this._current;
            return true;

        };

        Current = () => {
            return this._match;
        };


        Reset() {
            return this._previous.Reset();
        }
    }

    class Intersect<T, T2> implements IEnumerator<T>{
        _previous: IEnumerator<T>;
        _predicate: (item1: T, item2: T2) => boolean;
        _current: T;
        _match: T;
        _secondDataList: IEnumerator<T2>;

        constructor(previous: IEnumerator<T>, secondDataList: IEnumerator<T2>, predicate: (item1: T, item2: T2) => boolean) {
            this._previous = previous;
            this._predicate = predicate;
            this._secondDataList = secondDataList;
        }

        MoveNext = () => {
            var r = this._previous.MoveNext();
            if (!r) return false;

            this._current = this._previous.Current();
            this._secondDataList.Reset(); //resetting to beginning because we only need one match to satisfy this logic

            while (this._secondDataList.MoveNext()) {
                if (this._predicate(this._current, this._secondDataList.Current())) {
                    this._match = this._current;
                    return true;
                }
            }
            //no match found

            return this.MoveNext(); //retry with the next element

        };

        Current = () => {
            return this._match;
        };


        Reset() {
            return this._previous.Reset();
        }
    }

    class Take<T> implements IEnumerator<T>{
        _previous: IEnumerator<T>;
        _count: number;
        _index: number;

        _current: T;

        constructor(previous: IEnumerator<T>, count: number) {
            this._previous = previous;
            this._count = count;
            this._index = 0;
        }
        MoveNext(): boolean {
            while (this._index < this._count && this._previous.MoveNext()) {
                this._index++;
                this._current = this._previous.Current();
                return true;
            }

            return false;

        }
        Current(): T {
            return this._current;
        }
        Reset(): void {
            this._previous.Reset();
        }

    }


    class Skip<T> implements IEnumerator<T>{
        _previous: IEnumerator<T>;
        _count: number;
        _index: number;

        _current: T;

        constructor(previous: IEnumerator<T>, count: number) {
            this._previous = previous;
            this._count = count;
            this._index = 0;
        }
        MoveNext(): boolean {
            while (this._index < this._count && this._previous.MoveNext()) {
                this._index++;
            }
            while (this._previous.MoveNext()) {
                this._current = this._previous.Current();
                return true;
            }

            return false;

        }
        Current(): T {
            return this._current;
        }
        Reset(): void {
            this._previous.Reset();
        }

    }

    class Select<T, T2> implements IEnumerator<T2>{
        _previous: IEnumerator<T>;
        _selector: (item: T) => T2;
        _current: T2;

        constructor(previous: IEnumerator<T>, selector: (item: T) => T2) {
            this._previous = previous;
            this._selector = selector;
        }

        MoveNext = () => {
            var r = this._previous.MoveNext();
            if (!r) return false;
            this._current = this._selector(this._previous.Current());
            return true;
        };

        Current = () => {
            return this._current;
        };

        Reset() {
            this._previous.Reset();
        }
    }

    class Join<T, T2, T3> implements IEnumerator<T3>{
        _current: T3;
        _previous: IEnumerator<T>;
        _predicate: (item1: T, item2: T2) => boolean;
        _selector: (item: T, item2: T2) => T3;
        _secondary: IEnumerator<T2>;

        constructor(previous: IEnumerator<T>, secondary: IEnumerator<T2>,
            predicate: (item1: T, item2: T2) => boolean,
            selector: (item: T, item2: T2) => T3) {
            this._previous = previous;
            this._selector = selector;
            this._predicate = predicate;
            this._secondary = secondary;
        }
        Current(): T3 {
            return this._current;
        }
        MoveNext(): boolean {
            this._secondary.Reset();

            while (this._previous.MoveNext()) {
                while (this._secondary.MoveNext()) {
                    if (this._predicate(this._previous.Current(), this._secondary.Current())) {
                        this._current = this._selector(this._previous.Current(), this._secondary.Current());
                        return true;
                    }
                }
            }
            return false;



        }
        Reset() {
            return this._previous.Reset();
        }
    }

    class Where<T> implements IEnumerator<T>{
        _previous: IEnumerator<T>;
        _predicate: (item: T) => boolean;
        _current: T;

        constructor(previous: IEnumerator<T>, predicate: (item: T) => boolean) {
            this._previous = previous;
            this._predicate = predicate;
        }

        MoveNext = () => {
            while (this._previous.MoveNext()) {
                if (this._predicate(this._previous.Current())) {
                    this._current = this._previous.Current();
                    return true;
                }
            }
            return false;
        };

        Current = () => {
            return this._current;
        };

        Reset() {
            this._previous.Reset();
        }
    }
    class Distinct<T> implements IEnumerator<T>{
        _previous: IEnumerator<T>;
        _predicate: (item: T, item2: T) => boolean;
        _current: T;
        _copy: T[];

        constructor(previous: IEnumerator<T>, predicate: (item: T, item2: T) => boolean) {
            this._previous = previous;
            this._predicate = predicate;
            this._copy = new ToArray<T>(previous).GetResults<T>();

        }

        MoveNext = () => {

            if (this._copy.length == 0) return false;

            var last = this._copy.shift();

            if (Enumerate(this._copy).Where((i: T) => { return this._predicate(i, last); }).First() != null) {
                return this.MoveNext(); //duplicate found, moving on
            }

            this._current = last;  // no match found
            return true;
        };

        Current = () => {
            return this._current;
        };

        Reset() {
            this._previous.Reset();
        }
    }
    class Duplicates<T> implements IEnumerator<T>{
        _previous: IEnumerator<T>;
        _predicate: (item: T, item2: T) => boolean;
        _current: T;
        _copy: T[];

        constructor(previous: IEnumerator<T>, predicate: (item: T, item2: T) => boolean) {
            this._previous = previous;
            this._predicate = predicate;
            this._copy = new ToArray<T>(previous).GetResults<T>();

        }

        MoveNext = () => {

            if (this._copy.length == 0) return false;

            var last = this._copy.pop();

            if (Enumerate(this._copy).Where((i: T) => { return this._predicate(i, last); }).First() != null) {
                this._current = last;
                return true;
            }

            return this.MoveNext();  // no match found
           
        };

        Current = () => {
            return this._current;
        };

        Reset() {
            this._previous.Reset();
        }
    }
    class ArrayEnumerator<T> implements IEnumerator<T>{
        _dataSource: T[]
        _index: number;
        _current: T;

        constructor(data: T[]) {
            this._index = -1;
            this._dataSource = data;
        }

        MoveNext = () => {

            this._index++;
            return this._index < this._dataSource.length;
        };

        Current = () => {
            return this._dataSource[this._index];
        };

        GetEnumerator = () => {
            return this;
        };
        Reset() {
            this._index = -1;
        }
    }

    class ForEach<T> {
        _previous: IEnumerator<T>;
        _action: (item: T) => void;
        _current: T;

        constructor(previous: IEnumerator<T>, action: (item: T) => void) {
            this._previous = previous;
            this._action = action;
            while (previous.MoveNext()) {
                action(previous.Current());
            }
        }
    }

    class Min<T, T2>{
        _previous: IEnumerator<T>;
        _valueSelector: (item: T) => T2;

        constructor(previous: IEnumerator<T>, valueSelector: (item: T) => T2) {
            this._previous = previous;
            this._valueSelector = valueSelector;

        }

        GetResults(): T {
            var minValue: T2 = null;
            var min: T;
            this._previous.Reset();

            new Enumerable(this._previous).ForEach((i) => {
                if (minValue == null || this._valueSelector(i) < minValue) {
                    minValue = this._valueSelector(i);
                    min = i;
                }
            });

            return min;
        }

    }
    class Max<T, T2>{
        _previous: IEnumerator<T>;
        _valueSelector: (item: T) => T2;

        constructor(previous: IEnumerator<T>, valueSelector: (item: T) => T2) {
            this._previous = previous;
            this._valueSelector = valueSelector;

        }

        GetResults(): T {
            var maxValue: T2 = null;
            var max: T;
            this._previous.Reset();

            new Enumerable(this._previous).ForEach((i) => {
                if (maxValue == null || this._valueSelector(i) > maxValue) {
                    maxValue = this._valueSelector(i);
                    max = i;
                }
            });

            return max;
        }

    }

    class OrderBy<T, T2> implements IEnumerator<T>{
        _copy: T[];
        _valueSelector: (item: T) => T2;
        _current: T;
        _previous: IEnumerator<T>;

        constructor(previous: IEnumerator<T>, valueSelector: (item: T) => T2) {
            this._copy = new ToArray<T>(previous).GetResults<T>();
            this._valueSelector = valueSelector;
            this._previous = previous;
        }

        MoveNext(): boolean {
            var min = Enumerate(this._copy).Min(this._valueSelector);
            //TODO: need remove code
            if (min == null) return false;
            var targetIndex = this._copy.indexOf(min);
            var index = 0;

            var newResults: Array<T> = [];

            Enumerate(this._copy).ForEach((i) => {
                if (index != targetIndex) {
                    newResults.push(i);
                }
                index++;
            });
            this._copy = newResults;

            this._current = min;
            return true;

        }
        Current(): T {
            return this._current;
        }
        Reset() {
            this._previous.Reset();
            this._copy = new ToArray<T>(this._previous).GetResults<T>();
        }
    }
    class OrderByDescending<T, T2> implements IEnumerator<T>{
        _copy: T[];
        _valueSelector: (item: T) => T2;
        _current: T;
        _previous: IEnumerator<T>;

        constructor(previous: IEnumerator<T>, valueSelector: (item: T) => T2) {
            this._copy = new ToArray<T>(previous).GetResults<T>();
            this._valueSelector = valueSelector;
            this._previous = previous;
        }

        MoveNext(): boolean {

            var max = Enumerate(this._copy).Max(this._valueSelector);

            if (max == null) return false;
            var targetIndex = this._copy.indexOf(max);
            var index = 0;

            var newResults: Array<T> = [];

            Enumerate(this._copy).ForEach((i) => {
                if (index != targetIndex) {
                    newResults.push(i);
                }
                index++;
            });
            this._copy = newResults;

            this._current = max;
            return true;

        }
        Current(): T {
            return this._current;
        }
        Reset() {
            this._previous.Reset();
            this._copy = new ToArray<T>(this._previous).GetResults<T>();
        }

    }


   export class Enumerable<T> implements IEnumerable<T>{
        _enumerator: IEnumerator<T>;
        constructor(enumerator: IEnumerator<T>) {
            this._enumerator = enumerator;
        }
        Where(predicate: (item: T) => boolean) {
            var w = new Where<T>(this._enumerator, predicate);
            return new Enumerable<T>(w);
        }
        First(): T {
            var a = new First<T>(this._enumerator);
            return a.GetResults<T>();
        }
        Last(): T {
            var a = new Last<T>(this._enumerator);
            return a.GetResults<T>();
        }

        ToArray(): T[] {
            var a = new ToArray<T>(this._enumerator);
            return a.GetResults<T>();
        }

        SelectMany<T2>(selector: (item: T) => Enumerable<T2>) {
            var s = new SelectMany<T, T2>(this._enumerator, selector);
            return new Enumerable(s);
        }
        Select<T2>(selector: (item: T) => T2) {
            var s = new Select<T, T2>(this._enumerator, selector);
            return new Enumerable(s);
        }
        Intersect<T2>(second: Enumerable<T2>, predicate: (item1: T, item2: T2) => boolean) {
            var i = new Intersect<T, T2>(this._enumerator, second.GetEnumerator(), predicate);
            return new Enumerable(i);
        }
        Except<T2>(second: Enumerable<T2>, predicate: (item1: T, item2: T2) => boolean) {
            var i = new Except<T, T2>(this._enumerator, second.GetEnumerator(), predicate);
            return new Enumerable(i);
        }
        Duplicates(predicate: (item1: T, item2: T) => boolean) {
            var d = new Duplicates<T>(this._enumerator, predicate);
            return new Enumerable(d);
        }
        Distinct(predicate: (item1: T, item2: T) => boolean) {
            var d = new Distinct<T>(this._enumerator, predicate);
            return new Enumerable(d);
        }
        ForEach(action: (item: T) => void): void {
            var f = new ForEach<T>(this._enumerator, action);

        }
        Min<T2>(valueSelector: (item: T) => T2): T {
            return new Min(this._enumerator, valueSelector).GetResults();
        }
        Max<T2>(valueSelector: (item: T) => T2): T {
            return new Max(this._enumerator, valueSelector).GetResults();
        }

        Skip(count: number) {
            var s = new Skip<T>(this._enumerator, count);
            return new Enumerable(s);
        }
        Take(count: number) {
            var s = new Take<T>(this._enumerator, count);
            return new Enumerable(s);
        }
        Join<T2, T3>(secondary: Enumerable<T2>, predicate: (item1: T, item2: T2) => boolean, selector: (item1: T, item2: T2) => T3) {
            var j = new Join<T, T2, T3>(this._enumerator, secondary.GetEnumerator(), predicate, selector);
            return new Enumerable(j);
        }
        OrderBy<T2>(valueSelector: (item: T) => T2) {
            var o = new OrderBy<T, T2>(this._enumerator, valueSelector);
            return new Enumerable(o);
        }
        OrderByDescending<T2>(valueSelector: (item: T) => T2) {
            var o = new OrderByDescending<T, T2>(this._enumerator, valueSelector);
            return new Enumerable(o);
        }
        GetEnumerator() {
            return this._enumerator;
        }
    }

    class SortedEnumerable<T> extends Enumerable<T>{


    }

    export function Enumerate<T>(array: T[]) {
        return new Enumerable<T>(new ArrayEnumerator(array));
    }



}