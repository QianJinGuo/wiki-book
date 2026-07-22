---
title: "You Must Fix Your Asserts"
source_url: https://kristoff.it/blog/fix-your-asserts/
source: newsletter
created: 2026-06-01
updated: 2026-06-01
type: article
tags: [newsletter, article]
sha256: e0c6221f412c8b16
---

# You Must Fix Your Asserts


Published Time: Mon, 01 Jun 2026 09:19:32 GMT

Markdown Content:
Fear is the killer of the mind ...and the codebase as well.

A user on a discussion platform wrote:

> I think “disabling asserts in prod” is a pretty common technique, yeah?

As far as I know that is probably a correct statement, but **I believe it to be an irredeemably bad practice**. Let’s start with some context first, since this discussion started because of how `std.debug.assert` works in Zig.

## Asserts in general

An assert is a line of code that introduces a new fact to the program, such as “this argument can never be null”, or “this integer can never be even”, and they kinda look like this:

```
assert(my_arg != null);
assert(my_num % 2 != 0);
```

If your type system can be used to enforce one of these constraints, then you will probably want to use the facilities in your language rather than asserts.

For example, in Zig normal pointers (e.g. `*Foo`) can never be null, while optional pointers (`?*Foo`) can, but they also force you to check before you can access the value (and for which Zig has dedicated idioms).

Asserts can be used to explicitly state pre/post conditions and invariants in your code. This is useful because, if you pick good assertions, those will be able to protect you from programming mistakes better than unit tests, especially if you fuzz your code.

**An assert is worth a thousand unit tests** (and orders of magnitude more than that if you fuzz), but that’s a story for a follow-up post.

## Asserts in Zig

Asserts in Zig are based on `unreachable`, a language feature that marks invalid code paths.

```
const Op = enum { a, b, c };

fn execute(orig_op: Op) void {
  var op = orig_op;

  if (op == .a) {
    op = .b; // turn .a into .b
  }

  const op_cost = switch(op) {
    .a => unreachable, // impossible to reach
    .b => 50,
    .c => 100,
  };

  // finalize op
}
```

In this example the `.a` case is always mutated into a `.b` case by the `if` statement which means that, once we reach the `switch`, it’s impossible to enter the `.a` case.

Another neat property of `unreachable` is that it can be used as a statement, but it is also valid anywhere an expression (of any type) is expected.

In the example above we’re computing the “cost” of an operation, and it might be that it doesn’t even make sense for `.a` to have an associated cost. Thanks to `unreachable` we don’t even have to come up with an awkward placeholder value for a case that can never happen anyway.

Zig’s stdlib assert function also leverages `unreachable` and is implemented as follows:

```
pub fn assert(ok: bool) void {
  if (!ok) unreachable; // assertion failure
}
```

### Build modes

Zig has multiple build modes:

*   Debug
*   ReleaseSafe
*   ReleaseFast
*   ReleaseSmall

