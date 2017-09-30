import * as React from "react";
import * as PropTypes from "prop-types";

import FilterControl from "./FilterControl";

export interface Props {
  keys: string[];
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  render?: Function;
}

export default class Search<T> extends React.Component<Props, {}> {
  static propTypes = {
    keys: PropTypes.arrayOf(PropTypes.string).isRequired
  };
  mapValuesToComparison = (datum: T): string[] => {
    const { keys } = this.props;

    const values = keys.reduce((out: Array<string>, key, i) => {
      out[i] = datum[key].toString().toLowerCase();
      return out;
    }, new Array<string>(keys.length));

    return values;
  };
  compare = (filterValue: string) => (dataValues: string[]): boolean =>
    dataValues.some(value => value.includes(filterValue));
  render() {
    // There's a weird syntax for passing types to a generic react component
    // https://github.com/Microsoft/TypeScript/issues/3960#issuecomment-165330151
    const { keys, ...props } = this.props;
    type TypedFilterControl = new () => FilterControl<T, string[]>;
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
