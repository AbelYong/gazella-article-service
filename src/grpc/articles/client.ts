import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "node:path";
import { GetCategoriesRequest, GetCategoriesResponse, ArticleServiceClient } from "./types.js";

const PROTO_PATH = path.resolve(import.meta.dirname, "./article_service.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const articlePackage = protoDescriptor.article;

const client = new articlePackage.ArticleService(
  process.env["DATA_SERVICE_URL"],
  grpc.credentials.createInsecure()
) as ArticleServiceClient;

export const grpcGetCategories = (request: GetCategoriesRequest): Promise<GetCategoriesResponse> => {
  return new Promise((resolve, reject) => {
    client.GetCategories(request, (error: grpc.ServiceError | null, response: GetCategoriesResponse) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};
