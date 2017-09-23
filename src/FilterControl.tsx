import React, { ChangeEvent } from "react";
import PropTypes from "prop-types";

import { ControlPair, FilterContext } from "./index";

const isActive = (value: string) => value !== "";

export interface Props<Data, MappedValue> {
  mapValuesToComparison: (datum: Data) => MappedValue;
  compare: (comparator: string) => (dataValue: MappedValue) => boolean;
  name?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  value?: string;
}

export interface State {
  value: string;
}

export default class FilterControl<Data, MappedValue> extends React.Component<
  Props<Data, MappedValue>,
  State
> {
  static contextTypes = {
    registerControl: PropTypes.func
  };
  state = {
    value: ""
  };
  context: FilterContext<Data, any>;

  updateFilter: () => void;
  unregisterControl: Function;

  componentDidMount() {
    let { unregister, update } = this.context.registerControl(this.control);
    this.updateFilter = update;
    this.unregisterControl = unregister;
  }
  componentWillUnmount() {
    this.unregisterControl();
  }
  getValue(): string {
    if (this.props.value === undefined) {
      return this.state.value;
    }
    return this.props.value;
  }
  compare = (value: string): ((MappedValue) => boolean) => {
    return this.props.compare(value);
  };
  control = (): ControlPair<Data, MappedValue> | undefined => {
    if (isActive(this.getValue())) {
      return [this.props.mapValuesToComparison, this.compare(this.getValue())];
    }
    return undefined;
  };
  handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (this.props.onChange !== undefined) {
      this.props.onChange(e);
      return;
    }
    let value = e.target.value;
    this.setState({ value }, this.updateFilter);
  };
  render() {
    const {
      mapValuesToComparison,
      compare,
      name,
      onChange,
      value,
      ...rest
    } = this.props;
    return (
      <input {...rest} value={this.getValue()} onChange={this.handleChange} />
    );
  }
}
