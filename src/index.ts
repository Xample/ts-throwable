/***********************************************
 ** The part to hide a type within another type
 **********************************************/
// A symbol to hide the type without colliding with another existing type
const errorType = Symbol("A property only there to store types");

// Throwable is only a type holding the possible errors which can be thrown
export type throwable<T extends Error> = {
    [errorType]?: T;
}

// Get back this extra type
type getThrowableType<T> = T extends throwable<infer T> ? T : never;

/***********************************************
 ** The part to implement a throwable logic
 **********************************************/

// return the error typed according to the throwableMethod passed into parameter
type basicFunction = (...any: any[]) => any;

export type exceptionsOf<T extends basicFunction> = getThrowableType<ReturnType<T>>;

export const getTypedError = <T extends basicFunction>(error: unknown, throwableMethod: T) => (error as exceptionsOf<T>);
