import z from "zod";
import { MaxOffset, MaxPageIndex } from "../validators/pagination_util.js";

export const ArticleIdSchema = z.object({
    articleId: z.uuidv4()
});

export type ArticleIdInput = z.infer<typeof ArticleIdSchema>

const iso8601ZRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

export const SearchArticlesSchema = z.object({
    pageIndex: z.coerce.number().int()
        .min(1, { error: "Page index cannot be lower than 1"} )
        .max(MaxPageIndex, { error: `Page index cannot be higher than ${MaxPageIndex}`} )
        .default(1),
    pageSize: z.coerce.number().int()
        .min(10, { error: "Page size cannot be lower than 10" })
        .max(50, { error: "Page size cannot be higher than 50" })
        .default(10),
    title: z.string().optional(),
    category: z.string().optional(),
    authorName: z.string().optional(),
    publishedAfter: z.string().regex(iso8601ZRegex, {error: "Invalid date format. Expected ISO 8601. Must end with Z"})
        .refine((date) => !Number.isNaN(Date.parse(date)), {error: "Invalid date value."}).optional(),
    sortBy: z.enum(["published_at","views", "likes", "comments"]).optional()
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

export type SearchArticlesInput = z.infer<typeof SearchArticlesSchema>

export const GetPublishedArticlesSchema = z.object({
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

export type GetPublishedArticlesInput = z.infer<typeof GetPublishedArticlesSchema>

export const GetFeaturedArticlesSchema = z.object({
    amount: z.coerce.number().int().min(3).max(10)
});

export type GetFeaturedArticlesInput = z.infer<typeof GetFeaturedArticlesSchema>