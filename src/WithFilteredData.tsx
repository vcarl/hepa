import React, { ReactElement, ReactInstance } from "react";
import PropTypes from "prop-types";

type VoidFunc = () => void;
interface Predicate {
  (any): boolean;
}
interface Props<Datum> {
  data: Datum[];
}
type ComponentWithData<T> = React.Component<{ data: T[] }, {}>;

interface WithFilterHOC<T> {
  (component: React.Component<{ data: T[] }, {}>): React.Component<{}, {}>;
}

function WithFilteredData<T>(
  Thing: new () => React.Component<Props<T> | {}, {}>
) {
  return class WithFilter extends React.Component<{ data: any[] }, {}> {
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
      const { data, ...rest } = this.props;

      let filtered = data.filter(this.predicate);
      return <Thing data={filtered} {...rest} />;
    }
  };
}

export default WithFilteredData;
