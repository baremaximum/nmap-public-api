import { RouteOptions } from "fastify";
import { searchHandler } from "../handlers/search.handler";
import { KitArrayResponseSchema } from "../schemas/kitArrayResponse.schema";

export const SearchRoute: RouteOptions = {
  method: "GET",
  url: "/search",
  logLevel: process.env.LOG_LEVEL,
  schema: {
    querystring: {
      required: ["query"],
      type: "object",
      properties: {
        query: { type: "string" },
      },
    },
    response: KitArrayResponseSchema,
  },
  handler: searchHandler,
};
