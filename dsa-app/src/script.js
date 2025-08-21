// This array will hold the lender data we get securely from our Netlify Function
let lenderData = [];

// This function runs when the page loads to get the data
async function loadLenderData() {
    try {
        // 🔐 This is the magic. We call OUR OWN Netlify Function endpoint.
        // The function name 'getLenders' becomes part of the URL.
        const response = await fetch('/.netlify/functions/getLenders');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        lenderData = await response.json();
        console.log("Lender data loaded securely!", lenderData);
        
    } catch (error) {
        console.error("Could not load lender data:", error);
        document.getElementById('results').innerHTML = "<p style='color: red;'>Error loading lender data. Please refresh the page.</p>";
    }
}

// Call the function to load data when the page is ready
window.addEventListener('load', loadLenderData);

// The main function that checks eligibility
async function checkEligibility() {
    // 1. Get values from the form
    const pincode = document.getElementById('pincode').value;
    const age = parseInt(document.getElementById('age').value);
    const income = parseFloat(document.getElementById('income').value);
    const cibil = parseInt(document.getElementById('cibil').value);
    const currentEmi = parseFloat(document.getElementById('emi').value);
    const loanAmount = parseFloat(document.getElementById('loanAmount').value);

    let resultsHTML = "<h2>Eligibility Results</h2>";
    let eligibleFound = false;

    // 2. Check each lender's rules
    for (const lender of lenderData) {
        // Basic checks
        if (age < lender.minAge || age > lender.maxAge) continue;
        if (cibil < lender.minCibil) continue;
        if (income < lender.minIncome) continue;
        if (loanAmount < lender.minLoanAmount || loanAmount > lender.maxLoanAmount) continue;

        // FOIR Check (The most important check)
        // Estimate new EMI: using formula [P x R x (1+R)^N]/[(1+R)^N-1]
        // For simplicity, let's assume a fixed tenure (e.g., 60 months) for all lenders
        const tenureMonths = 60;
        const monthlyRate = lender.roi / 100 / 12; // Monthly interest rate
        const emi = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
        
        const totalObligation = emi + currentEmi;
        const foir = (totalObligation / income) * 100;

        if (foir > lender.foir) continue;

        // 3. If we get here, the lender is eligible
        eligibleFound = true;
        resultsHTML += `<p><strong>${lender.name}</strong> - Eligible. Estimated EMI: ₹${emi.toFixed(2)}</p>`;
    }

    if (!eligibleFound) {
        resultsHTML += "<p>No eligible lenders found for this profile.</p>";
    }

    // 4. Show the results on the page
    document.getElementById('results').innerHTML = resultsHTML;
}