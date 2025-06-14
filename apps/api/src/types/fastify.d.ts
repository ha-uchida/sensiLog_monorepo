import { FastifyRequest, FastifyReply } from 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id: string;
      email: string;
      riotPuuid?: string;
      gameName?: string;
      tagLine?: string;
      isAdmin: boolean;
    };
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    generateToken: (payload: any) => string;
    verifyToken: (token: string) => any;
  }
}