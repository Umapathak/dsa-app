const Airtable = require('airtable');

exports.handler = async function(event, context) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { pincode, lenderId } = JSON.parse(event.body);
        const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } = process.env;
        
        const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
        
        // Check if pincode exists for this lender
        const records = await base('Serviceable Pincodes').select({
            filterByFormula: `AND({Pincode} = '${pincode}', {Lender} = '${lenderId}')`
        }).firstPage();

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ isServiceable: records.length > 0 })
        };
        
    } catch (error) {
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: error.message })
        };
    }
};
