import * as grpc from '@grpc/grpc-js';

export interface GetArticlesPendingReviewRequest {
  page_index: number;
  page_size: number;
}

export interface ArticlePendingReview {
  article_id: string;
  title: string;
  author_name: string;
  category: string;
  submitted_at: string;
}

export interface GetArticlesPendingReviewResponse {
  articles_pending: ArticlePendingReview[];
  total_pending: number;
  current_page: number;
  page_count: number;
  page_size: number;
}

export interface ApproveArticleRequest {
  article_id: string;
  reviewed_by_id: string;
}

export interface ApproveArticleResponse {
  article_status: string;
  message: string;
}

export interface RejectArticleRequest {
  article_id: string;
  reviewed_by_id: string;
  rejection_reason: string;
}

export interface RejectArticleResponse {
  article_status: string;
  message: string;
}

export interface ReviewServiceClient extends grpc.Client {
  GetArticlesPendingReview(
    request: GetArticlesPendingReviewRequest,
    callback: (error: grpc.ServiceError | null, response: GetArticlesPendingReviewResponse) => void
  ): grpc.ClientUnaryCall;
  ApproveArticle(
    request: ApproveArticleRequest,
    callback: (error: grpc.ServiceError | null, response: ApproveArticleResponse) => void
  ): grpc.ClientUnaryCall;
  RejectArticle(
    request: RejectArticleRequest,
    callback: (error: grpc.ServiceError | null, response: RejectArticleResponse) => void
  ): grpc.ClientUnaryCall;
}
