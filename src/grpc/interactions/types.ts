import * as grpc from '@grpc/grpc-js';

export interface CommentArticleRequest {
  article_id: string;
  author_id: string;
  author_name: string;
  author_pfp_uri: string;
  content: string;
}

export interface CommentArticleResponse {
  success: boolean;
  posted_at: string;
}

export interface DeleteCommentRequest {
  article_id: string;
  comment_id: string;
}

export interface DeleteCommentResponse {
  success: boolean;
  message: string;
}

export interface GetCommentsRequest {
  article_id: string;
  page_index: number;
  page_size: number;
}

export interface Comment {
  id: string;
  author_id: string;
  author_name: string;
  author_pfp_uri: string;
  content: string;
  posted_at: string;
}

export interface GetCommentsResponse {
  comments: Comment[];
  total_comments: number;
  current_page: number;
  page_count: number;
  page_size: number;
}

export interface LikeArticleRequest {
  article_id: string;
  author_id: string;
}

export interface LikeArticleResponse {
  message: string;
  current_likes: number;
}

export interface RevokeLikeRequest {
  article_id: string;
  author_id: string;
}

export interface RevokeLikeResponse {
  message: string;
  current_likes: number;
}

export interface InteractionServiceClient extends grpc.Client {
  CommentArticle(
    request: CommentArticleRequest,
    callback: (error: grpc.ServiceError | null, response: CommentArticleResponse) => void
  ): grpc.ClientUnaryCall;
  DeleteComment(
    request: DeleteCommentRequest,
    callback: (error: grpc.ServiceError | null, response: DeleteCommentResponse) => void
  ): grpc.ClientUnaryCall;
  GetComments(
    request: GetCommentsRequest,
    callback: (error: grpc.ServiceError | null, response: GetCommentsResponse) => void
  ): grpc.ClientUnaryCall;
  LikeArticle(
    request: LikeArticleRequest,
    callback: (error: grpc.ServiceError | null, response: LikeArticleResponse) => void
  ): grpc.ClientUnaryCall;
  RevokeLike(
    request: RevokeLikeRequest,
    callback: (error: grpc.ServiceError | null, response: RevokeLikeResponse) => void
  ): grpc.ClientUnaryCall;
}
