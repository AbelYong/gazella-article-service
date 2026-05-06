import { z } from "zod"

export const DraftSubmissionSchema = z.object({
    title: z.string()
        .trim().max(128, {error: "Title cannot be longer than 128 characters" }),
    coverUri: z.url().trim().optional(),
    summary: z.string().trim().max(500, {error: "Content cannot be longer than 500 characters" }),
    categoryId: z.uuidv4(),
    authorId: z.uuidv4(),
    content: z.string(),
});

export type DraftSubmissionInput = z.infer<typeof DraftSubmissionSchema>
