const nodemailer = require('nodemailer');
const prisma = require('../lib/prisma');

// Email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send email helper
const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || "ScholarHub <noreply@scholarhub.com>",
            to,
            subject,
            html
        });
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error('Email send error:', error.message);
    }
};

// Create in-app notification
const createNotification = async (userId, title, message, type = 'INFO') => {
    try {
        return await prisma.notification.create({
            data: { userId, title, message, type }
        });
    } catch (error) {
        console.error('Create notification error:', error.message);
    }
};

// APPLICATION SUBMITTED notification
const notifyApplicationSubmitted = async (studentUserId, scholarshipTitle) => {
    await createNotification(
        studentUserId,
        'Application Submitted! 🎉',
        `Your application for "${scholarshipTitle}" has been submitted successfully.`,
        'SUCCESS'
    );

    const user = await prisma.user.findUnique({ where: { id: studentUserId } });
    if (user?.email) {
        await sendEmail(
            user.email,
            '✅ Application Submitted - ScholarHub',
            `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Application Submitted Successfully! 🎉</h2>
          <p>Your application for <strong>${scholarshipTitle}</strong> has been submitted.</p>
          <p>We'll notify you when the provider reviews your application.</p>
          <br/>
          <p style="color: #64748b;">Good luck! — ScholarHub Team</p>
        </div>
      `
        );
    }
};

// APPLICATION STATUS CHANGED notification
const notifyApplicationStatus = async (studentUserId, scholarshipTitle, status, remarks) => {
    const statusConfig = {
        APPROVED: { emoji: '🎊', color: '#16a34a', message: 'Congratulations!' },
        REJECTED: { emoji: '😔', color: '#dc2626', message: 'Better luck next time.' },
        UNDER_REVIEW: { emoji: '🔍', color: '#d97706', message: 'Your application is being reviewed.' }
    };

    const config = statusConfig[status] || { emoji: '📋', color: '#2563eb', message: '' };

    await createNotification(
        studentUserId,
        `Application ${status} ${config.emoji}`,
        `Your application for "${scholarshipTitle}" has been ${status.toLowerCase()}.${remarks ? ` Remarks: ${remarks}` : ''}`,
        status === 'APPROVED' ? 'SUCCESS' : status === 'REJECTED' ? 'ERROR' : 'INFO'
    );

    const user = await prisma.user.findUnique({ where: { id: studentUserId } });
    if (user?.email) {
        await sendEmail(
            user.email,
            `${config.emoji} Application ${status} - ScholarHub`,
            `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${config.color};">Application ${status} ${config.emoji}</h2>
          <p>${config.message}</p>
          <p>Your application for <strong>${scholarshipTitle}</strong> has been <strong>${status.toLowerCase()}</strong>.</p>
          ${remarks ? `<p><strong>Remarks:</strong> ${remarks}</p>` : ''}
          <br/>
          <p style="color: #64748b;">— ScholarHub Team</p>
        </div>
      `
        );
    }
};

// PROVIDER VERIFIED notification
const notifyProviderVerified = async (providerUserId, status) => {
    await createNotification(
        providerUserId,
        status === 'APPROVED' ? 'Account Verified! ✅' : 'Verification Rejected ❌',
        status === 'APPROVED'
            ? 'Your provider account has been verified. You can now post scholarships!'
            : 'Your verification request was rejected. Please contact support.',
        status === 'APPROVED' ? 'SUCCESS' : 'ERROR'
    );

    const user = await prisma.user.findUnique({ where: { id: providerUserId } });
    if (user?.email) {
        await sendEmail(
            user.email,
            status === 'APPROVED' ? '✅ Account Verified - ScholarHub' : '❌ Verification Rejected - ScholarHub',
            `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${status === 'APPROVED' ? '#16a34a' : '#dc2626'};">
            ${status === 'APPROVED' ? 'Account Verified! ✅' : 'Verification Rejected ❌'}
          </h2>
          <p>${status === 'APPROVED'
                ? 'Your provider account has been verified. You can now post scholarships on ScholarHub!'
                : 'Your verification request was rejected. Please contact support for more details.'
            }</p>
          <br/>
          <p style="color: #64748b;">— ScholarHub Team</p>
        </div>
      `
        );
    }
};

// DEADLINE REMINDER notification (called by cron job)
const sendDeadlineReminders = async () => {
    try {
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Find scholarships with deadlines in next 3 days
        const scholarships = await prisma.scholarship.findMany({
            where: {
                status: 'ACTIVE',
                deadline: {
                    gte: tomorrow,
                    lte: threeDaysFromNow
                }
            }
        });

        for (const scholarship of scholarships) {
            // Find students who haven't applied yet
            const appliedStudentIds = await prisma.application.findMany({
                where: { scholarshipId: scholarship.id },
                select: { student: { select: { userId: true } } }
            });

            const appliedUserIds = appliedStudentIds.map(a => a.student.userId);

            // Notify all students (simplified - in production filter by eligibility)
            const students = await prisma.student.findMany({
                where: {
                    userId: { notIn: appliedUserIds }
                },
                take: 50 // limit for now
            });

            for (const student of students) {
                const daysLeft = Math.ceil(
                    (new Date(scholarship.deadline) - new Date()) / (1000 * 60 * 60 * 24)
                );

                await createNotification(
                    student.userId,
                    `⏰ Deadline Reminder: ${scholarship.title}`,
                    `Only ${daysLeft} day(s) left to apply for "${scholarship.title}"!`,
                    'WARNING'
                );
            }
        }

        console.log(`Deadline reminders sent for ${scholarships.length} scholarships`);
    } catch (error) {
        console.error('Deadline reminder error:', error.message);
    }
};

