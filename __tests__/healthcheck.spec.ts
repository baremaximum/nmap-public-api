import { App } from "../src/App";

describe("/healthz", () => {
  let app: App;

  beforeAll(async () => {
    app = new App();
    app.setup();
    await app.server.ready();
  });

  afterAll(async () => {
    app.server.close();
  });

  it("GET should return empty response with status 200", async (done) => {
    const response = await app.server.inject({
      method: "GET",
      url: "/healthz",
    });
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual("");
    done();
  });
});
