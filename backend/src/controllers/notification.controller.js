const prisma = require('../lib/prisma');

// GET MY NOTIFICATIONS
const getMyNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20, unreadOnly } = req.query;

        const where = {
            userId: req.user.userId,
            ...(unreadOnly === 'true' && { isRead: false })
        };

        const [notifications, total, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: parseInt(limit)
            }),
            prisma.notification.count({ where }),
            prisma.notification.count({
                where: { userId: req.user.userId, isRead: false }
            })
        ]);

        res.status(200).json({
            notifications,
            unreadCount,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get notifications error:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// MARK AS READ
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.notification.update({
            where: { id, userId: req.user.userId },
            data: { isRead: true }
        });

        res.status(200).json({ message: 'Notification marked as read' });

    } catch (error) {
        console.error('Mark as read error:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// MARK ALL AS READ
const markAllAsRead = async (req, res) => {
    try {
        await prisma.notification.updateMany({
            where: { userId: req.user.userId, isRead: false },
            data: { isRead: true }
        });

        res.status(200).json({ message: 'All notifications marked as read' });

    } catch (error) {
        console.error('Mark all as read error:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// DELETE NOTIFICATION
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.notification.delete({
            where: { id, userId: req.user.userId }
        });

        res.status(200).json({ message: 'Notification deleted' });

    } catch (error) {
        console.error('Delete notification error:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
};
