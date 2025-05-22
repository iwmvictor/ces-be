import express, {
  json,
  urlencoded,
  Response as ExResponse,
  Request as ExRequest,
  NextFunction,
} from "express";
// Explanation: This line intentionally causes an error because...
// @ts-ignore
import { RegisterRoutes } from "../build/routes";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import { TUser } from "./utils/interfaces/common";
import AppError, { ValidationError } from "./utils/error";

declare module "express" {
  interface Request {
    user?: TUser;
  }
}

const app = express();
const PORT = process.env.PORT || 3000;
app.use(
  urlencoded({
    extended: true,
  }),
);

app.use(json());
app.use(cors());
app.use("/docs", swaggerUi.serve, async (_req: ExRequest, res: ExResponse) => {
  return res.send(
    //@ts-ignore
    swaggerUi.generateHTML(await import("../build/swagger.json")),
  );
});

RegisterRoutes(app);

app.use(function errorHandler(
  err: unknown,
  req: ExRequest,
  res: ExResponse,
  next: NextFunction,
): ExResponse | void {
  console.log(err);
  if (err instanceof AppError) {
    return res.status(err.status).json({
      status: err.status,
      message: err.message,
    });
  }

  if (err instanceof ValidationError) {
    return res
      .status(400)
      .json({ error: "validate", data: JSON.parse(err.message) });
  }
  if (err instanceof Error) {
    return res.status(500).json({
      message: err.message ?? "Internal server error",
      status: 500,
    });
  }
  next();
});

app.listen(PORT, () =>
  console.log(`API running on PORT http://localhost:${PORT} wow!s`),
);
