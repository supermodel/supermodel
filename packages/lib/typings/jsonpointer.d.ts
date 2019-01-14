declare module 'jsonpointer' {
  export function get<I = TIterableObject>(obj: I, pointer: string): I;
}
