import React, { ChangeEvent } from "react";
import PropTypes from "prop-types";

import { Control } from "./filter.d";

const isActive = (value: string) => value !== "";

interface Props {
  name: string;
}

interface State {
  value: string;
}

export default class Exact extends React.Component<Props, State> {
  static contextTypes = {
    registerControl: PropTypes.func
  };
  props: {
    name: string;
  };
  state = {
    value: ""
  };
  updateFilter: () => {};
  unregisterControl: () => {};

  componentDidMount() {
    let { unregister, update } = this.context.registerControl(this.control);
    this.updateFilter = update;
    this.unregisterControl = unregister;
  }
  componentWillUnmount() {
    this.unregisterControl();
  }
  control = () => {
    if (isActive(this.state.value)) {
      return [this.props.name, this.state.value];
    }
    return undefined;
  };
  handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    let value = e.target.value;
    this.setState({ value }, this.updateFilter);
  };
  render() {
    return (
      <input
        value={this.state.value}
        onChange={this.handleChange}
        {...this.props}
      />
    );
  }
}
