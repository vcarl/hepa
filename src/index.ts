import FilterProvider from "./FilterProvider";
import Fuzzy from "./Fuzzy";
import Exact from "./Exact";
import Search from "./Search";
import Filter from "./Filter";
import WithFilteredData from "./WithFilteredData";

export { FilterProvider, Filter, Exact, Fuzzy, Search, WithFilteredData };
export interface values {
  [key: string]: number | string;
}
export type ControlPair<Data, MappedValue> = [
  (datum: Data) => MappedValue,
  (value: MappedValue) => boolean
];

export type Control<Data, MappedValue> = () =>
  | ControlPair<Data, MappedValue>
  | undefined;
export interface Predicate<T> {
  (predicate: T): boolean;
}

export interface RegisterResponse {
  unregister: () => void;
  update: () => void;
}

export interface FilterContext<Data, MappedValue> {
  registerControl: (control: Control<Data, MappedValue>) => RegisterResponse;
  subscribe: Function;
}
