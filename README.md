### What is ts-throwable ?

`ts-throwable` is an attempt to keep the typing of the error(s) thrown by a method.

typebrokenMethod.ts exports a function which throw a CustomError object
```typescript
class CustomError extends Error {
    constructor(public details: string) {
        super();
    }
}

export function brokenMethod(): number {
    return Math.random() < 0.5 ? 42 : throw new CustomError("Boom!");
}
```

And yourCode.ts file imports this function
```typescript
import { brokenMethod } from 'brokenMethod'
try {
    const answer: number = brokenMethod()
}
catch(error){ // <- if this happend, what is the error's type ? 
    // how do I know error has a `details` property at this point ?
}
```

`ts-throwable` is a workaround to stick the thrown error(s) types to a function.

### Usage
Here is the example above refactored with ts-throwable

```typescript
// we import ts-throwable
import { throwable } from 'ts-throwable';
class CustomError extends Error {
    constructor(public details: string) {
        super();
    }
}
// we append the possible thrown error type to the return type of the method.
export function brokenMethod(): number & throwable<CustomError> {
    return Math.random() < 0.5 ? 42 : throw new CustomError("Boom!");
}
```
And yourCode.ts file
```typescript
import { brokenMethod } from 'brokenMethod';
import { getTypedError } from  'ts-throwable';
try {
    const answer: number = brokenMethod()
}
catch(error){ // same as before, we cannot type error in TS anyway…
    // getTypedError takes the error and the faulty method in parameters.
    // `typedError` is now an alias of `error` and typed as `CustomError` 
    const typedError = getTypedError(error, brokenMethod);
}
```

#### What if my method is throwing several types of errors ?
You can simply pass a type union to the throwable type. Example:
```typescript
function brokenMethod(): number & throwable<CustomError | AnotherCustomError> { /*...*/ }
```

#### How to simply get the types of the errors a method can throw ?
You can use `exceptionOf` on the type of the method: Example:
```typescript
exceptionOf<typeof brokenMethod>
```

#### I have a method using several risky methods, and I want to escalate the responsibility of catching the errors. How can I do so ?
Considering throwable can take a type union and that you can get the error types of any method using throwable. The following is possible
```typescript

function riskyMethod1(): number & throwable<Error> { /*...*/ }
function riskyMethod2(): number & throwable<CustomError1 | CustomError2> { /*...*/ }

function methodUsing2RiskyMethods(): number & throwable<exceptionsOf<typeof riskyMethod1> | exceptionsOf<typeof riskyMethod2>> {
    return (Math.random() > 0.5) ? riskyMethod1() : riskyMethod2();
}
```
Same usage as before i.e.
```typescript
try {
    const answer: number = methodUsing2RiskyMethods()
}
catch(error){
    const typedError = getTypedError(error, methodUsing2RiskyMethods); // typedError is of type Error | CustomError1 | CustomError2
}
```

#### Okay I have a typed error, how to use it now ?
```typescript
catch (error) {
    // for this example, assume the typedError is of type `Error | CustomError1 | CustomError2`
    const typedError = getTypedError(error, methodUsing2RiskyMethods);

    // 2 possible usages:
    // Using if - else clauses
    if (typedError instanceof CustomError2) { /*...*/ }
    else if (typedError instanceof CustomError1) { /*...*/ }
    // each of CustomError2 and CustomError1 extends Error, you therefore better respect the order and put `instanceof Error` last
    else if (typedError instanceof Error) { /*...*/ }

    // Or using a switch case on the constructor:
    // Note: it would have been really cool if TS did understood the typedError.constructor is narrowed by the types Error | CustomError1 | CustomError2 (here the order does not matter)
    switch (typedError.constructor) {
        case Error: /*...*/;
        case CustomError1: /*...*/;
        case CustomError2: /*...*/;
    }
    
}
```

#### Limitations:
`ts-throwable` is trying to achieve something we cannot do yet(?) natively with typescript. This should be considered as a nice helper to keep an eye on the possible error types thrown however.
- you must explicitly and manually append `throwable<YourErrorType>` to the method throwing `YourErrorType`. If this method does not throw anything or if it throws another type than `YourErrorType` you will not have any ts warning.
- if you have a masterMethod returning either the result of a methodA or methodB (both using throwable), TS does not implicitly infer the type of those methods to your masterMethod. In short, you have to explicitly use `throwable` on that masterMethod.  
- there is no way I do know to narrow the type of the typedError within a switch case or an if / else. In other words, TS helps you know what can be the type of the error, but (unlike an enum in a switch) it does not warn you if you forget to handle a type or constructor name in your catch block . 
