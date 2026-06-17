import { Router } from "express"
import { requireAuth } from "../validators/auth_validator.js";
import { asyncHandler } from "../handlers/async_handler.js";
import { validateBody, validateParams } from "../validators/request_validator.js";
import { makeGetDraftController, makePublishDraftController, makeSubmitDraftController, makeUpdateDraftController } from "../controllers/draft_controller.js";
import { DraftIdSchema, DraftPublicationSchema, DraftSubmissionSchema, DraftUpdateSchema } from "../schemas/draft_schema.js";
import { DraftGrpcClient } from "../grpc/drafts/client.js";
import { executeGrpcCall, DataServiceUrl } from "../grpc/grpc_util.js";
import { ArticleIdSchema } from "../schemas/article_schema.js";

const router = Router();

const draftClient = new DraftGrpcClient(DataServiceUrl);

const getDraft = makeGetDraftController(draftClient, executeGrpcCall);
const submitDraft = makeSubmitDraftController(draftClient, executeGrpcCall);
const updateDraft = makeUpdateDraftController(draftClient, executeGrpcCall);
const publishDraft = makePublishDraftController(draftClient, executeGrpcCall);

router.get("/drafts/:articleId", requireAuth, validateParams(ArticleIdSchema), asyncHandler(getDraft));

/**
 * @openapi
 * /drafts:
 *   post:
 *     summary: Submit a new draft
 *     description: >
 *       Submits a new draft for an article. The `content` field must be an escaped,
 *       stringified EditorJS JSON payload. Requires authorization via JWT with specific
 *       roles (`volunteer`, `organizer`, `editor`, `moderator`) or the `write:articles` permission.
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
 *                 description: Title of the draft. Cannot be longer than 128 characters.
 *               coverUri:
 *                 type: string
 *                 format: uri
 *                 description: Optional URL for the cover image.
 *               summary:
 *                 type: string
 *                 maxLength: 500
 *                 description: Brief summary of the draft. Cannot be longer than 500 characters.
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 description: UUIDv4 identifier of the category.
 *               authorId:
 *                 type: string
 *                 format: uuid
 *                 description: UUIDv4 identifier of the author.
 *               content:
 *                 type: string
 *                 description: Escaped stringified EditorJS payload.
 *           example:
 *             title: "El colapso de los arrecifes de coral"
 *             summary: "Durante los ultimos 20 años..."
 *             categoryId: "75d06355-6891-4a1e-ba5a-12d7863a754e"
 *             authorId: "79c515bd-9ef2-4f19-bf5a-23e65cbfad8b"
 *             content: "{\"time\":1550476186479,\"blocks\":[{\"id\":\"oUq2g_tl8y\",\"type\":\"header\",\"data\":{\"text\":\"Editor.js\",\"level\":2}},{\"id\":\"zbGZFPM-iI\",\"type\":\"paragraph\",\"data\":{\"text\":\"Hey. Meet the new Editor. On this page you can see it in action — try to edit this text. Source code of the page contains the example of connection and configuration.\"}},{\"id\":\"qYIGsjS5rt\",\"type\":\"header\",\"data\":{\"text\":\"Key features\",\"level\":3}},{\"id\":\"XV87kJS_H1\",\"type\":\"list\",\"data\":{\"style\":\"unordered\",\"items\":[\"It is a block-styled editor\",\"It returns clean data output in JSON\",\"Designed to be extendable and pluggable with a simple API\"]}},{\"id\":\"AOulAjL8XM\",\"type\":\"header\",\"data\":{\"text\":\"What does it mean «block-styled editor»\",\"level\":3}},{\"id\":\"cyZjplMOZ0\",\"type\":\"paragraph\",\"data\":{\"text\":\"Workspace in classic editors is made of a single contenteditable element, used to create different HTML markups. Editor.js <mark class=\\\"cdx-marker\\\">workspace consists of separate Blocks: paragraphs, headings, images, lists, quotes, etc</mark>. Each of them is an independent contenteditable element (or more complex structure) provided by Plugin and united by Editor's Core.\"}}],\"version\":\"2.8.1\"}"
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
 *                 id:
 *                   type: string
 *                   format: uuid
 *             example:
 *               message: "Draft submitted successfully"
 *               id: "29661a3b-cb7f-4212-bae8-6f4677e7ef38"
 *       '400':
 *         description: Bad Request. Likely will be a schema validation error.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                     details:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           field:
 *                             type: string
 *                           message:
 *                             type: string
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     code:
 *                       type: string
 *             examples:
 *               ValidationError:
 *                 summary: Schema validation failed
 *                 value:
 *                   error: "Invalid Input"
 *                   details:
 *                     - field: "summary"
 *                       message: "Invalid input: expected string, received undefined"
 *               InvalidArgument:
 *                 summary: Invalid business argument
 *                 value:
 *                   message: "Category not found"
 *                   code: "INVALID_ARGUMENT"
 *       '401':
 *         description: Access denied due to missing or invalid authorization.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 *                 code:
 *                   type: string
 *             example:
 *               error: "Access denied"
 *               message: "No authorization token was found"
 *               code: "UNAUTHORIZED"
 *       '403':
 *         description: Forbidden. The provided JWT is valid, but the user lacks the required roles or permissions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 code:
 *                   type: string
 *             example:
 *               message: "You do not have permission to access this function or content"
 *               code: "FORBIDDEN"
 *       '404':
 *         description: Not Found. The category ID does not match an existing category.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 code:
 *                   type: string
 *             example:
 *               message: "Category not found"
 *               code: "NOT_FOUND"
 *       '500':
 *         description: Internal Server Error. Service communication infrastructure fault.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 *             example:
 *               error: "Internal Server Error"
 *               message: "An internal infrastructure error occurred while communicating with Article Data Service"
 *       '503':
 *         description: Service Unavailable. The underlying database failed to respond.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 code:
 *                   type: string
 *             example:
 *               message: "The database is not available, it took to long to respond or another internal issue"
 *               code: "DB_UNAVAILABLE"
 */
