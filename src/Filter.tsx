import React from "react";
import PropTypes from "prop-types";

import { ReactChild } from "react";

export interface Predicate {
  (): boolean;
}

export interface Props<T> {
  data: T[];
  render: (data: T[]) => ReactChild;
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
    let filtered = this.props.data.filter(this.predicate);
    return <div>{this.props.render(filtered)}</div>;
  }
}
