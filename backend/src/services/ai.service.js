const axios = require('axios');

const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Get match scores for a student
const getMatchScores = async (studentProfile, scholarships) => {
  try {
    const { data } = await axios.post(`${AI_URL}/api/matching/quick`, {
      student: {
        cgpa: studentProfile.cgpa ? parseFloat(studentProfile.cgpa) : null,
        fieldOfStudy: studentProfile.fieldOfStudy || null,
        incomeLevel: studentProfile.incomeLevel || null,
        location: studentProfile.location || null
      },
      scholarships: scholarships.map(s => {
        let parsedCriteria = {};
        if (s.criteriaJson) {
          if (typeof s.criteriaJson === 'string') {
            try { parsedCriteria = JSON.parse(s.criteriaJson); } catch (e) {}
          } else if (typeof s.criteriaJson === 'object') {
            parsedCriteria = s.criteriaJson;
          }
        }
        
        return {
          id: String(s.id),
          title: String(s.title),
          description: s.description ? String(s.description) : '',
          amount: s.amount ? parseFloat(s.amount) : null,
          criteriaJson: parsedCriteria
        };
      })
    });
    return data.matches || [];
  } catch (error) {
    if (error.response) {
      console.error('AI matching error data:', JSON.stringify(error.response.data));
    } else {
      console.error('AI matching error:', error.message);
    }
    return [];
  }
};

// Check application for fraud
const checkFraud = async (applicationData) => {
  try {
    let parsedCriteria = {};
    if (applicationData.criteria) {
      if (typeof applicationData.criteria === 'string') {
        try { parsedCriteria = JSON.parse(applicationData.criteria); } catch (e) {}
      } else if (typeof applicationData.criteria === 'object') {
        parsedCriteria = applicationData.criteria;
      }
    }

    const payload = {
      ...applicationData,
      applicationId: String(applicationData.applicationId),
      studentId: String(applicationData.studentId),
      scholarshipId: String(applicationData.scholarshipId),
      criteria: parsedCriteria
    };

    const { data } = await axios.post(`${AI_URL}/api/fraud/check`, payload);
    return data;
  } catch (error) {
    if (error.response) {
      console.error('AI fraud check error data:', JSON.stringify(error.response.data));
    } else {
      console.error('AI fraud check error:', error.message);
    }
    return { isSuspicious: false, riskScore: 0, reasons: [] };
  }
};

module.exports = { getMatchScores, checkFraud };
