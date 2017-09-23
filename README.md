# Hepa

Because it filters, get it? This is a set of [compound components](https://www.youtube.com/watch?v=hEGg-3pIHlE) to make filtering data easier. 

## Problem:

When iterating on different filter controls for data, a big impediment is wiring up the controls to where the actual data is available. Maybe the filter controls are in a sidebar, and the data is being used in the main page, and there are several components in between them in the tree. 

## Solution:

Because these components use context to communicate, they can be used in any combination without any manual wiring. Put a `FilterProvider` at the top, add some custom `FilterControls` (or one of the built in controls), and pass data into a `Filter` component.

## Sample usage

```js
<FilterProvider>
  {/* "Fuzzy" matcher a la Sublime Text's cmd-p search */}
  <Fuzzy name="name" />
  <ul style={{ display: "none" }}>
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
  <ul>
    <EnhancedShowData data={data} />
  </ul>
</FilterProvider>
```
