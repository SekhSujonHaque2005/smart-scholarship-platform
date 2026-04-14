/**
 * AI Match Score Engine
 * Calculates a compatibility percentage between a student profile and a scholarship's criteria.
 */

const calculateMatchScore = (student, scholarship) => {
  if (!student || !scholarship) return 0;

  let totalScore = 0;
  let weights = {
    cgpa: 40,
    income: 30,
    category: 20,
    location: 10
  };

  // 1. CGPA Match (40%)
  // Logic: Extract min CGPA from criteria or use a default threshold
  const criteriaJson = scholarship.criteriaJson;
  const criteria = Array.isArray(criteriaJson) ? criteriaJson : [];
  const gpaMatch = criteria.find(c => typeof c === 'string' && c.toLowerCase().includes('cgpa'));
  if (gpaMatch) {
    const requiredGpa = parseFloat(gpaMatch.match(/[\d.]+/)?.[0]);
    if (requiredGpa) {
      if (student.cgpa >= requiredGpa) {
        totalScore += weights.cgpa;
      } else if (student.cgpa >= requiredGpa - 0.5) {
        totalScore += weights.cgpa * 0.5; // Partial match
      }
    } else {
       totalScore += weights.cgpa; // No specific GPA in criteria
    }
  } else {
    totalScore += weights.cgpa;
  }

  // 2. Income Level Match (30%)
  if (scholarship.category?.toLowerCase().includes('means') || scholarship.title?.toLowerCase().includes('means')) {
     const incomeLevels = {
       'LOW': 1,
       'LOWER_MIDDLE': 2,
       'MIDDLE': 3,
       'UPPER_MIDDLE': 4,
       'HIGH': 5
     };
     const studentIncome = incomeLevels[student.incomeLevel] || 3;
     if (studentIncome <= 2) totalScore += weights.income;
     else if (studentIncome <= 3) totalScore += weights.income * 0.7;
     else totalScore += weights.income * 0.3;
  } else {
     totalScore += weights.income; // Not a means-based scholarship
  }

  // 3. Category Match (20%)
  if (scholarship.category && student.fieldOfStudy) {
    const sCat = scholarship.category.toLowerCase();
    const fStudy = student.fieldOfStudy.toLowerCase();
    if (sCat.includes(fStudy) || fStudy.includes(sCat)) {
       totalScore += weights.category;
    } else {
       totalScore += weights.category * 0.5; // Neutral
    }
  } else {
    totalScore += weights.category;
  }

  // 4. Location Match (10%)
  if (student.location && criteria.some(c => c.toLowerCase().includes(student.location.toLowerCase()))) {
     totalScore += weights.location;
  } else {
     totalScore += weights.location * 0.8; // Default
  }

  return Math.min(Math.round(totalScore), 100);
};

module.exports = { calculateMatchScore };
