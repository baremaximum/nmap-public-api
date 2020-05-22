import { ServerResponse } from "http";
import { Kits } from "../DAO/Kits.dao";
import { FastifyRequest, FastifyReply } from "fastify";

export async function getKitsHandler(
  this: any, // Need to fool typscript compiler. Gives access to logger on the App object.
  request: FastifyRequest,
  response: FastifyReply<ServerResponse>
) {
  // latitude, longitude, and radius extracted from request query
  const { lon, lat, radiusMeters } = request.query;
  try {
    const kits = await Kits.getByCoordinates(lon, lat, radiusMeters).toArray();
    // If there are kits, send them.
    if (kits.length > 0) {
      response.status(200).send(kits);
    } else {
      response
        .status(404)
        .send("There are no kits within 500 meters of that location.");
    }
  } catch (e) {
    // Catch and log mongodb errors.
    this.server.log.error(e);
    response.status(500).send("Server error");
  }
}
