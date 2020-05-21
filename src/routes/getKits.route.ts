import { RouteOptions } from "fastify";
import { getKitsHandler } from "../handlers/getKits.handler";

export const KitsRoute: RouteOptions = {
  method: "GET",
  url: "/kits",
  logLevel: process.env.LOG_LEVEL,
  schema: {
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
