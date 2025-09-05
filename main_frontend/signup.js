document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const otpForm = document.getElementById('otpForm');
    const interestForm = document.getElementById('interestForm');

    signupForm.addEventListener('submit', handleSignupStart);
    otpForm.addEventListener('submit', handleOtpVerify);
    interestForm.addEventListener('submit', handleInterestSubmit);
});

const API_BASE_URL = 'http://127.0.0.1:8000';
const messageDiv = document.getElementById('message');

async function handleSignupStart(event) {
    event.preventDefault();
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    const response = await fetch(`${API_BASE_URL}/signup/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
    });
    const result = await response.json();
    
    if (response.ok) {
        messageDiv.style.color = 'green';
        messageDiv.textContent = result.message;
        document.getElementById('signupSection').style.display = 'none';
        document.getElementById('otpSection').style.display = 'block';
        document.getElementById('otpEmail').value = email;
    } else {
        messageDiv.style.color = 'red';
        messageDiv.textContent = `Error: ${result.detail}`;
    }
}

async function handleOtpVerify(event) {
    event.preventDefault();
    const email = document.getElementById('otpEmail').value;
    const otp = document.getElementById('otpInput').value;

    const response = await fetch(`${API_BASE_URL}/signup/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
    });
    const result = await response.json();

    if (response.ok) {
        messageDiv.style.color = 'green';
        messageDiv.textContent = result.message;
        document.getElementById('otpSection').style.display = 'none';
        document.getElementById('interestSection').style.display = 'block';
    } else {
        messageDiv.style.color = 'red';
        messageDiv.textContent = `Error: ${result.detail}`;
    }
}

async function handleInterestSubmit(event) {
    event.preventDefault();
    const email = document.getElementById('otpEmail').value;
    const selected = document.querySelectorAll('input[name="interests"]:checked');
    const interests = Array.from(selected).map(cb => cb.value);

    if (interests.length === 0) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = 'Please select at least one interest.';
        return;
    }

    const response = await fetch(`${API_BASE_URL}/signup/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, interests }),
    });
    const result = await response.json();
    
    if (response.ok) {
        messageDiv.style.color = 'green';
        messageDiv.textContent = "User account created successfully!";
        document.getElementById('interestSection').style.display = 'none';
    } else {
        messageDiv.style.color = 'red';
        messageDiv.textContent = `Error: ${result.detail}`;
    }
}