import { Kits } from "../src/DAO/Kits.dao";
import { App } from "../src/App";
import { HTTPInjectOptions } from "fastify";

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
      console.log(response.payload);
      expect(response.statusCode).toEqual(400);
      done();
    });
  });
});
