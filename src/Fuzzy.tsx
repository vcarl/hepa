import React from "react";
import PropTypes from "prop-types";

import FilterControl from "./FilterControl";

export interface Props {
  name: string;
}

export default class Fuzzy<T> extends React.Component<Props, {}> {
  static propTypes = {
    name: PropTypes.string.isRequired
  };
  mapValuesToComparison = (datum: T): string =>
    datum[this.props.name].toLowerCase();
  compare = (filterValue: string) => (dataValue: string) =>
    new RegExp(filterValue.split("").join(".*")).test(dataValue);
  render() {
    type TypedFilterControl = new () => FilterControl<T, string>;
    const TypedFilterControl = FilterControl as TypedFilterControl;
    return (
      <TypedFilterControl
        name={this.props.name}
        mapValuesToComparison={this.mapValuesToComparison}
        compare={this.compare}
      />
    );
  }
}
