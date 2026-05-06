import * as grpc from '@grpc/grpc-js';

export interface GetCategoriesRequest { }

export interface GetCategoriesResponse {
    categories: Category[];
}

export interface Category {
    id: string;
    name: string;
}

export interface ArticleServiceClient extends grpc.Client {
  GetCategories(
    request: GetCategoriesRequest,
    callback: (error: grpc.ServiceError | null, response: GetCategoriesResponse) => void
  ): grpc.ClientUnaryCall;
}
