let currentStep = 1;
const totalSteps = 4;
let isGoingBack = false;

// Form elements
const form = document.getElementById('multiStepForm');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const autosaveIndicator = document.getElementById('autosaveIndicator');
const successMessage = document.getElementById('successMessage');

// Password toggle function
function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector('.eye-icon');

    if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = '🙈'; // Eye closed
    } else {
        input.type = 'password';
        icon.textContent = '👁️'; // Eye open
    }
}

// Initialize autosave from localStorage
window.addEventListener('load', () => {
    loadFormData();
});

// Autosave functionality
form.addEventListener('input', debounce(() => {
    saveFormData();
}, 500));

function saveFormData() {
    autosaveIndicator.textContent = 'Saving...';
    autosaveIndicator.className = 'autosave-indicator saving';

    const formData = new FormData(form);
    const data = {};

    // Handle all form fields including checkboxes
    for (let [key, value] of formData.entries()) {
        if (key === 'interests') {
            if (!data[key]) data[key] = [];
            data[key].push(value);
        } else {
            data[key] = value;
        }
    }

    localStorage.setItem('formData', JSON.stringify(data));

    setTimeout(() => {
        autosaveIndicator.textContent = 'All changes saved';
        autosaveIndicator.className = 'autosave-indicator saved';
    }, 300);
}

function loadFormData() {
    const savedData = localStorage.getItem('formData');
    if (savedData) {
        const data = JSON.parse(savedData);

        // Populate text inputs and select
        Object.keys(data).forEach(key => {
            const element = document.querySelector(`[name="${key}"]`);
            if (element) {
                if (element.type === 'radio') {
                    const radio = document.querySelector(`[name="${key}"][value="${data[key]}"]`);
                    if (radio) radio.checked = true;
                } else if (element.type === 'checkbox') {
                    if (Array.isArray(data[key])) {
                        data[key].forEach(value => {
                            const checkbox = document.querySelector(`[name="${key}"][value="${value}"]`);
                            if (checkbox) checkbox.checked = true;
                        });
                    }
                } else {
                    element.value = data[key];
                }
            }
        });

        autosaveIndicator.textContent = 'Previous data restored';
        autosaveIndicator.className = 'autosave-indicator saved';
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Navigation
nextBtn.addEventListener('click', () => {
    if (validateStep(currentStep)) {
        if (currentStep === totalSteps) {
            submitForm();
        } else {
            isGoingBack = false;
            currentStep++;
            updateForm();
        }
    }
});

prevBtn.addEventListener('click', () => {
    if (currentStep > 1) {
        isGoingBack = true;
        currentStep--;
        updateForm();
    }
});

function updateForm() {
    // Update steps
    const steps = document.querySelectorAll('.step');
    const formSteps = document.querySelectorAll('.form-step');

    steps.forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index + 1 < currentStep) {
            step.classList.add('completed');
        } else if (index + 1 === currentStep) {
            step.classList.add('active');
        }
    });

    // Update form steps with animation
    formSteps.forEach((step, index) => {
        step.classList.remove('active', 'prev');
        if (index + 1 === currentStep) {
            step.classList.add('active');
            if (isGoingBack) {
                step.classList.add('prev');
            }
        }
    });

    // Update progress line
    const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
    document.getElementById('progressLine').style.width = progress + '%';

    // Update buttons
    prevBtn.style.display = currentStep === 1 ? 'none' : 'block';
    nextBtn.textContent = currentStep === totalSteps ? 'Submit' : 'Next';

    // Update summary if on last step
    if (currentStep === totalSteps) {
        updateSummary();
    }
}

