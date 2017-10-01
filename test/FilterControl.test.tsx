import * as React from "react";
import { FilterControl } from "../src/index";

import { shallow } from "enzyme";

type TypedFilterControl = new () => FilterControl<{ name: string }, string>;
const TypedFilterControl = FilterControl as TypedFilterControl;
const contextStub = {
  registerControl: () => ({
    update: () => {},
    unregister: () => {}
  })
};

describe("FilterControl", () => {
  it("throws a helpful error", () => {
    expect(() =>
      shallow(
        <TypedFilterControl
          mapValuesToComparison={x => x.name}
          compare={f => x => f === x}
        />
      )
    ).toThrowError(new RegExp("forgotten.*FilterProvider"));
  });
  it("tracks its own state", () => {
    const wrapper = shallow(
      <TypedFilterControl
        mapValuesToComparison={x => x.name}
        compare={f => x => f === x}
      />,
      { context: contextStub }
    );

    // Find the input node and simulate a change event.
    const input = wrapper.find("input");
    input.simulate("change", { target: { value: "test" } });
    expect(wrapper.state("value")).toBe("test");
  });
  it("can be controlled", () => {
    const handler = jest.fn();
    const event = { target: { value: "changed" } };
    const wrapper = shallow(
      <TypedFilterControl
        mapValuesToComparison={x => x.name}
        compare={f => x => f === x}
        onChange={handler}
        value="test"
      />,
      { context: contextStub }
    );

    const input = wrapper.find("input");
    expect(input.prop("value")).toBe("test");
    input.simulate("change", event);
    expect(handler).toHaveBeenCalledWith(event);
  });
  it("can render from a prop", () => {
    const wrapper = shallow(
      <TypedFilterControl
        mapValuesToComparison={x => x.name}
        compare={f => x => f === x}
        render={() => <div className="test" />}
      />,
      { context: contextStub }
    );
    expect(wrapper.find("div.test").length).toBe(1);
  });
  it("passes props to render", () => {
    const handler = jest.fn();
    handler.mockReturnValue(<div />);
    const props = {
      name: "output",
      className: "test"
    };
    const wrapper = shallow(
      <TypedFilterControl
        mapValuesToComparison={x => x.name}
        compare={f => x => f === x}
        {...props}
      />,
      { context: contextStub }
    );
    expect(wrapper.find("input").prop("name")).toBe("output");
    expect(wrapper.find("input").prop("className")).toBe("test");
  });
});
