import express from "express"
import dotenv from "dotenv"
import swaggerJsDoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import { swaggerOptions } from "./swagger.js"
import { ArticlesRouter } from "./routes/articles_routes.js"
import { DraftsRouter } from "./routes/drafts_routes.js"
import { InteractionsRouter } from "./routes/interactions_routes.js"
import { ReviewsRouter } from "./routes/reviews_routes.js"
import { globalErrorHandler } from "./handlers/error_handler.js"

dotenv.config();

const app = express();
app.disable("x-powered-by");

const specs = swaggerJsDoc(swaggerOptions);

async function startServer() {
    try {
        app.use(express.json());

        if (process.env["NODE_ENV"] === "development") {
            app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));
        }

        app.use(ArticlesRouter);
        app.use(DraftsRouter);
        app.use(InteractionsRouter);
        app.use(ReviewsRouter);

        app.use(globalErrorHandler);

        const PORT = process.env["PORT"] || 7000;
        app.listen(PORT, () => {
            console.log(`Article service listening on ${PORT}`);
        });
    } catch (error) {
        console.error("Failure on startup", error);
        process.exit(1);
    }
}

await startServer();
