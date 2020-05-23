import { Kits } from "../src/DAO/Kits.dao";
import { App } from "../src/App";
import { HTTPInjectOptions } from "fastify";
import fs from "fs";

describe("/kits", () => {
  let app = new App();

  beforeAll(async () => {
    await app.setup();
    await app.server.ready();
    app.injectDB();
  });

  afterAll(async () => {
    await app.server.close();
    Kits.collection().drop();
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
          query: { lat: "50", lon: "180", radius: "1501" },
        },
      };

      const response = await app.server.inject(request);
      expect(response.statusCode).toEqual(400);
      expect(JSON.parse(response.payload).message).toEqual(
        "querystring.radius should be <= 1500"
      );
      done();
    });
  });

  describe("tests with data", () => {});
});
