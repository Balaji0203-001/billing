// Initialize users array in local storage if it doesn't exist
if (!localStorage.getItem('users')) {
  localStorage.setItem('users', JSON.stringify([]));
}

// Toggle between sign-in and sign-up panels
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
  container.classList.add('right-panel-active');
});

signInButton.addEventListener('click', () => {
  container.classList.remove('right-panel-active');
});

// Handle sign-up form submission
const signupForm = document.getElementById('signupForm');
const signupSuccess = document.getElementById('signupSuccess');
const signupError = document.getElementById('signupError');

signupForm.addEventListener('submit', function(e) {
  e.preventDefault();
  
  // Get form data
  const formData = new FormData(signupForm);
  const userData = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      password: formData.get('password'), // In a real app, you would hash this password
      createdAt: new Date().toISOString()
  };
  
  try {
      // Get existing users from local storage
      const users = JSON.parse(localStorage.getItem('users')) || [];
      
      // Check if email already exists
      const existingUser = users.find(user => user.email === userData.email);
      if (existingUser) {
          signupError.textContent = "This email is already registered.";
          signupError.style.display = 'block';
          signupSuccess.style.display = 'none';
          return;
      }
      
      // Add new user
      users.push(userData);
      
      // Save to local storage
      localStorage.setItem('users', JSON.stringify(users));
      
      // Show success message
      signupSuccess.style.display = 'block';
      signupError.style.display = 'none';
      signupForm.reset();
      
      // Automatically switch to sign-in after successful signup
      setTimeout(() => {
          container.classList.remove('right-panel-active');
      }, 3000);
  } catch (error) {
      console.error('Error:', error);
      signupError.textContent = "Something went wrong. Please try again.";
      signupError.style.display = 'block';
      signupSuccess.style.display = 'none';
  }
});

// Handle sign-in form submission
const signinForm = document.getElementById('signinForm');
const signinError = document.getElementById('signinError');
const signinSuccess = document.getElementById('signinSuccess');

signinForm.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const email = signinForm.elements.email.value;
  const password = signinForm.elements.password.value;
  
  try {
      // Get users from local storage
      const users = JSON.parse(localStorage.getItem('users')) || [];
      
      // Find user by email
      const user = users.find(user => user.email === email);
      
      // Check if user exists and password matches
      if (user && user.password === password) {
          // Authentication successful
          signinError.style.display = 'none';
          signinSuccess.style.display = 'block';
          
          // Store user info in session for dashboard use
          sessionStorage.setItem('currentUser', JSON.stringify({
              name: user.name,
              email: user.email,
              phone: user.phone
          }));
          
          // Redirect to dashboard after showing success message
          setTimeout(() => {
              window.location.href = 'dashboard.html';
          }, 1000);
      } else {
          // Authentication failed
          signinError.style.display = 'block';
          signinSuccess.style.display = 'none';
      }
  } catch (error) {
      console.error('Error:', error);
      signinError.textContent = "Something went wrong. Please try again.";
      signinError.style.display = 'block';
      signinSuccess.style.display = 'none';
  }
});

// Forgot Password Functionality
const forgotPasswordLink = document.getElementById('forgotPassword');
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const passwordResetModal = document.getElementById('passwordResetModal');
const resetEmail = document.getElementById('resetEmail');
const resetSuccess = document.getElementById('resetSuccess');
const resetError = document.getElementById('resetError');
const sendResetLinkBtn = document.getElementById('sendResetLink');
const cancelResetBtn = document.getElementById('cancelReset');
const saveNewPasswordBtn = document.getElementById('saveNewPassword');
const cancelNewPasswordBtn = document.getElementById('cancelNewPassword');
const newPasswordSuccess = document.getElementById('newPasswordSuccess');
const newPasswordError = document.getElementById('newPasswordError');

// Store the email being reset for reference
let currentResetEmail = '';

// Open forgot password modal
forgotPasswordLink.addEventListener('click', function(e) {
  e.preventDefault();
  forgotPasswordModal.style.display = 'block';
  resetSuccess.style.display = 'none';
  resetError.style.display = 'none';
  resetEmail.value = '';
});

