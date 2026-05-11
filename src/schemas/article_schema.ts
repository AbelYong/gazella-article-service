import z from "zod";

export const ArticleIdSchema = z.object({
    id: z.uuidv4()
});

export type ArticleIdInput = z.infer<typeof ArticleIdSchema>
