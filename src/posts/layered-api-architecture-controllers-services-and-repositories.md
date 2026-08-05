---
title: Layered API Architecture: Controllers, Services, and Repositories.
subtitle: A beginner-friendly guide to separating logic in your backend
excerpt: A simple introduction to layered API architecture and how controllers, services, and repositories help keep backend code clean and organized.
date: 2026-08-04
tags: Node.js, Express.js, Go, TypeScript, Backend, API Architecture.
---

# Layered API Architecture

Layered API architecture is something I learned when I started learning Go for backend development. Before that, while working with Node.js and Express, I often saw APIs where almost everything was written inside the controller.

For example, let's say we have a login endpoint:

`POST /auth/login`

A controller might find the user from the database, check their password, generate a token, and return the response—all inside one function.

This works, especially for small projects. But as the project grows, controllers can become huge and difficult to maintain.

A simple way to solve this is to separate our API into three layers:

`Controller → Service → Repository → Database`

## Repository Layer

The repository layer handles **database-related logic**.

For example, instead of directly calling Prisma inside our controller:

```ts
const user = await prisma.user.findUnique({
  where: { email },
});
```

we can create a repository function:

```ts
const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};
```

Other repository functions could be:

```ts
findUserById();
createUser();
updateUser();
deleteUser();
```

The important thing is that the repository should mainly deal with getting data from or saving data to the database.

Simply put:&#x20;

`Repository = Database Logic`

## Service Layer

Above the repository is the **service layer**.

The service layer contains our **business logic**, which basically means the rules and actual working logic of our application.

For example, our login service could look like this:

&#x20;

```ts
const loginUser = async (email: string, password: string) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user.id);

  return { user, token };
};
```

The service asks the repository for the data and then decides what to do with it.

So:

`Repository → Gets the data`

`Service    → Works with the data`

## Controller / Handler Layer

Finally, we have the **controller**, also called a handler in some frameworks.

The controller handles the HTTP request and response.

Our login controller can now be very simple:

```js
const login = async (req, res) => {
  const { email, password } = req.body;

  const result = await loginUser(email, password);

  return res.status(200).json(result);
};
```

The controller doesn't need to know how the user is fetched from the database or how login works internally.

It just receives the request, calls the service, and sends the response.

## Putting It Together

When someone calls our login API, the flow looks like this:

Client → Controller → Service → Repository → Database

And the result travels back up to the client.

**Each layer has a simple responsibility:**

Controller → HTTP request and response

Service → Business logic

Repository → Database logic

# Finally&#x20;

That's basically the idea behind layered API architecture.

You don't need to use this structure for every tiny project. Sometimes a simple controller is completely fine. But as your backend grows, separating responsibilities like this can make your code much easier to understand, test, and maintain.

I first became familiar with this approach while learning Go, but it isn't specific to Go. The same idea can be used with Node.js, Express, TypeScript, Java, and many other backend technologies.