router.post("/drafts", requireAuth, validateBody(DraftSubmissionSchema), asyncHandler(submitDraft));

/**
 * @openapi
 * /drafts/{draftId}:
 *   patch:
 *     summary: Update an existing draft
 *     description: >
 *       Updates an existing article draft by its ID. Requires authorization via JWT with specific
 *       roles (`volunteer`, `organizer`, `editor`, `moderator`) or the `write:articles` permission.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: draftId
 *         in: path
 *         required: true
 *         description: The UUIDv4 identifier of the draft to update.
 *         schema:
 *           type: string
 *           format: uuid
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
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 128
 *                 description: Title of the draft. Cannot be longer than 128 characters.
 *               coverUri:
 *                 type: string
 *                 format: uri
 *                 description: Optional URL for the cover image.
 *               summary:
 *                 type: string
 *                 maxLength: 500
 *                 description: Brief summary of the draft. Cannot be longer than 500 characters.
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 description: UUIDv4 identifier of the category.
 *               content:
 *                 type: string
 *                 description: Escaped stringified EditorJS payload.
 *           example:
 *             title: "El colapso de los arrecifes de coral"
 *             summary: "Segunda revisión. En los ultimos 20 años"
 *             categoryId: "75d06355-6891-4a1e-ba5a-12d7863a754e"
 *             authorId: "79c515bd-9ef2-4f19-bf5a-23e65cbfad8b"
 *             content: "{\"time\":1550476186479,\"blocks\":[{\"id\":\"oUq2g_tl8y\",\"type\":\"header\",\"data\":{\"text\":\"Editor.js\",\"level\":2}},{\"id\":\"zbGZFPM-iI\",\"type\":\"paragraph\",\"data\":{\"text\":\"Hey. Meet the new Editor. On this page you can see it in action — try to edit this text. Source code of the page contains the example of connection and configuration.\"}},{\"id\":\"qYIGsjS5rt\",\"type\":\"header\",\"data\":{\"text\":\"Key features\",\"level\":3}},{\"id\":\"XV87kJS_H1\",\"type\":\"list\",\"data\":{\"style\":\"unordered\",\"items\":[\"It is a block-styled editor\",\"It returns clean data output in JSON\",\"Designed to be extendable and pluggable with a simple API\"]}},{\"id\":\"AOulAjL8XM\",\"type\":\"header\",\"data\":{\"text\":\"What does it mean «block-styled editor»\",\"level\":3}},{\"id\":\"cyZjplMOZ0\",\"type\":\"paragraph\",\"data\":{\"text\":\"Workspace in classic editors is made of a single contenteditable element, used to create different HTML markups. Editor.js <mark class=\\\"cdx-marker\\\">workspace consists of separate Blocks: paragraphs, headings, images, lists, quotes, etc</mark>. Each of them is an independent contenteditable element (or more complex structure) provided by Plugin and united by Editor's Core.\"}}],\"version\":\"2.8.1\"}"
 *     responses:
 *       '200':
 *         description: Draft successfully updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Draft successfully updated"
 *       '400':
 *         description: Bad Request. The content payload is invalid or does not adhere to the required format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 code:
 *                   type: string
 *             example:
 *               message: "The draft's content does not adhere to Editor.js format"
 *               code: "BAD_CONTENT"
 *       '401':
 *         description: Access denied due to missing or invalid authorization.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 *                 code:
 *                   type: string
 *             example:
 *               error: "Access denied"
 *               message: "No authorization token was found"
 *               code: "UNAUTHORIZED"
 *       '403':
 *         description: Forbidden. The provided JWT is valid, but the user lacks the required roles or permissions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 code:
 *                   type: string
 *             example:
 *               message: "You do not have permission to access this function or content"
 *               code: "FORBIDDEN"
 *       '404':
 *         description: Not Found. No draft was found matching the provided ID. Or no category matching the provided categoryId.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 code:
 *                   type: string
 *             example:
 *               message: "No draft was found for id: 299a20e3-efc4-4f7c-a172-2d3af439aed7"
 *               code: "NOT_FOUND"
 *       '500':
 *         description: Internal Server Error. Service communication infrastructure fault.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 *             example:
 *               error: "Internal Server Error"
 *               message: "An internal infrastructure error occurred while communicating with Article Data Service"
 *       '503':
 *         description: Service Unavailable. The underlying database failed to respond.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 code:
 *                   type: string
 *             example:
 *               message: "The database is not available, it took to long to respond or another internal issue"
 *               code: "DB_UNAVAILABLE"
 */
