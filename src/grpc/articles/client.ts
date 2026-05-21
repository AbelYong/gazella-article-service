import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "node:path";
import { GetCategoriesRequest, GetCategoriesResponse, ArticleServiceClient, GetMyArticlesResponse, GetMyArticlesRequest, GetArticleRequest, GetArticleResponse, SearchArticlesRequest, SearchArticlesResponse } from "./types.js";

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

export class ArticleGrpcClient {
  private readonly client: ArticleServiceClient;

  constructor(dataServiceUrl: string) {
    this.client = new articlePackage.ArticleService(
      dataServiceUrl,
      grpc.credentials.createInsecure()
    ) as ArticleServiceClient;
  }

  public getCategories(request: GetCategoriesRequest): Promise<GetCategoriesResponse> {
    return new Promise((resolve, reject) => {
      this.client.GetCategories(request, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }

  public getMyArticles(request: GetMyArticlesRequest): Promise<GetMyArticlesResponse> {
    return new Promise((resolve, reject) => {
      this.client.GetMyArticles(request, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }

  public getArticle(request: GetArticleRequest): Promise<GetArticleResponse> {
    return new Promise((resolve, reject) => {
      this.client.GetArticle(request, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }

  public searchArticles(request: SearchArticlesRequest): Promise<SearchArticlesResponse> {
    return new Promise((resolve, reject) => {
      this.client.SearchArticles(request, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }
}
