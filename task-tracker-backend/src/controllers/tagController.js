// Контролер тегів

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Отримати всі теги користувача
exports.getAllTags = async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      where: { ownerId: req.user.userId },
      orderBy: { name: 'asc' }
    });

    res.json(tags);
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Отримати тег за ID
exports.getTagById = async (req, res) => {
  try {
    const { id } = req.params;

    const tag = await prisma.tag.findUnique({
      where: { id: parseInt(id) }
    });

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    if (tag.ownerId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(tag);
  } catch (error) {
    console.error('Get tag error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Створити тег
exports.createTag = async (req, res) => {
  try {
    const { name, color } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        color: color || null,
        ownerId: req.user.userId
      }
    });

    res.status(201).json(tag);
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Оновити тег
exports.updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;

    const existingTag = await prisma.tag.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingTag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    if (existingTag.ownerId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const tag = await prisma.tag.update({
      where: { id: parseInt(id) },
      data: {
        name: name || existingTag.name,
        color: color !== undefined ? color : existingTag.color
      }
    });

    res.json(tag);
  } catch (error) {
    console.error('Update tag error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Видалити тег
exports.deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    const existingTag = await prisma.tag.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingTag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    if (existingTag.ownerId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.tag.delete({ where: { id: parseInt(id) } });

    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({ error: error.message });
  }
};
