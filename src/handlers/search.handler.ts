import { FastifyRequest, FastifyReply } from "fastify";
import { ServerResponse } from "http";

export async function searchHandler(
  request: FastifyRequest,
  response: FastifyReply<ServerResponse>
): Promise<void> {}
