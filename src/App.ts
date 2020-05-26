import fastify from "fastify";
import { Server, IncomingMessage, ServerResponse } from "http";
import { secrets } from "docker-secret";
// routes
import { GetKitsRoute } from "./routes/getKits.route";
import { HealthCheckRoute } from "./routes/healthcheck.route";
// plugins
import fastifyBlipp from "fastify-blipp";
import fastifyHelmet from "fastify-helmet";
import fastifyMongodb, { FastifyMongodbOptions } from "fastify-mongodb";
// DAO
import { Kits } from "./DAO/Kits.dao";
import { SearchRoute } from "./routes/search.route";

// extend the type to insert additional options
interface ConnectionOptions extends FastifyMongodbOptions {
  keepAlive: boolean;
}

export class App {
  server: fastify.FastifyInstance<
    Server,
    IncomingMessage,
    ServerResponse
  > = fastify({
    logger: { level: process.env.LOG_LEVEL },
    trustProxy: 1,
    caseSensitive: true,
  });
  port = process.env.PORT || "3000";
  host = process.env.HOST || "0.0.0.0";

  constructor() {}

  public setup(): void {
    try {
      this.registerPlugins();
    } catch (err) {
      this.server.log.error(`Could not register plugins. Error: ${err}`);
      process.exit(1);
    }
    this.regiserRoutes();

    // Prevent whole error stack from being sent back as response.
    this.server.setErrorHandler(function (error, request, reply) {
      if (error.validation) {
        reply.status(400).send(error);
        return;
      }
      console.error(error);
      reply.status(500).send("Server Error");
    });
  }

  private registerPlugins(): void {
    // blipp
    this.server.register(fastifyBlipp);
    // helmet
    this.server.register(fastifyHelmet, {
      noCache: false,
      referrerPolicy: true,
    });

    // mongodb
    const dbOptions: ConnectionOptions = {
      url: secrets.db_url,
      forceClose: true,
      database: "naloxone",
      keepAlive: true,
    };
    this.server.register(fastifyMongodb, dbOptions);
  }

  private regiserRoutes(): void {
    this.server.route(SearchRoute);
    this.server.route(HealthCheckRoute);
    this.server.route(GetKitsRoute);
  }

  public listen(): void {
    this.server.listen(parseInt(this.port), this.host, (err) => {
      if (err) throw err;
      this.server.blipp();
      this.injectDB();
    });
  }

  public async close(): Promise<void> {
    return this.server.close();
  }

  public injectDB(): void {
    if (!this.server.mongo.db) throw new Error("No database connection");
    const kitsColl = this.server.mongo.db.collection("kits");
    Kits.injectDB(kitsColl);
  }
}
