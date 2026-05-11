import * as grpc from '@grpc/grpc-js';
import { ServiceDomainError } from '../errors/error.js';

export const INVALID_ARGUMENT = "invalid_argument";
export const DB_UNAVAILABLE = "db_unavailable";
export const INVALID_OPERATION = "invalid_operation";
export const NOT_FOUND = "not_found";

export async function executeGrpcCall<T>(grpcPromise: Promise<T>): Promise<T> {
  try {
    return await grpcPromise;
  } catch (err: any) {
    const error = err as grpc.ServiceError;

    const domainCodeMeta = error.metadata?.get("x-gazella-error");
    const isDomainError = domainCodeMeta && domainCodeMeta.length > 0;

    if (isDomainError) {
      const domainCode = domainCodeMeta[0] as string;

      const code = getErrorCode(domainCode);
      const statusCode = getStatusCode(domainCode);

      throw new ServiceDomainError(domainCode, error.details, code, statusCode);
    }

    console.error(`[PROTOCOL FAULT] gRPC Code: ${error.code} | Details: ${error.details}`);

    const message = error.code === grpc.status.INTERNAL ?
      "Article data service failed to respond due to an internal error" :
      "An internal infrastructure error occurred while communicating with Article Data Service";
    
    throw new Error(message);
  }
}

function getErrorCode(domainCode: string) : string {
  let code: string;

  switch (domainCode) {
    case INVALID_ARGUMENT:
      code = "INVALID_ARGUMENT";
      break;
    case INVALID_OPERATION:
      code = "INVALID_OPERATION"
      break;
    case DB_UNAVAILABLE:
      code = "DB_UNAVAILABLE"
      break;
    case NOT_FOUND:
      code = "NOT_FOUND";
      break;
    default:
      code = domainCode;
  }

  return code;
}

function getStatusCode(domainCode: string) : number {
  let statusCode: number;

  switch (domainCode) {
    case INVALID_ARGUMENT:
      statusCode = 400;
      break;
    case INVALID_OPERATION:
      statusCode = 422
      break;
    case DB_UNAVAILABLE:
      statusCode = 503
      break;
    case NOT_FOUND:
      statusCode = 404;
      break;
    default:
      statusCode = 500;
  }

  return statusCode;
}

export type ExecuteCall = (<T>(promise: Promise<T>) => Promise<T>);
