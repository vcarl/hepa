# Hepa

Because it filters, get it? This is a set of [compound components](https://www.youtube.com/watch?v=hEGg-3pIHlE) to make filtering data easier. 

## Problem:

When iterating on different filter controls for data, a big impediment is wiring up the controls to where the actual data is available. Maybe the filter controls are in a sidebar, and the data is being used in the main page, and there are several components in between them in the tree. 

## Solution:

Because these components use context to communicate, they can be used in any combination without any manual wiring. Put a `FilterProvider` at the top, add some custom `FilterControls` (or one of the built in controls), and pass data into a `Filter` component.

## API Reference

### FilterProvider

The top level component that owns filter state from controls below it in the hierarchy. Accepts no props, silently communicates with child controls via context.

### Filter

A component that expects `data` to filter as a prop, and passes the filtered list to a `render` prop. This component consumes the filter predicate from `FilterProvider`.

### WithFilteredData

Same as the `Filter` component, but a higher order component. Expects `data` as a prop, passes filtered `data` into the wrapped component.

### FilterControl

A generic control. This is what's used to implement the rest of the filter controls, and allows for custom controls to be implemented. This is very powerful, making this library very extensible within your codebase. It takes 2 props which it will call to build a predicate, `mapValuesToComparison` and `compare`. It will handle its own state when just handling a simple string, but it also allows for external control by accepting `value` and `onChange` props. By default it renders a simple DOM input and passes all props through, but it allows allows for a `render` prop for customized inputs.

#### Required Props

##### `mapValuesToComparison: datum => intermediateValue`

A function that receives each item in the `data` array passed to `Filter` or `WithFilteredData` and returns the value that should be passed into `compare`.

##### `compare: valueFromControl => intermediateValue => boolean`

A curried function that expects the value from within `FilterControl` (either from its own state if uncontrolled, or from a `value` prop if controlled) and the value returned from `mapValuesToComparison`.

For example, in `Exact`, these two functions are very simple. When mapping the data, it pulls off a single key that gets compared to the current filter value.

```js
mapValuesToComparison = 
  dataValue => dataValue[this.props.name]

compare = (filterValue /* a string value typed by the user */) => 
  (intermediateValue /* the string returned from `mapValuesToComparison` */) =>
    dataValue === filterValue;
```

`Search` provides an example of why this combination can be very powerful. It looks at multiple keys to see if any contain the filter value as a substring.

```js
mapValuesToComparison = (datum) => {
  const { keys } = this.props;

  const values = keys.reduce((out, key) => {
    out.push(datum[key].toString().toLowerCase());
    return out;
  }, []);

  return values;
};
compare = (filterValue /* a string value typed by the user */) => 
  (dataValues /* the array returned from `mapValuesToComparison` */) =>
    dataValues.some(value => value.includes(filterValue));
```

#### Optional Props

##### `onChange`
##### `value`

These can be passed to make the input controlled. If you need more complex behavior, you can extract the filter state while still leaning on `FilterControl` to build a predicate and communicate it to the `FilterProvider`.

##### `render`

Some filters are more complex than a simple text input. Maybe you want to render an HTML `select`, or use an existing component. All props other than `mapValuesToComparison` and `compare` are passed into this function as an argument. You'll likely only need to use `value` and `onChange` in here.

### Exact

This performs an exact string comparison (`===`) on what is entered into the filter with the value on the data keyed of what's passed in as the `name` prop. For instance, a data value with the shape of `{ id: 1, username: 'vcarl' }` would match `<Exact name="username">` with "vcarl" entered.

### Fuzzy

This performs a "fuzzy" match akin to Sublime Text's cmd-p menu on what is entered into the filter with the value on the data key passed in as the `name` prop. For instance, a data value with the shape of `{ id: 1, username: 'vcarl' }` would match `<Fuzzy name="username">` with "val" entered, because **v**c**a**r**l**

### Search

This checks if multiple keys contain what is entered into the filter as a substring, with the value on the data keys passed in as the `name` prop. For instance, a data value with the shape of `{ id: 1, username: 'vcarl', email: 'vcarl@me.com' }` would match `<Search keys={["username", "email"]}>` with "@me.com" entered. 

## Example usage

```js
<FilterProvider>
  <div>
    <Exact name="name" />
    <Search keys={["name", "email", "id"]}>
    <Fuzzy name="email" />
  </div>
  <ul>
    <Filter
      data={rawData}
      render={filteredData =>
        filteredData.map(datum => (
          <li>
            {datum.name}, {datum.email}
          </li>
        ))
      }
    />
  </ul>
</FilterProvider>
```

### Custom filter controls

For instance, we could reuse the `Exact` control to create a select of possible options.

```js
import { Exact } from "hepa";

export default class SelectFilter extends React.Component {
  state = {
    value: ""
  };
  render() {
    return (
      <Exact
        name={this.props.name}
        onChange={({ target }) => {
          this.setState({ value: target.value });
        }}
        value={this.state.value}
        render={props => (
          <select onChange={props.onChange} value={props.value}>
            {this.props.children}
          </select>
        )}
      />
    );
  }
}

/**
 * Used like:
 * <SelectFilter name="customerId">
 *  <option value="1">Google</option>
 *  <option value="2">Facebook</option>
 *  <option value="3">Apple</option>
 *  <option value="4">Microsoft</option>
 * </SelectFilter>
 */
```
