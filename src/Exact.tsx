import React, { ChangeEvent } from "react";
import PropTypes from "prop-types";

import FilterControl from "./FilterControl";
import { ControlPair, FilterContext } from "./filter.d";

const isActive = (value: string) => value !== "";

interface Props {
  name: string;
}

interface State {
  value: string;
}

export default class NewExact<T> extends React.Component<Props, State> {
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
