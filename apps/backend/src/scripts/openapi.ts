import Fastify from "fastify";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import app from "../app.ts";

const fastify = Fastify({ logger: false });

try {
  fastify.register(app);

  await fastify.ready();

  const response = await fastify.inject("/docs/json");
  if (response.statusCode !== 200) {
    throw new Error(
      `Failed to generate OpenAPI document: ${response.statusCode}`,
    );
  }

  const output = resolve(process.cwd(), "../../openapi.json");
  await writeFile(output, `${JSON.stringify(response.json(), null, 2)}\n`);

  console.log(`OpenAPI document written to ${output}`);
} finally {
  await fastify.close();
}
