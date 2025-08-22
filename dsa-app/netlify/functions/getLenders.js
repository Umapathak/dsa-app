// netlify/functions/getLenders.js
const Airtable = require('airtable');

exports.handler = async function(event, context) {
  console.log('Function started: getLenders');
  
  const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } = process.env;
  
  // Check if environment variables exist
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing API key or Base ID' })
    };
  }

  try {
    const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
    const records = await base('Lenders').select({}).firstPage();
    
    const lenders = records.map(record => ({
      id: record.id,
      ...record.fields
    }));

    console.log(`Found ${lenders.length} lenders`);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(lenders)
    };
    
  } catch (error) {
    console.error('Airtable error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch data from Airtable' })
    };
  }
};
