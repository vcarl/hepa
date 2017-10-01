import * as React from "react";
import * as PropTypes from "prop-types";

import { ControlPair, FilterContext } from "./index";

const isActive = (value: string) => value !== "";

export interface Props<Data, MappedValue> {
  mapValuesToComparison: (datum: Data) => MappedValue;
  compare: (comparator: string) => (dataValue: MappedValue) => boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  render?: Function;
}

export interface State {
  value: string;
}

export default class FilterControl<Data, MappedValue> extends React.Component<
  Props<Data, MappedValue>,
  State
> {
  static propTypes = {
    mapValuesToComparison: PropTypes.func.isRequired,
    compare: PropTypes.func.isRequired,
    onChange: PropTypes.func,
    value: PropTypes.string,
    render: PropTypes.func
  };
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
    if (this.context.registerControl === undefined) {
      throw new Error(
        "registerControl is undefined. You might have forgotten a FilterProvider."
      );
    }
    let { unregister, update } = this.context.registerControl(this.control);
    this.updateFilter = update;
    this.unregisterControl = unregister;
  }
  componentWillReceiveProps(nextProps) {
    // It would be nice to do this elsewhere, since this means we get 2 renders
    // for controlled components. I can't think of how to do it without messing
    // up the API for the onChange prop.
    if (this.props.value !== nextProps.value) {
      this.updateFilter();
    }
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
  handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (this.props.onChange !== undefined) {
      this.props.onChange(e);
      return;
    }
    let value = e.target.value;
    this.setState({ value }, this.updateFilter.bind(this));
  };
  render() {
    const {
      mapValuesToComparison,
      compare,
      onChange,
      value,
      render,
      ...rest
    } = this.props;
    if (typeof render === "function") {
      return render({
        ...rest,
        value: this.getValue(),
        onChange: this.handleChange
      });
    }
    return (
      <input {...rest} value={this.getValue()} onChange={this.handleChange} />
    );
  }
}
