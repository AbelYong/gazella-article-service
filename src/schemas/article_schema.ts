import z from "zod";

export const ArticleIdSchema = z.object({
    articleId: z.uuidv4()
});

export type ArticleIdInput = z.infer<typeof ArticleIdSchema>
