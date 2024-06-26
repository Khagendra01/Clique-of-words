"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const $ = document.querySelector.bind(document);
  const loginLink = $("#loginLink");
  const registerLink = $("#registerLink");

  if (loginLink) {
    loginLink.addEventListener("click", openLoginScreen);
  }

  if (registerLink) {
    registerLink.addEventListener("click", openRegisterScreen);
  }

  // Password and email validation for real-time feedback
  const registerPassword = $("#registerPassword");
  if (registerPassword) {
    registerPassword.addEventListener('input', checkPasswordValidity);
  }

  const registerEmail = $("#registerEmail");
  if (registerEmail) {
    registerEmail.addEventListener('input', checkEmailValidity);
  }

  const registerName = $("#registerName");
  if (registerName) {
    registerName.addEventListener('input', checkNameValidity);
  }

  const userName = $("#registerUsername");
  if (userName) {
    userName.addEventListener('input', checkUserNameValidity);
  }
  function validateUsername(username) {
    return username.length >= 4;
  }
  
  function validatePassword(password) {
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const isLongEnough = password.length >= 8;
    return hasLowercase && hasUppercase && hasNumber && isLongEnough;
  }
  
  function validateName(name) {
    return name.length >= 4;
  }
  
  function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }



  // Sign in button action
  $("#loginBtn").addEventListener("click", (event) => {
    event.preventDefault();
    const loginUsername = $("#loginUsername").value;
    const loginPassword = $("#loginPassword").value;
    

    if (!loginUsername || !loginPassword) {
      showError("Username and password are required.", $("#loginError"));
      return;
    }

    const data = {
      username: loginUsername,
      password: loginPassword,
    };

    fetch(`http://localhost:3000/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    .then((response) => response.json())
    .then((doc) => {
      if (doc.error) {
        showError(doc.error, $("#loginError"));
      } else {
        openHomeScreen(doc);
      }
    })
    .catch((err) => showError("ERROR: " + err, $("#loginError")));
  });

  // Register button action
  $("#registerBtn").addEventListener("click", (event) => {
    event.preventDefault();
    const registerUsername = $("#registerUsername").value;
    const registerPassword = $("#registerPassword").value;
    const registerName = $("#registerName").value;
    const registerEmail = $("#registerEmail").value;

    if (!registerUsername || !registerPassword || !registerName || !registerEmail) {
      showError("All fields are required." , $("#registerError"));
      return;
    }
    if (!$("#registerPassword").checkValidity()) {
      checkPasswordValidity(); // Show password error if invalid
      return; // Stop further processing if the password is invalid
    }
    if (!validateUsername(registerUsername)) {
      showError("Username must be at least 4 characters long.", $("#registerError"));
      return;
    }

    if (!validatePassword(registerPassword)) {
      
      return;
    }

    if (!validateName(registerName)) {
      showError("Name should be at least 4 characters long.", $("#registerError"));
      return;
    }

    if (!validateEmail(registerEmail)) {
      showError("Please enter a valid email address.", $("#registerError"));
      return;
    }
   

    const data = {
      username: registerUsername,
      password: registerPassword,
      name: registerName,
      email: registerEmail,
    };

    fetch("http://localhost:3000/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    .then((response) => response.json())
    .then((doc) => {
      if (doc.error) {
        showError(doc.error, $("#registerError"));
      } else {
        openHomeScreen(doc);
      }
    })
    .catch((err) => showError("ERROR: " + err, $("#registerError")));
  });

  function showError(err, errorElement) {
    const errorDiv = errorElement || $(".error"); 
    errorDiv.innerText = err;
}


  function resetInputs() {
    document.querySelectorAll("input").forEach(input => input.value = "");
  }

  function openHomeScreen(doc) {
    const token = doc.auth;
    localStorage.setItem("token", token);
    localStorage.setItem("currentLevel", 1);
    window.location.href = "/game.html";
  }

  function openLoginScreen() {
    const loginScreen = $("#loginScreen");
    const registerScreen = $("#registerScreen");
    if (loginScreen && registerScreen) {
      registerScreen.classList.add("hidden");
      resetInputs();
      showError("", $("#registerError"));
      loginScreen.classList.remove("hidden");
    }
  }

  function openRegisterScreen() {
    const loginScreen = $("#loginScreen");
    const homeScreen = $("#homeScreen");
    const registerScreen = $("#registerScreen");

    if (loginScreen) {
      loginScreen.classList.add("hidden");
    }

    if (homeScreen) {
      homeScreen.classList.add("hidden");
    }

    if (registerScreen) {
      resetInputs();
      showError("", $("#registerError"));
      registerScreen.classList.remove("hidden");
    }
  }

  function checkPasswordValidity() {
    var password = document.getElementById('registerPassword');
    var passwordValue = password.value;
    
    // Define the individual criteria using regular expressions
    var hasLowercase = /[a-z]/.test(passwordValue);
    var hasUppercase = /[A-Z]/.test(passwordValue);
    var hasNumber = /\d/.test(passwordValue);
    var isLongEnough = passwordValue.length >= 8;
    var isZeroLength = passwordValue.length === 0;
  
    // Select all list items within the error-message container
    var criteriaListItems = document.querySelectorAll('#passwordError ul li');
  
    // Update the appearance of each list item based on whether its condition is met
    criteriaListItems[0].classList.toggle('invalid', !hasLowercase); // Lowercase
    criteriaListItems[1].classList.toggle('invalid', !hasUppercase); // Uppercase
    criteriaListItems[2].classList.toggle('invalid', !hasNumber);     // Number
    criteriaListItems[3].classList.toggle('invalid', !isLongEnough);  // Length
  
    // If any criteria are not met, show the error message container
    var showError_toggle = !hasLowercase || !hasUppercase || !hasNumber || !isLongEnough;
    document.getElementById('passwordError').classList.toggle('show', showError_toggle);
  }
  

  function checkEmailValidity() {
    var email = $("#registerEmail");
    var emailError = $("#emailError");

    if (email.value.length === 0) {
    } else if (!email.checkValidity()) {
      emailError.textContent = 'Please enter a valid email address.';
      emailError.classList.add('show');
    } else {
      emailError.textContent = '';
      emailError.classList.remove('show');
    }
  }
  function checkNameValidity() {
    var name = $("#registerName");
    var nameError = $("#nameError");

    if (name.value.length === 0) {
    } else if (name.value.length<4) {
      nameError.textContent = 'Name should be at least 4 characters long.';
      nameError.classList.add('show');
    } else {
      nameError.textContent = '';
      nameError.classList.remove('show');
    }
  }
  function checkUserNameValidity() {
    var userName = $("#registerUsername");
    var userNameError = $("#userNameError");

    if (userName.value.length === 0) {
    } else if (userName.value.length<4) {
      userNameError.textContent = 'Username should be at least 4 characters long.';
      userNameError.classList.add('show');
    } else {
      userNameError.textContent = '';
      userNameError.classList.remove('show');
    }
  }
  

  // Initial screen setup
  openLoginScreen();
});
