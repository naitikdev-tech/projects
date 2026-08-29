/**
 * Stellar Multi-Step Form Logic Controller
 */

document.addEventListener('DOMContentLoaded', () => {
    // Form and navigation elements
    const form = document.getElementById('multi-step-form');
    const steps = Array.from(document.querySelectorAll('.form-step'));
    const indicators = Array.from(document.querySelectorAll('.step-indicator'));
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');
    const btnReset = document.getElementById('btn-reset');
    const navContainer = document.getElementById('wizard-navigation');
    const stepperContainer = document.getElementById('form-stepper');

    // Step state tracking
    let currentStepIndex = 0;

    // Output payload elements
    const reviewEmail = document.getElementById('review-email');
    const reviewName = document.getElementById('review-name');
    const reviewTrack = document.getElementById('review-track');
    const payloadOutput = document.getElementById('payload-output');

    // Navigation updater
    function updateStepVisibility() {
        // Toggle steps display classes
        steps.forEach((step, idx) => {
            if (idx === currentStepIndex) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Hide navigation once we reach the success screen
        const isSuccessScreen = currentStepIndex === steps.length - 1;
        if (isSuccessScreen) {
            navContainer.classList.add('hidden');
            stepperContainer.classList.add('hidden');
            return;
        } else {
            navContainer.classList.remove('hidden');
            stepperContainer.classList.remove('hidden');
        }

        // Show/hide Back button
        if (currentStepIndex === 0) {
            btnPrev.classList.add('hidden');
        } else {
            btnPrev.classList.remove('hidden');
        }

        // Change Next button label on review step
        if (currentStepIndex === steps.length - 2) {
            btnNext.textContent = 'Submit';
        } else {
            btnNext.textContent = 'Continue';
        }

        // Update stepper indicators
        indicators.forEach((indicator, idx) => {
            const stepNum = idx + 1;
            const currentStepNum = currentStepIndex + 1;

            if (stepNum === currentStepNum) {
                indicator.className = 'step-indicator active';
            } else if (stepNum < currentStepNum) {
                indicator.className = 'step-indicator completed';
            } else {
                indicator.className = 'step-indicator';
            }
        });
    }

    // Step validation rules
    function validateStep(stepIndex) {
        const stepEl = steps[stepIndex];
        let isValid = true;

        // Reset all active error visual states inside the current step
        const inputGroups = stepEl.querySelectorAll('.input-group');
        inputGroups.forEach(group => group.classList.remove('invalid'));

        // 1. Validate inputs (text, email, password)
        const inputs = Array.from(stepEl.querySelectorAll('input[required]'));
        inputs.forEach(input => {
            const parent = input.closest('.input-group') || input.parentElement;
            if (!input.checkValidity()) {
                isValid = false;
                parent.classList.add('invalid');
            }
        });

        // Special regex matching or validation rules
        const emailInput = stepEl.querySelector('input[type="email"]');
        if (emailInput && emailInput.value.trim() !== '') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailInput.value)) {
                isValid = false;
                emailInput.closest('.input-group').classList.add('invalid');
            }
        }

        const phoneInput = stepEl.querySelector('input[type="tel"]');
        if (phoneInput && phoneInput.value.trim() !== '') {
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(phoneInput.value)) {
                isValid = false;
                phoneInput.closest('.input-group').classList.add('invalid');
            }
        }

        // 2. Validate custom checkable inputs on final confirmation page
        const termsCheckbox = stepEl.querySelector('#terms');
        const termsError = document.getElementById('terms-error');
        if (termsCheckbox) {
            if (!termsCheckbox.checked) {
                isValid = false;
                termsError.style.display = 'block';
            } else {
                termsError.style.display = 'none';
            }
        }

        return isValid;
    }

    // Capture and populate review step details
    function populateReviewData() {
        const email = document.getElementById('email').value;
        const firstname = document.getElementById('firstname').value;
        const lastname = document.getElementById('lastname').value;
        const track = document.querySelector('input[name="track"]:checked').value;

        reviewEmail.textContent = email || 'N/A';
        reviewName.textContent = `${firstname} ${lastname}`.trim() || 'N/A';
        reviewTrack.textContent = track || 'N/A';
    }

    // Submit form and construct output payload
    function handleFormSubmission() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const firstname = document.getElementById('firstname').value;
        const lastname = document.getElementById('lastname').value;
        const phone = document.getElementById('phone').value;
        const track = document.querySelector('input[name="track"]:checked').value;

        const payload = {
            account: { email, password },
            profile: { firstname, lastname, phone },
            preferences: { track },
            submittedAt: new Date().toISOString()
        };

        // Render response payload
        payloadOutput.textContent = JSON.stringify(payload, null, 2);
    }

    // Event handler: Continue / Next Button click
    btnNext.addEventListener('click', () => {
        if (!validateStep(currentStepIndex)) {
            return;
        }

        // Before transitioning to final confirmation step, build review details
        if (currentStepIndex === steps.length - 3) {
            populateReviewData();
        }

        // If on the review step (the second-to-last step), process submission
        if (currentStepIndex === steps.length - 2) {
            handleFormSubmission();
        }

        currentStepIndex++;
        updateStepVisibility();
    });

    // Event handler: Back Button click
    btnPrev.addEventListener('click', () => {
        if (currentStepIndex > 0) {
            currentStepIndex--;
            updateStepVisibility();
        }
    });

    // Reset Wizard Flow
    btnReset.addEventListener('click', () => {
        form.reset();
        
        // Hide errors
        const inputGroups = form.querySelectorAll('.input-group');
        inputGroups.forEach(group => group.classList.remove('invalid'));
        const termsError = document.getElementById('terms-error');
        if (termsError) termsError.style.display = 'none';

        currentStepIndex = 0;
        updateStepVisibility();
    });

    // Allow inputs to clear invalid highlights on user typing
    form.addEventListener('input', (e) => {
        const input = e.target;
        if (input.tagName === 'INPUT') {
            const parent = input.closest('.input-group');
            if (parent && input.checkValidity()) {
                parent.classList.remove('invalid');
            }
        }
    });
});
