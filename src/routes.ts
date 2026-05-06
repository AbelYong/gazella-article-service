import { Router } from "express"
import { requireAuth } from "./validators/auth_validator.js";
import { asyncHandler } from "./handlers/async_handler.js";
import { validateBody } from "./validators/request_validator.js";
import { DraftSubmissionSchema } from "./schemas/draft_schema.js";
import { submitDraft } from "./controllers/draft_controller.js";
import { getCategories } from "./controllers/article_controller.js";

const router = Router();

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
 * /drafts:
 *   post:
 *     summary: Submit a new article draft
 *     description: Creates a new article draft. Requires a valid JWT with the 'volunteer' role OR the 'write:articles' permission. The content must be a valid Editor.js payload.
 *     tags:
 *       - Drafts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - summary
 *               - categoryId
 *               - authorId
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 128
 *                 description: The title of the draft. Max 128 characters.
 *                 example: "Emperor penguin facing shrinking habitat amidst changing climate"
 *               coverUri:
 *                 type: string
 *                 format: uri
 *                 description: Optional URL pointing to the cover image.
 *               summary:
 *                 type: string
 *                 maxLength: 500
 *                 description: A short summary of the draft. Max 500 characters.
 *                 example: "The Emperor penguin has been..."
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 description: The UUIDv4 of the selected category.
 *                 example: "75d06355-6891-4a1e-ba5a-12d7863a754e"
 *               authorId:
 *                 type: string
 *                 format: uuid
 *                 description: The UUIDv4 of the author. Must match the subject (sub) in the JWT.
 *                 example: "79c515bd-9ef2-4f19-bf5a-23e65cbfad8b"
 *               content:
 *                 type: string
 *                 description: A stringified JSON payload conforming to the Editor.js format.
 *     responses:
 *       '201':
 *         description: Draft submitted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 id:
 *                   type: string
 *                   description: The created article ID from the gRPC service.
 *       '400':
 *         description: Bad Request. Occurs on schema validation failure, invalid Editor.js content, or invalid gRPC arguments.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "The draft's content does not adhere to Editor.js format"
 *                 code:
 *                   type: string
 *                   example: "BAD_CONTENT"
 *       '401':
 *         description: Unauthorized. The token is missing, invalid, or lacks the subject (sub) claim.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid Token or subject is missing (sub)"
 *                 code:
 *                   type: string
 *                   example: "MISSING_SUB"
 *       '403':
 *         description: Forbidden. The user lacks required roles/permissions, or the token's subject does not match the provided authorId.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message describing the permission failure.
 *                   example: "You don't have permissions to write articles"
 *                 message:
 *                   type: string
 *                   description: Alternative message for author mismatch.
 *                   example: "Subject and authorId don't match."
 *                 code:
 *                   type: string
 *                   example: "FORBIDDEN"
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
router.post("/drafts", requireAuth, validateBody(DraftSubmissionSchema), asyncHandler(submitDraft));

export default router;
