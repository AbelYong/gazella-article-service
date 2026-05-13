import { Request, Response } from "express"
import { DraftIdInput, DraftPublicationInput, DraftSubmissionInput, DraftUpdateInput } from "../schemas/draft_schema.js";
import { isValidGazellaJson } from "../validators/article_validator.js";
import { PublishDraftRequest, PublishDraftResponse, SubmitDraftRequest, SubmitDraftResponse, UpdateDraftRequest, UpdateDraftResponse } from "../grpc/drafts/types.js";
import { ExecuteCall } from "../grpc/grpc_util.js";
import { DraftGrpcClient } from "../grpc/drafts/client.js";
import { ControllerAuthorization, processAuthorization } from "../security/auth_util.js";
import { Editor, Moderator, Organizer, Volunteer, WriteArticles } from "../security/authorizations.js";

type DraftService = {
    client: DraftGrpcClient,
    executeCall: ExecuteCall
}

export const makeSubmitDraftController = (client: DraftGrpcClient, executeCall: ExecuteCall) => {
    return async (req: Request<{}, {}, DraftSubmissionInput>, res: Response) : Promise<void> => {
        const userId = req.auth?.sub;

        const auth: ControllerAuthorization = {
            userId: req.auth?.sub,
            roles: req.auth?.roles,
            permissions: req.auth?.permissions,
            allowedRoles: [Volunteer, Organizer, Editor, Moderator],
            fineGrainedPermission: WriteArticles
        };

        const authResult = processAuthorization(auth);

        if (authResult.statusCode !== 200) {
            res.status(authResult.statusCode).json({ message: authResult.message, code: authResult.code });
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

        const response = await submitDraft({client, executeCall}, draftData);
        
        res.status(201).json({ message: response.message, id: response.article_id });
    }
}

async function submitDraft(service: DraftService, draft: DraftSubmissionInput) : Promise<SubmitDraftResponse> {
    const request: SubmitDraftRequest = {
        title: draft.title,
        cover_uri: draft.coverUri || "",
        summary: draft.summary,
        category_id: draft.categoryId,
        author_id: draft.authorId,
        content: draft.content
    }

    const response = await service.executeCall(service.client.submitDraft(request));
    console.log(`[INFO] Draft submission sent id: ${response.article_id}`);
        
    return response;
}

export const makeUpdateDraftController = (client: DraftGrpcClient, executeCall: ExecuteCall) => {
    return async (req: Request<DraftIdInput, {}, DraftUpdateInput, {}>, res: Response): Promise<void> => {
        const auth: ControllerAuthorization = {
            userId: req.auth?.sub,
            roles: req.auth?.roles,
            permissions: req.auth?.permissions,
            allowedRoles: [Volunteer, Organizer, Editor, Moderator],
            fineGrainedPermission: WriteArticles
        };

        const authResult = processAuthorization(auth);

        if (authResult.statusCode !== 200) {
            res.status(authResult.statusCode).json({ message: authResult.message, code: authResult.code });
            return;
        }

        const draftData = req.body;

        if (!isValidGazellaJson(draftData.content)) {
            res.status(400).json({ message: "The draft's content does not adhere to Editor.js format", code: "BAD_CONTENT" });
            return;
        }

        const draftId = req.params.draftId;

        const response = await updateDraft({client, executeCall}, draftId, draftData);

        res.status(200).json({ message: response.message });
    }
}

async function updateDraft(service: DraftService, draftId: string, draft: DraftUpdateInput) : Promise<UpdateDraftResponse> {
    const request: UpdateDraftRequest = {
        draft_id: draftId,
        title: draft.title,
        cover_uri: draft.coverUri || "",
        category_id: draft.categoryId,
        summary: draft.summary,
        content: draft.content
    };

    const response = await service.executeCall(service.client.updateDraft(request));
    console.log(`[INFO] Draft successfully updated. Id: ${request.draft_id}`);
        
    return response;
}

export const makePublishDraftController = (client: DraftGrpcClient, executeCall: ExecuteCall) => {
    return async (req: Request<DraftIdInput, {}, DraftPublicationInput, {}>, res: Response) : Promise<void> => {
        const auth: ControllerAuthorization = {
            userId: req.auth?.sub,
            roles: req.auth?.roles,
            permissions: req.auth?.permissions,
            allowedRoles: [Volunteer, Organizer, Editor, Moderator],
            fineGrainedPermission: WriteArticles
        };

        const authResult = processAuthorization(auth);

        if (authResult.statusCode !== 200) {
            res.status(authResult.statusCode).json({ message: authResult.message, code: authResult.code });
            return;
        }

        const draftData = req.body;

        if (!isValidGazellaJson(draftData.content)) {
            res.status(400).json({ message: "The draft's content does not adhere to Editor.js format", code: "BAD_CONTENT" });
            return;
        }

        const draftId = req.params.draftId;

        const response = await publishDraft({client, executeCall}, draftId, draftData);

        res.status(200).json({ message: response.message });
    }
}

async function publishDraft(service: DraftService, draftId: string, draft: DraftPublicationInput) : Promise<PublishDraftResponse> {
    const request: PublishDraftRequest = {
        draft_id: draftId,
        title: draft.title,
        author_name: draft.authorName,
        author_pfp_uri: draft.authorPfpUri || "",
        cover_uri: draft.coverUri || "",
        category_id: draft.categoryId,
        summary: draft.summary,
        content: draft.content
    };

    const response = await service.executeCall(service.client.publishDraft(request));
    console.log(`[INFO] Draft publication request sent for draft Id: ${request.draft_id}, Updated to status: ${response.article_status}`);
        
    return response;
}
