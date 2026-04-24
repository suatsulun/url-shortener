import { Router } from "express";
import { authenticate, adminAuth } from "../middleware/authenticate.js";
import {
  deleteUrl,
  redirectUrl,
  shortenUrl,
  triggerCleanup,
  getUserUrls,
} from "../controllers/urlController.js";
import validate from "../middleware/validate.js";
import {
  shortenUrlSchema,
  shortIdParamSchema,
} from "../validation/urlSchemas.js";

const router = Router();

router.post(
  "/shorten",
  authenticate,
  validate({ schema: shortenUrlSchema, source: "body" }),
  shortenUrl,
);
router.get("/me", authenticate, getUserUrls);
router.delete(
  "/:shortId",
  authenticate,
  validate({ schema: shortIdParamSchema, source: "params" }),
  deleteUrl,
);
router.post("/admin/cleanup", adminAuth, triggerCleanup);
router.get("/:shortId", redirectUrl);

export default router;
