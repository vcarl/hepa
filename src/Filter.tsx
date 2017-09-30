import * as React from "react";
import * as PropTypes from "prop-types";

export interface Predicate {
  (): boolean;
}

export interface Props<T> {
  data: T[];
  render: (data: T[]) => React.ReactChild;
  [key: string]: any;
}

export default class Filter<T> extends React.Component<Props<T>, {}> {
  static propTypes = {
    data: PropTypes.array.isRequired,
    render: PropTypes.func.isRequired
  };
  static contextTypes = {
    subscribe: PropTypes.func
  };
  unsubscribe = () => {};
  predicate: Predicate = () => true;

  componentDidMount() {
    this.unsubscribe = this.context.subscribe(this.updateFilter);
  }
  componentWillUnmount() {
    this.unsubscribe();
  }
  updateFilter = (predicate: Predicate) => {
    this.predicate = predicate;
    this.forceUpdate();
  };
  render() {
    const { render, data, ...rest } = this.props;
    let filtered = data.filter(this.predicate);
    return <div {...rest}>{render(filtered)}</div>;
  }
}
