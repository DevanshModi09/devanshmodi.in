---
title: Concurrency vs Parallelism: What Learning Go Taught Me
subtitle: A simple, beginner-friendly (not really) breakdown of two concepts I mixed up for way too long — with easy real-world examples along the way.
excerpt: I used to think concurrency and parallelism meant the same thing. Learning Go — and writing goroutines myself — finally showed me why they're not.
date: 2026-07-27
tags: go, golang, concurrency, parallelism, javascript, nodejs, learning
---
# My Biggest Misconception About Concurrency

###

Back when I was learning JavaScript, one of the first things I picked up was that it's single-threaded. Simple enough fact. But I completely misunderstood what it actually meant — in my head, "single-threaded" basically translated to "not concurrent."

See, at the time, concurrency and parallelism were the exact same thing to me. Just two words for "doing multiple things at once." So if JavaScript only had one thread, it seemed obvious that it couldn't be doing multiple things at once — which meant, in my mind, it just wasn't concurrent. Simple logic, except it was completely wrong.

Turns out JavaScript is actually really concurrent. It just doesn't get there through parallelism. And figuring out why those are two different things is basically what changed how I think about all of this — which is what this post is about.

# Concurrency vs Parallelism, Explained Simply

Assume one guy in a kitchen, and he's only got one hand to work with (1 core). He's cooking something, then he stops for a second to fill up a water bottle, then goes right back to cooking. He's just switching back and forth, doing one thing at a time, but with just that one hand (1 core). That's concurrency — one core, hopping between tasks, never actually doing two things at the exact same moment. This is basically what the event loop does — one core, switching between tasks so fast it feels like multiple things are happening, even though only one thing is ever actually running at a time.

Now assume the same guy, except this time he's got two hands (2 cores). He's cooking with one hand and filling the water bottle with the other, at the same exact time. That's parallelism — two cores, two things actually happening simultaneously.

So really, it's not about how many things you're juggling. It's about how many hands you've got doing the juggling. One hand switching super fast between tasks? Concurrency (1 core). Multiple hands working at the exact same time? That's parallelism (2 cores).

## A few points to remember:

* **Concurrency is about structure, parallelism is about execution.** Concurrency is how you organize tasks so multiple things can make progress. Parallelism is actually running multiple things at the same instant.
* **Concurrency can happen on a single core. Parallelism cannot.** This is the big one people miss. You don't need multiple hands to be concurrent — one hand switching fast enough between tasks is still concurrency. Parallelism, on the other hand, requires more than one hand (more than one core) working at the same time.
* **Concurrency is about dealing with lots of things at once. Parallelism is about doing lots of things at once.** "Dealing with" doesn't mean simultaneous. "Doing" does.
* **A single core can absolutely be concurrent — it just can't be parallel.** It can rapidly switch between tasks (like JavaScript's event loop does), giving the illusion that many things are happening together, without ever truly running two tasks at the exact same instant.
* **Parallelism needs multiple cores; concurrency just needs good task-switching.** That's why JavaScript, running on a single core, can juggle hundreds of tasks concurrently but can never run two of them in true parallel — no matter how fast the switching is.
* **You can have concurrency without parallelism, but not the other way around.** If two things are genuinely running in parallel, they're automatically concurrent too (since they're both making progress at once). But something can be concurrent without ever being parallel — like a single-core event loop.

# How JavaScript Achieves Concurrency Without Parallelism

So if JavaScript only has one core (one hand), how does it manage to juggle so many things at once — API calls, timers, user clicks — without freezing up? This is where the **event loop** comes in.

Here's the simple version: JavaScript doesn't actually do slow things itself. When it hits something that takes time — like fetching data from a server, reading a file, or waiting on a `setTimeout` — it doesn't sit there waiting. It hands that task off to the browser (or to Node's underlying system) and immediately moves on to the next line of code. When that slow task finally finishes, its result gets queued up, and the event loop picks it up and runs it once the main thread is free.

## A simple example:

```js
console.log("1");

setTimeout(() => {
  console.log("2");
}, 1000);

console.log("3");
```

