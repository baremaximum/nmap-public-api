import { FastifyRequest, FastifyReply } from "fastify";
import { ServerResponse } from "http";
import { Kits } from "../DAO/Kits.dao";

export async function searchHandler(
  request: FastifyRequest,
  response: FastifyReply<ServerResponse>
): Promise<void> {
  const { query } = request.query;
  try {
    const result = await Kits.textSearch(query).toArray();
    if (result.length > 0) {
      response.status(200).send(result);
    } else {
      response.status(404).send("No results matched specified query");
    }
  } catch (err) {
    // Mongodb errors
    console.error(err);
    response.status(500).send("Server error");
  }
}
