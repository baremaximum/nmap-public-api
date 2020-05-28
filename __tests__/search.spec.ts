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
    let data: Kit[];

    beforeAll(async () => {
      data = await KitFaker.data();
      // Insert mock data
      await Kits.collection.insertMany(data);
      // GeoNear query only works if there is a spatial index on the collection
      await Kits.collection.createIndex({
        organizationName: "text",
        "location.address": "text",
        "Location.city": "text",
        "location.provinceState": "text",
      });
    });

    afterAll(async () => {
      await Kits.collection.drop();
    });

    it("should return correctly ordered kits", async (done) => {
      const name = data[0].organizationName;
      const request: HTTPInjectOptions = {
        method: "GET",
        url: { pathname: "/search", query: { query: name } },
      };
      const response = await app.server.inject(request);
      expect(response.statusCode).toEqual(200);
      const respData = response.json();
      // If search results are correctly ordered, first result should
      // be the one that the query was copied from.
      expect(respData[0].organizationName).toEqual(name);

      // Test that each item in the response had the required propreties,
      // and values were of correct type
      respData.forEach((kit: any) => {
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

    it("should ignore diacritics when performing text search", async (done) => {
      const request: HTTPInjectOptions = {
        method: "GET",
        url: { pathname: "/search", query: { query: "Quebec" } },
      };
      const response = await app.server.inject(request);
      expect(response.statusCode).toEqual(200);
      const data = response.json();
      expect(data.length > 0).toBe(true);
      done();
    });

    it("Should return a server error if an exception occurs", async (done) => {
      // Fake a mongodb error
      const mockGet = jest.spyOn(Kits, "textSearch");
      mockGet.mockImplementation(() => {
        throw new Error("Fake error");
      });
      const request: HTTPInjectOptions = {
        method: "GET",
        url: {
          pathname: "/search",
          query: { query: "Quebec" },
        },
      };
      const response = await app.server.inject(request);
      expect(response.statusCode).toEqual(500);
      expect(response.body).toEqual("Server error");
      done();
    });
  });
});
