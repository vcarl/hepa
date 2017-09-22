import { Control } from "./filter.d";
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
export type Predicate<T> = (T) => boolean;

interface RegisterResponse {
  unregister: () => void;
  update: () => void;
}

export interface FilterContext<Data, MappedValue> {
  registerControl: (control: Control<Data, MappedValue>) => RegisterResponse;
  subscribe: Function;
}
