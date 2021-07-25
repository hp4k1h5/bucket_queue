# bucket_queue 

## purpose

This library facilitates the maintenance of _n_ concurrent processes.

It is best suited for cases where the number of processes to execute is
potentially unlimited. For example, web crawlers may have an infinite number of
webpages to crawl as they continuously add more urls to the queue of urls to be
crawled as they scrape links from the urls crawled. 

Maintaining a steady number of concurrent requests allows for smooth overall
request distribution and can prevent very long requests from halting the
overall program flow. 

# usage

The primary export `supervise` accepts an array of `async function`s, or a
function returning an array of `async function`s. `supervise` will execute these
concurrently up to the max concurrency limit, replenishing the active execution
queue sequentially from the array of requests provided to the asynchronous
queue manager, an async generator function.

```javascript
await supervise(queue, 20)
```

The process underneath is roughly:

1) The `queue` provides an array or series of arrays to the `queue manager`
2) the `queue manager feeds them, one-by-one to the `bucket supervisor`
3) the `bucket supervisor` maintains up to the max number of simultaneous processes

See [src/example.js](src/example.js)

Finding the right max for concurrent processes will be system and workload
dependent. In cpu intensive workloads, it might be best to limit max concurrent
to the number of cores available to the program. In request based workloads,
the network latency might allow for thousands of concurrent requests on
relatively modest architectures.

For example, [these tests](test/supervise.spec.ts) demonstrate the relative
potential of various workloads.

### Observational Results of random sleeps

```
100 "requests" / 10 workers * Math.random() * 50ms sleep
 ~= 250ms total runtime
```

```
1,000 "requests" / 100 workers * Math.random() * 50 ms sleep
 ~= 250ms total runtime
```

You can theoretically execute 1,000 calls as fast as 100, provided you also
increase the concurrent worker pool to 100 concurrent workers. Also, you can
limit overall resource usage.

### Usage

See [`./src/example.js`](src/example.js).

### Caveats
Actual usage with network latency type response time distribution would likely
show different results.

The test examples are void of any real work being done, and as such, the tests
are not indicative of what actual results would show in a live environment
under load. In general, if this package is used

I have not experimented with it much beyond the examples in the test cases.
