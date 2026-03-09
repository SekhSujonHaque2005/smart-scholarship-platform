const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth.routes');
const scholarshipRoutes = require('./routes/scholarship.routes');
const applicationRoutes = require('./routes/application.routes');
const providerRoutes = require('./routes/provider.routes');
const reviewRoutes = require('./routes/review.routes');
const notificationRoutes = require('./routes/notification.routes');

const cron = require('node-cron');
const { sendDeadlineReminders } = require('./services/notification.service');

app.use('/api/auth', authRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);

// Run deadline reminders every day at 9 AM
cron.schedule('0 9 * * *', () => {
  console.log('Running deadline reminder cron job...');
  sendDeadlineReminders();
});

app.get('/', (req, res) => {
  res.json({ message: 'Smart Scholarship API is running!', version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});