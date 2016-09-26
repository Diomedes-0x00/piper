var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var piper;
(function (piper) {
    var First = (function () {
        function First(previous) {
            this._previous = previous;
        }
        First.prototype.GetResults = function () {
            if (this._previous.MoveNext()) {
                return this._previous.Current();
            }
            return null;
        };
        return First;
    })();
    var Last = (function () {
        function Last(previous) {
            this._previous = previous;
        }
        Last.prototype.GetResults = function () {
            while (this._previous.MoveNext()) {
            }
            return this._previous.Current();
        };
        return Last;
    })();
    var ToArray = (function () {
        function ToArray(previous) {
            this._previous = previous;
        }
        ToArray.prototype.GetResults = function () {
            var results = [];
            while (this._previous.MoveNext()) {
                var current = this._previous.Current();
                results.push(current);
            }
            return results;
        };
        return ToArray;
    })();
    var SelectMany = (function () {
        function SelectMany(previous, selector) {
            var _this = this;
            this.MoveNext = function () {
                if (_this._current == null) {
                    var r = _this._previous.MoveNext();
                    if (!r)
                        return false;
                    _this._current = _this._previous.Current();
                }
                if (_this._currentEnumerator == null) {
                    _this._currentEnumerator = _this._selector(_this._current).GetEnumerator();
                }
                while (_this._currentEnumerator.MoveNext()) {
                    _this._selected = _this._currentEnumerator.Current();
                    return true;
                }
                var r = _this._previous.MoveNext();
                if (!r)
                    return false;
                _this._current = _this._previous.Current();
                _this._currentEnumerator = _this._selector(_this._current).GetEnumerator();
                return _this.MoveNext();
            };
            this.Current = function () {
                return _this._selected;
            };
            this._previous = previous;
            this._selector = selector;
        }
        SelectMany.prototype.Reset = function () {
            return this._previous.Reset();
        };
        return SelectMany;
    })();
    var Except = (function () {
        function Except(previous, secondDataList, predicate) {
            var _this = this;
            this.MoveNext = function () {
                var r = _this._previous.MoveNext();
                if (!r)
                    return false;
                _this._current = _this._previous.Current();
                _this._secondDataList.Reset(); //resetting to beginning because we only need one match to satisfy this logic
                while (_this._secondDataList.MoveNext()) {
                    if (_this._predicate(_this._current, _this._secondDataList.Current())) {
                        //match found, move next
                        return _this.MoveNext();
                    }
                }
                //no match found, that's what we need
                _this._match = _this._current;
                return true;
            };
            this.Current = function () {
                return _this._match;
            };
            this._previous = previous;
            this._predicate = predicate;
            this._secondDataList = secondDataList;
        }
        Except.prototype.Reset = function () {
            return this._previous.Reset();
        };
        return Except;
    })();
    var Intersect = (function () {
        function Intersect(previous, secondDataList, predicate) {
            var _this = this;
            this.MoveNext = function () {
                var r = _this._previous.MoveNext();
                if (!r)
                    return false;
                _this._current = _this._previous.Current();
                _this._secondDataList.Reset(); //resetting to beginning because we only need one match to satisfy this logic
                while (_this._secondDataList.MoveNext()) {
                    if (_this._predicate(_this._current, _this._secondDataList.Current())) {
                        _this._match = _this._current;
                        return true;
                    }
                }
                //no match found
                return _this.MoveNext(); //retry with the next element
            };
            this.Current = function () {
                return _this._match;
            };
            this._previous = previous;
            this._predicate = predicate;
            this._secondDataList = secondDataList;
        }
        Intersect.prototype.Reset = function () {
            return this._previous.Reset();
        };
        return Intersect;
    })();
    var Take = (function () {
        function Take(previous, count) {
            this._previous = previous;
            this._count = count;
            this._index = 0;
        }
        Take.prototype.MoveNext = function () {
            while (this._index < this._count && this._previous.MoveNext()) {
                this._index++;
                this._current = this._previous.Current();
                return true;
            }
            return false;
        };
        Take.prototype.Current = function () {
            return this._current;
        };
        Take.prototype.Reset = function () {
            this._previous.Reset();
        };
        return Take;
    })();
    var Skip = (function () {
        function Skip(previous, count) {
            this._previous = previous;
            this._count = count;
            this._index = 0;
        }
        Skip.prototype.MoveNext = function () {
            while (this._index < this._count && this._previous.MoveNext()) {
                this._index++;
            }
            while (this._previous.MoveNext()) {
                this._current = this._previous.Current();
                return true;
            }
            return false;
        };
        Skip.prototype.Current = function () {
            return this._current;
        };
        Skip.prototype.Reset = function () {
            this._previous.Reset();
        };
        return Skip;
    })();
    var Select = (function () {
        function Select(previous, selector) {
            var _this = this;
            this.MoveNext = function () {
                var r = _this._previous.MoveNext();
                if (!r)
                    return false;
                _this._current = _this._selector(_this._previous.Current());
                return true;
            };
            this.Current = function () {
                return _this._current;
            };
            this._previous = previous;
            this._selector = selector;
        }
        Select.prototype.Reset = function () {
            this._previous.Reset();
        };
        return Select;
    })();
    var Join = (function () {
        function Join(previous, secondary, predicate, selector) {
            this._previous = previous;
            this._selector = selector;
            this._predicate = predicate;
            this._secondary = secondary;
        }
        Join.prototype.Current = function () {
            return this._current;
        };
        Join.prototype.MoveNext = function () {
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
        };
        Join.prototype.Reset = function () {
            return this._previous.Reset();
        };
        return Join;
    })();
    var Where = (function () {
        function Where(previous, predicate) {
            var _this = this;
            this.MoveNext = function () {
                while (_this._previous.MoveNext()) {
                    if (_this._predicate(_this._previous.Current())) {
                        _this._current = _this._previous.Current();
                        return true;
                    }
                }
                return false;
            };
            this.Current = function () {
                return _this._current;
            };
            this._previous = previous;
            this._predicate = predicate;
        }
        Where.prototype.Reset = function () {
            this._previous.Reset();
        };
        return Where;
    })();
    var Distinct = (function () {
        function Distinct(previous, predicate) {
            var _this = this;
            this.MoveNext = function () {
                if (_this._copy.length == 0)
                    return false;
                var last = _this._copy.shift();
                if (Enumerate(_this._copy).Where(function (i) { return _this._predicate(i, last); }).First() != null) {
                    return _this.MoveNext(); //duplicate found, moving on
                }
                _this._current = last; // no match found
                return true;
            };
            this.Current = function () {
                return _this._current;
            };
            this._previous = previous;
            this._predicate = predicate;
            this._copy = new ToArray(previous).GetResults();
        }
        Distinct.prototype.Reset = function () {
            this._previous.Reset();
        };
        return Distinct;
    })();
    var Duplicates = (function () {
        function Duplicates(previous, predicate) {
            var _this = this;
            this.MoveNext = function () {
                if (_this._copy.length == 0)
                    return false;
                var last = _this._copy.pop();
                if (Enumerate(_this._copy).Where(function (i) { return _this._predicate(i, last); }).First() != null) {
                    _this._current = last;
                    return true;
                }
                return _this.MoveNext(); // no match found
            };
            this.Current = function () {
                return _this._current;
            };
            this._previous = previous;
            this._predicate = predicate;
            this._copy = new ToArray(previous).GetResults();
        }
        Duplicates.prototype.Reset = function () {
            this._previous.Reset();
        };
        return Duplicates;
    })();
    var ArrayEnumerator = (function () {
        function ArrayEnumerator(data) {
            var _this = this;
            this.MoveNext = function () {
                _this._index++;
                return _this._index < _this._dataSource.length;
            };
            this.Current = function () {
                return _this._dataSource[_this._index];
            };
            this.GetEnumerator = function () {
                return _this;
            };
            this._index = -1;
            this._dataSource = data;
        }
        ArrayEnumerator.prototype.Reset = function () {
            this._index = -1;
        };
        return ArrayEnumerator;
    })();
    var ForEach = (function () {
        function ForEach(previous, action) {
            this._previous = previous;
            this._action = action;
            while (previous.MoveNext()) {
                action(previous.Current());
            }
        }
        return ForEach;
    })();
    var Min = (function () {
        function Min(previous, valueSelector) {
            this._previous = previous;
            this._valueSelector = valueSelector;
        }
        Min.prototype.GetResults = function () {
            var _this = this;
            var minValue = null;
            var min;
            this._previous.Reset();
            new Enumerable(this._previous).ForEach(function (i) {
                if (minValue == null || _this._valueSelector(i) < minValue) {
                    minValue = _this._valueSelector(i);
                    min = i;
                }
            });
            return min;
        };
        return Min;
    })();
    var Max = (function () {
        function Max(previous, valueSelector) {
            this._previous = previous;
            this._valueSelector = valueSelector;
        }
        Max.prototype.GetResults = function () {
            var _this = this;
            var maxValue = null;
            var max;
            this._previous.Reset();
            new Enumerable(this._previous).ForEach(function (i) {
                if (maxValue == null || _this._valueSelector(i) > maxValue) {
                    maxValue = _this._valueSelector(i);
                    max = i;
                }
            });
            return max;
        };
        return Max;
    })();
    var OrderBy = (function () {
        function OrderBy(previous, valueSelector) {
            this._copy = new ToArray(previous).GetResults();
            this._valueSelector = valueSelector;
            this._previous = previous;
        }
        OrderBy.prototype.MoveNext = function () {
            var min = Enumerate(this._copy).Min(this._valueSelector);
            //TODO: need remove code
            if (min == null)
                return false;
            var targetIndex = this._copy.indexOf(min);
            var index = 0;
            var newResults = [];
            Enumerate(this._copy).ForEach(function (i) {
                if (index != targetIndex) {
                    newResults.push(i);
                }
                index++;
            });
            this._copy = newResults;
            this._current = min;
            return true;
        };
        OrderBy.prototype.Current = function () {
            return this._current;
        };
        OrderBy.prototype.Reset = function () {
            this._previous.Reset();
            this._copy = new ToArray(this._previous).GetResults();
        };
        return OrderBy;
    })();
    var OrderByDescending = (function () {
        function OrderByDescending(previous, valueSelector) {
            this._copy = new ToArray(previous).GetResults();
            this._valueSelector = valueSelector;
            this._previous = previous;
        }
        OrderByDescending.prototype.MoveNext = function () {
            var max = Enumerate(this._copy).Max(this._valueSelector);
            if (max == null)
                return false;
            var targetIndex = this._copy.indexOf(max);
            var index = 0;
            var newResults = [];
            Enumerate(this._copy).ForEach(function (i) {
                if (index != targetIndex) {
                    newResults.push(i);
                }
                index++;
            });
            this._copy = newResults;
            this._current = max;
            return true;
        };
        OrderByDescending.prototype.Current = function () {
            return this._current;
        };
        OrderByDescending.prototype.Reset = function () {
            this._previous.Reset();
            this._copy = new ToArray(this._previous).GetResults();
        };
        return OrderByDescending;
    })();
    var Enumerable = (function () {
        function Enumerable(enumerator) {
            this._enumerator = enumerator;
        }
        Enumerable.prototype.Where = function (predicate) {
            var w = new Where(this._enumerator, predicate);
            return new Enumerable(w);
        };
        Enumerable.prototype.First = function () {
            var a = new First(this._enumerator);
            return a.GetResults();
        };
        Enumerable.prototype.Last = function () {
            var a = new Last(this._enumerator);
            return a.GetResults();
        };
        Enumerable.prototype.ToArray = function () {
            var a = new ToArray(this._enumerator);
            return a.GetResults();
        };
        Enumerable.prototype.SelectMany = function (selector) {
            var s = new SelectMany(this._enumerator, selector);
            return new Enumerable(s);
        };
        Enumerable.prototype.Select = function (selector) {
            var s = new Select(this._enumerator, selector);
            return new Enumerable(s);
        };
        Enumerable.prototype.Intersect = function (second, predicate) {
            var i = new Intersect(this._enumerator, second.GetEnumerator(), predicate);
            return new Enumerable(i);
        };
        Enumerable.prototype.Except = function (second, predicate) {
            var i = new Except(this._enumerator, second.GetEnumerator(), predicate);
            return new Enumerable(i);
        };
        Enumerable.prototype.Duplicates = function (predicate) {
            var d = new Duplicates(this._enumerator, predicate);
            return new Enumerable(d);
        };
        Enumerable.prototype.Distinct = function (predicate) {
            var d = new Distinct(this._enumerator, predicate);
            return new Enumerable(d);
        };
        Enumerable.prototype.ForEach = function (action) {
            var f = new ForEach(this._enumerator, action);
        };
        Enumerable.prototype.Min = function (valueSelector) {
            return new Min(this._enumerator, valueSelector).GetResults();
        };
        Enumerable.prototype.Max = function (valueSelector) {
            return new Max(this._enumerator, valueSelector).GetResults();
        };
        Enumerable.prototype.Skip = function (count) {
            var s = new Skip(this._enumerator, count);
            return new Enumerable(s);
        };
        Enumerable.prototype.Take = function (count) {
            var s = new Take(this._enumerator, count);
            return new Enumerable(s);
        };
        Enumerable.prototype.Join = function (secondary, predicate, selector) {
            var j = new Join(this._enumerator, secondary.GetEnumerator(), predicate, selector);
            return new Enumerable(j);
        };
        Enumerable.prototype.OrderBy = function (valueSelector) {
            var o = new OrderBy(this._enumerator, valueSelector);
            return new Enumerable(o);
        };
        Enumerable.prototype.OrderByDescending = function (valueSelector) {
            var o = new OrderByDescending(this._enumerator, valueSelector);
            return new Enumerable(o);
        };
        Enumerable.prototype.GetEnumerator = function () {
            return this._enumerator;
        };
        return Enumerable;
    })();
    piper.Enumerable = Enumerable;
    var SortedEnumerable = (function (_super) {
        __extends(SortedEnumerable, _super);
        function SortedEnumerable() {
            _super.apply(this, arguments);
        }
        return SortedEnumerable;
    })(Enumerable);
    function Enumerate(array) {
        return new Enumerable(new ArrayEnumerator(array));
    }
    piper.Enumerate = Enumerate;
})(piper || (piper = {}));
//# sourceMappingURL=piper.js.map