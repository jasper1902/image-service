import express, { Router } from "express";

import verifyAdmin from "../middlewares/verify";
import { login, register, verifyUser } from "../controllers/user";

const router: Router = express.Router();
router.post("/register", [verifyAdmin], register);

router.post("/login", login);

router.get("/verify", [verifyAdmin], verifyUser);

export default router;
