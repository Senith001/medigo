const Notification = require('../models/Notification');

// GET /api/notifications - Admin: get all notification logs
const getAllNotifications = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Notification.countDocuments(filter);
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({ total, page: parseInt(page), notifications });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching notifications.' });
  }
};

// GET /api/notifications/appointment/:appointmentId
const getByAppointment = async (req, res) => {
  try {
    const notifications = await Notification.find({
      appointmentId: req.params.appointmentId,
    }).sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getAllNotifications, getByAppointment };
