const router = require("express").Router();
const mod = require("../controllers/moduleController");

router.post("/:courseId/modules", mod.addModule);

router.get("/:courseId/modules", mod.getModules);
router.get("/:courseId/modules/:moduleId", mod.getModuleById);

router.delete("/:courseId/modules/:moduleId", mod.deleteModule);

module.exports = router;
