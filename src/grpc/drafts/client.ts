import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "node:path";
import { SubmitDraftRequest, SubmitDraftResponse, DraftServiceClient } from "./types.js";

const PROTO_PATH = path.resolve(import.meta.dirname, "./draft_service.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const draftPackage = protoDescriptor.draft;

const client = new draftPackage.DraftService(
  process.env["DATA_SERVICE_URL"],
  grpc.credentials.createInsecure()
) as DraftServiceClient;

export const grpcSubmitDraft = (request: SubmitDraftRequest): Promise<SubmitDraftResponse> => {
  return new Promise((resolve, reject) => {
    client.SubmitDraft(request, (error: grpc.ServiceError | null, response: SubmitDraftResponse) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};
