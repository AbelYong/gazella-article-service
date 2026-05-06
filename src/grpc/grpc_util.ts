import * as grpc from '@grpc/grpc-js';
import { ServiceDomainError } from '../errors/error.js';

export const INVALID_ARGUMENT = "invalid_argument";
export const DB_UNAVAILABLE = "db_unavailable";

export async function executeGrpcCall<T>(grpcPromise: Promise<T>): Promise<T> {
  try {
    return await grpcPromise;
  } catch (err: any) {
    const error = err as grpc.ServiceError;

    const domainCodeMeta = error.metadata?.get("x-gazella-error");
    const isDomainError = domainCodeMeta && domainCodeMeta.length > 0;

    if (isDomainError) {
      const domainCode = domainCodeMeta[0] as string;

      throw new ServiceDomainError(domainCode, error.details);
    }

    console.error(`[PROTOCOL FAULT] gRPC Code: ${error.code} | Details: ${error.details}`);

    const message = error.code === grpc.status.INTERNAL ?
      "Article data service failed to respond due to an internal error" :
      "An internal infrastructure error occurred while communicating with Article Data Service";
    
    throw new Error(message);
  }
}
