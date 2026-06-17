import z from "zod";
import { MaxOffset, MaxPageIndex } from "../validators/pagination_util.js";

export const CommentArticleSchema = z.object({
    authorName: z.string().trim()
        .max(128, {error: "Author Name cannot be longer than 128 characters"}),
    authorPfpUri: z.string().trim()
        .pipe(
            z.union([z.url(), z.literal("").transform(() => undefined)])
        ).optional(),
    content: z.string().trim()
        .max(1000, {error: "Comment content cannot be longer than a 1000 characters"})
});

export type CommentArticleInput = z.infer<typeof CommentArticleSchema>

export const DeleteCommentSchema = z.object({
    articleId: z.uuidv4(),
    commentId: z.uuidv4(),
});

export type DeleteCommentInput = z.infer<typeof DeleteCommentSchema>

export const GetCommentsSchema = z.object({
    pageIndex: z.coerce.number().int()
        .min(1, { error: "Page index cannot be lower than 1"} )
        .max(MaxPageIndex, { error: `Page index cannot be higher than ${MaxPageIndex}`} )
        .default(1),
    pageSize: z.coerce.number().int()
        .min(10, { error: "Page size cannot be lower than 10" })
        .max(50, { error: "Page size cannot be higher than 50" })
        .default(10),
}).superRefine((data, ctx) => {
    const offset = data.pageIndex * data.pageSize;
    if (offset > MaxOffset) {
        ctx.addIssue({
            code: "too_big",
            maximum: MaxOffset,
            origin: "int",
            message: "The calculaded page offset is too high",
            path: ["pageSize", "pageIndex"]
        });
    } 
});

export type GetCommentsInput = z.infer<typeof GetCommentsSchema>

export const DeleteOwnCommentSchema = z.object({
    authorId: z.uuidv4(),
    articleId: z.uuidv4(),
    commentId: z.uuidv4()
});

export type DeleteOwnCommentInput = z.infer<typeof DeleteOwnCommentSchema>