router.patch("/drafts/:draftId", requireAuth, validateParams(DraftIdSchema), validateBody(DraftUpdateSchema), asyncHandler(updateDraft));

/**
 * @openapi
 * /drafts/{draftId}/publications:
    post:
      summary: Submit a draft for publication
      description: >
        Submits a specific draft for publication. The `content` field must be an escaped,
        stringified EditorJS JSON payload. Requires authorization via JWT with specific
        roles (`volunteer`, `organizer`, `editor`, `moderator`) or the `write:articles` permission.
      security:
        - bearerAuth: []
      parameters:
        - name: draftId
          in: path
          required: true
          description: The UUIDv4 identifier of the draft to submit for publication.
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - title
                - summary
                - categoryId
                - authorName
                - content
              properties:
                title:
                  type: string
                  maxLength: 128
                  description: Title of the draft. Cannot be longer than 128 characters.
                coverUri:
                  type: string
                  format: uri
                  description: Optional URL for the cover image.
                summary:
                  type: string
                  maxLength: 500
                  description: Brief summary of the draft. Cannot be longer than 500 characters.
                categoryId:
                  type: string
                  format: uuid
                  description: UUIDv4 identifier of the category.
                authorName:
                  type: string
                  maxLength: 64
                  description: Name of the author. Cannot be longer than 64 characters.
                authorPfpUri:
                  type: string
                  format: uri
                  description: Optional URL for the author's profile picture.
                content:
                  type: string
                  description: Escaped stringified EditorJS payload.
            example:
              title: "El colapso de los arrecifes de coral"
              summary: "En los ultimos 20 años..."
              categoryId: "75d06355-6891-4a1e-ba5a-12d7863a754e"
              authorName: "Abel Hernández Yong"
              content: "{\"time\":1550476186479,\"blocks\":[{\"id\":\"oUq2g_tl8y\",\"type\":\"header\",\"data\":{\"text\":\"Editor.js\",\"level\":2}}],\"version\":\"2.8.1\"}"
      responses:
        '200':
          description: Draft submitted for publication successfully.
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
              example:
                message: "The draft has been submitted for publication"
        '400':
          description: Bad Request. Schema validation failed for the input payload.
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                  details:
                    type: array
                    items:
                      type: object
                      properties:
                        field:
                          type: string
                        message:
                          type: string
              example:
                error: "Invalid Input"
                details:
                  - field: "coverUri"
                    message: "Invalid input: expected string, received null"
        '401':
          description: Access denied due to missing or invalid authorization.
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                  message:
                    type: string
                  code:
                    type: string
              example:
                error: "Access denied"
                message: "No authorization token was found"
                code: "UNAUTHORIZED"
        '403':
          description: Forbidden. The provided JWT is valid, but the user lacks the required roles or permissions.
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                  code:
                    type: string
              example:
                message: "You do not have permission to access this function or content"
                code: "FORBIDDEN"
        '500':
          description: Internal Server Error. Service communication infrastructure fault.
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                  message:
                    type: string
              example:
                error: "Internal Server Error"
                message: "An internal infrastructure error occurred while communicating with Article Data Service"
        '503':
          description: Service Unavailable. The underlying database failed to respond.
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                  code:
                    type: string
              example:
                message: "The database is not available, it took to long to respond or another internal issue"
                code: "DB_UNAVAILABLE"
 */
router.post("/drafts/:draftId/publications", requireAuth, validateParams(DraftIdSchema), validateBody(DraftPublicationSchema), asyncHandler(publishDraft));

export const DraftsRouter = router;
