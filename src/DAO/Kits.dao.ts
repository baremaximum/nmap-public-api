import { Collection, AggregationCursor, Cursor } from "mongodb";

export interface Location {
  point: {
    type: string; // Point. GEOjson field.
    coordinates: {
      lon: number;
      lat: number;
    };
  };
  address: string;
  city: string;
  postalZip: string;
  country: string;
  provinceState: string;
}

export interface Kit {
  _id: string;
  location: Location;
  lastVerified: Date;
  openingHours: string;
  organizationName: string;
  upToDate: boolean;
  notes?: [{ locale: string; content: string }];
}

let kits: Collection<Kit>;

export class Kits {
  constructor() {}

  public static injectDB(coll: Collection): void {
    /* Assign kits collection to variable if it is not already assigned */
    if (!kits) {
      kits = coll;
    }
  }

  public static textSearch(query: string): Cursor<Kit> {
    // Searches fields that are included in the text index of the collection.
    return kits.find({ $text: { $search: query } });
  }

  public static getByCoordinates(
    lon: number,
    lat: number,
    radiusMeters: number
  ): AggregationCursor<Kit> {
    /* Finds all kits whose location is within specified radius of the specified point.*/
    const pipeline = [
      {
        $geoNear: {
          near: { type: "Point", coordinates: [lon, lat] },
          distanceField: "dist.calculated",
          query: { upToDate: true },
          maxDistance: radiusMeters,
          spherical: true,
        },
      },
    ];
    return kits.aggregate(pipeline);
  }
  public static get collection(): Collection<Kit> {
    return kits;
  }
}
