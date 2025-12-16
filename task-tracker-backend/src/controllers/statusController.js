// Контролер статусів

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Отримати всі статуси користувача
exports.getAllStatuses = async (req, res) => {
  try {
    const statuses = await prisma.status.findMany({
      where: { ownerId: req.user.userId },
      orderBy: { sortOrder: 'asc' }
    });

    res.json(statuses);
  } catch (error) {
    console.error('Get statuses error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Отримати статус за ID
exports.getStatusById = async (req, res) => {
  try {
    const { id } = req.params;

    const status = await prisma.status.findUnique({
      where: { id: parseInt(id) }
    });

    if (!status) {
      return res.status(404).json({ error: 'Status not found' });
    }

    if (status.ownerId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(status);
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Створити статус
exports.createStatus = async (req, res) => {
  try {
    const { name, sortOrder } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const status = await prisma.status.create({
      data: {
        name,
        sortOrder: sortOrder || 1,
        ownerId: req.user.userId
      }
    });

    res.status(201).json(status);
  } catch (error) {
    console.error('Create status error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Оновити статус
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sortOrder } = req.body;

    const existingStatus = await prisma.status.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingStatus) {
      return res.status(404).json({ error: 'Status not found' });
    }

    if (existingStatus.ownerId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const status = await prisma.status.update({
      where: { id: parseInt(id) },
      data: {
        name: name || existingStatus.name,
        sortOrder: sortOrder !== undefined ? sortOrder : existingStatus.sortOrder
      }
    });

    res.json(status);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Видалити статус
exports.deleteStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const existingStatus = await prisma.status.findUnique({
      where: { id: parseInt(id) },
      include: { tasks: true }
    });

    if (!existingStatus) {
      return res.status(404).json({ error: 'Status not found' });
    }

    if (existingStatus.ownerId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Не можна видалити якщо є завдання з цим статусом
    if (existingStatus.tasks.length > 0) {
      return res.status(400).json({ error: 'Cannot delete status that is being used by tasks' });
    }

    await prisma.status.delete({ where: { id: parseInt(id) } });

    res.json({ message: 'Status deleted successfully' });
  } catch (error) {
    console.error('Delete status error:', error);
    res.status(500).json({ error: error.message });
  }
};
