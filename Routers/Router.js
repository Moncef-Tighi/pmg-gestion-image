import express from "express";
import * as imageHandelerController from "../controllers/imageHandelerController.js";
import multer from "multer";
import slug from "slug";

const router = express.Router();

slug.charmap['.'] = '.'
// const storage = multer.diskStorage({
//   destination: './public/uploads/',
//   filename: function ( request, file, cb ) {
//     cb( null, slug(`${file.originalname}`, {
//       lower: false,
//     }));
//   }}
// );
const storage = multer.memoryStorage();
const uploadImage = multer({ storage : storage,
  limits: { fileSize: 50 * 1024 * 1024 },
})

router.post("/image/add",
  uploadImage.single('file'),  
  imageHandelerController.addOneImage
);

router.post("/image/delete",
  imageHandelerController.removeOneImage
);

// router.post("/image/remove",
//   articleController.removeImage
// });

export default router