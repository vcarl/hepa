import moment from "moment";
import memoize from "fast-memoize";

// These functions are used to figure out what type of control is being used.
const isNot = (val: string) => val[0] === "!";
const isDate = (val: string) => val[0] === "@";
const isFuzzy = (val: string) => val[0] === "~";
const isSearch = (val: string) => val[0] === "?";
const isRange = (val: string) => /.*\.\..*/.test(val);

interface PredicateMap {
  [key: string]: string | number;
}
interface Check {
  (predicateMap: PredicateMap, key: string): boolean;
}
interface Test {
  (key: string): Check;
}
interface TestRange {
  (min: number, max: number): Check;
}
interface TestDateRange {
  (minDate: string, maxDate: string): Check;
}
interface TestSearch {
  (key: string): Check;
}

// These functions test whether a value matches the predicate of a control.
const testEqual: Test = compare => (obj, key) =>
  compare.toLowerCase() === obj[key].toString().toLowerCase();

const testDate: Test = compare => (obj, key) =>
  moment(compare).isSame(moment(obj[key]));
// The `, undefined, '[]')` is how you tell Moment to do inclusive checking for
// `.isBetween`. undefined `null` is what units (month, year, second etc) to check.
// http://momentjs.com/docs/#/query/is-between/

const testDateRange: TestDateRange = (low, high) => (obj, key) =>
  moment(obj[key]).isBetween(low, high, undefined, "[]");

const testRange: TestRange = (low, high) => (obj, key) =>
  low <= obj[key] && obj[key] <= high;

const testFuzzy: Test = compare => {
  // Creates a regex that allows for any number of characters between those
  // passed. Similar to Sublime Text's cmd-p menu. 'i' for case insensitive.
  const regex = new RegExp(compare.split("").join(".*"), "i");
  return (obj, key) => regex.test(obj[key].toString());
};

const testSearch: TestSearch = (compare: string) => {
  const regex = new RegExp(compare.split("").join(".*"), "i");
  return (obj, keys: string) =>
    keys.split(",").some(key => regex.test(obj[key].toString()));
};

const parseRange = (low: string, high: string): Check => {
  if (low[0] === "@" && high[0] === "@") {
    return testDateRange(low.substring(1), high.substring(1));
  }
  return testRange(Number(low), Number(high));
};

const not = (func: Check): Check => (map, key) => !func(map, key);

const parseValue = (key: string, val: string): [string, Check] => {
  if (isNot(val)) {
    let pair = parseValue(key, val.substring(1));
    pair[1] = not(pair[1]);
    return pair;
  }
  if (isRange(val)) {
    const [low, high] = val.split("..");
    return [key, parseRange(low, high)];
  }
  if (isDate(val)) {
    return [key, testDate(val.substring(1))];
  }
  if (isFuzzy(val)) {
    return [key, testFuzzy(val.substring(1))];
  }
  if (isSearch(val)) {
    return [key, testSearch(val.substring(1))];
  }
  return [key, testEqual(val)];
};

// Expects a string with a list of key:value pairs separated by ;s. Will do
// string === comparisons for bare values, ! inverts a match,  @ will treat the
// next value as a date, .. between two values for a single key treats it as a
// range, and ~ can be used for fuzzy string matching. Memoized for performance.
const parseValues = memoize((str: string): [string, Check][] => {
  const fields = str.split(";");

  const predicatePairs = fields.map(field => {
    let pair = field.split(":");
    if (pair.length !== 2) return undefined;
    if (process.env.NODE_ENV !== "production" && pair[1] === undefined) {
      console.error(`No value parsed for key '${pair[0]}'!`);
    }
    let checkPair = parseValue(pair[0], pair[1]);
    return checkPair;
  }) as [string, Check][];

  // In development mode, throw an error if there are duplicate keys.
  // This was added after burning at least an hour debugging what turned out to
  // be duplicate keys.
  if (process.env.NODE_ENV !== "production") {
    let keys = predicatePairs
      .map(pair => (pair || [])[0])
      .filter(x => x !== undefined)
      .sort();
    let last: string | Check;
    let duplicates = keys.reduce((dupes: Array<string | Check>, key) => {
      if (key === last) dupes.push(key);
      last = key;
      return dupes;
    }, []);
    if (duplicates.length > 0) {
      console.error(
        `Parsed predicate had duplicate keys: ${duplicates.join(", ")}`
      );
    }
  }

  return predicatePairs;
}) as (string) => [string, Check][];

interface ValuesMap {
  [key: string]: string;
}

const buildPredicate = (filterString: string) => {
  const predicateMap = parseValues(filterString);
  return (obj: ValuesMap) =>
    predicateMap.every(([key, test]: [string, Check]) => test(obj, key));
};

export { parseValues };
export default buildPredicate;
