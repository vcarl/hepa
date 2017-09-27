import React, { ChangeEvent } from "react";
import PropTypes from "prop-types";

import FilterControl from "./FilterControl";

export interface Props {
  name: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  render?: Function;
}

export default class Exact<T> extends React.Component<Props, {}> {
  static propTypes = {
    name: PropTypes.string.isRequired
  };
  mapValuesToComparison = datum => datum[this.props.name];
  compare = (filterValue: string) => (dataValue: string) =>
    dataValue === filterValue;
  render() {
    const { name, ...props } = this.props;
    // There's a weird syntax for passing types to a generic react component
    // https://github.com/Microsoft/TypeScript/issues/3960#issuecomment-165330151
    type TypedFilterControl = new () => FilterControl<T, string>;
    const TypedFilterControl = FilterControl as TypedFilterControl;
    return (
      <TypedFilterControl
        {...props}
        mapValuesToComparison={this.mapValuesToComparison}
        compare={this.compare}
      />
    );
  }
}
