// Маршрути тегів

const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const { auth } = require('../middleware/auth');

// Всі маршрути захищені
router.use(auth);

router.get('/', tagController.getAllTags);
router.get('/:id', tagController.getTagById);
router.post('/', tagController.createTag);
router.put('/:id', tagController.updateTag);
router.delete('/:id', tagController.deleteTag);

module.exports = router;
