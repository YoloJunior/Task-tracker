// Контролер завдань

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Отримати всі завдання з фільтрами
exports.getAllTasks = async (req, res) => {
  try {
    const { projectId, statusId, tagId } = req.query;
    const where = {};

    // Не-адмін бачить тільки свої проекти
    if (req.user.role !== 'admin') {
      const userProjects = await prisma.project.findMany({
        where: { ownerId: req.user.userId },
        select: { id: true }
      });
      const projectIds = userProjects.map(p => p.id);
      where.projectId = { in: projectIds };
    }

    // Фільтри
    if (projectId) where.projectId = parseInt(projectId);
    if (statusId) where.statusId = parseInt(statusId);
    if (tagId) where.tags = { some: { tagId: parseInt(tagId) } };

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: { select: { id: true, title: true } },
        status: true,
        assignedUser: { select: { id: true, name: true, email: true } },
        tags: { include: { tag: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Трансформуємо теги для frontend
    const transformedTasks = tasks.map(task => ({
      ...task,
      tags: task.tags.map(t => t.tag)
    }));

    res.json(transformedTasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Отримати завдання за ID
exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) },
      include: {
        project: { select: { id: true, title: true, ownerId: true } },
        status: true,
        assignedUser: { select: { id: true, name: true, email: true } },
        tags: { include: { tag: true } }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Перевірка доступу
    if (task.project.ownerId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Створити завдання
exports.createTask = async (req, res) => {
  try {
    const { projectId, statusId, title, description, dueDate, assignedToId, tagIds } = req.body;

    if (!projectId || !statusId || !title) {
      return res.status(400).json({ error: 'projectId, statusId, and title are required' });
    }

    // Перевірка проекту
    const project = await prisma.project.findUnique({
      where: { id: parseInt(projectId) }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.ownerId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Тільки адмін може призначати виконавця
    if (assignedToId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can assign tasks' });
    }

    const taskData = {
      title,
      description,
      projectId: parseInt(projectId),
      statusId: parseInt(statusId),
      dueDate: dueDate ? new Date(dueDate) : null,
      assignedTo: assignedToId ? parseInt(assignedToId) : null
    };

    const task = await prisma.task.create({
      data: taskData,
      include: {
        project: { select: { id: true, title: true } },
        status: true,
        assignedUser: { select: { id: true, name: true, email: true } },
        tags: { include: { tag: true } }
      }
    });

    // Додаємо теги
    if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
      await prisma.taskTag.createMany({
        data: tagIds.map(tagId => ({
          taskId: task.id,
          tagId: parseInt(tagId)
        }))
      });

      const updatedTask = await prisma.task.findUnique({
        where: { id: task.id },
        include: {
          project: { select: { id: true, title: true } },
          status: true,
          assignedUser: { select: { id: true, name: true, email: true } },
          tags: { include: { tag: true } }
        }
      });

      return res.status(201).json({
        ...updatedTask,
        tags: updatedTask.tags.map(t => t.tag),
        assignedTo: updatedTask.assignedUser
      });
    }

    res.status(201).json({
      ...task,
      tags: task.tags.map(t => t.tag),
      assignedTo: task.assignedUser
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Оновити завдання
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { projectId, statusId, title, description, dueDate, assignedToId, tagIds } = req.body;

    const existingTask = await prisma.task.findUnique({
      where: { id: parseInt(id) },
      include: { project: true }
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (existingTask.project.ownerId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Тільки адмін може призначати виконавця
    if (assignedToId !== undefined && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can assign tasks' });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (statusId) updateData.statusId = parseInt(statusId);
    if (projectId) updateData.projectId = parseInt(projectId);
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (assignedToId !== undefined) updateData.assignedTo = assignedToId ? parseInt(assignedToId) : null;

    const task = await prisma.task.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        project: { select: { id: true, title: true } },
        status: true,
        assignedUser: { select: { id: true, name: true, email: true } },
        tags: { include: { tag: true } }
      }
    });

    // Оновлюємо теги
    if (tagIds !== undefined && Array.isArray(tagIds)) {
      await prisma.taskTag.deleteMany({ where: { taskId: parseInt(id) } });

      if (tagIds.length > 0) {
        await prisma.taskTag.createMany({
          data: tagIds.map(tagId => ({
            taskId: parseInt(id),
            tagId: parseInt(tagId)
          }))
        });
      }

      const updatedTask = await prisma.task.findUnique({
        where: { id: parseInt(id) },
        include: {
          project: { select: { id: true, title: true } },
          status: true,
          assignedUser: { select: { id: true, name: true, email: true } },
          tags: { include: { tag: true } }
        }
      });

      return res.json({
        ...updatedTask,
        tags: updatedTask.tags.map(t => t.tag),
        assignedTo: updatedTask.assignedUser
      });
    }

    res.json({
      ...task,
      tags: task.tags.map(t => t.tag),
      assignedTo: task.assignedUser
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Видалити завдання
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const existingTask = await prisma.task.findUnique({
      where: { id: parseInt(id) },
      include: { project: true }
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (existingTask.project.ownerId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.task.delete({ where: { id: parseInt(id) } });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: error.message });
  }
};
