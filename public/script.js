'use strict';

// on content load
document.addEventListener('DOMContentLoaded', () => {
  const $ = document.querySelector.bind(document);
  const loginLink = document.getElementById('loginLink');
  const registerLink = document.getElementById('registerLink');
  
  if (loginLink) {
    loginLink.addEventListener('click', openLoginScreen);
  }
  
  if (registerLink) {
    registerLink.addEventListener('click', openRegisterScreen);
  }

  // sign In button action
  $('#loginBtn').addEventListener('click', (event) => {
    event.preventDefault();
    const loginUsername = $('#loginUsername').value;
    const loginPassword = $('#loginPassword').value;

    if (!loginUsername || !loginPassword) {
      showError('Username and password are required.');
      return;
    }

    //data
    const data = {
      username: loginUsername,
      password: loginPassword,
    };

    fetch(`http://localhost:3000/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((doc) => {
        console.log(doc); // for debug
        if (doc.error) {
          showError(doc.error);
          
        } else {
          openHomeScreen(doc);
        }
        console.log(data);
      })
      .catch(err => showError('ERROR: ' + err));
  });


  // register button action
  $('#registerBtn').addEventListener('click', () => {
    const registerUsername = $('#registerUsername').value;
    const registerPassword = $('#registerPassword').value;
    const registerName = $('#registerName').value;
    const registerEmail = $('#registerEmail').value;

    if (!registerUsername || !registerPassword || !registerName || !registerEmail) {
      showError('All fields are required.');
      return;
    }

    const data = {
      username: registerUsername,
      password: registerPassword,
      name: registerName,
      email: registerEmail,
    };

    fetch('http://localhost:3000/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((doc) => {
        if (doc.error) {
          showError(doc.error);
        } else {
          openHomeScreen(doc);
        }
      })
      .catch(err => showError('ERROR: ' + err));
  });

  // helper functions
  function showError(err) {
    $('#error').innerText = err;
  }

  function resetInputs() {
    const inputs = document.getElementsByTagName('input');
    for (let i = 0; i < inputs.length; i++) {
      inputs[i].value = '';
    }
  }

  function openHomeScreen(doc) {
    const token = doc.auth;
    localStorage.setItem('token', token);
    localStorage.setItem('currentLevel', 1);
    window.location.href = "/game.html";
  }


  function openLoginScreen() {
    const loginScreen = $('#loginScreen');
    const registerScreen = $('#registerScreen');
    if (loginScreen && registerScreen) {
      registerScreen.classList.add('hidden');
      resetInputs();
      showError('');
      loginScreen.classList.remove('hidden');
    }
  }


  function openRegisterScreen() {
    const loginScreen = $('#loginScreen');
    const homeScreen = $('#homeScreen');
    const registerScreen = $('#registerScreen');
    
    if (loginScreen) {
      loginScreen.classList.add('hidden');
    }
    
    if (homeScreen) {
      homeScreen.classList.add('hidden');
    }
    
    if (registerScreen) {
      resetInputs();
      showError('');
      registerScreen.classList.remove('hidden');
    }
  }
  // Initial screen setup
  openLoginScreen();
});
