export type ControlPair = [string, string];

export interface Control {
  (): ControlPair | void;
}
