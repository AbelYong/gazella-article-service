import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "node:path";
import { SubmitDraftRequest, SubmitDraftResponse, DraftServiceClient, UpdateDraftRequest, UpdateDraftResponse, PublishDraftRequest, PublishDraftResponse, GetDraftRequest, GetDraftResponse } from "./types.js";

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

export class DraftGrpcClient {
  private readonly client: DraftServiceClient;

  constructor(dataServiceUrl: string) {
    this.client = new draftPackage.DraftService(
      dataServiceUrl,
      grpc.credentials.createInsecure()
    ) as DraftServiceClient;
  }

  public getDraft(request: GetDraftRequest): Promise<GetDraftResponse> {
    return new Promise((resolve, reject) => {
      this.client.GetDraft(request, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }

  public submitDraft(request: SubmitDraftRequest): Promise<SubmitDraftResponse> {
    return new Promise((resolve, reject) => {
      this.client.SubmitDraft(request, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }

  public updateDraft(request: UpdateDraftRequest): Promise<UpdateDraftResponse> {
    return new Promise((resolve, reject) => {
      this.client.UpdateDraft(request, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }

  public publishDraft(request: PublishDraftRequest) : Promise<PublishDraftResponse> {
    return new Promise((resolve, reject) => {
      this.client.PublishDraft(request, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }
}