You'd expect `1, 2, 3` — but the actual output is `1, 3, 2`. Why? Because `setTimeout` hands the "wait 1 second" job off elsewhere, and JavaScript immediately moves on to log `"3"` instead of pausing to wait. Only once the timer's done, and the main thread is free again, does `"2"` get logged. One core, one hand — but it never sat idle waiting for that 1 second to pass.

## Why this is concurrency, not parallelism:

At no point are two pieces of your JavaScript code actually running at the exact same instant. There's still just one hand (one core) doing the work. But by handing off slow tasks and picking up other tasks in the meantime, it *feels* like multiple things are happening together — because they're all making progress, just not simultaneously.

That's the whole trick: JavaScript achieves concurrency by never blocking on slow tasks, not by doing multiple things at literally the same time.

# An example of Go Achieving Concurrency, With and Without Parallelism

Let's actually prove it with code. We'll run the same CPU-heavy work as 3 goroutines, once with `GOMAXPROCS` set to 1 (forcing everything onto a single core), and once with it set to the max (letting Go use all available cores), and time both.

## The setup :&#x20;

```go
package main

import (
	"fmt"
	"runtime"
	"sync"
	"time"
)

func heavyWork(id int) {
	sum := 0
	for i := 0; i < 1_000_000_000; i++ {
		sum += i
		if i == 0 || i == 333_000_000 || i == 666_000_000 {
			fmt.Printf("  goroutine %d -> checkpoint at %d\n", id, i)
		}
	}
}

func run(label string) {
	fmt.Println("----", label, "----")
	start := time.Now()

	var wg sync.WaitGroup
	for i := 0; i < 3; i++ {
		wg.Add(1)
		id := i
		go func() {
			defer wg.Done()
			heavyWork(id)
		}()
	}
	wg.Wait()

	fmt.Printf("%s: %v\n\n", label, time.Since(start))
}

func main() {
	fmt.Printf("Cores available on this machine: %d\n\n", runtime.NumCPU())

	runtime.GOMAXPROCS(1)
	run("GOMAXPROCS=1 (concurrency only, no parallelism)")

	runtime.GOMAXPROCS(runtime.NumCPU())
	run(fmt.Sprintf("GOMAXPROCS=%d (real parallelism, if cores > 1)", runtime.NumCPU()))
}
```

## The Output will be :&#x20;

```md
---- GOMAXPROCS=1 (concurrency only, no parallelism) ----
  goroutine 2 -> checkpoint at 0
  goroutine 0 -> checkpoint at 0
  goroutine 1 -> checkpoint at 0
  goroutine 1 -> checkpoint at 333000000
  goroutine 2 -> checkpoint at 333000000
  goroutine 0 -> checkpoint at 333000000
  goroutine 0 -> checkpoint at 666000000
  goroutine 1 -> checkpoint at 666000000
  goroutine 2 -> checkpoint at 666000000
GOMAXPROCS=1 (concurrency only, no parallelism): 1.519608958s

---- GOMAXPROCS=8 (real parallelism, if cores > 1) ----
  goroutine 2 -> checkpoint at 0
  goroutine 1 -> checkpoint at 0
  goroutine 0 -> checkpoint at 0
  goroutine 2 -> checkpoint at 333000000
  goroutine 1 -> checkpoint at 333000000
  goroutine 0 -> checkpoint at 333000000
  goroutine 1 -> checkpoint at 666000000
  goroutine 0 -> checkpoint at 666000000
  goroutine 2 -> checkpoint at 666000000
GOMAXPROCS=8 (real parallelism, if cores > 1): 556.020458ms
```

You can see that even with just 1 core, all three goroutines are still running *concurrently* — the checkpoints from goroutine 0, 1, and 2 are interleaved, not sequential. But once we bump it up to the max number of cores, the whole thing runs roughly 3x faster (i assume your cpu has more then 3 cores) , because each goroutine now gets its own core to run on at the exact same time. That's the shift from concurrency to actual parallelism — same code, same goroutines, just more hands doing the work.



# Final Thoughts

That's concurrency vs parallelism, the way I finally understood it. Hope it made a bit more sense to you too.

Also — small side note, but I wrote this entire post while on loop with a song called *Kalyani*. Absolute peak. Worth a listen if you need something to code to.&#x20;