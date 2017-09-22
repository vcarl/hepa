import React, { ChangeEvent } from "react";
import PropTypes from "prop-types";

import { ControlPair, FilterContext } from "./filter.d";

const isActive = (value: string) => value !== "";

interface Props<T> {
  mapValuesToComparison: (datum: T) => number | string;
  compare: (comparator: string) => (dataValue: string) => boolean;
  name?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  value?: string;
}

interface State {
  value: string;
}

export default class FilterControl<T> extends React.Component<Props<T>, State> {
  static contextTypes = {
    registerControl: PropTypes.func
  };
  state = {
    value: ""
  };
  context: FilterContext<T>;

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
  getValue = () =>
    this.props.value === undefined ? this.state.value : this.props.value;
  compare = value => {
    return this.props.compare(value);
  };
  control = (): ControlPair<T> | undefined => {
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
