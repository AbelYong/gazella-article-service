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

export interface PublishedArticle {
  id: string;
  title: string;
  author_name: string;
  published_at: string;
  likes_count: number;
  comments_count: number;
  status: string;
}

export interface GetPublishedArticlesRequest {
  page_index: number;
  page_size: number;
}

export interface GetPublishedArticlesResponse {
  published_articles: PublishedArticle[];
  total_entries: number;
  current_page: number;
  page_count: number;
  page_size: number;
}

export interface DeleteArticleRequest {
  article_id: string;
}

export interface DeleteArticleResponse {
  status: string;
  message: string;
}

export interface GetAuthorStatsRequest {
  author_id: string;
}

export interface TopAuthorArticle {
  id: string;
  title: string;
  likes_count: number;
  comments_count: number;
}

export interface RecentActivity {
  latest_comment_id: string;
  latest_comment_article_id: string;
  latest_comment_posted_at: string;
  likes_today: string;
}

export interface GetAuthorStatsResponse {
  top_articles: TopAuthorArticle[];
  recent_activity: RecentActivity;
  total_likes: number;
  total_comments: number;
  published_articles_count: number;
  engagement_rate: number;
}

export interface GetFeaturedArticlesRequest {
  requested_amount: number;
}

export interface FeaturedArticle {
  id: string;
  title: string;
  cover_uri: string;
  author_id: string;
  author_name: string;
  author_pfp_uri: string;
  summary: string;
}

export interface GetFeaturedArticlesResponse {
  featured_articles: FeaturedArticle[];
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
  GetPublishedArticles(
    request: GetPublishedArticlesRequest,
    callback: (error: grpc.ServiceError | null, response: GetPublishedArticlesResponse) => void
  ): grpc.ClientUnaryCall;
  DeleteArticle(
    request: DeleteArticleRequest,
    callback: (error: grpc.ServiceError | null, response: DeleteArticleResponse) => void
  ): grpc.ClientUnaryCall;
  GetAuthorStats(
    request: GetAuthorStatsRequest,
    callback: (error: grpc.ServiceError | null, response: GetAuthorStatsResponse) => void
  ): grpc.ClientUnaryCall;
  GetFeaturedArticles(
    request: GetFeaturedArticlesRequest,
    callback: (error: grpc.ServiceError | null, response: GetFeaturedArticlesResponse) => void
  ): grpc.ClientUnaryCall;
}
