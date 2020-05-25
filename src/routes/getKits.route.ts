import { RouteOptions } from "fastify";
import { getKitsHandler } from "../handlers/getKits.handler";
import { KitArrayResponseSchema } from "../schemas/kitArrayResponse.schema";

export const GetKitsRoute: RouteOptions = {
  method: "GET",
  url: "/kits",
  logLevel: process.env.LOG_LEVEL,
  schema: {
    querystring: {
      required: ["lon", "lat", "radius"],
      type: "object",
      properties: {
        lon: { type: "number", minimum: -180, maximum: 180 },
        lat: { type: "number", minimum: -90, maximum: 90 },
        radius: { type: "number", minimum: 100, maximum: 3000 },
      },
    },
    response: KitArrayResponseSchema,
  },
  handler: getKitsHandler,
};
