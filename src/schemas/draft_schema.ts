import { z } from "zod"

export const DraftSubmissionSchema = z.object({
    title: z.string()
        .trim().max(128, {error: "Title cannot be longer than 128 characters" }),
    coverUri: z.string().trim()
        .pipe(
            z.union([z.url(), z.literal("").transform(() => undefined)])
        ).optional(),
    summary: z.string().trim().max(500, {error: "Content cannot be longer than 500 characters" }),
    categoryId: z.uuidv4(),
    authorId: z.uuidv4(),
    content: z.string(),
});

export type DraftSubmissionInput = z.infer<typeof DraftSubmissionSchema>

export const DraftIdSchema = z.object({
    draftId: z.uuidv4()
});

export type DraftIdInput = z.infer<typeof DraftIdSchema>

export const DraftUpdateSchema = z.object({
    title: z.string()
        .trim().max(128, {error: "Title cannot be longer than 128 characters" }),
    coverUri: z.string().trim()
        .pipe(
            z.union([z.url(), z.literal("").transform(() => undefined)])
        ).optional(),
    summary: z.string().trim().max(500, {error: "Content cannot be longer than 500 characters" }),
    categoryId: z.uuidv4(),
    content: z.string()
});

export type DraftUpdateInput = z.infer<typeof DraftUpdateSchema>

export const DraftPublicationSchema = z.object({
    title: z.string()
        .trim().max(128, {error: "Title cannot be longer than 128 characters" }),
    coverUri: z.string().trim()
        .pipe(
            z.union([z.url(), z.literal("").transform(() => undefined)])
        ).optional(),
    summary: z.string().trim().max(500, {error: "Content cannot be longer than 500 characters" }),
    categoryId: z.uuidv4(),
    authorName: z.string().trim().max(128, {error: "Author Name cannot be longer than 128 characters"}),
    authorPfpUri: z.string().trim()
        .pipe(
            z.union([z.url(), z.literal("").transform(() => undefined)])
        ).optional(),
    content: z.string()
});

export type DraftPublicationInput = z.infer<typeof DraftPublicationSchema>
