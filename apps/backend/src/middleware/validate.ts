import { Request, Response, NextFunction } from "express";
import { z } from "zod";

interface ValidationOptions {
  schema: z.ZodSchema;
  source: "body" | "params" | "query";
}
const validate = (options: ValidationOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req[options.source] = await options.schema.parseAsync(
        req[options.source],
      );
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: error.issues[0].message ?? "Invalid input" });
      }

      next(error);
    }
  };
};

export default validate;
