import { JSONSchema } from "fastify";
import { KitArrayResponseSchema } from "../src/schemas/kitArrayResponse.schema";

const jsf = require("json-schema-faker");

export class KitFaker {
  /*
   * Creates a JSON array of fake data for testing purposes.
   * Uses the api's response JSON schema as a base and appends
   * faker functions to the properties that require it.
   *
   */

  private static schema: any = Object.assign({}, KitArrayResponseSchema[200]);

  public static get data() {
    jsf.extend("faker", () => require("faker"));
    return jsf.generate(this.addFakers);
  }

  private static get addFakers(): JSONSchema {
    const props = this.schema.items.properties;

    props.organizationName.faker = "company.companyName";
    return this.schema;
  }
}
