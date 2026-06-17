import { Request, Response } from "express";
import { InteractionGrpcClient } from "../grpc/interactions/client.js";
import { ExecuteCall } from "../grpc/grpc_util.js";
import { ControllerAuthorization, processAuthorization } from "../security/auth_util.js";
import { DeleteComments, Editor, InteractArticles, Moderator, Organizer, Volunteer, WriteComments } from "../security/authorizations.js";
import { CommentArticleInput, DeleteCommentInput, DeleteOwnCommentInput, GetCommentsInput } from "../schemas/interaction_schema.js";
import { CheckIfAlreadyLikedRequest, CommentArticleRequest, DeleteCommentRequest, GetCommentsRequest, LikeArticleRequest, RevokeLikeRequest } from "../grpc/interactions/types.js";
import { ArticleIdInput } from "../schemas/article_schema.js";


export const makeCommentArticleController = (client: InteractionGrpcClient, executeCall: ExecuteCall) => {
    return async (req: Request<ArticleIdInput, {}, CommentArticleInput>, res: Response) : Promise<void> => {
        const userId = req.auth?.sub;

        const auth: ControllerAuthorization = {
            userId: req.auth?.sub,
            roles: req.auth?.roles,
            permissions: req.auth?.permissions,
            allowedRoles: [Volunteer, Organizer, Editor, Moderator],
            fineGrainedPermission: WriteComments
        };
    
        const authResult = processAuthorization(auth);
        
        if (authResult.statusCode !== 200) {
            res.status(authResult.statusCode).json({ message: authResult.message, code: authResult.code });
            return;
        }

        const request: CommentArticleRequest = {
            article_id: req.params.articleId,
            author_id: userId as string,
            author_name: req.body.authorName,
            author_pfp_uri: req.body.authorPfpUri || "",
            content: req.body.content
        }

        const response = await executeCall(client.commentArticle(request));

        res.status(200).json({
            success: response.success,
            commentId: response.comment_id,
            postedAt: response.posted_at
        });
    }
}

export const makeDeleteCommentController = (client: InteractionGrpcClient, executeCall: ExecuteCall) => {
    return async (req: Request<DeleteCommentInput>, res: Response) : Promise<void> => {        
        const auth: ControllerAuthorization = {
            userId: req.auth?.sub,
            roles: req.auth?.roles,
            permissions: req.auth?.permissions,
            allowedRoles: [Moderator],
            fineGrainedPermission: DeleteComments
        };

        const authResult = processAuthorization(auth);
        
        if (authResult.statusCode !== 200) {
            res.status(authResult.statusCode).json({ message: authResult.message, code: authResult.code });
            return;
        }

        const request: DeleteCommentRequest = {
            article_id: req.params.articleId,
            comment_id: req.params.commentId
        }

        const response = await executeCall(client.deleteComment(request));

        res.status(200).json(response);
    }
}

export const makeDeleteOwnCommentController = (client: InteractionGrpcClient, executeCall: ExecuteCall) => {
    return async (req: Request<DeleteOwnCommentInput>, res: Response) : Promise<void> => {
        const authorId = req.auth?.sub;
    
        if (!authorId) {
            res.status(401).json({ message: "Invalid Token or subject is missing (sub)", code: "MISSING_SUB" });
            return;
        }
            
        const isOwner = authorId === req.params.authorId;
    
        if (!isOwner) {
            res.status(403).json({ message: "Your sub and the authorId of the requested article to delete do not match", code: "FORBIDDEN" })
            return;
        }

        const request: DeleteCommentRequest = {
            article_id: req.params.articleId,
            comment_id: req.params.commentId
        }

        const response = await executeCall(client.deleteComment(request));

        res.status(200).json(response);
    }
}

export const makeGetCommentsController = (client: InteractionGrpcClient, executeCall: ExecuteCall) => {
    return async (req: Request<ArticleIdInput, {}, {}, GetCommentsInput>, res: Response) : Promise<void> => {
        const request: GetCommentsRequest = {
            article_id: req.params.articleId,
            page_index: req.query.pageIndex,
            page_size: req.query.pageSize
        }

        const response = await executeCall(client.getComments(request));

        res.status(200).json({
            comments: [
                ...response.comments.map(comment => ({
                    id: comment.id,
                    authorId: comment.author_id,
                    authorName: comment.author_name,
                    authorPfpUri: comment.author_pfp_uri,
                    content: comment.content,
                    postedAt: comment.posted_at
                }))
            ],
            totalComments: response.total_comments,
            currentPage: response.current_page,
            pageCount: response.page_count,
            pageSize: response.page_size
        });
    }
}

export const makeLikeArticleController = (client: InteractionGrpcClient, executeCall: ExecuteCall) => {
    return async (req: Request<ArticleIdInput>, res:Response) : Promise<void> => {
        const userId = req.auth?.sub;

        const auth: ControllerAuthorization = {
            userId: req.auth?.sub,
            roles: req.auth?.roles,
            permissions: req.auth?.permissions,
            allowedRoles: [Volunteer, Organizer, Editor, Moderator],
            fineGrainedPermission: InteractArticles
        };
    
        const authResult = processAuthorization(auth);
        
        if (authResult.statusCode !== 200) {
            res.status(authResult.statusCode).json({ message: authResult.message, code: authResult.code });
            return;
        }

        const request: LikeArticleRequest = {
            article_id: req.params.articleId,
            author_id: userId as string
        }

        const response = await executeCall(client.likeArticle(request));

        res.status(201).json({
            message: response.message,
            currentLikes: response.current_likes
        });
    }
}

export const makeRevokeLikeController = (client: InteractionGrpcClient, executeCall: ExecuteCall) => {
    return async (req: Request<ArticleIdInput>, res: Response) : Promise<void> => {
        const userId = req.auth?.sub;

        const auth: ControllerAuthorization = {
            userId: req.auth?.sub,
            roles: req.auth?.roles,
            permissions: req.auth?.permissions,
            allowedRoles: [Volunteer, Organizer, Editor, Moderator],
            fineGrainedPermission: InteractArticles
        };
    
        const authResult = processAuthorization(auth);
        
        if (authResult.statusCode !== 200) {
            res.status(authResult.statusCode).json({ message: authResult.message, code: authResult.code });
            return;
        }

        const request: RevokeLikeRequest = {
            article_id: req.params.articleId,
            author_id: userId as string
        }

        const response = await executeCall(client.revokeLike(request));

        res.status(201).json({
            message: response.message,
            currentLikes: response.current_likes
        });
    }
}

export const makeCheckIfAlreadyLikedController = (client: InteractionGrpcClient, executeCall: ExecuteCall) => {
    return async (req: Request<ArticleIdInput>, res: Response) : Promise<void> => {
        const userId = req.auth?.sub;

        const auth: ControllerAuthorization = {
            userId: req.auth?.sub,
            roles: req.auth?.roles,
            permissions: req.auth?.permissions,
            allowedRoles: [Volunteer, Organizer, Editor, Moderator],
            fineGrainedPermission: InteractArticles
        };
    
        const authResult = processAuthorization(auth);
        
        if (authResult.statusCode !== 200) {
            res.status(authResult.statusCode).json({ message: authResult.message, code: authResult.code });
            return;
        }

        const request: CheckIfAlreadyLikedRequest = {
            article_id: req.params.articleId,
            author_id: userId as string
        }

        const response = await executeCall(client.checkIfAlreadyLiked(request));
        
        res.status(200).json({
            isAlreadyLiked: response.is_already_liked
        });
    }
}
