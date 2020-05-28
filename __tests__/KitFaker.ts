import { JSONSchema } from "fastify";
import { KitArrayResponseSchema } from "../src/schemas/kitArrayResponse.schema";
import { Kit } from "../src/DAO/Kits.dao";
// library doesn't have a types file. need to use CommonJS style import.
const jsf = require("json-schema-faker");

export class KitFaker {
  /*
   * Creates a JSON array of fake data for testing purposes.
   * Uses the api's response JSON schema as a base and appends
   * faker functions to the properties that require it.
   *
   */

  private static schema: any = Object.assign({}, KitArrayResponseSchema[200]);

  public static async data(): Promise<Kit[]> {
    // json-schema-faker requires this setup.
    jsf.extend("faker", () => require("faker"));
    const data = await jsf.resolve(this.addFakers);
    // Generate our own coordinates due to bug in faker.
    data.map((item: Kit, index: number) => {
      // Some of the fake data should be expired.
      if (index < 3) {
        let date = new Date();
        date.setMonth(date.getMonth() - 3);
        item.expires = date;
      }
      item.location.point.coordinates = KitFaker.randCoords;
      return item;
    });
    return data;
  }

  private static get addFakers(): JSONSchema {
    const props = this.schema.items.properties;
    this.schema.minItems = 30;
    const location = props.location.properties;
    const point = location.point.properties;

    // Make expiration date in the future
    const newDate = new Date();
    newDate.setMonth(newDate.getMonth() + 1);

    props.expires.pattern = newDate.toDateString();
    props._id.faker = "random.uuid";
    props.organizationName.faker = "company.companyName";
    location.provinceState.pattern = "Québec"; // Include accent to test that search ignores diacritics
    location.address.faker = "address.streetAddress";
    location.city.faker = "address.city";
    location.country.pattern = "Canada";
    location.postalZip.faker = "address.zipCode";
    point.type.pattern = "Point";
    // Faker coordinates is bugged. Range input doesn't do anything.
    // coordinates.lon.faker = { "address.longitude": [45.52056, 45.518733] };
    // coordinates.lat.faker = { "address.latitude": [-73.582177, -73.594177] };
    return this.schema;
  }

  public static get randCoords(): { lon: number; lat: number } {
    return {
      lon: Math.random() * (45.52056 - 45.518733) + 45.518733,
      lat: Math.random() * (-73.582177 + 73.594177) - 73.594177,
    };
  }

  private static makeTypesObj(properties: { [key: string]: any }) {
    /*
     * Create a set of key, value pairs that describes the expected properties
     * of an object, and the expected type of each property.
     *
     * Used in tests to verify that endpoints return data with correct structure.
     */
    let tar = {};
    for (let prop in properties) {
      tar = { ...tar, ...{ [prop]: properties[prop].type } };
    }
    return tar;
  }

  public static get kitTypesObject(): { [key: string]: string } {
    const properties = this.schema.items.properties;
    return this.makeTypesObj(properties);
  }

  public static get locationTypesObject(): { [key: string]: string } {
    const properties = this.schema.items.properties.location.properties;
    return this.makeTypesObj(properties);
  }

  public static get notesTypesObject(): { [key: string]: string } {
    const properties = this.schema.items.properties.notes.items.properties;
    return this.makeTypesObj(properties);
  }
}
