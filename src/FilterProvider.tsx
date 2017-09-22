import React from "react";
import PropTypes from "prop-types";

import buildPredicate from "./buildPredicate";

import { Control, ControlPair, Predicate, FilterContext } from "./filter.d";

type Subscriber<T> = (predicate: Predicate<T>) => boolean;

interface State<T> {
  controls: Array<Control<T>>;
  subscribers: Array<Subscriber<T>>;
}

/**
 * FilterProvider exposes controls on context for managing filters in a
 * flexible, composable way. The meat of the functionality is provided by the
 * `buildPrediate` function, which provides methods for deserializing a string
 * of key:value pairs into a filter predicate.
 *
 * The context methods are
 *  - registerControl()
 *  - subscribe()
 *
 * `registerControl` takes a function that returns a key-value tuple or
 * undefined, and returns an object with two attributes: an `update` function
 * for notifying FilterProvider that something has changed and it needs to
 * recalculate the predicate, and an `unregister` function for removing the
 * control (e.g. when a control unmounts).
 *
 * `subscribe` takes a callback that expects no arguments and returns no value
 * to call whenever the filter predicate changes. It returns a function for
 * unsubscribing.
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

  context: FilterContext<T>;

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
  componentWillUpdate(nextProps, nextState) {
    this.updateSubscribers(nextState);
  }
  componentWillUnmount() {}
  registerControl = (control: Control<T>) => {
    // Prepend the new control to state.controls.
    this.setState(({ controls }) => ({ controls: [control, ...controls] }));

    return {
      unregister: this.unregister(control),
      update: this.forceUpdate.bind(this)
    };
  };
  unregister = (control: Control<T>) => () => {
    let index = this.state.controls.findIndex(x => x === control);
    this.setState(({ controls }) => ({
      controls: [...controls.slice(0, index), ...controls.slice(index + 1)]
    }));
  };
  updateSubscribers({ controls }) {
    function predicate(values: T) {
      const filteredControls = controls
        .map(cc => cc())
        .filter(x => x !== undefined) as ControlPair<T>[];
      return filteredControls.every(pair => pair[1](pair[0](values)));
    }

    this.state.subscribers.forEach(subscriber => subscriber(predicate));
  }
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
