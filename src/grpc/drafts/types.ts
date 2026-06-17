import * as grpc from '@grpc/grpc-js';

export interface GetDraftRequest {
  article_id: string;
}

export interface GetDraftResponse {
  id: string;
  title: string;
  cover_uri: string;
  summary: string;
  category_id: string;
  category_name: string;
  content: string;
  status: string;
  rejection_reason: string;
}

export interface SubmitDraftRequest {
  title: string;
  cover_uri: string;
  summary: string;
  category_id: string;
  author_id: string;
  content: string;
}

export interface SubmitDraftResponse {
  article_id: string;
  message: string;
}

export interface UpdateDraftRequest {
  draft_id: string;
  title: string;
  cover_uri: string;
  summary: string;
  category_id: string;
  content: string;
}

export interface UpdateDraftResponse {
  is_success: boolean;
  message: string;
}

export interface PublishDraftRequest {
  draft_id: string;
  title: string;
  cover_uri: string;
  summary: string;
  category_id: string;
  author_name: string;
  author_pfp_uri: string;
  content: string;
}

export interface PublishDraftResponse {
  article_status: string;
  message: string;
}

export interface DraftServiceClient extends grpc.Client {
  GetDraft(
    request: GetDraftRequest,
    callback: (error: grpc.ServiceError | null, respinse: GetDraftResponse) => void
  ): grpc.ClientUnaryCall;
  SubmitDraft(
    request: SubmitDraftRequest,
    callback: (error: grpc.ServiceError | null, response: SubmitDraftResponse) => void
  ): grpc.ClientUnaryCall;
  UpdateDraft(
    request: UpdateDraftRequest,
    callback: (error: grpc.ServiceError | null, response: UpdateDraftResponse) => void
  ): grpc.ClientUnaryCall;
  PublishDraft(
    request: PublishDraftRequest,
    callback: (error: grpc.ServiceError | null, response: PublishDraftResponse) => void
  ): grpc.ClientUnaryCall;
}
