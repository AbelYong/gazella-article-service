import { RequestHandler, Router } from "express"
import { requireAuth } from "../validators/auth_validator.js";
import { asyncHandler } from "../handlers/async_handler.js";
import { validateBody, validateParams, validateQuery } from "../validators/request_validator.js";
import { ArticleIdSchema } from "../schemas/article_schema.js";
import { CommentArticleSchema, DeleteCommentSchema, DeleteOwnCommentSchema, GetCommentsSchema } from "../schemas/interaction_schema.js";
import { makeCheckIfAlreadyLikedController, makeCommentArticleController, makeDeleteCommentController, makeDeleteOwnCommentController, makeGetCommentsController, makeLikeArticleController, makeRevokeLikeController } from "../controllers/interaction_controller.js";
import { InteractionGrpcClient } from "../grpc/interactions/client.js";
import { executeGrpcCall, DataServiceUrl } from "../grpc/grpc_util.js";

const router = Router();

const interactionClient = new InteractionGrpcClient(DataServiceUrl);

const commentArticle = makeCommentArticleController(interactionClient, executeGrpcCall);
const deleteComment = makeDeleteCommentController(interactionClient, executeGrpcCall);
const deleteOwnComment = makeDeleteOwnCommentController(interactionClient, executeGrpcCall);
const getComments = makeGetCommentsController(interactionClient, executeGrpcCall);
const likeArticle = makeLikeArticleController(interactionClient, executeGrpcCall);
const revokeLike = makeRevokeLikeController(interactionClient, executeGrpcCall);
const checkIfLiked = makeCheckIfAlreadyLikedController(interactionClient, executeGrpcCall);

router.post("/interactions/:articleId/comments", requireAuth, validateParams(ArticleIdSchema), validateBody(CommentArticleSchema), asyncHandler(commentArticle));

router.delete("/interactions/:articleId/comments/:commentId", requireAuth, validateParams(DeleteCommentSchema), asyncHandler(deleteComment));

router.delete("/interactions/:articleId/authors/:authorId/comments/:commentId", requireAuth, validateParams(DeleteOwnCommentSchema), asyncHandler(deleteOwnComment));

router.get("/interactions/:articleId/comments", validateParams(ArticleIdSchema), validateQuery(GetCommentsSchema), asyncHandler(getComments) as unknown as RequestHandler);

router.get("/interactions/:articleId/likes/me", requireAuth, validateParams(ArticleIdSchema), asyncHandler(checkIfLiked));

router.post("/interactions/:articleId/likes", requireAuth, validateParams(ArticleIdSchema), asyncHandler(likeArticle));

router.delete("/interactions/:articleId/likes", requireAuth, validateParams(ArticleIdSchema), asyncHandler(revokeLike));

export const InteractionsRouter = router;;
