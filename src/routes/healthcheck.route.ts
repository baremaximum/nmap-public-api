import { RouteOptions } from "fastify";

export const HealthCheckRoute: RouteOptions = {
  method: "GET",
  logLevel: process.env.LOG_LEVEL,
  url: "/healthz",
  schema: {
    response: {
      200: {
        type: "null",
      },
    },
  },
  handler(request, response) {
    response.send();
  },
};
