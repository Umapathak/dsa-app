// netlify/functions/getLenders.js
const Airtable = require('airtable');

exports.handler = async function(event, context) {
  console.log('🔵 Function STARTED: getLenders');
  
  try {
    const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } = process.env;
    
    if (!AIRTABLE_API_KEY) {
      throw new Error('AIRTABLE_API_KEY environment variable is missing');
    }
    if (!AIRTABLE_BASE_ID) {
      throw new Error('AIRTABLE_BASE_ID environment variable is missing');
    }

    console.log('✅ Environment variables found');
    
    const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
    console.log('✅ Airtable base initialized');

    // ✅ FIXED: Changed from 'Lenders' to 'lenders_policy_data'
    console.log('🔄 Testing connection to "lenders_policy_data" table...');
    const records = await base('lenders_policy_data').select({
      maxRecords: 1,
      view: 'Grid view'
    }).firstPage();

    console.log('✅ Successfully connected to Airtable!');
    console.log('Found', records.length, 'record(s) in lenders_policy_data table');

    // Get all records from the correct table
    const allRecords = await base('lenders_policy_data').select({}).all();
    console.log(`📊 Total records: ${allRecords.length}`);

    const lenders = allRecords.map(record => ({
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
    console.error('❌ FULL ERROR DETAILS:');
    console.error('Error message:', error.message);
    console.error('Error type:', error.type);
    console.error('Error statusCode:', error.statusCode);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Airtable connection failed',
        message: error.message,
        type: error.type,
        statusCode: error.statusCode,
        help: 'Check your Airtable base ID, table name, and API key'
      })
    };
  }
};
