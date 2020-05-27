import { App } from "../src/App";
import { Kits, Kit } from "../src/DAO/Kits.dao";
import { HTTPInjectOptions } from "fastify";
import { KitFaker } from "./KitFaker";

describe("/search", () => {
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
    it("Should return 400 if no string passed to query", async (done) => {
      const request: HTTPInjectOptions = {
        method: "GET",
        url: { pathname: "/search", query: {} },
      };
      const response = await app.server.inject(request);
      expect(response.statusCode).toEqual(400);
      done();
    });
  });

  describe("With data", () => {
    beforeAll(async () => {
      // let data: Kit[] = JSON.parse(
      //   fs.readFileSync("./MOCK_DATA.json", { encoding: "utf-8" })
      // );
      // // Insert mock data
      // await Kits.collection.insertMany(data);
      // // GeoNear query only works if there is a spatial index on the collection
      // await Kits.collection.createIndex({
      //   organizationName: "text",
      //   "location.address": "text",
      //   "Location.city": "text",
      //   "location.provinceState": "text",
      // });
    });

    afterAll(async () => {
      await Kits.collection.drop();
    });
    it("IS A DUMMY", async (done) => {
      done();
    });

    // it("should return correctly ordered kits", async (done) => {
    //   // Duplicate needed to get around typescript scoping issue.
    //   const jsonData = JSON.parse(
    //     fs.readFileSync("./MOCK_DATA.json", { encoding: "utf-8" })
    //   );

    //   const name = jsonData[0].organizationName;
    //   const request: HTTPInjectOptions = {
    //     method: "GET",
    //     url: { pathname: "/search", query: { query: name } },
    //   };
    //   const response = await app.server.inject(request);
    //   const data = response.json();
    //   expect(response.statusCode).toEqual(200);
    //   expect(data[0].organizationName).toEqual(name);
    //   done();
    // });

    // it("should ignore diacritics when performing text search", async (done) => {
    //   const request: HTTPInjectOptions = {
    //     method: "GET",
    //     url: { pathname: "/search", query: { query: "Quebec" } },
    //   };
    //   const response = await app.server.inject(request);
    //   const data = response.json();

    //   expect(response.statusCode).toEqual(200);
    //   expect(data.length).toEqual(14);
    //   done();
    // });
  });
});
