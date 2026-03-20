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

// NOTIFY EXTERNAL SCHOLARSHIPS (Premium Grid Email Template)
const notifyExternalScholarships = async (newScholarships) => {
    if (!newScholarships || newScholarships.length === 0) return;

    // Get all students and newsletter subscribers
    const [students, subscribers] = await Promise.all([
        prisma.user.findMany({
            where: { role: 'STUDENT', isActive: true },
            select: { email: true, id: true, student: { select: { name: true } } }
        }),
        prisma.newsletterSubscriber.findMany({ where: { isActive: true }, select: { email: true } })
    ]);

    const topScholarships = newScholarships.slice(0, 5);
    const featured = topScholarships.slice(0, 3);

    const formatAmount = (amt) => {
        if (!amt) return 'Varies';
        return '₹' + Number(amt).toLocaleString('en-IN');
    };

    const formatDeadline = (d) => {
        if (!d) return 'Open';
        try {
            return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch { return 'Open'; }
    };

    const generateScholarshipCards = () => featured.map(s => `
        <tr>
          <td style="padding: 0 0 16px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; border-left: 4px solid #2563eb; overflow: hidden;">
              <tr>
                <td style="padding: 20px 24px;">
                  <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #0f172a;">${s.title}</p>
                  <p style="margin: 0 0 14px 0; font-size: 13px; color: #64748b; line-height: 1.5;">${(s.description || '').substring(0, 120)}${(s.description || '').length > 120 ? '...' : ''}</p>
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background: #dbeafe; color: #1d4ed8; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; margin-right: 8px;">${formatAmount(s.amount)}</td>
                      <td style="width: 8px;"></td>
                      <td style="background: #fef3c7; color: #b45309; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600;">⏰ ${formatDeadline(s.deadline)}</td>
                      <td style="width: 8px;"></td>
                      ${s.category ? `<td style="background: #f0fdf4; color: #15803d; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600;">${s.category}</td>` : ''}
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
    `).join('');

    const generateHtml = (studentName = null, isFullAccess = false) => `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
              
              <!-- ─── HEADER ─── -->
              <tr>
                <td style="background: linear-gradient(135deg, #0f172a 0%, #1e40af 50%, #2563eb 100%); padding: 40px 30px; text-align: center;">
                  <p style="margin: 0; font-size: 28px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">🎓 ScholarHub</p>
                  <p style="margin: 10px 0 0 0; color: #93c5fd; font-size: 14px; font-weight: 500;">New Scholarship Opportunities Discovered</p>
                </td>
              </tr>

              <!-- ─── GREETING ─── -->
              <tr>
                <td style="padding: 35px 30px 10px 30px;">
                  <p style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
                    ${studentName ? `Hi ${studentName} 👋` : 'Hello Scholar 👋'}
                  </p>
                  <p style="margin: 8px 0 0 0; font-size: 14px; color: #64748b; line-height: 1.6;">
                    Our AI engine just discovered ${topScholarships.length} new external scholarship${topScholarships.length > 1 ? 's' : ''} that you might be eligible for!
                  </p>
                </td>
              </tr>

              <!-- ─── 2×2 FEATURE GRID ─── -->
              <tr>
                <td style="padding: 25px 30px;">
                  <p style="margin: 0 0 18px 0; font-size: 15px; font-weight: 800; color: #0f172a; text-align: center; text-transform: uppercase; letter-spacing: 0.5px;">What makes these unique</p>
                  <table width="100%" cellpadding="0" cellspacing="10">
                    <tr>
                      <td width="50%" style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 18px; text-align: center; vertical-align: top;">
                        <p style="margin: 0 0 4px 0; font-size: 22px;">💰</p>
                        <p style="margin: 0; font-size: 13px; font-weight: 700; color: #1e40af;">Full Coverage</p>
                        <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">Tuition + Living Expenses</p>
                      </td>
                      <td width="50%" style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 18px; text-align: center; vertical-align: top;">
                        <p style="margin: 0 0 4px 0; font-size: 22px;">🏛️</p>
                        <p style="margin: 0; font-size: 13px; font-weight: 700; color: #15803d;">Government Backed</p>
                        <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">Verified & Trusted Sources</p>
                      </td>
                    </tr>
                    <tr>
                      <td width="50%" style="background: #fefce8; border: 1px solid #fde68a; border-radius: 10px; padding: 18px; text-align: center; vertical-align: top;">
                        <p style="margin: 0 0 4px 0; font-size: 22px;">⚡</p>
                        <p style="margin: 0; font-size: 13px; font-weight: 700; color: #a16207;">Easy Apply</p>
                        <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">Simplified Application</p>
                      </td>
                      <td width="50%" style="background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 10px; padding: 18px; text-align: center; vertical-align: top;">
                        <p style="margin: 0 0 4px 0; font-size: 22px;">🤖</p>
                        <p style="margin: 0; font-size: 13px; font-weight: 700; color: #7e22ce;">AI Matched</p>
                        <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">Tailored to Your Profile</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- ─── SCHOLARSHIP CARDS ─── -->
              <tr>
                <td style="padding: 10px 30px 25px 30px;">
                  <p style="margin: 0 0 16px 0; font-size: 15px; font-weight: 800; color: #0f172a; text-align: center; text-transform: uppercase; letter-spacing: 0.5px;">Featured Scholarships</p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    ${generateScholarshipCards()}
                  </table>
                  ${topScholarships.length > 3 ? `<p style="text-align: center; font-size: 13px; color: #64748b;">+ ${topScholarships.length - 3} more available on your dashboard</p>` : ''}
                </td>
              </tr>

              <!-- ─── CTA BUTTON ─── -->
              <tr>
                <td style="padding: 10px 30px 35px 30px; text-align: center;">
                  <a href="http://localhost:3000/dashboard" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; padding: 16px 48px; text-decoration: none; font-weight: 800; font-size: 16px; border-radius: 10px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(37,99,235,0.4);">Explore All Scholarships →</a>
                </td>
              </tr>

              ${!isFullAccess ? `
              <!-- ─── NEWSLETTER CONVERSION FOOTER ─── -->
              <tr>
                <td style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 30px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="text-align: center;">
                        <p style="margin: 0 0 4px 0; font-size: 20px;">🔓</p>
                        <p style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: #0f172a;">Unlock 50+ more matches</p>
                        <p style="margin: 0 0 16px 0; font-size: 13px; color: #64748b;">Create a free profile and get AI-powered scholarship matches.</p>
                        <a href="http://localhost:3000/register" style="color: #2563eb; font-weight: 700; text-decoration: none; font-size: 14px; border: 2px solid #2563eb; padding: 10px 28px; border-radius: 8px; display: inline-block;">Create Your Profile →</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              ` : ''}

              <!-- ─── FOOTER ─── -->
              <tr>
                <td style="background: #0f172a; padding: 24px 30px; text-align: center;">
                  <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 12px;">You're receiving this because you're subscribed to ScholarHub alerts.</p>
                  <p style="margin: 0; color: #64748b; font-size: 11px;"><a href="#" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a> · <a href="#" style="color: #94a3b8; text-decoration: underline;">Preferences</a></p>
                  <p style="margin: 10px 0 0 0; color: #475569; font-size: 11px;">© 2025 ScholarHub. All rights reserved.</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    // Send to Students (Full Access — personalized)
    for (const student of students) {
        const name = student.student?.name || null;
        const html = generateHtml(name, true);
        await sendEmail(student.email, '🚀 New External Scholarships Launched!', html);
    }

    // Send to Newsletter Subscribers (Limited Access)
    const newsletterHtml = generateHtml(null, false);
    for (const sub of subscribers) {
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
