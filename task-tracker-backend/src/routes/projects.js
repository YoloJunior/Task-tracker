// Маршрути проектів

const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { auth } = require('../middleware/auth');

// Всі маршрути захищені
router.use(auth);

router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', projectController.createProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router;
