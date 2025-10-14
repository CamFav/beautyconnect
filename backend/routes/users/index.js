const express = require("express");
const router = express.Router();

router.use(require("./getPros"));
router.use(require("./follow"));
router.use(require("./avatar"));
router.use(require("./getOne"));
router.use(require("./getMany"));

module.exports = router;
