import Fastify from "fastify";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import app from "../app.ts";

const fastify = Fastify({ logger: false });

try {
  await app(fastify, {});
  await fastify.ready();

  const generatedDirectory = resolve(process.cwd(), "./generated");
  const openapiPath = resolve(generatedDirectory, "openapi.json");
  const document = fastify.swagger();

  await mkdir(generatedDirectory, { recursive: true });
  await writeFile(openapiPath, `${JSON.stringify(document, null, 2)}\n`);

  console.log(`OpenAPI document written to ${openapiPath}`);
} finally {
  await fastify.close();
}
