import React from "react";
import PropTypes from "prop-types";
import { Predicate } from "./filter.d";

export interface Props<T> {
  data: T[];
}

function WithFilteredData<T>(
  Thing: new () => React.Component<Props<T> | {}, {}>
): React.ComponentClass {
  return class WithFilter extends React.Component<{ data: T[] }, {}> {
    static propTypes = {
      data: PropTypes.array
    };
    static contextTypes = {
      subscribe: PropTypes.func
    };

    unsubscribe = (): void => {};
    predicate: Predicate<T> = () => true;

    componentDidMount() {
      this.unsubscribe = this.context.subscribe(this.updateFilter);
    }
    componentWillUnmount() {
      this.unsubscribe();
    }
    updateFilter = (predicate: Predicate<T>) => {
      this.predicate = predicate;
      this.forceUpdate();
    };
    render() {
      const { data, ...rest } = this.props;

      let filtered = data.filter(this.predicate);
      return <Thing data={filtered} {...rest} />;
    }
  };
}

export default WithFilteredData;
