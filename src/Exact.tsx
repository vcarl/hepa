import React from "react";
import PropTypes from "prop-types";

import FilterControl from "./FilterControl";

interface Props {
  name: string;
}

export default class NewExact<T> extends React.Component<Props, {}> {
  static propTypes = {
    name: PropTypes.string.isRequired
  };
  mapValuesToComparison = datum => datum[this.props.name].toLowerCase();
  compare = filterValue => dataValue => dataValue === filterValue;
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
