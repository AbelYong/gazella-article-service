import z from "zod"
import { MaxOffset, MaxPageIndex } from "../validators/pagination_util.js";

export const GetArticlesPendingReviewSchema = z.object({
    pageIndex: z.coerce.number().int()
        .min(1, { error: "Page index cannot be lower than 1"} )
        .max(MaxPageIndex, { error: `Page index cannot be higher than ${MaxPageIndex}`} )
        .default(1),
    pageSize: z.coerce.number().int()
        .min(10, { error: "Page size cannot be lower than 10" })
        .max(50, { error: "Page size cannot be higher than 50" })
        .default(10)
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

export type GetArticlesPendingReviewInput = z.infer<typeof GetArticlesPendingReviewSchema>

export const RejectArticleSchema = z.object({
    rejectionReason: z.string().trim()
        .max(500, { error: "The rejection reason can only have up to 500 characters" })
});

export type RejectArticleInput = z.infer<typeof RejectArticleSchema>
