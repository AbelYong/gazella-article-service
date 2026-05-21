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

export interface GetArticleRequest {
  id: string;
}

export interface RecentComment {
  id: string;
  author_id: string;
  author_name: string;
  author_pfp_uri: string;
  content: string;
  posted_at: string;
}

export interface GetArticleResponse {
  id: string;
  title: string;
  cover_uri: string;
  summary: string;
  category: string;
  published_at: string;
  last_updated_at: string;
  status: string;
  content: string;
  author_id: string;
  author_name: string;
  author_pfp_uri: string;
  likes_count: number;
  comments_count: number;
  recent_comments: RecentComment[];
}

export interface SearchFilter {
  title: string;
  category: string;
  author_name: string;
  published_after: string;
  sort_by: string;
}

export interface SearchArticlesRequest {
  filter: SearchFilter;
  page_index: number;
  page_size: number;
}

export interface ArticleEntry {
  id: string;
  title: string;
  author_id: string;
  author_name: string;
  category_name: string;
  summary: string;
  published_at: string;
  last_updated_at: string;
}

export interface SearchArticlesResponse {
  entries: ArticleEntry[];
  total_entries: number;
  current_page: number;
  page_count: number;
  page_size: number;
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
  GetArticle(
    request: GetArticleRequest,
    callback: (error: grpc.ServiceError | null, response: GetArticleResponse) => void
  ): grpc.ClientUnaryCall;
  SearchArticles(
    request: SearchArticlesRequest,
    callback: (error: grpc.ServiceError | null, response: SearchArticlesResponse) => void
  ): grpc.ClientUnaryCall;
}
