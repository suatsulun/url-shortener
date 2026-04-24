import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import {
  changePassword,
  deleteMe,
  editMe,
  getCurrentUser,
  login,
  logout,
  register,
} from "../controllers/userController.js";
import validate from "../middleware/validate.js";
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
  changePasswordSchema,
} from "../validation/userSchemas.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post(
  "/register",
  authLimiter,
  validate({ schema: registerSchema, source: "body" }),
  register,
);
router.post(
  "/login",
  authLimiter,
  validate({ schema: loginSchema, source: "body" }),
  login,
);

router.get("/me", authenticate, getCurrentUser);
router.patch(
  "/me",
  authenticate,
  validate({ schema: updateProfileSchema, source: "body" }),
  editMe,
);
router.patch(
  "/me/password",
  authenticate,
  validate({ schema: changePasswordSchema, source: "body" }),
  changePassword,
);
router.delete("/me", authenticate, deleteMe);
router.post("/logout", authenticate, logout);

export default router;
