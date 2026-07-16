---
title: A Reusable Error Handling Pattern for Express
subtitle: A simple and robust template for handling errors in any JavaScript backend project.
excerpt: I got tired of writing the same error handling code in every Express project, so I moved everything into one reusable setup.
date: 2026-07-16
tags: node, express, javascript
---

After building a few Express APIs, I noticed I kept writing the same error handling code again and again.

Every controller had its own `res.status(...).json(...)` call. Some returned `{ msg }`, others returned `{ error }`, and every route handled errors a little differently.

I wanted my controllers to focus on business logic, not building error responses.

So I moved all the error handling into one place.

Now every project starts with:

- One base error class
- A few custom error classes
- One global error middleware

That's the entire setup.

## The Problem

A typical controller usually looks something like this.

```js
app.get("/user/:id", async (req, res) => {
  const user = await findUser(req.params.id);

  if (!user) {
    return res.status(404).json({
      msg: "User not found",
    });
  }

  res.json(user);
});
```

This works perfectly fine.

The problem starts when your project grows. You'll end up writing the same response logic in lots of different controllers.

Instead, I prefer throwing an error and letting one middleware decide how every error should be returned.

## Creating a Base Error Class

The built-in `Error` class only stores an error message.

I also want every error to know which HTTP status code it should return.

```js
export class CustomAPIError extends Error {
  constructor(message) {
    super(message);

    this.statusCode = 500;

    Object.setPrototypeOf(this, CustomAPIError.prototype);
  }
}
```

You might be wondering why `Object.setPrototypeOf()` is there.

When extending built-in classes like `Error`, `instanceof` checks don't always work correctly without it. Since this setup relies on `instanceof`, it's a good idea to keep it.

## Creating Custom Errors

Now creating new error types becomes very simple.

```js
export class BadRequestError extends CustomAPIError {
  constructor(message) {
    super(message);

    this.statusCode = StatusCodes.BAD_REQUEST;

    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}
```

I usually create these four errors.

| Class | Status | When to Use |
| ------ | ------ | ------------------------------ |
| `BadRequestError` | 400 | The request is invalid |
| `UnauthenticatedError` | 401 | The user isn't logged in |
| `UnauthorizedError` | 403 | The user doesn't have permission |
| `NotFoundError` | 404 | The requested resource doesn't exist |

Since every class extends `CustomAPIError`, the middleware can handle all of them in exactly the same way.

![Error handling architecture](/images/error-architecture.png)

## Global Error Middleware

Every error eventually reaches this middleware.

```js
export const errorHandlerMiddleware = (err, req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    console.error(err);
  }

  let customError = {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    msg: "Something went wrong. Try again later.",
  };

  if (err instanceof CustomAPIError) {
    customError.statusCode = err.statusCode;
    customError.msg = err.message;
  }

  return res.status(customError.statusCode).json({
    msg: customError.msg,
  });
};
```

The logic is simple.

If the error is one of our custom errors, return its status code and message.

If it's any other error, return a generic `500` response instead. That way users don't see internal server errors or database messages.

Every error response now follows the same format.

## Controllers Become Cleaner

Instead of returning responses everywhere:

```js
if (!user) {
  return res.status(404).json({
    msg: "User not found",
  });
}
```

just throw an error.

```js
if (!user) {
  throw new NotFoundError("User not found");
}
```

The middleware handles everything else.

Controllers stay small and only contain business logic.

## Express 4 vs Express 5

One small difference between Express 4 and Express 5 is how async errors are handled.

In **Express 4**, throwing an error inside an async route doesn't automatically call the error middleware.

```js
app.get("/", async (req, res) => {
  throw new Error("Something went wrong");
});
```

To make it work, you need to:

- call `next(err)`
- wrap your async routes
- or use `express-async-errors`

In **Express 5**, async errors are forwarded automatically.

The same code works without any wrapper.

```js
app.get("/", async (req, res) => {
  throw new Error("Something went wrong");
});
```

It's a small change, but it makes writing async routes much cleaner.

## Final Thoughts

This isn't a complicated pattern, but it saves a lot of repetitive code.

Once this setup is in place, controllers only worry about business logic while one middleware handles every error in the application.

It's one of the first things I add whenever I start a new Express backend.