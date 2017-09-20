import React from "react";
import PropTypes from "prop-types";

import { ReactChild } from "react";

interface VoidFunc {
  (): void;
}
interface Predicate {
  (): boolean;
}

interface Props<T> {
  data: T[];
  render: (data: T[]) => ReactChild;
}

export default class Filter<T> extends React.Component<Props<T>, {}> {
  static contextTypes = {
    subscribe: PropTypes.func
  };
  unsubscribe: VoidFunc = () => {};
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
