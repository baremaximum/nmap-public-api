import { RouteOptions } from "fastify";
import { getKitsHandler } from "../handlers/getKits.handler";

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
        radius: { type: "number", minimum: 100, maximum: 1500 },
      },
    },
    response: {
      400: {
        type: "object",
      },
      404: {
        type: "string",
      },
      500: {
        type: "string",
      },
      200: {
        type: "array",
        items: {
          type: "object",
          properties: {
            location: {
              type: "object",
              properties: {
                city: { type: "string" },
                coordinates: {
                  type: "array",
                  items: { type: "number" },
                },
                address: { type: "string" },
                postalZip: { type: "string" },
                country: { type: "string" },
                provinceState: { type: "string" },
              },
            },
            lastVerified: { type: "string", format: "date-time" },
            openingHours: { type: "string" },
            organizationName: { type: "string" },
            upToDate: { type: "boolean" },
            notes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  locale: { type: "string" },
                  content: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
  },
  handler: getKitsHandler,
};
