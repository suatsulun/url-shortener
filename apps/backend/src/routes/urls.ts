import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { redirectUrl, shortenUrl } from "../controllers/urlController.js";


const router = Router();

router.post("/shorten", authenticate, shortenUrl);
router.get("/:shortId", redirectUrl);

export default router;