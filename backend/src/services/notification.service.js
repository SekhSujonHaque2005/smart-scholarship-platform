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

module.exports = {
    createNotification,
    sendEmail,
    notifyApplicationSubmitted,
    notifyApplicationStatus,
    notifyProviderVerified,
    sendDeadlineReminders
};
