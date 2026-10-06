import fastifyEnv from "@fastify/env";
import fp from "fastify-plugin";
import z from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.string(),
});

declare module "fastify" {
  interface FastifyInstance {
    env: z.infer<typeof EnvSchema>;
  }
}
export default fp(async function envPlugin(fastify, _options) {
  // Load environment variables from .env.local file
  await fastify.register(fastifyEnv, {
    dotenv: {
      path: "./.env.local",
    },
    confKey: "env",
    schema: EnvSchema.toJSONSchema({ target: "draft-07" }),
  });
});
