import { Router, RequestHandler } from "express"
import { requireAuth } from "../validators/auth_validator.js";
import { asyncHandler } from "../handlers/async_handler.js";
import { validateBody, validateParams, validateQuery } from "../validators/request_validator.js";
import { ArticleIdSchema } from "../schemas/article_schema.js";
import { GetArticlesPendingReviewSchema, RejectArticleSchema } from '../schemas/review_schema.js';
import { makeApproveArticleController, makeGetArticlesPendingReviewController, makeRejectArticleController, PublicationClients } from "../controllers/review_controller.js";
import { ReviewGrpcClient } from '../grpc/reviews/client.js';
import { executeGrpcCall, DataServiceUrl } from "../grpc/grpc_util.js";
import { ArticleGrpcClient } from "../grpc/articles/client.js";
import { rabbitMQPublisher } from "../messaging/rabbitmq.js";

const router = Router();

const reviewClient = new ReviewGrpcClient(DataServiceUrl);
const articleClient = new ArticleGrpcClient(DataServiceUrl)

const publishingClients: PublicationClients = {
    reviewClient,
    articleClient,
    publisher: rabbitMQPublisher
}

const getArticlesPendingReview = makeGetArticlesPendingReviewController(reviewClient, executeGrpcCall);
const approveArticle = makeApproveArticleController(publishingClients, executeGrpcCall);
const rejectArticle = makeRejectArticleController(publishingClients, executeGrpcCall);

router.get("/to-review-articles", requireAuth, validateQuery(GetArticlesPendingReviewSchema), asyncHandler(getArticlesPendingReview) as unknown as RequestHandler);

router.post("/reviews/:articleId/publications", requireAuth, validateParams(ArticleIdSchema), asyncHandler(approveArticle));

router.post("/reviews/:articleId/rejections", requireAuth, validateParams(ArticleIdSchema), validateBody(RejectArticleSchema), asyncHandler(rejectArticle));

export const ReviewsRouter = router;
