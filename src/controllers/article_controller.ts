import { Request, Response } from "express"
import { GetCategoriesRequest } from '../grpc/articles/types.js';
import { executeGrpcCall } from "../grpc/grpc_util.js";
import { grpcGetCategories } from "../grpc/articles/client.js";

export const getCategories = async (_req: Request, res: Response) : Promise<void> => {
    const request: GetCategoriesRequest = {};

    const response = await executeGrpcCall(grpcGetCategories(request));

    res.status(200).json({categories: response.categories});
}
