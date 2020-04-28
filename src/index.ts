/***********************************************
 ** The part to hide a type within another type
 **********************************************/
// A symbol to hide the type without colliding with another existing type
const extraType = Symbol("A property only there to store types");

type extraType<T> = {
    [extraType]?: T;
}

// Get back this extra type
type getExtraType<T> = T extends extraType<infer T> ? T : never;

/***********************************************
 ** The part to implement a throwable logic
 **********************************************/

// Throwable is only a type holding the possible errors which can be thrown
export type throwable<E extends Error> = extraType<E>

// return the error typed according to the throwableMethod passed into parameter
type basicFunction = (...any: any[]) => any;

export type exceptionsOf<T extends basicFunction> = getExtraType<ReturnType<T>>;

export const getTypedError = <T extends basicFunction>(error: unknown, throwableMethod: T) => (error as exceptionsOf<T>);
