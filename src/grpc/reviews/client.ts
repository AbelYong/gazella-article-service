import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "node:path";
import { GetArticlesPendingReviewRequest, GetArticlesPendingReviewResponse, ApproveArticleRequest, ApproveArticleResponse, RejectArticleRequest, RejectArticleResponse, ReviewServiceClient } from "./types.js";

const PROTO_PATH = path.resolve(import.meta.dirname, "./review_service.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const reviewPackage = protoDescriptor.review;

export class ReviewGrpcClient {
  private readonly client: ReviewServiceClient;

  constructor(dataServiceUrl: string) {
    this.client = new reviewPackage.ReviewService(
      dataServiceUrl,
      grpc.credentials.createInsecure()
    ) as ReviewServiceClient;
  }

  public getArticlesPendingReview(request: GetArticlesPendingReviewRequest): Promise<GetArticlesPendingReviewResponse> {
    return new Promise((resolve, reject) => {
      this.client.GetArticlesPendingReview(request, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }

  public approveArticle(request: ApproveArticleRequest): Promise<ApproveArticleResponse> {
    return new Promise((resolve, reject) => {
      this.client.ApproveArticle(request, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }

  public rejectArticle(request: RejectArticleRequest): Promise<RejectArticleResponse> {
    return new Promise((resolve, reject) => {
      this.client.RejectArticle(request, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }
}
