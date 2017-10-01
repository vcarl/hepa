import * as React from "react";
import {
  FilterProvider,
  Filter,
  Exact,
  Fuzzy,
  Search,
  FilterControl
} from "../src/index";

import { mount } from "enzyme";

function TestFilter(control, data) {
  type data = { [name: string]: string };
  type TypedFilter = new () => Filter<data>;
  const TypedFilter = Filter as TypedFilter;
  type TypedFilterProvider = new () => FilterProvider<string>;
  const TypedFilterProvider = FilterProvider as TypedFilterProvider;
  return mount(
    <TypedFilterProvider>
      <div>{control}</div>
      <TypedFilter
        data={data}
        render={data => (
          <div>
            {data.map(x => (
              <div key={JSON.stringify(x)} className="filtered-output">
                {x.name}
              </div>
            ))}
          </div>
        )}
      />
    </TypedFilterProvider>
  );
}

describe("Included controls", () => {
  describe("Exact", () => {
    it("matches exact strings", () => {
      const data = [{ name: "aaa" }, { name: "bbb" }, { name: "AAA" }];
      const output = TestFilter(<Exact value="aaa" name={"name"} />, data);
      expect(output.find(".filtered-output").length).toBe(1);
    });
  });
  describe("Fuzzy", () => {
    it("matches loose strings", () => {
      const data = [
        { name: "abc" },
        { name: "bcd" },
        { name: "cde" },
        { name: "def" }
      ];
      // 'ac' should match 'abc'
      let output = TestFilter(<Fuzzy value="ac" name={"name"} />, data);
      expect(output.find(".filtered-output").length).toBe(1);
      // 'bc' should match 'abc' and 'bcd'
      output = TestFilter(<Fuzzy value="bc" name={"name"} />, data);
      expect(output.find(".filtered-output").length).toBe(2);
    });
  });
  describe("Search", () => {
    const data = [
      { a: "abc", b: "def" },
      { a: "test string", b: "other string" }
    ];
    it("matches full strings", () => {
      let output = TestFilter(<Search value="abc" keys={["a", "b"]} />, data);
      expect(output.find(".filtered-output").length).toBe(1);
      output = TestFilter(<Search value="def" keys={["a", "b"]} />, data);
      expect(output.find(".filtered-output").length).toBe(1);
    });
    it("matches partial strings", () => {
      const output = TestFilter(
        <Search value="string" keys={["a", "b"]} />,
        data
      );
      expect(output.find(".filtered-output").length).toBe(1);
    });
  });
  describe("FilterControl", () => {
    const data = [{ a: "abc" }, { a: "test string" }];
    interface data {
      a: string;
      b: string;
    }
    type TypedFilterControl = new () => FilterControl<data, string>;
    const TypedFilterControl = FilterControl as TypedFilterControl;
    it("matches correctly", () => {
      let output = TestFilter(
        <TypedFilterControl
          mapValuesToComparison={data => data.a}
          compare={filter => data => filter === data}
          value="abc"
        />,
        data
      );
      expect(output.find(".filtered-output").length).toBe(1);
    });
    it("allows render props", () => {
      let output = TestFilter(
        <TypedFilterControl
          mapValuesToComparison={data => data.a}
          compare={filter => data => filter === data}
          render={() => <div className="custom-rendered" />}
        />,
        data
      );
      expect(output.find(".custom-rendered").length).toBe(1);
    });
  });
});
