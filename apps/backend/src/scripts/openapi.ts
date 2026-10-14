import Fastify from "fastify";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import app from "../app.ts";

const fastify = Fastify({ logger: false });

try {
  await app(fastify, {});
  await fastify.ready();

  const contractDirectory = resolve(process.cwd(), "./contract");
  const openapiPath = resolve(contractDirectory, "openapi.json");
  const document = fastify.swagger();

  await mkdir(contractDirectory, { recursive: true });
  await writeFile(openapiPath, `${JSON.stringify(document, null, 2)}\n`);

  console.log(`OpenAPI document written to ${openapiPath}`);
} finally {
  await fastify.close();
}
