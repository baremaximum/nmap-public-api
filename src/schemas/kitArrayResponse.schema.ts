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
      properties: {
        _id: { type: "string" },
        location: {
          type: "object",
          properties: {
            city: { type: "string" },
            point: {
              type: "object",
              properties: {
                type: { type: "string" },
                coordinates: {
                  type: "object",
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
