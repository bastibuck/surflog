import type { AutoloadPluginOptions } from "@fastify/autoload";
import AutoLoad from "@fastify/autoload";
import type { FastifyPluginAsync, FastifyServerOptions } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export interface AppOptions
  extends FastifyServerOptions, Partial<AutoloadPluginOptions> {}
const appDirectory = dirname(fileURLToPath(import.meta.url));

// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {};

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts,
): Promise<void> => {
  // setup serializers and validators for zod schemas
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  void fastify.register(AutoLoad, {
    dir: join(appDirectory, "plugins"),
    options: opts,
  });

  // This loads all plugins defined in routes
  void fastify.register(AutoLoad, {
    dir: join(appDirectory, "routes"),
    options: opts,
  });

  // This loads all plugins defined in modules
  void fastify.register(AutoLoad, {
    dir: join(appDirectory, "modules"),
    options: opts,
  });
};

export default app;
export { app, options };
