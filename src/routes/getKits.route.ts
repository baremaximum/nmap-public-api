import { RouteOptions } from "fastify";
import { getKitsHandler } from "../handlers/getKits.handler";

export const GetKitsRoute: RouteOptions = {
  method: "GET",
  url: "/kits",
  logLevel: process.env.LOG_LEVEL,
  schema: {
    querystring: {
      required: ["lon", "lat", "radius"],
      lon: { type: "number", minValue: -180, maxValue: 180 },
      lat: { type: "number", minValue: -90, maxValue: 90 },
      radius: { type: "number", maxValue: 5000, minValue: 100 },
    },
    response: {
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
                city: "string",
                type: "string",
                coordinates: {
                  type: "array",
                  items: { type: "number" },
                },
                address: "string",
                postalZip: "string",
                country: "string",
                provinceState: "string",
              },
            },
            lastVerified: "date",
            openingHours: "string",
            organizationName: "string",
            upToDate: "boolean",
            notes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  locale: "string",
                  content: "string",
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
