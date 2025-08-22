// src/script.js
let allLenders = [];

// Function to show a loading spinner and message
function showLoading(message) {
    document.getElementById('results').innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>${message}</p>
        </div>
    `;
}

// Function to show an error message
function showError(message) {
    document.getElementById('results').innerHTML = `
        <div class="error">
            <p><strong>Error:</strong> ${message}</p>
        </div>
    `;
}

// Fetch data from OUR secure Netlify Function
async function loadLenderData() {
    showLoading('Loading lender data...');
    try {
        const response = await fetch('/.netlify/functions/getLenders');
        
        if (!response.ok) {
            throw new Error(`Network error! Status: ${response.status}`);
        }
        
        allLenders = await response.json();
        console.log("Lender data loaded successfully!", allLenders);
        // Clear the loading message
        document.getElementById('results').innerHTML = ''; 
        
    } catch (error) {
        console.error("Could not load lender data:", error);
        showError(`Could not load lender data: ${error.message}. Please refresh the page.`);
    }
}

// Reset form function
function resetForm() {
    document.getElementById('eligibilityForm').reset();
    document.getElementById('results').innerHTML = '';
    console.log("Form has been reset.");
}

// The main function that checks eligibility
async function checkEligibility() {
    showLoading('Checking eligibility...');
    
    // 1. Get values from the form
    const pincode = document.getElementById('pincode').value;
    const age = parseInt(document.getElementById('age').value);
    const income = parseFloat(document.getElementById('income').value);
    const cibil = parseInt(document.getElementById('cibil').value);
    const currentEmi = parseFloat(document.getElementById('emi').value) || 0; // Default to 0 if empty
    const loanAmount = parseFloat(document.getElementById('loanAmount').value);

    let resultsHTML = "<h3>Eligibility Results</h3>";
    let eligibleFound = false;

    // 2. Check if lender data is loaded
    if (allLenders.length === 0) {
        showError('Lender data is not loaded. Please refresh the page.');
        return;
    }

    // 3. Check each lender's rules
    for (const lender of allLenders) {
        // Basic checks
        if (age < lender.minAge || age > lender.maxAge) continue;
        if (cibil < lender.minCibil) continue;
        
        // Check income based on employment type (simplified)
        const minIncome = lender.minIncomeSalaried || lender.minIncomeSelfEmployed || 0;
        if (income < minIncome) continue;
        
        if (loanAmount < lender.minLoanAmount || loanAmount > lender.maxLoanAmount) continue;

        // FOIR Check (The most important check)
        const tenureMonths = 60; // Assume 5 years for all loans
        const monthlyRate = (lender.roi || 15) / 100 / 12; // Default to 15% if no ROI
        const emi = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
        
        const totalObligation = emi + currentEmi;
        const foir = (totalObligation / income) * 100;

        if (foir > (lender.foir || 50)) continue; // Default to 50% FOIR

        // 4. If we get here, the lender is eligible
        eligibleFound = true;
        resultsHTML += `
            <div class="lender-card">
                <h4>${lender.name}</h4>
                <p><strong>Type:</strong> ${lender.type}</p>
                <p><strong>Eligible Amount:</strong> ₹${loanAmount.toLocaleString()}</p>
                <p><strong>Estimated EMI:</strong> ₹${emi.toFixed(2)}</p>
            </div>
        `;
    }

    if (!eligibleFound) {
        resultsHTML += "<div class='no-result'><p>No eligible lenders found for this profile.</p></div>";
    }

    // 5. Show the results on the page
    document.getElementById('results').innerHTML = resultsHTML;
}

// Call this when the page loads
window.addEventListener('load', loadLenderData);
