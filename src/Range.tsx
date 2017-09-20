import React, { ChangeEvent } from "react";
import PropTypes from "prop-types";

import { Control } from "./filter.d";

type VoidFunc = () => void;
type Props = { name: string };
type State = { high: string; low: string };

const isActive = (lowString: string, highString: string) => {
  let low = Number(lowString);
  let high = Number(highString);
  if (isNaN(low) || isNaN(high)) {
    return false;
  }
  if (low >= high) {
    return false;
  }
  return true;
};

export default class Exact extends React.Component<Props, State> {
  static contextTypes = {
    registerControl: PropTypes.func
  };
  state = {
    high: "",
    low: ""
  };
  updateFilter: VoidFunc = () => {};
  unregisterControl: VoidFunc = () => {};

  componentDidMount() {
    let { unregister, update } = this.context.registerControl(this.control);
    this.updateFilter = update;
    this.unregisterControl = unregister;
  }
  componentWillUnmount() {
    this.unregisterControl();
  }
  control: Control = () => {
    const { low, high } = this.state;
    if (isActive(low, high)) {
      return [this.props.name, `${low}..${high}`];
    }
    return undefined;
  };
  handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;

    this.setState({ [name]: value } as any, this.updateFilter);
  };
  render() {
    return (
      <div {...this.props}>
        <input value={this.state.low} name="low" onChange={this.handleChange} />
        {" - "}
        <input
          value={this.state.high}
          name="high"
          onChange={this.handleChange}
        />
      </div>
    );
  }
}
