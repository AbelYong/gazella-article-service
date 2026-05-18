import { Request, Response } from "express";
import { ApproveArticleRequest, GetArticlesPendingReviewRequest, RejectArticleRequest } from "../grpc/reviews/types.js";
import { ExecuteCall } from "../grpc/grpc_util.js";
import { ArticleIdInput } from "../schemas/article_schema.js";
import { ControllerAuthorization, processAuthorization } from "../security/auth_util.js";
import { Editor, ManageArticles, Moderator } from "../security/authorizations.js";
import { GetArticlesPendingReviewInput, RejectArticleInput } from '../schemas/review_schema.js';
import { ReviewGrpcClient } from "../grpc/reviews/client.js";

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
                articlesPending: response.articles_pending,
                totalPending: response.total_pending,
                currentPage: response.current_page,
                pageCount: response.page_count,
                pageSize: response.page_size
            }
        );
    }
}

export const makeApproveArticleController = (client: ReviewGrpcClient, executeCall: ExecuteCall) => {
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

        const response = await executeCall(client.approveArticle(request));

        res.status(200).json({ message: response.message, status: response.article_status });
    }
}

export const makeRejectArticleController = (client: ReviewGrpcClient, executeCall: ExecuteCall) => {
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

        const response = await executeCall(client.rejectArticle(request));

        res.status(200).json({ message: response.message, status: response.article_status });
    }
}
