const prisma = require('../lib/prisma');

// In-memory store for scraper run metadata
let lastRunMeta = {
  lastRunAt: null,
  totalScraped: 0,
  created: 0,
  updated: 0,
  errors: [],
  sources: [],
};

// ─── SYNC SCHOLARSHIPS (Scraper service only) ────────────────────────
const syncScholarships = async (req, res) => {
  try {
    const { scholarships } = req.body;

    if (!Array.isArray(scholarships) || scholarships.length === 0) {
      return res.status(400).json({ message: 'Scholarships array is required and must not be empty' });
    }

    console.log(`[Scraper] Syncing ${scholarships.length} scholarships. Sample URL: ${scholarships[0]?.sourceUrl}`);

    // Ensure a System Provider exists for external scholarships
    let systemProvider = await prisma.provider.findFirst({
      where: { orgName: 'Government & External Agencies' }
    });

    if (!systemProvider) {
      let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

      if (!admin) {
        admin = await prisma.user.create({
          data: {
            email: 'admin@scholarhub.com',
            role: 'ADMIN',
            password: 'system_generated_admin_pass',
            isActive: true,
            preferences: {},
          }
        });
        console.log('[Scraper] Created default system admin:', admin.email);
      }

      systemProvider = await prisma.provider.create({
        data: {
          userId: admin.id,
          orgName: 'Government & External Agencies',
          trustScore: 100,
          verificationStatus: 'APPROVED',
        }
      });
      console.log('[Scraper] Created system provider:', systemProvider.orgName);
    }

    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    };

    for (const s of scholarships) {
      try {
        if (!s.title || !s.externalId) {
          results.skipped++;
          continue;
        }

        const data = {
          title: s.title,
          description: s.description || null,
          amount: s.amount ? parseFloat(s.amount) : null,
          deadline: s.deadline ? new Date(s.deadline) : null,
          category: s.category || 'General',
          isExternal: true,
          sourceUrl: s.sourceUrl || null,
          providerId: systemProvider.id,
          status: 'ACTIVE',
        };

        // Check if record exists to track created vs updated
        const existing = await prisma.scholarship.findUnique({
          where: { externalId: s.externalId }
        });

        await prisma.scholarship.upsert({
          where: { externalId: s.externalId },
          update: data,
          create: {
            ...data,
            externalId: s.externalId,
          },
        });

        if (existing) {
          results.updated++;
        } else {
          results.created++;
        }
      } catch (err) {
        results.errors.push({ id: s.externalId, error: err.message });
      }
    }

    // Update run metadata
    lastRunMeta = {
      lastRunAt: new Date().toISOString(),
      totalScraped: scholarships.length,
      created: results.created,
      updated: results.updated,
      errors: results.errors,
      sources: [...new Set(scholarships.map(s => {
        try { return new URL(s.sourceUrl).hostname; } catch { return 'unknown'; }
      }))],
    };

    // Trigger email notifications for new scholarships
    if (results.created > 0) {
      const { notifyExternalScholarships } = require('../services/notification.service');
      const newScholarships = scholarships.filter(s => s.title && s.externalId);
      notifyExternalScholarships(newScholarships.slice(0, 10))
        .catch(err => console.error('[Scraper] Notification error:', err.message));
    }

    console.log(`[Scraper] Sync complete — created: ${results.created}, updated: ${results.updated}, skipped: ${results.skipped}, errors: ${results.errors.length}`);

    res.status(200).json({
      message: 'Bulk sync complete',
      results,
    });
  } catch (error) {
    console.error('[Scraper] Sync error:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// ─── SCRAPER STATUS / HEALTH ─────────────────────────────────────────
const getScraperStatus = async (req, res) => {
  try {
    // Count external scholarships in DB
    const externalCount = await prisma.scholarship.count({
      where: { isExternal: true }
    });

    res.status(200).json({
      status: 'operational',
      lastRun: lastRunMeta.lastRunAt
        ? {
            timestamp: lastRunMeta.lastRunAt,
            totalScraped: lastRunMeta.totalScraped,
            created: lastRunMeta.created,
            updated: lastRunMeta.updated,
            errorCount: lastRunMeta.errors.length,
            sources: lastRunMeta.sources,
          }
        : null,
      database: {
        externalScholarships: externalCount,
      },
    });
  } catch (error) {
    console.error('[Scraper] Status error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  syncScholarships,
  getScraperStatus,
};
