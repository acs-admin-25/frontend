// Debug script to test date processing
const { safeParseDate } = require('./lib/utils/date.ts');

// Test cases for date processing
const testCases = [
  undefined,
  null,
  '',
  '2024-01-01T00:00:00Z',
  '2024-01-01T00:00:00.000Z',
  '2024-01-01T00:00:00.123456',
  'invalid-date',
  new Date(),
  new Date().toISOString()
];

console.log('Testing date processing functions...');
console.log('=====================================');

testCases.forEach((testCase, index) => {
  console.log(`\nTest case ${index + 1}:`, {
    input: testCase,
    type: typeof testCase,
    isNull: testCase === null,
    isUndefined: testCase === undefined
  });
  
  try {
    const result = safeParseDate(testCase);
    console.log('Result:', {
      date: result,
      isValid: result instanceof Date && !isNaN(result.getTime()),
      timestamp: result instanceof Date ? result.toISOString() : 'N/A'
    });
  } catch (error) {
    console.log('Error:', error.message);
  }
});

console.log('\n=====================================');
console.log('Debug complete'); 