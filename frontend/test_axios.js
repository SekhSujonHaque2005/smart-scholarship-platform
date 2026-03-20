const axios = require('axios');

const testApi = axios.create({
  baseURL: 'http://localhost:5000/api'
});

console.log('Testing baseURL: http://localhost:5000/api');
console.log('Requesting "scholarships"...');
// We can't actually see the final URL easily without interceptors
testApi.interceptors.request.use((config) => {
  console.log('Final URL:', config.baseURL + '/' + config.url); // This is just manual concatenation
  console.log('Actual Full URL (if handled by axios):', axios.getUri(config));
  return config;
});

testApi.get('scholarships').catch(() => {});
