# bucket_queue 

> a typescript bucket queue implementation

## purpose

maintain _n_ concurrent functional processes

This library aims to provide a convenient way to execute large numbers of
concurrent processes. This library facilitates the maintenance of _n_
concurrent processes, refilling the queue as soon as any asynchronous process
is resolved.

As opposed to `Promise.all`, which waits for the slowest Promise to resolve
before finishing, `bucket_queue` will maintain _n_ processes, guaranteeing
fastest theoretical execution of the overall number of process to execute.
