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

// Function to test the API connection
async function testApiConnection() {
    showLoading('Testing connection...');
    try {
        const response = await fetch('/.netlify/functions/getLenders');
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('API Response data:', data);
        return data;
        
    } catch (error) {
        console.error('API Connection failed:', error);
        showError(`Connection failed: ${error.message}. Check Netlify Functions.`);
        throw error;
    }
}

// Fetch data from OUR secure Netlify Function
async function loadLenderData() {
    try {
        console.log('Starting to load lender data...');
        allLenders = await testApiConnection();
        console.log("Lender data loaded successfully!", allLenders);
        
        // Clear any loading messages
        document.getElementById('results').innerHTML = '';
        
    } catch (error) {
        console.error("Failed to load lender data:", error);
        // Error is already shown by testApiConnection
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
    // 1. Get values from the form
    const pincode = document.getElementById('pincode').value;
    const age = parseInt(document.getElementById('age').value);
    const income = parseFloat(document.getElementById('income').value);
    const cibil = parseInt(document.getElementById('cibil').value);
    const currentEmi = parseFloat(document.getElementById('emi').value) || 0;
    const loanAmount = parseFloat(document.getElementById('loanAmount').value);

    // 2. Validate inputs
    if (!pincode || !age || !income || !cibil || !loanAmount) {
        showError('Please fill all required fields');
        return;
    }

    showLoading('Checking eligibility...');

    // 3. Check if lender data is loaded
    if (allLenders.length === 0) {
        try {
            await loadLenderData();
        } catch (error) {
            return; // Error already shown
        }
    }

    let resultsHTML = "<h3>Eligibility Results</h3>";
    let eligibleFound = false;

    // 4. Check each lender's rules
    for (const lender of allLenders) {
        // Basic checks with fallback values
        const minAge = lender.minAge || 21;
        const maxAge = lender.maxAge || 65;
        const minCibil = lender.minCibil || 650;
        const minIncome = lender.minIncomeSalaried || lender.minIncomeSelfEmployed || 20000;
        const minLoan = lender.minLoanAmount || 25000;
        const maxLoan = lender.maxLoanAmount || 5000000;
        const foirLimit = lender.foir || 60;
        const roi = lender.roi || 15;

        if (age < minAge || age > maxAge) continue;
        if (cibil < minCibil) continue;
        if (income < minIncome) continue;
        if (loanAmount < minLoan || loanAmount > maxLoan) continue;

        // FOIR Check
        const tenureMonths = 60;
        const monthlyRate = roi / 100 / 12;
        const emi = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
        
        const totalObligation = emi + currentEmi;
        const foir = (totalObligation / income) * 100;

        if (foir > foirLimit) continue;

        // 5. If we get here, the lender is eligible
        eligibleFound = true;
        resultsHTML += `
            <div class="lender-card">
                <h4>${lender.name}</h4>
                <p><strong>Type:</strong> ${lender.type || 'Lender'}</p>
                <p><strong>Eligible Amount:</strong> ₹${loanAmount.toLocaleString()}</p>
                <p><strong>Estimated EMI:</strong> ₹${emi.toFixed(2)}</p>
                <p><strong>FOIR:</strong> ${foir.toFixed(1)}%</p>
            </div>
        `;
    }

    if (!eligibleFound) {
        resultsHTML += "<div class='no-result'><p>No eligible lenders found for this profile.</p></div>";
    }

    // 6. Show the results on the page
    document.getElementById('results').innerHTML = resultsHTML;
}

// Call this when the page loads
window.addEventListener('load', loadLenderData);

// Add tab switching function
function switchTab(tabName) {
    document.querySelectorAll('.tab-button').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    console.log('Switched to:', tabName);
    resetForm();
}
