import { Router } from "express";
import {userRegister ,userLogin, userLogout, refreshAccessToken} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middlewaer.js";

const router = Router();

// Route for registration
router.post(
  "/register",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  userRegister
);
//secured Routes
router.post('/login',upload.none(),userLogin)
router.route('/logout').post(verifyJwt,userLogout)
router.route('/refresh-token',refreshAccessToken)
export default router;
