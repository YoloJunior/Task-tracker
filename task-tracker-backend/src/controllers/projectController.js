// Контролер проектів

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Отримати всі проекти (адмін бачить всі)
exports.getAllProjects = async (req, res) => {
  try {
    const whereClause = req.user.role === 'admin' ? {} : { ownerId: req.user.userId };

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        tasks: true,
        owner: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Отримати проект за ID
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
      include: {
        tasks: {
          include: {
            status: true,
            tags: { include: { tag: true } },
            assignedUser: { select: { id: true, name: true, email: true } }
          }
        },
        owner: { select: { id: true, name: true, email: true } }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Перевірка доступу
    if (project.ownerId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Створити проект
exports.createProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        ownerId: req.user.userId
      },
      include: {
        owner: { select: { id: true, name: true, email: true } }
      }
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Оновити проект
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const existingProject = await prisma.project.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Перевірка доступу
    if (existingProject.ownerId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const project = await prisma.project.update({
      where: { id: parseInt(id) },
      data: {
        title: title || existingProject.title,
        description: description !== undefined ? description : existingProject.description
      },
      include: {
        owner: { select: { id: true, name: true, email: true } }
      }
    });

    res.json(project);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Видалити проект
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const existingProject = await prisma.project.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Перевірка доступу
    if (existingProject.ownerId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.project.delete({ where: { id: parseInt(id) } });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: error.message });
  }
};
