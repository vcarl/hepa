import { Control } from "./filter.d";
export interface values {
  [key: string]: number | string;
}
export type ControlPair<T> = [
  (datum: T) => number | string,
  (value: string | number) => boolean
];

export type Control<T> = () => ControlPair<T> | undefined;
export type Predicate<T> = (T) => boolean;

interface RegisterResponse {
  unregister: () => void;
  update: () => void;
}

export interface FilterContext<T> {
  registerControl: (control: Control<T>) => RegisterResponse;
  subscribe: Function;
}
