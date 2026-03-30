import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { changePassword, deleteMe, editMe, getCurrentUser, login, logout, register } from "../controllers/userController.js";


const router = Router();


router.post("/register", register);
router.post("/login", login);

router.get("/me", authenticate, getCurrentUser);
router.patch("/me", authenticate, editMe);
router.patch("/me/password", authenticate, changePassword);
router.delete("/me", authenticate, deleteMe);
router.post("/logout", authenticate, logout);




export default router;

