import { Request, Response } from "express";
import { ApproveArticleRequest, GetArticlesPendingReviewRequest, RejectArticleRequest } from "../grpc/reviews/types.js";
import { ExecuteCall } from "../grpc/grpc_util.js";
import { ArticleIdInput } from "../schemas/article_schema.js";
import { ControllerAuthorization, processAuthorization } from "../security/auth_util.js";
import { Editor, ManageArticles, Moderator } from "../security/authorizations.js";
import { GetArticlesPendingReviewInput, RejectArticleInput } from '../schemas/review_schema.js';
import { ReviewGrpcClient } from "../grpc/reviews/client.js";
import { ArticleGrpcClient } from "../grpc/articles/client.js";
import { RabbitMQPublisherService } from "../messaging/rabbitmq.js";
import { GetArticleRequest } from "../grpc/articles/types.js";
import { ArticlePublishedOutput, ArticleRejectedOutput } from "../messaging/message_schemas.js";

export type PublicationClients = {
    reviewClient: ReviewGrpcClient,
    articleClient: ArticleGrpcClient
    publisher: RabbitMQPublisherService
}

export const makeGetArticlesPendingReviewController = (client: ReviewGrpcClient, executeCall: ExecuteCall) => {
    return async (req: Request<{}, {}, {}, GetArticlesPendingReviewInput>, res: Response) : Promise<void> => {
        const auth: ControllerAuthorization = {
            userId: req.auth?.sub,
            roles: req.auth?.roles,
            permissions: req.auth?.permissions,
            allowedRoles: [Editor, Moderator],
            fineGrainedPermission: ManageArticles
        };
        
        const authResult = processAuthorization(auth);

        if (authResult.statusCode !== 200) {
            res.status(authResult.statusCode).json({ message: authResult.message, code: authResult.code });
            return;
        }

        const request: GetArticlesPendingReviewRequest = {
            page_index: req.query.pageIndex,
            page_size: req.query.pageSize
        };

        const response = await executeCall(client.getArticlesPendingReview(request));

        res.status(200).json(
            {
                articlesPending: [
                    ...response.articles_pending.map(article => ({
                        id: article.article_id,
                        title: article.title,
                        authorName: article.author_name,
                        category: article.category,
                        submittedAt: article.submitted_at
                    }))
                ],
                totalPending: response.total_pending,
                currentPage: response.current_page,
                pageCount: response.page_count,
                pageSize: response.page_size
            }
        );
    }
}

export const makeApproveArticleController = (clients: PublicationClients, executeCall: ExecuteCall) => {
    return async (req: Request<ArticleIdInput>, res: Response) : Promise<void> => {
        const auth: ControllerAuthorization = {
            userId: req.auth?.sub,
            roles: req.auth?.roles,
            permissions: req.auth?.permissions,
            allowedRoles: [Editor, Moderator],
            fineGrainedPermission: ManageArticles
        };
        
        const authResult = processAuthorization(auth);

        if (authResult.statusCode !== 200) {
            res.status(authResult.statusCode).json({ message: authResult.message, code: authResult.code });
            return;
        }

        const request: ApproveArticleRequest = {
            article_id: req.params.articleId,
            reviewed_by_id: req.auth?.sub as string
        }

        const response = await executeCall(clients.reviewClient.approveArticle(request));

        res.status(200).json({ message: response.message, status: response.article_status });

        publishArticlePublishedMessage(req.params.articleId, clients, executeCall)
            .catch(error => {
                console.error(`[Background task error] Failed to publish approval message for article ${req.params.articleId}`, error);
            });
    }
}

async function publishArticlePublishedMessage(articleId: string, clients: PublicationClients, executeCall: ExecuteCall) {
    const request: GetArticleRequest = {
        id: articleId
    }
    
    const article = await executeCall(clients.articleClient.getArticle(request));

    const message: ArticlePublishedOutput = {
        articleId: article.id,
        authorId: article.author_id,
        title: article.title,
        authorName: article.author_name
    }

    clients.publisher.publish("article.published", message);
}

export const makeRejectArticleController = (clients: PublicationClients, executeCall: ExecuteCall) => {
    return async (req: Request<ArticleIdInput, {}, RejectArticleInput>, res: Response) : Promise<void> => {
        const auth: ControllerAuthorization = {
            userId: req.auth?.sub,
            roles: req.auth?.roles,
            permissions: req.auth?.permissions,
            allowedRoles: [Editor, Moderator],
            fineGrainedPermission: ManageArticles
        };
        
        const authResult = processAuthorization(auth);

        if (authResult.statusCode !== 200) {
            res.status(authResult.statusCode).json({ message: authResult.message, code: authResult.code });
            return;
        }

        const request: RejectArticleRequest = {
            article_id: req.params.articleId,
            reviewed_by_id: req.auth?.sub as string,
            rejection_reason: req.body.rejectionReason
        }

        const response = await executeCall(clients.reviewClient.rejectArticle(request));

        res.status(200).json({ message: response.message, status: response.article_status });

        publishArticleRejectedMessage(req.params.articleId, clients, executeCall)
            .catch(error => {
                console.error(`[Background task error] Failed to publish rejection message for article ${req.params.articleId}`, error);
            });
    }
}

async function publishArticleRejectedMessage(articleId: string, clients: PublicationClients, executeCall: ExecuteCall) {
    const request: GetArticleRequest = {
        id: articleId
    }
    
    const article = await executeCall(clients.articleClient.getArticle(request));

    const message: ArticleRejectedOutput = {
        articleId: article.id,
        authorId: article.author_id,
        title: article.title,
        authorName: article.author_name
    }

    clients.publisher.publish("article.rejected", message);
}
