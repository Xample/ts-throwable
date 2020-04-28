// There is only types to test

import { exceptionsOf, getTypedError, throwable } from '../dist';

class CustomError extends Error {}

// Here is my unreliable method which can crash throwing Error or CustomError.
// The returned type is simply our custom type with what we expect as the first argument and the
// possible thrown errors types as the second (in our case a type union of Error and CustomError)
function unreliableNumberGenerator(): number & throwable<Error | CustomError> {

    if (Math.random() > 0.5) {
        return 42;
    }

    if (Math.random() > 0.5) {
        new Error('No luck');
    }

    throw new CustomError('Really no luck')
}

// Usage
try {
    let myNumber = unreliableNumberGenerator();
    const canByTypedNumber: number = myNumber + 23;
}

// We cannot type error (see TS1196)
catch (error) {
    // Therefore we redeclare a typed value here and we must tell the method which could have crashed
    const typedError = getTypedError(error, unreliableNumberGenerator);
    const errorCanBeError: Error = typedError;
    const errorCanBeCustomError: CustomError = typedError;
}

// Advanced case, method error escalation for 2 unreliable methods

class CustomError2 extends Error {}

function unreliableNumberGenerator2(): number & throwable<CustomError2> {
    if (Math.random() > 0.5) {
        return 1000;
    }

    throw new CustomError2('One more error')
}

// We can get the thrownErrors of a method using `exceptionsOf`. This is useful to escalate type. One possible way:

function escalatingTypes1(): number & throwable<exceptionsOf<typeof unreliableNumberGenerator | typeof unreliableNumberGenerator2>> {
    return (Math.random() > 0.5) ? unreliableNumberGenerator() : 100;
}

try {
    escalatingTypes1();
}
catch (error) {
    const typedError = getTypedError(error, escalatingTypes1);
    const errorCanBeError :  Error = typedError;
    const errorCanBeCustomError :  CustomError = typedError;
    const errorCanBeCustomError2 :  CustomError2 = typedError;
}

// Another possible way:

function escalatingTypes2(): number & throwable<exceptionsOf<typeof unreliableNumberGenerator> | exceptionsOf<typeof unreliableNumberGenerator2>> {
    return (Math.random() > 0.5) ? unreliableNumberGenerator() : 100;
}

try {
    escalatingTypes2();
}
catch (error) {
    const typedError = getTypedError(error, escalatingTypes2);
    const errorCanBeError :  Error = typedError;
    const errorCanBeCustomError :  CustomError = typedError;
    const errorCanBeCustomError2 :  CustomError2 = typedError;
}

// note: the test could be improved using TS 3.9 and the // @ts-expect-error Comment
