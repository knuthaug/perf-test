import fastify from "fastify";
import fastifyPrintRoutes from "fastify-print-routes";
import fs from "fs";
const server = fastify({ logger: true });
await server.register(fastifyPrintRoutes);

server.get("/style.css", async (request, reply) => {
  const { delay } = request.query;
  if (delay) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  reply.type("text/css").code(200);
  reply.send("body { background-color: white; }");
});

server.get("/image.jpg", async (request, reply) => {
  const { delay } = request.query;
  if (delay) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  } else {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  if (!fs.existsSync(`./img.jpg`)) {
    reply.code(404).send("File not found");
    return;
  }

  const stream = fs.createReadStream(`./img.jpg`);
  const buffer = await stream2buffer(stream);
  reply.code(200).type("image/jpeg").send(buffer);
});

server.get("/:file", (request, reply) => {
  const { file } = request.params;

  if (!fs.existsSync(`./${file}`)) {
    reply.code(404).send("File not found");
    return;
  }
  const stream = fs.createReadStream(`./${file}`);
  reply.type("text/html").send(stream);
});

server.get("/index.css", (request, reply) => {
  const stream = fs.createReadStream(`./index.css`);
  reply.type("text/css").send(stream);
});

server.get("/", (request, reply) => {
  const stream = fs.createReadStream(`./index.html`);
  reply.type("text/html").send(stream);
});

server.get("/script.js", async (request, reply) => {
  const { delay, clientdelay } = request.query;

  if (delay) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  reply.type("text/javascript").code(200);
  reply.send(`
    function blockPause(milliseconds) {
  const start = performance.now();
  let lastCheck = start;
  let lastTime = 0;
  while (performance.now() - start < milliseconds) {
    // Log once a second
    lastTime = performance.now() - lastCheck;
    if (lastTime >= 1000) {
    console.log(
        "Still blocking " + Math.round(performance.now() - start, 0) + " ms out of " + milliseconds + "ms");
      lastCheck = performance.now();
    }
  }
}
blockPause(${clientdelay ?? 0});  
`);
});

const start = async () => {
  try {
    await server.listen({ port: 4000 });
    console.log("Server is running at http://localhost:4000");
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

function stream2buffer(stream) {
  return new Promise((resolve, reject) => {
    const _buf = [];

    stream.on("data", (chunk) => _buf.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(_buf)));
    stream.on("error", (err) => reject(err));
  });
}

start();
