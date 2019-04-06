// Opt-out types
type $TODO = any;
type $SkipTS = any;

// Helper Types
type Args<A = any> = Array<A>;

// TODO: I dont like the Optional...
type Maybe<T> = T | null;
type Optional<T> = T | undefined;
type Keys<T> = keyof T;
type Values<T> = T[keyof T];

type TIterableObject = {
  [key: string]: TIterableObject;
};

type NHKeys<T> = ({ [P in keyof T]: P } & { [x: string]: never })[keyof T];

type RequiredKeys<T> = { [K in NHKeys<T>]: T[K] };
