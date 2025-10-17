import { Router } from "express";
import {userRegister ,userLogin, userLogout, refreshAccessToken, updateCurrentPassword, getCurrentUser, updateAccountDetails, updateAvatar, updatecoverImage} from "../controllers/user.controller.js";
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
router.route('/reset-password',verifyJwt,updateCurrentPassword)
router.route('/get-current-user',verifyJwt,getCurrentUser)
router.route('/updateAccount-details', verifyJwt ,updateAccountDetails)
router.route('/updateAvatar',verifyJwt,upload.single({name:"avatar",maxCount:1}),updateAvatar)
router.route('/updateCoveImage',verifyJwt,upload.single({name:"coverImage",maxCount:1}),updatecoverImage)
export default router;
