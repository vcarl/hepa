# Hepa

Because it filters, get it? This is a set of [compound components](https://www.youtube.com/watch?v=hEGg-3pIHlE) to make filtering data easier. 

[![NPM badge](https://img.shields.io/npm/v/hepa.svg)](npmjs.com/package/hepa) [![Discord badge](https://img.shields.io/badge/discord-general@reactiflux-738bd7.svg)](https://discordapp.com/invite/reactiflux) ![CircleCI build](https://img.shields.io/circleci/project/github/vcarl/hepa.svg)
## Problem:

When iterating on different filter controls for data, a big impediment is wiring up the controls to where the actual data is available. Maybe the filter controls are in a sidebar, and the data is being used in the main page, and there are several components in between them in the tree. 

## Solution:

Because these components use context to communicate, they can be used in any combination without any manual wiring. Put a `FilterProvider` at the top, add some custom `FilterControls` (or one of the built in controls), and pass data into a `Filter` component.

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

The top level `FilterProvider` wraps a set of controls. Think of it how you would a `form`, rather than how Redux or react-router's top level providers work. Instead of a single provider for your whole app, it should only wrap the controls you want to apply to a given `Filter`.

### Custom filter controls

For instance, we could reuse the `Exact` control to create a select of possible options.

```js
import { Exact } from "hepa";

export default const SelectFilter = ({ children }) =>
  <Exact
    name={this.props.name}
    render={(innerProps) => (
      <select {...innerProps}>
        {this.props.children}
      </select>
    )}
  />

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

## API Reference

### FilterProvider

The top level component that owns filter state from controls below it in the hierarchy. Accepts no props, silently communicates with child controls via context.

### Filter

`data`: An array of items to filter.

`render`: A function with the signature `data => ReactElement`. 

### WithFilteredData

`data`: An array of items to filter.

Same as the `Filter` component, but a higher order component. It passes the `data` prop onto the wrapped component after filtering.

### FilterControl

`mapValuesToComparison`: This method gets passed each item in the array to be filtered, and maps it to an intermediate value that gets used in `compare.` The signature is `dataItem => valueToCompare`

`compare`: This is a higher order function that gets passed the output from the other prop method, then the current value of the filter control—what the user typed, by default. The signature is `filterValue => valueToCompare => boolean`

`value` (optional): By default, this component will handle its own state. It allows you to control it, however, which enables more complex use cases. This value is what is passed into `compare` as the first argument.

`onChange` (optional): Along with `value`, allows for this to be treated as a controlled component, which enables more complex use cases.

`render` (optional): By default, it renders a single `input` element. More complex filter controls, like select boxes or ranges, might need different rendered output. This gets passed all props from `FilterControl` except `mapValuesToComparison` and `compare`.

In the included `Exact` component, the two required props are as below.

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

### Exact

This performs an exact string comparison (`===`) on what is entered into the filter with the value on the data keyed of what's passed in as the `name` prop. For instance, a data value with the shape of `{ id: 1, username: 'vcarl' }` would match `<Exact name="username">` with "vcarl" entered.

### Fuzzy

This performs a "fuzzy" match akin to Sublime Text's cmd-p menu on what is entered into the filter with the value on the data key passed in as the `name` prop. For instance, a data value with the shape of `{ id: 1, username: 'vcarl' }` would match `<Fuzzy name="username">` with "val" entered, because **v**c**a**r**l**

### Search

This checks if multiple keys contain what is entered into the filter as a substring, with the value on the data keys passed in as the `name` prop. For instance, a data value with the shape of `{ id: 1, username: 'vcarl', email: 'vcarl@me.com' }` would match `<Search keys={["username", "email"]}>` with "@me.com" entered. 
