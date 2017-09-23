import React from "react";
import PropTypes from "prop-types";

import FilterControl from "./FilterControl";

export interface Props {
  keys: string[];
}

export default class Search<T> extends React.Component<Props, {}> {
  static propTypes = {
    keys: PropTypes.arrayOf(PropTypes.string).isRequired
  };
  mapValuesToComparison = (datum: T): string[] => {
    const { keys } = this.props;

    const values = keys.reduce((out: Array<string>, key, i) => {
      out[i] = datum[key].toLowerCase();
      return out;
    }, new Array<string>(keys.length));

    return values;
  };
  compare = (filterValue: string) => (dataValues: string[]): boolean =>
    dataValues.some(value => value.includes(filterValue));
  render() {
    type TypedFilterControl = new () => FilterControl<T, string[]>;
    const TypedFilterControl = FilterControl as TypedFilterControl;
    return (
      <TypedFilterControl
        mapValuesToComparison={this.mapValuesToComparison}
        compare={this.compare}
      />
    );
  }
}
