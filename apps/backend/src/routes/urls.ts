import { Router } from "express";
import { authenticate, adminAuth } from "../middleware/authenticate.js";
import { deleteUrl, redirectUrl, shortenUrl, triggerCleanup, getUserUrls } from "../controllers/urlController.js";

const router = Router();

router.post("/shorten", authenticate, shortenUrl);
router.get("/:shortId", redirectUrl);
router.get("/me", authenticate, getUserUrls);
router.delete("/:shortId", authenticate, deleteUrl);
router.post('/admin/cleanup', adminAuth, triggerCleanup);

export default router;