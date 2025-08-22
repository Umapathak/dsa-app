// netlify/functions/getLenders.js
const Airtable = require('airtable');

exports.handler = async function(event, context) {
  console.log('🔵 Function STARTED: getLenders');
  
  const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } = process.env;
  
  // Check if environment variables exist
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.error('❌ ERROR: Missing environment variables');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing API key or Base ID' })
    };
  }

  console.log('✅ Environment variables found');
  console.log('Base ID:', AIRTABLE_BASE_ID);

  try {
    // Initialize Airtable
    const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
    console.log('✅ Airtable initialized');

    // Try to list all tables in the base (for debugging)
    console.log('🔄 Listing tables in base...');
    // Note: This is a debug step - we'll remove it later
    const tableData = await base('Lenders').select({ maxRecords: 1 }).firstPage();
    console.log('✅ Successfully connected to Airtable');
    console.log('Found table with', tableData.length, 'records');

    // If we get here, the connection worked! Now get all records
    const records = await base('Lenders').select({}).all();
    console.log(`📊 Found ${records.length} lender records`);

    const lenders = records.map(record => ({
      id: record.id,
      name: record.get('Name') || 'Unknown Lender',
      type: record.get('Type') || 'Lender',
      minAge: record.get('Min Age') || 21,
      maxAge: record.get('Max Age') || 65,
      minCibil: record.get('Min CIBIL') || 650,
      minIncomeSalaried: record.get('Min Income Salaried') || 20000,
      minIncomeSelfEmployed: record.get('Min Income Self Employed') || 25000,
      foir: record.get('FOIR %') || 60,
      roi: record.get('ROI %') || 15,
      minLoanAmount: record.get('Min Loan Amount') || 25000,
      maxLoanAmount: record.get('Max Loan Amount') || 5000000
    }));

    console.log('✅ Processed', lenders.length, 'lenders');
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(lenders)
    };
    
  } catch (error) {
    console.error('❌ Airtable error details:', error.message);
    console.error('Full error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to fetch data from Airtable',
        details: error.message,
        suggestion: 'Check your Base ID and table name'
      })
    };
  }
};
