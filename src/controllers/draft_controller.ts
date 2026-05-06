import { Request, Response } from "express"
import { DraftSubmissionInput } from "../schemas/draft_schema.js";
import { isValidGazellaJson } from "../validators/article_validator.js";
import { SubmitDraftRequest, SubmitDraftResponse } from "../grpc/drafts/types.js";
import { grpcSubmitDraft } from "../grpc/drafts/client.js";
import { executeGrpcCall, INVALID_ARGUMENT } from "../grpc/grpc_util.js";
import { ServiceDomainError } from "../errors/error.js";

export const submitDraft = async (req: Request<{}, {}, DraftSubmissionInput>, res: Response) : Promise<void> => {
    const userId = req.auth?.sub;

    if (!userId) {
        res.status(401).json({ message: "Invalid Token or subject is missing (sub)", code: "MISSING_SUB" });
        return;
    }

    const userRoles = req.auth?.roles || [];
    const userPermissions = req.auth?.permissions || [];

    const isAuthorized = userRoles.includes("volunteer") || userPermissions.includes("write:articles");

    if (!isAuthorized) {
        res.status(403).json({ error: "You don't have permissions to write articles", code: "FORBIDDEN" });
        return;
    }

    const draftData = req.body;

    if (draftData.authorId !== userId) {
        res.status(403).json({ message: "Subject and authorId don't match.", code: "AUTHOR_MISMATCH" });
        return;
    }

    if (!isValidGazellaJson(draftData.content)) {
        res.status(400).json({ message: "The draft's content does not adhere to Editor.js format", code: "BAD_CONTENT" });
        return;
    }

    const response = await sendDraftSubmission(draftData);
    
    res.status(201).json({ message: response.message, id: response.article_id });
}

async function sendDraftSubmission(data: DraftSubmissionInput) : Promise<SubmitDraftResponse> {
    const request: SubmitDraftRequest = {
        title: data.title,
        cover_uri: data.coverUri || "",
        summary: data.summary,
        category_id: data.categoryId,
        author_id: data.authorId,
        content: data.content
    }

    try {
        const response = await executeGrpcCall(grpcSubmitDraft(request));
        console.log(`[INFO] Draft submission sent id: ${response.article_id}`);
        
        return response;
    } catch (error) {
        if (!(error instanceof ServiceDomainError)) {
            throw error;
        }

        if (error.domainCode === INVALID_ARGUMENT) {
            error.statusCode = 400;
            error.message = error.originalMessage;
        }
        throw error;
    }
}
