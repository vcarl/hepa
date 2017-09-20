import buildPredicate, { parseValues } from "./buildPredicate";

let testString = `a:asdf;b:!1;c:@2017-01-01;d:1..10;e:@2017-01-01..@2017-12-31;f:~asdf;a,g:?adf`;

let predicateMap = parseValues(testString);

type Predicate = ({}, string) => boolean;
type KeyedPredicate = [string, Predicate];
function getKeyFromPredicates(allPredicates: KeyedPredicate[]) {
  return (key, value) => {
    // Find a predicate that matches the key.
    // This started to get kinda funky while refactoring to add search.
    const predicate = allPredicates.find(([x]) => x === key);
    if (typeof predicate === "undefined") {
      throw new Error(`Bad test! Undefined value matched for key ${key}`);
    }
    // [0] is the key, [1] is the actual predicate function.
    return predicate[1]({ [key]: value }, key);
  };
}

const testKeyWithValue = getKeyFromPredicates(predicateMap);

describe("parse filter string", () => {
  it("splits fields on ;", () => {
    expect(predicateMap.length).toBe(7);
  });
  test("each field is a function", () => {
    predicateMap.forEach(pair => expect(typeof pair[1]).toBe("function"));
  });
  describe("acceptable strings", () => {
    describe("string", () => {
      it("matches exactly", () => {
        expect(testKeyWithValue("a", "asdf")).toBe(true);
        expect(testKeyWithValue("a", "bad")).toBe(false);
      });
      it("matches case-insensitive", () => {
        expect(testKeyWithValue("a", "ASDF")).toBe(true);
      });
    });

    test("not", () => {
      expect(testKeyWithValue("b", "2")).toBe(true);
      expect(testKeyWithValue("b", "1")).toBe(false);
    });

    test("date", () => {
      expect(testKeyWithValue("c", "2017-01-01")).toBe(true);
      expect(testKeyWithValue("c", "2017-01-02")).toBe(false);
    });

    describe("range", () => {
      test("number", () => {
        expect(testKeyWithValue("d", 0)).toBe(false);
        expect(testKeyWithValue("d", 1)).toBe(true);

        expect(testKeyWithValue("d", 10)).toBe(true);
        expect(testKeyWithValue("d", 11)).toBe(false);
      });
      test("date", () => {
        expect(testKeyWithValue("e", "2016-12-31")).toBe(false);
        expect(testKeyWithValue("e", "2017-01-01")).toBe(true);

        expect(testKeyWithValue("e", "2017-12-31")).toBe(true);
        expect(testKeyWithValue("e", "2018-01-01")).toBe(false);
      });
    });

    test("fuzzy", () => {
      expect(testKeyWithValue("f", "asdf")).toBe(true);
      expect(testKeyWithValue("f", "--aIsIdIf--")).toBe(true);
      expect(testKeyWithValue("f", "qwerty")).toBe(false);
    });

    test("search", () => {
      const [keyList, predicate] = predicateMap.find(([x]) => x === "a,g");
      // Uses fuzzy matching, so the search term 'adf' matches 'asdf'
      // on either key a or g
      expect(predicate({ a: "asdf", g: "qwer" }, keyList)).toBe(true);
      expect(predicate({ a: "zxcv", g: "qwer" }, keyList)).toBe(false);
      expect(predicate({ a: "zxcv", g: "asdf" }, keyList)).toBe(true);
      expect(predicate({ a: "adf", g: "adf" }, keyList)).toBe(true);
    });
  });
});

let predicate = buildPredicate(testString);
let testData = [
  {
    a: "BAD",
    b: "2",
    c: "2017-01-01",
    d: "5",
    e: "2017-06-15",
    f: "--a--s--d--f--"
  },
  {
    a: "asdf",
    b: /*bad*/ "1",
    c: "2017-01-01",
    d: "5",
    e: "2017-06-15",
    f: "--a--s--d--f--"
  },
  {
    a: "asdf",
    b: "2",
    c: /*bad*/ "2017-05-05",
    d: "5",
    e: "2017-06-15",
    f: "--a--s--d--f--"
  },
  {
    a: "asdf",
    b: "2",
    c: "2017-01-01",
    d: /*bad*/ "50",
    e: "2017-06-15",
    f: "--a--s--d--f--"
  },
  {
    a: "asdf",
    b: "2",
    c: "2017-01-01",
    d: "5",
    e: /*bad*/ "2016-06-15",
    f: "--a--s--d--f--"
  },
  {
    a: "asdf",
    b: "2",
    c: "2017-01-01",
    d: "5",
    e: "2017-06-15",
    f: "--BAD-VALUE--"
  },
  {
    a: "asdf",
    b: "2",
    c: "2017-01-01",
    d: "5",
    e: "2017-06-15",
    f: "--a--s--d--f--"
  }
];

describe("predicate", () => {
  it("filters failing values", () => {
    expect(testData.filter(predicate).length).toBe(1);
    expect(testData.filter(predicate)[0]).toBe(testData[6]);
  });
  it("doesn't break when the data has more keys than the predicate", () => {
    let data = [{ a: "1", b: "2", c: "3" }, { a: "2", b: "3", c: "4" }];
    let filter = "a:1";
    let predicate = buildPredicate(filter);
    expect(data.filter(predicate).length).toBe(1);
  });
});
