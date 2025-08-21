// netlify/functions/getLenders.js
const Airtable = require('airtable');

exports.handler = async function(event, context) {
  
  const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } = process.env;
  const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

  try {
    const records = await base('Lenders').select({}).firstPage();
    const lenders = records.map(record => ({
      id: record.id,
      ...record.fields
    }));

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*' 
      },
      body: JSON.stringify(lenders)
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch data' })
    };
  }
};