// Handle contact form submission
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  
  // Generate a CSRF token for the form
  function generateCSRFToken() {
    // Generate a random token
    const token = Math.random().toString(36).substring(2, 15) + 
                 Math.random().toString(36).substring(2, 15);
    
    // Store in sessionStorage
    sessionStorage.setItem('csrfToken', token);
    return token;
  }
  
  // Client-side form validation
  function validateForm(formData) {
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    
    // Check required fields
    if (!name || !email || !message) {
      return { valid: false, message: 'Please fill in all required fields.' };
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, message: 'Please enter a valid email address.' };
    }
    
    // Check message length
    if (message.length > 5000) {
      return { valid: false, message: 'Message is too long (maximum 5000 characters).' };
    }
    
    return { valid: true };
  }
  
  if (contactForm) {
    // Add CSRF token to the form
    const csrfToken = generateCSRFToken();
    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = 'csrf_token';
    csrfInput.value = csrfToken;
    contactForm.appendChild(csrfInput);
    
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Reset status
      formStatus.textContent = '';
      formStatus.className = 'form-status';
      
      // Show loading state
      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
      
      try {
        const formData = new FormData(contactForm);
        
        // Client-side validation
        const validation = validateForm(formData);
        if (!validation.valid) {
          formStatus.textContent = validation.message;
          formStatus.className = 'form-status error';
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
          return;
        }
        
        // Ensure CSRF token is included
        if (formData.get('csrf_token') !== sessionStorage.getItem('csrfToken')) {
          formData.set('csrf_token', sessionStorage.getItem('csrfToken'));
        }
        
        // Set up request timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch('/api/contact', {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
          },
          // Prevent caching of the request
          cache: 'no-store',
          signal: controller.signal
        });
        
        // Clear the timeout
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const status = response.status;
          
          if (status === 429) {
            throw new Error('Too many requests. Please try again later.');
          } else {
            throw new Error(`Server responded with ${status}: ${response.statusText}`);
          }
        }
        
        const result = await response.json();
        
        if (result.success) {
          // Success - Create new CSRF token for next submission
          generateCSRFToken();
          
          // Safely display success message (prevent XSS)
          const safeMessage = document.createTextNode(result.message);
          formStatus.textContent = '';
          formStatus.appendChild(safeMessage);
          formStatus.className = 'form-status success';
          contactForm.reset();
        } else {
          // Error from server - Safely display error message
          const safeMessage = document.createTextNode(result.message);
          formStatus.textContent = '';
          formStatus.appendChild(safeMessage);
          formStatus.className = 'form-status error';
        }
      } catch (error) {
        // Network or other error
        console.error('Error submitting form:', error);
        
        let errorMessage = 'There was a problem submitting your form. Please try again.';
        
        // Handle timeout errors specifically
        if (error.name === 'AbortError') {
          errorMessage = 'The request timed out. Please check your connection and try again.';
        }
        
        // Safely display error message
        const safeMessage = document.createTextNode(error.message || errorMessage);
        formStatus.textContent = '';
        formStatus.appendChild(safeMessage);
        formStatus.className = 'form-status error';
      } finally {
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    });
    
    // Add input validation events
    const emailInput = contactForm.querySelector('input[name="email"]');
    if (emailInput) {
      emailInput.addEventListener('blur', () => {
        const email = emailInput.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email && !emailRegex.test(email)) {
          emailInput.setCustomValidity('Please enter a valid email address');
          emailInput.reportValidity();
        } else {
          emailInput.setCustomValidity('');
        }
      });
    }
  }
});
