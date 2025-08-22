const Airtable = require('airtable');

exports.handler = async function(event, context) {
    try {
        const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } = process.env;
        const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
        
        const records = await base('Customers').select({
            sort: [{ field: 'Date', direction: 'desc' }],
            maxRecords: 100
        }).all();

        const customers = records.map(record => ({
            id: record.id,
            name: record.get('Name'),
            phone: record.get('Phone'),
            email: record.get('Email'),
            pincode: record.get('Pincode'),
            age: record.get('Age'),
            income: record.get('Income'),
            cibil: record.get('CIBIL'),
            loanAmount: record.get('Loan Amount Required'),
            eligibleLenders: record.get('Eligible Lenders'),
            date: record.get('Date')
        }));

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify(customers)
        };
        
    } catch (error) {
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: error.message })
        };
    }
};
