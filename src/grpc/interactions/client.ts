import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "node:path";
import { 
  CommentArticleRequest, 
  CommentArticleResponse, 
  DeleteCommentRequest, 
  DeleteCommentResponse, 
  GetCommentsRequest, 
  GetCommentsResponse, 
  LikeArticleRequest,
  LikeArticleResponse,
  RevokeLikeRequest,
  RevokeLikeResponse,
  InteractionServiceClient 
} from "./types.js";

const PROTO_PATH = path.resolve(import.meta.dirname, "./interaction_service.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const interactionPackage = protoDescriptor.interaction;

export class InteractionGrpcClient {
  private readonly client: InteractionServiceClient;

  constructor(dataServiceUrl: string) {
    this.client = new interactionPackage.InteractionService(
      dataServiceUrl,
      grpc.credentials.createInsecure()
    ) as InteractionServiceClient;
  }

  public commentArticle(request: CommentArticleRequest): Promise<CommentArticleResponse> {
    return new Promise((resolve, reject) => {
      this.client.CommentArticle(request, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }

  public deleteComment(request: DeleteCommentRequest): Promise<DeleteCommentResponse> {
    return new Promise((resolve, reject) => {
      this.client.DeleteComment(request, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }

  public getComments(request: GetCommentsRequest): Promise<GetCommentsResponse> {
    return new Promise((resolve, reject) => {
      this.client.GetComments(request, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }

  public likeArticle(request: LikeArticleRequest): Promise<LikeArticleResponse> {
    return new Promise((resolve, reject) => {
      this.client.LikeArticle(request, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }

  public revokeLike(request: RevokeLikeRequest): Promise<RevokeLikeResponse> {
    return new Promise((resolve, reject) => {
      this.client.RevokeLike(request, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }
}
