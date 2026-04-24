const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const scraperRoutes = require('./routes/scraper.routes');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 🛡️ Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 🛡️ Strict Auth Limiter (Prevent brute force)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 requests per hour for login/register
  message: { message: 'Too many authentication attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 🛡️ AI/Scraper Limiter (Prevent resource exhaustion)
const taskLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Only 5 heavy tasks per hour
  message: { message: 'System resources are busy, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply global rate limiting to all requests
app.use('/api/', globalLimiter);

// Routes
const authRoutes = require('./routes/auth.routes');
const scholarshipRoutes = require('./routes/scholarship.routes');
const applicationRoutes = require('./routes/application.routes');
const providerRoutes = require('./routes/provider.routes');
const reviewRoutes = require('./routes/review.routes');
const notificationRoutes = require('./routes/notification.routes');
const statsRoutes = require('./routes/stats.routes');
const newsletterRoutes = require('./routes/newsletter.routes');
const documentRoutes = require('./routes/document.routes');
const messageRoutes = require('./routes/message.routes');
const billingRoutes = require('./routes/billing.routes');
const adminRoutes = require('./routes/admin.routes');

const cron = require('node-cron');
const { sendDeadlineReminders } = require('./services/notification.service');

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/scraper', taskLimiter, scraperRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/admin', adminRoutes);

// Run deadline reminders every day at 9 AM
cron.schedule('0 9 * * *', () => {
  console.log('Running deadline reminder cron job...');
  sendDeadlineReminders();
});

// Run scholarship scraper every day at 6 AM
cron.schedule('0 6 * * *', () => {
  console.log('[Cron] Triggering scholarship scraper...');
  const { exec } = require('child_process');
  const scraperDir = require('path').join(__dirname, '..', '..', 'scraper_service');
  exec(`python main.py --live`, { cwd: scraperDir }, (error, stdout, stderr) => {
    if (error) {
      console.error('[Cron] Scraper error:', error.message);
      return;
    }
    console.log('[Cron] Scraper output:', stdout);
    if (stderr) console.error('[Cron] Scraper stderr:', stderr);
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'Smart Scholarship API is running!', version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});