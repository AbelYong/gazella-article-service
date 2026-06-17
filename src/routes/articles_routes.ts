import { RequestHandler, Router } from "express"
import { requireAuth } from "../validators/auth_validator.js";
import { asyncHandler } from "../handlers/async_handler.js";
import { validateParams, validateQuery } from "../validators/request_validator.js";
import { ArticleIdSchema, GetFeaturedArticlesSchema, GetPublishedArticlesSchema, SearchArticlesSchema, DeletionByAuthorSchema } from "../schemas/article_schema.js";
import { makeDeleteArticleController, makeDeleteAsAuthorController, makeGetArticleController, makeGetAuthorStatsController, makeGetCategoriesController, makeGetFeaturedArticlesController, makeGetMyArticlesController, makeGetPublishedArticlesController, makeSearchArticlesController } from "../controllers/article_controller.js";
import { ArticleGrpcClient } from "../grpc/articles/client.js";
import { executeGrpcCall, DataServiceUrl } from "../grpc/grpc_util.js";

const router = Router();

const articleClient = new ArticleGrpcClient(DataServiceUrl);

const getCategories = makeGetCategoriesController(articleClient, executeGrpcCall);
const getMyArticles = makeGetMyArticlesController(articleClient, executeGrpcCall);
const searchArticles = makeSearchArticlesController(articleClient, executeGrpcCall);
const getPublishedArticles = makeGetPublishedArticlesController(articleClient, executeGrpcCall);
const deleteArticle = makeDeleteArticleController(articleClient, executeGrpcCall);
const deleteArticleAsAuthor = makeDeleteAsAuthorController(articleClient, executeGrpcCall);
const getArticle = makeGetArticleController(articleClient, executeGrpcCall);
const getAuthorStats = makeGetAuthorStatsController(articleClient, executeGrpcCall);
const getFeaturedArticles = makeGetFeaturedArticlesController(articleClient, executeGrpcCall);

/**
 * @openapi
 * /categories:
 *   get:
 *     summary: Retrieve a list of article categories
 *     description: Fetches a list of all available categories via a gRPC call to the Article Data Service.
 *     tags:
 *       - Categories
 *     responses:
 *       '200':
 *         description: Successful response containing the categories list.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - categories
 *               properties:
 *                 categories:
 *                   type: array
 *                   description: An array of category objects.
 *                   items:
 *                     type: object
 *                     required:
 *                       - id
 *                       - name
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: The unique identifier of the category.
 *                       name:
 *                         type: string
 *                         description: The name of the category.
 *       '500':
 *         description: Internal Server Error. The gRPC service is unavailable.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 *                 message:
 *                   type: string
 *                   example: "An internal infrastructure error occurred while communicating with Article Data Service"
 *       '503':
 *         description: Service Unavailable. The gRPC database failed to respond.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "Database unavailable"
 *                 message:
 *                   type: string
 *                   example: "The database is not available, it took to long to respond or another internal issue"
 */
router.get("/categories", asyncHandler(getCategories));

