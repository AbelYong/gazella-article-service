import { Request, Response } from "express"
import { GetArticleRequest, GetCategoriesRequest, GetMyArticlesRequest } from '../grpc/articles/types.js';
import { ArticleGrpcClient } from "../grpc/articles/client.js";
import { ExecuteCall } from "../grpc/grpc_util.js";
import { ArticleIdInput } from "../schemas/article_schema.js";

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

        res.status(200).json(response);
    }
}
