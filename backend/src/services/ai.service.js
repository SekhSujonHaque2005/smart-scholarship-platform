const axios = require('axios');

const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Get match scores for a student
const getMatchScores = async (studentProfile, scholarships) => {
  try {
    const { data } = await axios.post(`${AI_URL}/api/matching/quick`, {
      student: {
        cgpa: studentProfile.cgpa || null,
        fieldOfStudy: studentProfile.fieldOfStudy || null,
        incomeLevel: studentProfile.incomeLevel || null,
        location: studentProfile.location || null
      },
      scholarships: scholarships.map(s => ({
        id: s.id,
        title: s.title,
        description: s.description || '',
        amount: s.amount || null,
        criteriaJson: s.criteriaJson || {}
      }))
    });
    return data.matches || [];
  } catch (error) {
    console.error('AI matching error:', error.message);
    return [];
  }
};

// Check application for fraud
const checkFraud = async (applicationData) => {
  try {
    const { data } = await axios.post(`${AI_URL}/api/fraud/check`, applicationData);
    return data;
  } catch (error) {
    console.error('AI fraud check error:', error.message);
    return { isSuspicious: false, riskScore: 0, reasons: [] };
  }
};

module.exports = { getMatchScores, checkFraud };