// Close modals when clicking on X or cancel buttons
document.querySelectorAll('.close, #cancelReset, #cancelNewPassword').forEach(element => {
  element.addEventListener('click', function() {
      forgotPasswordModal.style.display = 'none';
      passwordResetModal.style.display = 'none';
  });
});

// Click outside to close modals
window.addEventListener('click', function(event) {
  if (event.target == forgotPasswordModal) {
      forgotPasswordModal.style.display = 'none';
  }
  if (event.target == passwordResetModal) {
      passwordResetModal.style.display = 'none';
  }
});

// Send reset link button
sendResetLinkBtn.addEventListener('click', function() {
  const email = resetEmail.value.trim();
  
  if (!email) {
      resetError.textContent = "Please enter your email address.";
      resetError.style.display = 'block';
      resetSuccess.style.display = 'none';
      return;
  }
  
  try {
      // Get users from local storage
      const users = JSON.parse(localStorage.getItem('users')) || [];
      
      // Find user by email
      const user = users.find(user => user.email === email);
      
      if (user) {
          // Store the email for the next step
          currentResetEmail = email;
          
          // Show success message
          resetSuccess.style.display = 'block';
          resetError.style.display = 'none';
          
          // In a real app, you would send an email with a reset link here
          
          // For this demo, we'll just show the password reset form after a delay
          setTimeout(() => {
              forgotPasswordModal.style.display = 'none';
              passwordResetModal.style.display = 'block';
              document.getElementById('newPassword').value = '';
              document.getElementById('confirmNewPassword').value = '';
              newPasswordSuccess.style.display = 'none';
              newPasswordError.style.display = 'none';
          }, 2000);
      } else {
          // User not found
          resetError.textContent = "No account found with this email address.";
          resetError.style.display = 'block';
          resetSuccess.style.display = 'none';
      }
  } catch (error) {
      console.error('Error:', error);
      resetError.textContent = "Something went wrong. Please try again.";
      resetError.style.display = 'block';
      resetSuccess.style.display = 'none';
  }
});

// Save new password button
saveNewPasswordBtn.addEventListener('click', function() {
  const newPassword = document.getElementById('newPassword').value;
  const confirmNewPassword = document.getElementById('confirmNewPassword').value;
  
  if (!newPassword || !confirmNewPassword) {
      newPasswordError.textContent = "Please fill in all fields.";
      newPasswordError.style.display = 'block';
      newPasswordSuccess.style.display = 'none';
      return;
  }
  
  if (newPassword !== confirmNewPassword) {
      newPasswordError.textContent = "Passwords don't match. Please try again.";
      newPasswordError.style.display = 'block';
      newPasswordSuccess.style.display = 'none';
      return;
  }
  
  try {
      // Get users from local storage
      const users = JSON.parse(localStorage.getItem('users')) || [];
      
      // Find user index by email
      const userIndex = users.findIndex(user => user.email === currentResetEmail);
      
      if (userIndex !== -1) {
          // Update user's password
          users[userIndex].password = newPassword;
          
          // Save updated users to local storage
          localStorage.setItem('users', JSON.stringify(users));
          
          // Show success message
          newPasswordSuccess.style.display = 'block';
          newPasswordError.style.display = 'none';
          
          // Close modal and redirect to sign in after a delay
          setTimeout(() => {
              passwordResetModal.style.display = 'none';
              // Clear the current reset email
              currentResetEmail = '';
          }, 2000);
      } else {
          // This shouldn't happen as we've already verified the email, but just in case
          newPasswordError.textContent = "Something went wrong. Please try again.";
          newPasswordError.style.display = 'block';
          newPasswordSuccess.style.display = 'none';
      }
  } catch (error) {
      console.error('Error:', error);
      newPasswordError.textContent = "Something went wrong. Please try again.";
      newPasswordError.style.display = 'block';
      newPasswordSuccess.style.display = 'none';
  }
});