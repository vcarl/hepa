import * as React from "react";
import * as PropTypes from "prop-types";

import FilterControl from "./FilterControl";

export interface Props {
  name: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  render?: Function;
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
    // There's a weird syntax for passing types to a generic react component
    // https://github.com/Microsoft/TypeScript/issues/3960#issuecomment-165330151
    type TypedFilterControl = new () => FilterControl<T, string>;
    const TypedFilterControl = FilterControl as TypedFilterControl;
    return (
      <TypedFilterControl
        {...this.props}
        mapValuesToComparison={this.mapValuesToComparison}
        compare={this.compare}
      />
    );
  }
}
