const Airtable = require('airtable');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const customerData = JSON.parse(event.body);
        const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } = process.env;
        
        const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
        
        const record = await base('Customers').create([
            {
                fields: {
                    'Name': customerData.name,
                    'Phone': customerData.phone,
                    'Email': customerData.email || '',
                    'Pincode': customerData.pincode,
                    'Age': customerData.age,
                    'Income': customerData.income,
                    'CIBIL': customerData.cibil,
                    'Loan Amount Required': customerData.loanAmount,
                    'Eligible Lenders': customerData.eligibleLenders.join(', '),
                    'Date': new Date().toISOString().split('T')[0]
                }
            }
        ]);

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: true, recordId: record[0].getId() })
        };
        
    } catch (error) {
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: error.message })
        };
    }
};
