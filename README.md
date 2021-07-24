# bucket_queue 

> a typescript bucket queue implementation

## purpose

maintain _n_ concurrent functional processes

This library aims to provide a convenient way to execute large numbers of
concurrent processes. This library facilitates the maintenance of _n_
concurrent processes, refilling the queue as soon as any asynchronous process
is resolved.

As opposed to `Promise.all`, which waits for the slowest Promise to resolve
before finishing, `bucket_queue` will maintain _n_ processes, aiming at  
faster theoretical execution of the overall number of process to execute.

For example, [these tests](test/supervise.spec.ts) demonstrate the relative
potential of various workloads.

### Observational Results of random sleeps

```
100 "requests" * 10 workers * Math.random() * 50ms sleep
 ~= 250ms total runtime
```
 (more like 280ms with functional overhead)

```
1,000 "requests" * 100 workers * Math.random() * 50 ms sleep
 ~= 250ms total runtime
```
 (more like 280ms with functional overhead)

 As you can see, you can theoretically execute 1,000 calls as fast as 100,
 provided you also increase the concurrent worker pool to 100 concurrent workers.


### Usage
 Actual usage with network latency type response time distribution would
 certainly show slightly different results.

 The test examples are void of any real work being done, and as such, the tests
 are not indicative of what actual results would show in a live environment
 under load. In general, if this package is used at all the number of
 concurrent works should probably be set to values near an instance's overall
 network bandwidth limits or cpu resources. If dispatched functions are local
 cpu intensive, it may be best to limit concurrent resources to the number of
 cpu cores available to the instance.

I have not experimented with it much beyond the examples in the test cases.
