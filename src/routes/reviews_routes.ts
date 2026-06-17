import { Router, RequestHandler } from "express"
import { requireAuth } from "../validators/auth_validator.js";
import { asyncHandler } from "../handlers/async_handler.js";
import { validateBody, validateParams, validateQuery } from "../validators/request_validator.js";
import { ArticleIdSchema } from "../schemas/article_schema.js";
import { GetArticlesPendingReviewSchema, RejectArticleSchema } from '../schemas/review_schema.js';
import { makeApproveArticleController, makeGetArticlesPendingReviewController, makeRejectArticleController } from "../controllers/review_controller.js";
import { ReviewGrpcClient } from '../grpc/reviews/client.js';
import { executeGrpcCall, DataServiceUrl } from "../grpc/grpc_util.js";

const router = Router();

const reviewClient = new ReviewGrpcClient(DataServiceUrl);

const getArticlesPendingReview = makeGetArticlesPendingReviewController(reviewClient, executeGrpcCall);
const approveArticle = makeApproveArticleController(reviewClient, executeGrpcCall);
const rejectArticle = makeRejectArticleController(reviewClient, executeGrpcCall);

router.get("/to-review-articles", requireAuth, validateQuery(GetArticlesPendingReviewSchema), asyncHandler(getArticlesPendingReview) as unknown as RequestHandler);

router.post("/reviews/:articleId/publications", requireAuth, validateParams(ArticleIdSchema), asyncHandler(approveArticle));

router.post("/reviews/:articleId/rejections", requireAuth, validateParams(ArticleIdSchema), validateBody(RejectArticleSchema), asyncHandler(rejectArticle));

export const ReviewsRouter = router;
