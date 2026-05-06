import * as grpc from '@grpc/grpc-js';

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

export interface DraftServiceClient extends grpc.Client {
  SubmitDraft(
    request: SubmitDraftRequest,
    callback: (error: grpc.ServiceError | null, response: SubmitDraftResponse) => void
  ): grpc.ClientUnaryCall;
}
