import { ServerResponse } from "http";
import { Kits } from "../DAO/Kits.dao";
import { FastifyRequest, FastifyReply } from "fastify";

export async function getKitsHandler(
  request: FastifyRequest,
  response: FastifyReply<ServerResponse>
) {
  // latitude, longitude, and radius extracted from request query
  const { lon, lat, radius } = request.query;
  try {
    const kits = await Kits.getByCoordinates(lon, lat, radius).toArray();
    // If there are kits, send them.
    if (kits.length > 0) {
      response.status(200).send(kits);
    } else {
      response
        .status(404)
        .send(
          "There are no kits within the specified radius of that location."
        );
    }
  } catch (e) {
    // Catch and log mongodb errors.
    console.error(e);
    response.status(500).send("Server error");
  }
}
