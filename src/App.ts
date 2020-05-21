import fastify from "fastify";
import { Server, IncomingMessage, ServerResponse } from "http";
import { secrets } from "docker-secret";
// routes
import { HealthCheckRoute } from "./routes/healthcheck.route";
// plugins
import fastifyBlipp from "fastify-blipp";
import fastifyHelmet from "fastify-helmet";
import fastifyMongodb from "fastify-mongodb";
import fastifyFormBody from "fastify-formbody";
// DAO
import { Kits } from "./DAO/Kits.dao";

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

    try {
      this.regiserRoutes();
    } catch (err) {
      this.server.log.error(`Could not register routes. Error: ${err}`);
      process.exit(1);
    }
  }

  public registerPlugins(): void {
    // form body
    this.server.register(fastifyFormBody);
    // blipp
    this.server.register(fastifyBlipp);
    // helmet
    this.server.register(fastifyHelmet, {
      noCache: false,
      referrerPolicy: true,
    });
    // mongodb
    this.server.register(fastifyMongodb, {
      forceClose: true,
      url: secrets.db_url,
      database: "naloxone",
    });
  }

  public regiserRoutes(): void {
    this.server.route(HealthCheckRoute);
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
    // This typeguard is just to please typescript compiler.
    if (!this.server.mongo.db) throw new Error("No database connection");
    const kitsColl = this.server.mongo.db.collection("kits");
    Kits.injectDB(kitsColl);
  }
}
