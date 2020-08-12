---
title: Pure-Impure Segregation Principle
date: 2020-08-30
cover: Cover.png
---

![cover](Cover.png)

About a month ago I published an article titled ["Unit Testing is Overrated"](/blog/unit-testing-is-overrated) where I shared my thoughts on how developers place way too much faith in that testing approach and why it often isn't the best tool for the job. While I didn't expect that post to do particularly well, it managed to get over 100k views and 1k comments in a span of just a couple of weeks in spite of its controversial nature (or, perhaps, owing to it?).

It was really interesting to follow the discussion as it unfolded, due to the vast contrast of opinions people seemed to have on the subject. While most commenters mainly shared their personal experiences, a few have also voiced criticism of the way some arguments were presented.

In particular, a couple of comments mentioned that the drawbacks I've described, especially those concerning abstractions and mocking, are really just a byproduct of object-oriented programming and its inherent flaws. Had my examples been designed with functional principles in mind, many of the outlined problems would never have surfaced.

The suggested approach was to refactor the class hierarchy I had in my example by creating a clear separation between the pure business logic and impure side-effects. Getting rid of the hierarchy eliminates the need for mocking, which in turn greatly simplifies unit testing.

Although the article also later alluded to this exact approach (in another context), I agree that the original example was a bit forced and could be simplified. And while I think that this doesn't take away from the point of the article, I also believe that the principle of separating pure and impure code is very potent and can often positively influence the design of your software.

When I was just getting into functional programming, one of the earliest mindset shifts I've experienced was upon learning of the functional architecture and how it utilizes this principle. Since then I've been applying these ideas on a daily basis, even when writing object-oriented code.

Because of its importance, I feel like this topic really deserves a dedicated article of its own. So to that end, I will try to cover it in this piece, explaining what makes the code pure or impure, why would we want to create separation based on such seemingly arbitrary properties, where it can be beneficial and where it probably isn't worth doing at all.

_Note: as usual, the article contains code samples in F# and C#, but the ideas are universal and apply to practically any language._

## Pure and impure code

As I'm writing this in 2020, there is no doubt that most readers are already familiar with the concept of purity in programming, as it's discussed quite often nowadays. Nevertheless, let's go over it one more time to make sure we're on the same page.

In essence, _pure code_ is code encapsulated within a function, whose **behavior is influenced only by the function's parameters** and whose **evaluation influences only the value returned by that function**. In other words, a pure function doesn't have implicit dependencies, is not influenced by the global state, and does not read from any other non-deterministic sources (such as the file system, database, etc.). At the same time it also doesn't perform any actions that can cause mutations in outside environment, otherwise known as _side-effects_.

Conversely, a function that breaks at least one of those two rules is considered _impure_. To illustrate this, let's look at a very simple example:

```csharp
public static bool IsProductEdible(DateTimeOffset expiration) =>
    DateTimeOffset.Now < expiration;

public static bool IsProductEdible(DateTimeOffset expiration, DateTimeOffset instant) =>
    instant < expiration;
```

While the above two versions of the `IsProductEdible` method are rather similar, only one of them is in fact pure. Due to the fact that the first overload reads the current date and time from `DateTimeOffset.Now`, it has an implicit dependency on a non-deterministic data source, which means that executing the method with the same parameter ten days apart may produce different results.

The second overload, which takes the current date and time as an explicit parameter, does not exhibit that problem. Regardless of whether we call that method now or in ten days, the result is guaranteed to always be the same for the same set of parameters.

Because of that, the first method shown above is impure, while the second one is pure. Additionally, the following method would be impure as well:

```csharp
public static void IsProductEdible(DateTimeOffset expiration, DateTimeOffset instant)
{
    if (instant < expiration)
        Console.WriteLine("It's edible.");
    else
        Console.WriteLine("It's not edible.");
}
```

In this case, the reason it's considered impure is because this method causes mutations by displaying text in the terminal. As a general observation, we can also extrapolate that any method that returns `void` is most likely going to be impure, as a pure function that doesn't return anything is inherently useless.

There would be little reason to classify functions based on whether they contain side-effects if it didn't provide something useful. Well, it just so happens that pure code has the following properties: