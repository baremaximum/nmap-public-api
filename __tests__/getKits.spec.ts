import { Kits, Kit } from "../src/DAO/Kits.dao";
import { App } from "../src/App";
import { HTTPInjectOptions } from "fastify";
import fs from "fs";
import { parse } from "querystring";

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
      // Mock data contains 25 fake records, all within a small geographic radius.
      // The center of that radius is in the mile end area of Montreal, Canada.
      // Min value lon: 45.518733
      // Max value lon: 45.452056
      // Min value lat: -73.594177
      // Max value lat -73.582177
      data = JSON.parse(
        fs.readFileSync("./MOCK_DATA.json", { encoding: "utf-8" })
      );
      await Kits.collection.insertMany(data);
      // GeoNear query only works if there is a spatial index on the collection
      await Kits.collection.createIndex({
        "location.point.coordinates": "2dsphere",
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

        if (d < parseFloat(radius) && kit.upToDate) {
          counter++;
        }
      });

      const response = await app.server.inject(request);
      const respObj = response.json();
      expect(response.statusCode).toEqual(200);
      expect(respObj.length).toEqual(counter);

      respObj.forEach((kit: Kit) => {
        expect(kit).toHaveProperty("notes");
        expect(kit).toHaveProperty("location");

        const location = kit.location;
        const notes = kit.notes;

        // Strict null checks
        if (!(notes && location)) throw new Error();

        expect(kit).toHaveProperty("_id");
        expect(kit).toHaveProperty("lastVerified");
        expect(kit).toHaveProperty("openingHours");
        expect(kit).toHaveProperty("organizationName");
        expect(kit).toHaveProperty("upToDate");

        notes.forEach((note) => {
          expect(note).toHaveProperty("locale");
          expect(note).toHaveProperty("content");
        });

        expect(location).toHaveProperty("point");
        expect(location.point).toHaveProperty("type", "Point");
        expect(location.point).toHaveProperty("coordinates");
        expect(location.point.coordinates).toHaveProperty("lat");
        expect(location.point.coordinates).toHaveProperty("lon");
      });

      done();
    });
  });
});
