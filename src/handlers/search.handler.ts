import { FastifyRequest, FastifyReply } from "fastify";
import { ServerResponse } from "http";
import { Kits } from "../DAO/Kits.dao";

export async function searchHandler(
  request: FastifyRequest,
  response: FastifyReply<ServerResponse>
): Promise<void> {
  const { search } = request.query;
  try {
    const result = await Kits.textSearch(search).toArray();

    if (!result) {
      response.status(404).send("No results matched specified query");
    } else {
      response.status(200).send(result);
    }
  } catch (err) {
    // Mongodb errors
    console.error(err);
    response.status(500).send("Server error");
  }
}
