declare type Modify<T, R> = Pick<T, Exclude<keyof T, keyof R>> & R

declare type Replace<T, R> = Omit<T, keyof R> & R
