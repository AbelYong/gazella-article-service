import z from "zod"

export const GetArticlesPendingReviewSchema = z.object({
    pageIndex: z.int()
        .min(1, { error: "Page index has to be 1 or higher" })
        .max(214748363, { error: "Page index cannot be higher than 214748363" }),
    pageSize: z.int()
        .min(10, { error: "Page size cannot be lower than 10" })
        .max(50, { error: "Page size cannot be higher than 50"})
});

export type GetArticlesPendingReviewInput = z.infer<typeof GetArticlesPendingReviewSchema>

export const RejectArticleSchema = z.object({
    rejectionReason: z.string().trim()
        .max(500, { error: "The rejection reason can only have up to 500 characters" })
});

export type RejectArticleInput = z.infer<typeof RejectArticleSchema>