// NOTIFY EXTERNAL SCHOLARSHIPS (Professional Grid Layout)
const notifyExternalScholarships = async (newScholarships) => {
    if (!newScholarships || newScholarships.length === 0) return;

    // Get all students and newsletter subscribers
    const [students, subscribers] = await Promise.all([
        prisma.user.findMany({ where: { role: 'STUDENT', isActive: true }, select: { email: true, id: true } }),
        prisma.newsletterSubscriber.findMany({ where: { isActive: true }, select: { email: true } })
    ]);

    const topScholarships = newScholarships.slice(0, 5); // Marketing limit for newsletter
    const featured = topScholarships.slice(0, 4); // For the 2x2 grid

    const generateHtml = (isFullAccess = false) => `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
      <div style="background-color: #2563eb; padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">ScholarHub AI</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 14px;">External Opportunity Alert</p>
      </div>
      
      <div style="padding: 40px 30px;">
        <h2 style="color: #0f172a; font-size: 20px; font-weight: 800; text-align: center; margin-bottom: 30px;">What makes these programs unique:</h2>
        
        <div style="display: table; width: 100%; border-collapse: separate; border-spacing: 12px;">
          <!-- Row 1 -->
          <div style="display: table-row;">
            <div style="display: table-cell; width: 50%; padding: 25px; background: white; border: 2px solid #ef4444; text-align: center; vertical-align: middle; border-radius: 8px;">
              <p style="margin: 0; color: #0f172a; font-weight: 700; font-size: 14px;">${featured[0]?.title || 'Multi-Agency Support'}</p>
            </div>
            <div style="display: table-cell; width: 50%; padding: 25px; background: white; border: 2px solid #ef4444; text-align: center; vertical-align: middle; border-radius: 8px;">
              <p style="margin: 0; color: #0f172a; font-weight: 700; font-size: 14px;">${featured[1]?.title || 'Direct-to-Bank Disbursement'}</p>
            </div>
          </div>
          <!-- Row 2 -->
          <div style="display: table-row;">
            <div style="display: table-cell; width: 50%; padding: 25px; background: white; border: 2px solid #ef4444; text-align: center; vertical-align: middle; border-radius: 8px;">
              <p style="margin: 0; color: #0f172a; font-weight: 700; font-size: 14px;">${featured[2]?.title || 'Simplified Verification'}</p>
            </div>
            <div style="display: table-cell; width: 50%; padding: 25px; background: white; border: 2px solid #ef4444; text-align: center; vertical-align: middle; border-radius: 8px;">
              <p style="margin: 0; color: #0f172a; font-weight: 700; font-size: 14px;">${featured[3]?.title || 'Pan-India Eligibility'}</p>
            </div>
          </div>
        </div>

        <div style="text-align: center; margin-top: 40px;">
          <p style="color: #475569; font-size: 16px; font-weight: 600; margin-bottom: 25px;">Ready to build your future, apply and secure smartly?</p>
          <a href="http://localhost:3000/dashboard" style="background-color: #ef4444; color: white; padding: 16px 45px; text-decoration: none; font-weight: 800; font-size: 16px; border-radius: 6px; display: inline-block;">Apply Now</a>
        </div>

        ${!isFullAccess ? `
        <div style="margin-top: 50px; padding-top: 30px; border-top: 1px solid #e2e8f0; text-align: center;">
          <p style="color: #64748b; font-size: 13px; font-weight: 600; margin-bottom: 15px;">Unlock 100+ more matches tailored to your profile.</p>
          <a href="http://localhost:3000/register" style="color: #2563eb; font-weight: 700; text-decoration: none; font-size: 14px;">Join our world & Create an Account &rarr;</a>
        </div>
        ` : ''}
      </div>

      <div style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
        <p>If you'd like to unsubscribe and stop receiving these emails <a href="#" style="color: #64748b; text-decoration: underline;">click here</a>.</p>
        <p>&copy; 2025 ScholarHub. All rights reserved.</p>
      </div>
    </div>
    `;

    // Send to Students (Full Access)
    const studentHtml = generateHtml(true);
    for (const student of students) {
        await sendEmail(student.email, '🚀 New External Scholarships Launched!', studentHtml);
    }

    // Send to Newsletter (Limited Access)
    const newsletterHtml = generateHtml(false);
    for (const sub of subscribers) {
        // Optimization: prevent double sending if they are also students
        const isStudent = students.some(s => s.email === sub.email);
        if (!isStudent) {
            await sendEmail(sub.email, '🔥 Sneak Peek: Top 5 New Scholarships!', newsletterHtml);
        }
    }
};

module.exports = {
    createNotification,
    sendEmail,
    notifyApplicationSubmitted,
    notifyApplicationStatus,
    notifyProviderVerified,
    sendDeadlineReminders,
    notifyExternalScholarships
};
