export const KitArrayResponseSchema = {
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
      required: [
        "_id",
        "location",
        "lastVerified",
        "opensAt",
        "closesAt",
        "openOn",
        "expires",
        "organizationName",
        "notes",
      ],
      properties: {
        _id: { type: "string" },
        location: {
          type: "object",
          required: [
            "address",
            "postalZip",
            "country",
            "provinceState",
            "point",
            "city",
          ],
          properties: {
            city: { type: "string" },
            point: {
              type: "object",
              required: ["type", "coordinates"],
              properties: {
                type: { type: "string" },
                coordinates: {
                  type: "object",
                  required: ["lon", "lat"],
                  properties: {
                    lon: { type: "number", minimum: -90, maximum: 90 },
                    lat: { type: "number", minimum: -180, maximum: 180 },
                  },
                },
              },
            },
            address: { type: "string" },
            postalZip: { type: "string" },
            country: { type: "string" },
            provinceState: { type: "string" },
          },
        },
        lastVerified: { type: "string", format: "date-time" },
        opensAt: { type: "string", format: "time" },
        closesAt: { type: "string", format: "time" },
        openOn: {
          type: "array",
          items: {
            type: "integer",
            minItems: 1,
            maxItems: 7,
            minimum: 0,
            maximum: 6,
          },
        },
        expires: { type: "string", format: "date-time" },
        organizationName: { type: "string" },
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
};