function validateStep(step) {
    const currentFormStep = document.querySelector(`.form-step[data-step="${step}"]`);
    const inputs = currentFormStep.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        const errorElement = document.getElementById(input.id + 'Error');

        if (input.type === 'radio') {
            const radioGroup = document.querySelectorAll(`input[name="${input.name}"]`);
            const isChecked = Array.from(radioGroup).some(radio => radio.checked);

            if (!isChecked) {
                isValid = false;
                if (errorElement) {
                    errorElement.classList.add('show');
                }
            } else {
                if (errorElement) {
                    errorElement.classList.remove('show');
                }
            }
        } else if (input.type === 'email') {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(input.value)) {
                isValid = false;
                input.classList.add('error');
                if (errorElement) {
                    errorElement.classList.add('show');
                }
            } else {
                input.classList.remove('error');
                if (errorElement) {
                    errorElement.classList.remove('show');
                }
            }
        } else if (input.id === 'phone') {
            const phonePattern = /^[\d\s\-+()]+$/;
            if (!phonePattern.test(input.value) || input.value.length < 10) {
                isValid = false;
                input.classList.add('error');
                if (errorElement) {
                    errorElement.classList.add('show');
                }
            } else {
                input.classList.remove('error');
                if (errorElement) {
                    errorElement.classList.remove('show');
                }
            }
        } else if (input.id === 'username') {
            if (input.value.length < 4) {
                isValid = false;
                input.classList.add('error');
                if (errorElement) {
                    errorElement.classList.add('show');
                }
            } else {
                input.classList.remove('error');
                if (errorElement) {
                    errorElement.classList.remove('show');
                }
            }
        } else if (input.id === 'password') {
            if (input.value.length < 8) {
                isValid = false;
                input.classList.add('error');
                if (errorElement) {
                    errorElement.classList.add('show');
                }
            } else {
                input.classList.remove('error');
                if (errorElement) {
                    errorElement.classList.remove('show');
                }
            }
        } else if (input.id === 'confirmPassword') {
            const password = document.getElementById('password').value;
            if (input.value !== password) {
                isValid = false;
                input.classList.add('error');
                if (errorElement) {
                    errorElement.classList.add('show');
                }
            } else {
                input.classList.remove('error');
                if (errorElement) {
                    errorElement.classList.remove('show');
                }
            }
        } else if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error');
            if (errorElement) {
                errorElement.classList.add('show');
            }
        } else {
            input.classList.remove('error');
            if (errorElement) {
                errorElement.classList.remove('show');
            }
        }
    });

    return isValid;
}

function updateSummary() {
    document.getElementById('summaryName').textContent =
        `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}`;
    document.getElementById('summaryDOB').textContent =
        document.getElementById('dateOfBirth').value;
    document.getElementById('summaryGender').textContent =
        document.querySelector('input[name="gender"]:checked')?.value || '-';
    document.getElementById('summaryEmail').textContent =
        document.getElementById('email').value;
    document.getElementById('summaryPhone').textContent =
        document.getElementById('phone').value;
    document.getElementById('summaryAddress').textContent =
        `${document.getElementById('address').value}, ${document.getElementById('city').value}, ${document.getElementById('country').value}`;
    document.getElementById('summaryUsername').textContent =
        document.getElementById('username').value;

    const interests = Array.from(document.querySelectorAll('input[name="interests"]:checked'))
        .map(cb => cb.value);
    document.getElementById('summaryInterests').textContent =
        interests.length > 0 ? interests.join(', ') : 'None selected';
}

function submitForm() {
    // Hide form and show success message
    form.style.display = 'none';
    document.querySelector('.progress-container').style.display = 'none';
    successMessage.classList.add('show');

    // Clear saved data
    localStorage.removeItem('formData');
}

function resetForm() {
    form.reset();
    currentStep = 1;
    form.style.display = 'block';
    document.querySelector('.progress-container').style.display = 'block';
    successMessage.classList.remove('show');
    localStorage.removeItem('formData');
    updateForm();
}

// Remove error on input
document.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('input', () => {
        input.classList.remove('error');
        const errorElement = document.getElementById(input.id + 'Error');
        if (errorElement) {
            errorElement.classList.remove('show');
        }
    });
});

// Initialize form
updateForm();