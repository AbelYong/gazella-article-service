import { Request, Response } from "express"
import { DeleteArticleRequest, GetArticleRequest, GetCategoriesRequest, GetMyArticlesRequest, GetPublishedArticlesRequest, SearchArticlesRequest } from '../grpc/articles/types.js';
import { ArticleGrpcClient } from "../grpc/articles/client.js";
import { ExecuteCall } from "../grpc/grpc_util.js";
import { ArticleIdInput, GetPublishedArticlesInput, SearchArticlesInput } from "../schemas/article_schema.js";
import { ControllerAuthorization, processAuthorization } from "../security/auth_util.js";
import { Editor, ManageArticles, Moderator } from "../security/authorizations.js";

export const makeGetCategoriesController = (client: ArticleGrpcClient, executeCall: ExecuteCall) => {
    return async (_req: Request, res: Response) : Promise<void> => {
        const request: GetCategoriesRequest = {};

        const response = await executeCall(client.getCategories(request));

        res.status(200).json(response.categories);
    }
}

export const makeGetMyArticlesController = (grpcClient: ArticleGrpcClient, executeCall: ExecuteCall) => {
    return async(req: Request, res: Response) : Promise<void> => {
        const authorId = req.auth?.sub;

        if (!authorId) {
            res.status(401).json({ message: "Invalid Token or subject is missing (sub)", code: "MISSING_SUB" });
            return;
        }

        const request: GetMyArticlesRequest = { id: authorId };

        const response = await executeCall(grpcClient.getMyArticles(request));

        res.status(200).json({myArticles: response.my_articles});
    }
}

export const makeGetArticleController = (client: ArticleGrpcClient, executeCall: ExecuteCall) => {
    return async (req: Request<ArticleIdInput>, res: Response) : Promise<void> => {
        const request:GetArticleRequest = {
            id: req.params.articleId 
        };

        const response = await executeCall(client.getArticle(request));

        res.status(200).json({
            id: response.id,
            title: response.title,
            coverUri: response.cover_uri,
            summary: response.summary,
            category: response.category,
            publishedAt: response.published_at,
            lastUpdatedAt: response.last_updated_at,
            status: response.status,
            content: response.content,
            authorId: response.author_id,
            authorName: response.author_name,
            authorPfpUri: response.author_pfp_uri,
            likesCount: response.likes_count,
            commentsCount: response.comments_count,
            recentComments: response.recent_comments
        });
    }
}

export const makeSearchArticlesController = (client: ArticleGrpcClient, executeCall: ExecuteCall) => {
    return async (req: Request<{}, {}, {}, SearchArticlesInput>, res: Response) : Promise<void> => {
        const request: SearchArticlesRequest = {
            filter: {
                title: req.query.title || "",
                category: req.query.category || "",
                author_name: req.query.authorName || "",
                published_after: req.query.publishedAfter || "",
                sort_by: req.query.sortBy || ""
            },
            page_index: req.query.pageIndex,
            page_size: req.query.pageSize
        }

        const response = await executeCall(client.searchArticles(request));

        res.status(200).json({
            entries: [
                ...response.entries.map(entry => ({
                    id: entry.id,
                    title: entry.title,
                    authorId: entry.author_id,
                    authorName: entry.author_name,
                    categoryName: entry.category_name,
                    summary: entry.summary,
                    publishedAt: entry.published_at,
                    lastUpdatedAt: entry.last_updated_at
                }))
            ],
            totalEntries: response.total_entries,
            currentPage: response.current_page,
            pageCount: response.page_count,
            pageSize: response.page_size
        });
    }
}

export const makeGetPublishedArticlesController = (client: ArticleGrpcClient, executeCall: ExecuteCall) => {
    return async (req: Request<{}, {}, {}, GetPublishedArticlesInput>, res: Response) : Promise<void> => {
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

        const request: GetPublishedArticlesRequest = {
            page_index: req.query.pageIndex,
            page_size: req.query.pageSize
        };

        const response = await executeCall(client.getPublishedArticles(request));

        res.status(200).json({
            publishedArticles: [
                ...response.published_articles.map(article => ({
                    id: article.id,
                    title: article.title,
                    authorName: article.author_name,
                    publishedAt: article.published_at,
                    likesCount: article.likes_count,
                    commentsCount: article.comments_count,
                    status: article.status
                }))
            ],
            totalEntries: response.total_entries,
            currentPage: response.current_page,
            pageCount: response.page_count,
            pageSize: response.page_size
        });
    }
}

export const makeDeleteArticleController = (client: ArticleGrpcClient, executeCall: ExecuteCall) => {
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

        const request: DeleteArticleRequest = {
            article_id: req.params.articleId,
        }

        const response = await executeCall(client.deleteArticle(request));

        res.status(200).json(response);
    }
}
