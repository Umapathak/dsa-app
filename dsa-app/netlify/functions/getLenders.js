// netlify/functions/getLenders.js
exports.handler = async function(event, context) {
  console.log('🔵 Function STARTED: getLenders');
  console.log('🔵 Checking environment variables...');
  
  const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } = process.env;
  
  // Debug: Log what we received (the key will be hidden, but we can see if it exists)
  console.log('AIRTABLE_BASE_ID exists:', !!AIRTABLE_BASE_ID);
  console.log('AIRTABLE_API_KEY exists:', !!AIRTABLE_API_KEY);
  
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.error('❌ ERROR: Missing environment variables');
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Missing environment variables',
        details: 'Check Netlify environment variables settings' 
      })
    };
  }

  try {
    console.log('🔵 Environment variables found. Testing Airtable connection...');
    
    // For now, just return test data to confirm the function works
    const testData = [
      { name: "Test Bank", minAge: 21, maxAge: 65, minCibil: 650 },
      { name: "Test NBFC", minAge: 23, maxAge: 60, minCibil: 700 }
    ];
    
    console.log('✅ Returning test data instead of Airtable data');
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(testData)
    };
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Unexpected error in function',
        details: error.message 
      })
    };
  }
};
