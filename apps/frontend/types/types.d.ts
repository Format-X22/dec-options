import { Dispatch, SetStateAction } from 'react';

declare type TSetter<T> = Dispatch<SetStateAction<T>>;

declare interface DOMEvent<T extends EventTarget> extends Event {
    readonly target: T;
}

declare type GreekValue = number | null;
