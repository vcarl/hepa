import React from "react";
import PropTypes from "prop-types";

import { Control, ControlPair, Predicate, FilterContext } from "./index";

export type Subscriber<T> = (predicate: Predicate<T>) => boolean;

export interface State<T> {
  // The "any" is because individual controls specify what intermediate type
  // is used. This component doesn't care and doesn't know what they are.
  controls: Array<Control<T, any>>;
  subscribers: Array<Subscriber<T>>;
}

/**
 * FilterProvider exposes controls on context for managing filters in a
 * flexible, composable way. Any filter control below it in the hierarchy will
 * get pass its predicate up, and any filter result will grab all predicates 
 * to filter data that's passed in.
 * 
 * There are a number of "control" components that make use of the
 * `context.registerControl` function, and a `Filter` component that consumes
 * `context.subscribe`.
 */
export default class FilterProvider<T> extends React.Component<{}, State<T>> {
  state: State<T> = {
    controls: [],
    subscribers: []
  };

  // https://medium.com/@mtiller/react-contexts-in-typescript-1337abb2e5a7
  context: FilterContext<T, any>;

  static childContextTypes = {
    registerControl: PropTypes.func,
    subscribe: PropTypes.func
  };
  getChildContext = () => {
    const { registerControl, subscribe } = this;
    return {
      registerControl,
      subscribe
    };
  };
  componentDidMount() {
    this.updateSubscribers(this.state);
  }
  componentWillUpdate(_nextProps, nextState) {
    this.updateSubscribers(nextState);
  }
  componentWillUnmount() {}
  /**
   * `registerControl` takes a function as an argument and returns an object with
   * two attributes: `update` and `unregister` functions.
   *   
   *   The argument returns either undefined or a tuple of 2 functions. The first
   *   gets a data object and returns what values it wants to compare to, and the
   *   second is a curried function of:
   *   `filter value => output of first function => boolean`
   *   
   *   `update` is used for notifying FilterProvider that a filter value has
   *   changed annd the predicate needs to be recalculated.
   *   `unregister` function is used for removing the control (e.g. when a control
   *   unmounts).
   */
  registerControl = (control: Control<T, any>) => {
    this.setState(({ controls }) => ({ controls: [control, ...controls] }));

    return {
      unregister: this.unregister(control),
      update: this.forceUpdate.bind(this)
    };
  };
  unregister = (control: Control<T, any>) => () => {
    let index = this.state.controls.findIndex(x => x === control);
    this.setState(({ controls }) => ({
      controls: [...controls.slice(0, index), ...controls.slice(index + 1)]
    }));
  };
  updateSubscribers({ controls, subscribers }) {
    function predicate(values: T) {
      // Each control is a function that returns the current value in the
      // control's state. Filter out any undefined and we're left with an
      // array of Control tuples.
      const filteredControls = controls
        .map(cc => cc())
        .filter(x => x !== undefined) as ControlPair<T, any>[];
      return filteredControls.every(pair => pair[1](pair[0](values)));
    }

    subscribers.forEach(subscriber => subscriber(predicate));
  }
  /**
   * `subscribe` takes a callback that takes no arguments and returns no value
   * to call whenever the filter predicate changes. It returns a function for
   * unsubscribing, which also requires no arguments.
   */
  subscribe = (listener: Subscriber<T>) => {
    this.setState(({ subscribers }) => ({
      subscribers: [listener, ...subscribers]
    }));

    const unsubscribe = () => {
      let index = this.state.subscribers.findIndex(x => x === listener);
      this.setState(({ subscribers }) => ({
        subscribers: [
          ...subscribers.slice(0, index),
          ...subscribers.slice(index + 1)
        ]
      }));
    };
    return unsubscribe;
  };
  render() {
    return <div>{this.props.children}</div>;
  }
}