This is not a setting that is necessarily global to your program: every dependency can be built in a different mode and you can even use [`@setRuntimeSafety`](https://ziglang.org/documentation/0.16.0/#setRuntimeSafety) for block-level granularity within a single function.

When an assert is tripped “illegal behavior” occurs. Checked modes (Debug, ReleaseSafe, `@setRuntimeSafety(true)`) guarantee a crash of your program by panicking, while unchecked modes (ReleaseFast, ReleaseSmall, `@setRuntimeSafety(false)`) incur “unchecked illegal behavior”.

In short, unchecked illegal behavior means that the program will misbehave.

In this particular example what happens today is that the `switch` statement that assigns a value to `op_cost` will ‘fallthrough’ to one of the other cases because of how the machine code gets generated. But that’s not guaranteed, and a different version of the compiler might generate machine code that causes a different misbehavior.

Here’s a [godbolt link](https://godbolt.org/z/jssEfx4Pv) so you can see for yourself.

This is a sharp tool, but it’s what powers a lot of powerful optimizations, for example in our case the machine code necessary to implement the first branch of the `switch` statement was essentially elided from the final executable.

Here’s [another godbolt link](https://zig.godbolt.org/z/7sMjofYsK) where you can see how an assert interacts with the subsequent `switch` statement in both ReleaseSafe and ReleaseFast (note how in ReleaseFast the function skips all comparisons and just returns `true`).

This is the kind of stuff that videogames and other real-time media applications rely on massively.

Not every assert will lead to a performance increase, but optimizing compilers have the ability to propagate `unreachable` information, resulting in non-local optimizations that you might not be able to easily anticipate as a programmer.

### Zig asserts are not macros

When approaching Zig, one thing that surprises C/C++ developers especially, is the fact that `std.debug.assert` is not a macro (and FYI Zig doesn’t have macros).

In those languages, it is common to disable assertions in a way which essentially acts as a though every call to `assert` had been commented out, including whatever expression is passed to the macro.

This means that in C/C++ you should never put an expression with side effects into a call to assert, as that whole operation will be commented out when asserts are disabled.

In Zig this is just not a thing because `std.debug.assert` is a normal function, which means that its arguments are evaluated before calling it no matter what the logic inside the function is.

The result is that you can put expressions with side-effects in your calls to assert without fear:

```
// assert that the remove operation is not a noop:
assert(my_map.remove("expected-to-exist"));
```

On the flipside it also means that if you have an assert that relies on performing complex computations, then those won’t necessarily be elided when building in unchecked modes, in which case you need to take care to guard the code with a comptime `if`:

```
const builtin = @import("builtin");

if (builtin.mode == .Debug) {
  var condition = ...;
  // whatever bookkeeping is necessary
  // to compute the condition
  assert(condition == .ok);
}
```

This is surprising behavior if you’re used to C/C++ semantics, but at the same time, if you’re a seasoned developer, you should be able to wrap your head around function call semantics eventually.

This is a good opportunity to get rid of some macro-induced PTSD and embrace simplicity, especially because in Zig you don’t normally disable asserts, which brings me to the main point of this post.

## Disabling asserts in prod

To recap, there are three things you can do with asserts:

1.   Keep them as runtime checks that panic the process when tripped.
2.   Use them for performance optimization at the cost of program misbehavior if an assert turns out to be wrong.
3.   Completely disable them. This is not supported out of the box by `std.debug.assert`, but you can implement your own version that internally checks a build-time flag, approximating C/C++ behavior [1](https://kristoff.it/blog/fix-your-asserts/#fn-1).

As I mentioned in the beginning, I believe (3) to be an irredeemably bad choice.

What are the reasons to want to disable asserts? It’s essentially the union of the other two cases, negated:

1.   You don’t want to keep the runtime checks, either because of the performance cost or because you don’t want the application to crash.
2.   You don’t want to use asserts for optimization because you don’t trust them to be correct and thus fear program misbehavior.

As [matklad reminded me](https://ziggit.dev/t/bun-is-being-ported-from-zig-to-rust/15330/129?u=kristoff) in a recent discussion on the topic, there might be situations where you might have a legitimate engineering reason to want to avoid crashes, but as far as general software goes, that’s a pretty bad default choice in my opinion.

Disabling asserts means that when one of those presumed-impossible conditions actually happens, the program keeps running instead of crashing. So now you have a program that keeps running under wrong assumptions, which is still a form of misbehavior, even if not caused by unchecked illegal behavior (UIB) as described above.

Naive memory safety advocates might argue that UIB (or undefined behavior, as it’s called in C) is **infinitely worse**, but I would disagree.

What makes UIB dangerous is the fact that it’s a pathway for turning a program into a [weird machine](https://en.wikipedia.org/wiki/Weird_machine), but in software sufficiently complex you don’t necessarily need UIB to twist the program into one. Falsifying an assertion at runtime is by definition deviating from the spec, and it can easily be enough to make the program perform operations that it was never intended to do.

And that’s not just a technicality: SQL injection is a concrete and widespread example of weird-machine-grade misbehavior that doesn’t require UIB.

If the cost of program misbehavior is so high that you don’t want to risk it, then you should keep the asserts on, and if performance is so important that you’re willing to risk misbehavior, then you’re just leaving performance on the table, while thinking that you’re safer than you really are.

But there’s an even bigger reason why methodically disabling all asserts in prod is counterproductive.

## Gaslighting yourself

To recap, the crux of the issue here is about the possibility of asserts being wrong, and the consequences of that. If we could guarantee that all our asserts are always true, then always using them for performance optimization would be uncontroversial. Similarly, if we could guarantee that tests could catch all wrong asserts, then prod could always be optimized safely as well.

The reason you’re reading this post, is because we know that we could write a wrong assert and it’s not guaranteed that tests would catch it, which is not just a hypothetical. There are plenty of projects that have asserts that pass tests, but that trip in prod, I can think of a hyped one that recently left the Z
