import * as grpc from '@grpc/grpc-js';

export interface GetCategoriesRequest { }

export interface GetCategoriesResponse {
  categories: Category[];
}

export interface GetMyArticlesRequest {
  id: string
}

export interface GetMyArticlesResponse {
  my_articles: MyArticle[];
}

export interface Category {
  id: string;
  name: string;
}

export interface MyArticle {
  article_id: string;
  title: string;
  status: string;
  category: string;
  published_at: string;
  likes: number;
  comments: number;
}

export interface ArticleServiceClient extends grpc.Client {
  GetCategories(
    request: GetCategoriesRequest,
    callback: (error: grpc.ServiceError | null, response: GetCategoriesResponse) => void
  ): grpc.ClientUnaryCall;
  GetMyArticles(
    request: GetMyArticlesRequest,
    callback: (error: grpc.ServiceError | null, response: GetMyArticlesResponse) => void
  ): grpc.ClientUnaryCall;
}