/**
 * @openapi
 * /articles/{articleId}:
 *   get:
 *     summary: Retrieve an article by its ID
 *     description: Fetches a specific article, including its content and recent comments, matching the provided UUID.
 *     tags:
 *       - Articles
 *     parameters:
 *       - in: path
 *         name: articleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           description: The unique identifier of the article.
 *     responses:
 *       '200':
 *         description: Successful response containing the article details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - id
 *                 - title
 *                 - coverUri
 *                 - summary
 *                 - category
 *                 - publishedAt
 *                 - lastUpdatedAt
 *                 - status
 *                 - content
 *                 - authorId
 *                 - authorName
 *                 - authorPfpUri
 *                 - likesCount
 *                 - commentsCount
 *                 - recentComments
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   example: "c743c3f7-a83b-4f8e-a7a3-b91af67cb9c4"
 *                 title:
 *                   type: string
 *                   example: "Pinguino Emperador amenazado frente al cambio climatico 2"
 *                 coverUri:
 *                   type: string
 *                   example: ""
 *                 summary:
 *                   type: string
 *                   example: "El pinguino emperador..."
 *                 category:
 *                   type: string
 *                   example: "Cambio climatico"
 *                 publishedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-05-20T05:20:08.7400000Z"
 *                 lastUpdatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-05-20T05:19:54.8150000Z"
 *                 status:
 *                   type: string
 *                   example: "Published"
 *                 content:
 *                   type: string
 *                   description: Stringified and escaped EditorJS JSON content.
 *                   example: "{\"time\":1550476186479,\"blocks\":[{\"id\":\"oUq2g_tl8y\",\"type\":\"header\",\"data\":{\"text\":\"Editor.js\",\"level\":2}}],\"version\":\"2.8.1\"}"
 *                 authorId:
 *                   type: string
 *                   format: uuid
 *                   example: "79c515bd-9ef2-4f19-bf5a-23e65cbfad8b"
 *                 authorName:
 *                   type: string
 *                   example: "Abel Hernandez Yong"
 *                 authorPfpUri:
 *                   type: string
 *                   example: ""
 *                 likesCount:
 *                   type: integer
 *                   example: 1
 *                 commentsCount:
 *                   type: integer
 *                   example: 1
 *                 recentComments:
 *                   type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - author_id
 *                     - author_name
 *                     - author_pfp_uri
 *                     - content
 *                     - posted_at
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "428aedcd-42bc-471e-98ca-9f69ffe78f62"
 *                     author_id:
 *                       type: string
 *                       format: uuid
 *                       example: "79c515bd-9ef2-4f19-bf5a-23e65cbfad8b"
 *                     author_name:
 *                       type: string
 *                       example: "Abel Hernández Yong"
 *                     author_pfp_uri:
 *                       type: string
 *                       example: ""
 *                     content:
 *                       type: string
 *                       example: "Muy interesante..."
 *                     posted_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-05-22T15:22:58.1370000Z"
 *       '400':
 *         description: Bad Request. The provided articleId is not a valid UUID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid Input"
 *                 details:
 *                   type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     field:
 *                       type: string
 *                       example: "articleId"
 *                     message:
 *                       type: string
 *                       example: "Invalid UUID"
 *       '404':
 *          description: Not Found. No article matching the provided ID exists.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "No article matching id: c743c3f7-a83b-4f8e-a7a3-b91af67cb9c6 could be found"
 *                  code:
 *                    type: string
 *                    example: "NOT_FOUND"
 *       '500':
 *          description: Internal Server Error. The Article Data Service is unavailable or unreachable.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: "Internal Server Error"
 *                  message:
 *                    type: string
 *                    example: "An internal infrastructure error occurred while communicating with Article Data Service"
 *       '503':
 *         description: Service Unavailable. The downstream database failed to respond or is offline.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "The database is not available, it took to long to respond or another internal issue"
 *                 code:
 *                   type: string
 *                   example: "DB_UNAVAILABLE"
 */
router.get("/articles/:articleId", validateParams(ArticleIdSchema), asyncHandler(getArticle));

router.get("/my-articles", requireAuth, asyncHandler(getMyArticles));

router.get("/search", validateQuery(SearchArticlesSchema), asyncHandler(searchArticles) as unknown as RequestHandler);

router.get("/publications", requireAuth, validateQuery(GetPublishedArticlesSchema), asyncHandler(getPublishedArticles) as unknown as RequestHandler);

router.delete("/publications/:articleId", requireAuth, validateParams(ArticleIdSchema), asyncHandler(deleteArticle));

router.delete("/authors/:authorId/articles/:articleId", requireAuth, validateParams(DeletionByAuthorSchema), asyncHandler(deleteArticleAsAuthor));

router.get("/my-stats", requireAuth, asyncHandler(getAuthorStats));

router.get("/featured", validateQuery(GetFeaturedArticlesSchema), asyncHandler(getFeaturedArticles) as unknown as RequestHandler);

export const ArticlesRouter = router;
