const worker = new Worker(new URL("./engineWorker.ts", import.meta.url), {
  type: "module",
});

worker.onmessage = (event) => {
  console.log("received:", event.data);
};

worker.postMessage({ type: "go", movetime: 1000 });
