import { Router } from "express";
import { authenticate, adminAuth } from "../middleware/authenticate.js";
import { redirectUrl, shortenUrl, triggerCleanup } from "../controllers/urlController.js";

const router = Router();

router.post("/shorten", authenticate, shortenUrl);
router.get("/:shortId", redirectUrl);
router.post('/admin/cleanup', adminAuth, triggerCleanup);

export default router;