const { Router } = require("express");
const router = Router();

router.get("/", async (req, res) => {
	res.render("index", {
		title: "Index"
	});
});
module.exports = router;