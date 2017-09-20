import React from "react";
import PropTypes from "prop-types";

import buildPredicate from "./buildPredicate";

import { Control } from "./filter.d";

type Subscriber = (predicate: Function) => boolean;

interface State {
  controls: Control[];
  subscribers: Array<Subscriber>;
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
export default class FilterProvider extends React.Component<{}, State> {
  filterString = "INITIAL";

  state: State = {
    controls: [],
    subscribers: []
  };

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
    this.updateSubscribers();
  }
  componentWillUpdate() {
    this.updateSubscribers();
  }
  componentWillUnmount() {}
  registerControl = (control: Control) => {
    // Prepend the new control to state.controls.
    this.setState(({ controls }) => ({ controls: [control, ...controls] }));

    return {
      unregister: this.unregister(control),
      update: this.forceUpdate.bind(this)
    };
  };
  unregister = (control: Control) => () => {
    let index = this.state.controls.findIndex(x => x === control);
    this.setState(({ controls }) => ({
      controls: [...controls.slice(0, index), ...controls.slice(index + 1)]
    }));
  };
  updateSubscribers() {
    let lastFilter = this.filterString;
    this.filterString = this.state.controls
      .map(control => control())
      .filter(control => control)
      .map(control => `${control[0]}:${control[1]}`)
      .join(";");

    if (lastFilter !== this.filterString) {
      const predicate = buildPredicate(this.filterString);
      this.state.subscribers.forEach(subscriber => subscriber(predicate));
    }
  }
  subscribe = (listener: Subscriber) => {
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
