const express = require("express");
const router = express.Router();

const upload = require("../../middleware/upload");
const { protect } = require("../../middleware/auth");


// Sous-routes pour les posts
router.use("/", require("./list"));       // GET /api/posts      (feed)


router.use("/", require("./create"));     // POST /api/posts
router.use("/", require("./update"));     // PUT/PATCH /api/posts/:id
router.use("/", require("./delete"));     // DELETE /api/posts/:id
router.use("/", require("./like"));       // POST /api/posts/:id/like
router.use("/", require("./favorite")); // POST /api/posts/:id/favorite


module.exports = router;