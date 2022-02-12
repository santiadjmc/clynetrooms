const { Router } = require("express");
const router = Router();

router.get("/", (req, res) => res.redirect("/home"));
router.get("/home", async (req, res) => {
	res.render("index", {
		title: "index"
	});
});
module.exports = router;