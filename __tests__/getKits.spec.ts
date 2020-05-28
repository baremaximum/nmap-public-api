import { Kits, Kit } from "../src/DAO/Kits.dao";
import { App } from "../src/App";
import { HTTPInjectOptions } from "fastify";
import { KitFaker } from "./KitFaker";

describe("/kits", () => {
  let app = new App();

  beforeAll(async () => {
    app.setup();
    await app.server.ready();
    app.injectDB();
  });

  afterAll(async () => {
    await app.server.close();
    Kits.collection.drop();
  });

  describe("Query validation", () => {
    it("Should respond with an error if lat is missing from query", async (done) => {
      const request: HTTPInjectOptions = {
        method: "GET",
        url: { pathname: "/kits", query: { lon: "50", radius: "1000" } },
      };

      const response = await app.server.inject(request);
      expect(response.statusCode).toEqual(400);
      expect(JSON.parse(response.payload).message).toEqual(
        "querystring should have required property 'lat'"
      );
      done();
    });

    it("Should respond with an error if lon is missing from query", async (done) => {
      const request: HTTPInjectOptions = {
        method: "GET",
        url: { pathname: "/kits", query: { lat: "50", radius: "1000" } },
      };

      const response = await app.server.inject(request);
      expect(response.statusCode).toEqual(400);
      expect(JSON.parse(response.payload).message).toEqual(
        "querystring should have required property 'lon'"
      );
      done();
    });

    it("Should respond with an error if radius is missing from query", async (done) => {
      const request: HTTPInjectOptions = {
        method: "GET",
        url: { pathname: "/kits", query: { lon: "50", lat: "50" } },
      };

      const response = await app.server.inject(request);
      expect(response.statusCode).toEqual(400);
      expect(JSON.parse(response.payload).message).toEqual(
        "querystring should have required property 'radius'"
      );
      done();
    });

    it("Should respond with an error if lat less than minimum value", async (done) => {
      const request: HTTPInjectOptions = {
        method: "GET",
        url: {
          pathname: "/kits",
          query: { lat: "-91", lon: "50", radius: "1000" },
        },
      };

      const response = await app.server.inject(request);
      expect(response.statusCode).toEqual(400);
      expect(JSON.parse(response.payload).message).toEqual(
        "querystring.lat should be >= -90"
      );
      done();
    });

    it("Should respond with an error if lon less than minimum value", async (done) => {
      const request: HTTPInjectOptions = {
        method: "GET",
        url: {
          pathname: "/kits",
          query: { lat: "50", lon: "-181", radius: "1000" },
        },
      };

      const response = await app.server.inject(request);
      expect(response.statusCode).toEqual(400);
      expect(JSON.parse(response.payload).message).toEqual(
        "querystring.lon should be >= -180"
      );
      done();
    });

    it("Should respond with an error if radius less than minimum value", async (done) => {
      const request: HTTPInjectOptions = {
        method: "GET",
        url: {
          pathname: "/kits",
          query: { lat: "50", lon: "50", radius: "99" },
        },
      };

      const response = await app.server.inject(request);
      expect(response.statusCode).toEqual(400);
      expect(JSON.parse(response.payload).message).toEqual(
        "querystring.radius should be >= 100"
      );
      done();
    });

    it("Should respond with an error if lat more than maximum value", async (done) => {
      const request: HTTPInjectOptions = {
        method: "GET",
        url: {
          pathname: "/kits",
          query: { lat: "91", lon: "50", radius: "1000" },
        },
      };

      const response = await app.server.inject(request);
      expect(response.statusCode).toEqual(400);
      expect(JSON.parse(response.payload).message).toEqual(
        "querystring.lat should be <= 90"
      );
      done();
    });

    it("Should respond with an error if lon more than maximum value", async (done) => {
      const request: HTTPInjectOptions = {
        method: "GET",
        url: {
          pathname: "/kits",
          query: { lat: "50", lon: "181", radius: "1000" },
        },
      };

      const response = await app.server.inject(request);
      expect(response.statusCode).toEqual(400);
      expect(JSON.parse(response.payload).message).toEqual(
        "querystring.lon should be <= 180"
      );
      done();
    });

    it("Should respond with an error if radius more than maximum value", async (done) => {
      const request: HTTPInjectOptions = {
        method: "GET",
        url: {
          pathname: "/kits",
          query: { lat: "50", lon: "180", radius: "3001" },
        },
      };

      const response = await app.server.inject(request);
      expect(response.statusCode).toEqual(400);
      expect(JSON.parse(response.payload).message).toEqual(
        "querystring.radius should be <= 3000"
      );
      done();
    });
  });

  describe("tests with data", () => {
    let data: Kit[];

    beforeAll(async () => {
      data = await KitFaker.data();
      // Insert fake data into DB.
      await Kits.collection.insertMany(data);
      // GeoNear query only works if there is a spatial index on the collection
      await Kits.collection.createIndex({
        "location.point.coordinates": "2dsphere",
        expires: 1,
      });
    });

    afterAll(async () => {
      await Kits.collection.drop();
    });

    it("Valid request should correct number or results with all expected fields", async (done) => {
      const lat = "-73.59";
      const lon = "45.52";
      const radius = "3000";
      const request: HTTPInjectOptions = {
        method: "GET",
        url: {
          pathname: "/kits",
          query: { lon: lon, lat: lat, radius: radius },
        },
      };
      const lat1 = parseFloat(lat);
      const lon1 = parseFloat(lon);

      // Count the number of docs in the dataset that should be returned.
      let counter = 0;

      data.forEach((kit: Kit) => {
        const lat2 = kit.location.point.coordinates.lat;
        const lon2 = kit.location.point.coordinates.lon;

        const R = 6371e3; // earth raidus in metres
        const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;

        const a =
          Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const d = R * c; // in metres

        if (
          d < parseFloat(radius) &&
          new Date(kit.expires).getTime() > Date.now()
        ) {
          counter++;
        }
      });

      // Test that respnse had right status code and number of items.
      const response = await app.server.inject(request);
      expect(response.statusCode).toEqual(200);
      const respObj = response.json();
      // First 3 fake records are expired.
      expect(respObj.length).toEqual(data.length - 3);
      expect(respObj.length).toEqual(counter);

      // Test that each item in the response had the required propreties,
      // and values were of correct type
      respObj.forEach((kit: any) => {
        for (let prop in KitFaker.kitTypesObject) {
          expect(kit.hasOwnProperty(prop)).toBe(true);

          if (KitFaker.kitTypesObject[prop] !== "array") {
            expect(typeof kit[prop]).toEqual(KitFaker.kitTypesObject[prop]);
          } else {
            expect(kit[prop] instanceof Array).toBe(true);
          }
        }

        for (let locProp in KitFaker.locationTypesObject) {
          expect(kit.location.hasOwnProperty(locProp)).toBe(true);
          expect(typeof kit.location[locProp]).toEqual(
            KitFaker.locationTypesObject[locProp]
          );
        }

        for (let noteProp in KitFaker.notesTypesObject) {
          kit.notes.forEach((note: any) => {
            expect(note.hasOwnProperty(noteProp)).toBe(true);
            expect(typeof note[noteProp]).toEqual(
              KitFaker.notesTypesObject[noteProp]
            );
          });
        }
      });

      done();
    });

    it("should return with 404 status if query is valid, but no kits nearby", async (done) => {
      // Query params must be outside of min/max values set in data faker.
      const request: HTTPInjectOptions = {
        method: "GET",
        url: {
          pathname: "/kits",
          query: { lon: "50", lat: "50", radius: "2000" },
        },
      };

      const response = await app.server.inject(request);
      expect(response.statusCode).toEqual(404);
      expect(response.body).toEqual(
        "There are no kits within the specified radius of that location."
      );
      done();
    });

    it("Should return a server error if an exception occurs", async (done) => {
      // Fake a mongodb error
      const mockGet = jest.spyOn(Kits, "getByCoordinates");
      mockGet.mockImplementation(() => {
        throw new Error("Fake error");
      });
      const lat = "-73.59";
      const lon = "45.52";
      const radius = "3000";
      const request: HTTPInjectOptions = {
        method: "GET",
        url: {
          pathname: "/kits",
          query: { lon: lon, lat: lat, radius: radius },
        },
      };
      const response = await app.server.inject(request);
      expect(response.statusCode).toEqual(500);
      expect(response.body).toEqual("Server error");
      done();
    });
  });
});
