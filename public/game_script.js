//doc
const $ = document.querySelector.bind(document);
// constants and variables
const open = document.getElementById("open");
const rules = document.getElementById("rules");
const restart = document.getElementById("restart");
const rules_container = document.getElementById('rules_container');
const settings_container = document.getElementById('settings_container');
const close = document.getElementById('close');
const play = document.getElementById('playGame');
const close_settings = document.getElementById('close_settings');
const root = document.getElementById('root');
const game_containter = document.getElementById('game_container');
const different_words = ["FIELD", "BEGIN", "SOLVE", "LANDS", "STICK"];
const checkbox = document.getElementById('darkmode-toggle');
const gameHeading = document.querySelector('.game-container-heading');
const lifeLine = document.querySelector('.life_line');
const shuffle_words = document.getElementById('shuffle_words');
const guessed_row1 = document.getElementById('guessed_row1');
const guessed_row2 = document.getElementById('guessed_row2');
const guessed_row3 = document.getElementById('guessed_row3');
const guessed_row4 = document.getElementById('guessed_row4');
const clearButton = document.getElementById('clear_selection');
const words_level = 0;
var correct_position = []
var correct_letter = []
var array_of_words;
var in_level = 0;
const level = 1;
var categories = {};
var categorySelectedWords = {};
var categoryRowNumber = {};
var shuffledWords = [];


// life balls
const life1 = document.getElementById('life_1');
const life2 = document.getElementById('life_2');
const life3 = document.getElementById('life_3');
const life4 = document.getElementById('life_4');

// lifeline buttons
const check_selections = document.getElementById('check_words');
const clear_selections = document.getElementById('clear_selection');

// get information and authorization on load
document.addEventListener('DOMContentLoaded', () => {
    getUserInformation();
    unauthorized();
    fetchDatabase(level)

    // dark mode toggle
    checkbox.addEventListener('change', function () {
        if (this.checked) {

            gameHeading.style.color = '#fbfbfb';
            lifeLine.style.color = '#fbfbfb';
            life1.style.backgroundColor = '#fbfbfb';
            life2.style.backgroundColor = '#fbfbfb';
            life3.style.backgroundColor = '#fbfbfb';
            life4.style.backgroundColor = '#fbfbfb';

        } else {

            gameHeading.style.color = 'black';
            lifeLine.style.color = 'black';
            life1.style.backgroundColor = 'rgb(116, 102, 102)';
            life2.style.backgroundColor = 'rgb(116, 102, 102)';
            life3.style.backgroundColor = 'rgb(116, 102, 102)';
            life4.style.backgroundColor = 'rgb(116, 102, 102)';
        }
    });

    check_selections.addEventListener('click', checkSelectedWords);

    const letters = document.querySelectorAll('#game_container .letter');


    shuffle_words.addEventListener('click', () => {
        //letter inputs in rows that are not hidden
        const visibleLetterInputs = Array.from(document.querySelectorAll('#game_container .row'))
            .filter(row => row.style.display !== 'none') // Filter out rows that are hidden
            .flatMap(row => Array.from(row.querySelectorAll('.letter input'))); // Get inputs from visible rows

        //extract the current words from these inputs
        const currentWords = visibleLetterInputs.map(input => input.placeholder);
        shuffledWords = shuffleArray(currentWords);

        //re-assign the shuffled words to the input placeholders of visible rows only
        visibleLetterInputs.forEach((input, index) => {
            input.placeholder = shuffledWords[index];
        });
        visibleLetterInputs.forEach(letter => {
            letter.classList.remove('selected');
        });
    });
    letters.forEach(letter => {
        letter.addEventListener('click', () => {
            pushDownAnimation(letter);
            updateSelection(letter);
        });
    });
    //clear selection button
    clearButton.addEventListener('click', () => {
        letters.forEach(letter => {
            letter.classList.remove('selected');
        });
    });

});

function pushDownAnimation(letter) {
    letter.classList.add('push-down');
    setTimeout(() => {
        letter.classList.remove('push-down');
    }, 200); // This timeout should match the duration of the CSS transition
}

// Function to update the selection based on the current state
function updateSelection(letter) {
    const selectedLetters = document.querySelectorAll('#game_container .letter.selected');
    // Check the current state and total selected before toggling
    if (selectedLetters.length < 4 || letter.classList.contains('selected')) {
        letter.classList.toggle('selected');
    }
}
function toggleVisibilityById(element) {
    if (element.classList.contains('visible')) {
        element.classList.remove('visible');
    } else {
        element.classList.add('visible');
    }
}
/**
 * Checks the selected words and counts the categories they belong to.
 * Notifies the user if they have found a category with four or more words.
 */
/**
 * Checks the selected words and counts the categories they belong to.
 * If a category has 4 or more words, it displays a success message.
 * If a category has 3 words and no category has 4 or more words, it displays a warning message.
 * If no category has 4 or more words and no category has 3 words, it displays a message to keep trying.
 */
function checkSelectedWords() {
    const selectedInputs = document.querySelectorAll('#game_container .letter.selected input');
    const categoryCounts = {};
    let maxWordsInCategory = 0;
    let successfulCategory = null;

    // Count categories for selected words
    selectedInputs.forEach(input => {
        const inputText = input.placeholder.toUpperCase();
        let found = false;

        Object.keys(categories).forEach(category => {
            if (categories[category].includes(inputText)) {
                if (!categoryCounts[category]) {
                    categoryCounts[category] = 1;
                } else {
                    categoryCounts[category]++;
                }
                found = true;

                if (categoryCounts[category] > maxWordsInCategory) {
                    maxWordsInCategory = categoryCounts[category];
                    successfulCategory = categoryCounts[category] === 4 ? category : null;
                }
            }
        });

        if (!found) {
            console.log(`Word: ${inputText} does not belong to any known category.`);
        }
    });

    // Use the stored row number to determine which row to hide
    if (successfulCategory && maxWordsInCategory === 4) {
        // Retrieve the row number from categoryRowNumber mapping
        const rowNumber = categoryRowNumber[successfulCategory];
        if (rowNumber) {
            hideRowAndReshuffle(rowNumber);  // Pass the row number directly
        } else {
            console.log("No row number found for the successful category.");
        }
    } else {
        console.log("Keep trying or check for errors in selected words.");
    }
}
function hideRowAndReshuffle(rowNumber) {
    let rowToHide = document.getElementById(`row${rowNumber}`);
    let guessedRowToShow = document.getElementById(`guessed_row${rowNumber}`);  // Corresponding guessed row

    if (rowToHide && guessedRowToShow) {
        rowToHide.style.display = 'none';  // Hide the row

        // Add .visible class to make the guessed row appear
        guessedRowToShow.classList.add('visible');

        // Remove words from shuffledWords and categories
        Object.keys(categories).forEach(category => {
            if (categoryRowNumber[category] == rowNumber) {
                categories[category].forEach(word => {
                    let index = shuffledWords.indexOf(word.toUpperCase());
                    if (index !== -1) {
                        shuffledWords.splice(index, 1); // Remove word from shuffledWords
                    }
                });
            }
        });

        reshuffleAndReassignWords();  // Reshuffle and reassign words to remaining visible rows
    } else {
        console.log("No row found to hide or no guessed row to show for row number:", rowNumber);
    }
}

// Function to reshuffle and reassign words to visible rows
function reshuffleAndReassignWords() {
    const letters = document.querySelectorAll('#game_container .letter');
    letters.forEach(letter => {
        letter.classList.remove('selected');
    });
    const remainingRows = Array.from(document.querySelectorAll('.row')).filter(row => row.style.display !== 'none');
    shuffledWords = shuffleArray(shuffledWords.slice());  // Shuffle a copy of shuffledWords

    let index = 0; // Track index across all rows
    remainingRows.forEach(row => {
        const letterInputs = row.querySelectorAll('.letter input');
        letterInputs.forEach((input) => {
            if (index < shuffledWords.length) {
                input.placeholder = shuffledWords[index++];
            } else {
                input.placeholder = ""; // Clear placeholder if no words left
            }
        });
    });
}




function fetchDatabase(level) {
    fetch(`http://localhost:3000/placeholders/${level}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then((data) => {
            categories = {};  // Initialize categories anew
            categorySelectedWords = {};
            categoryRowNumber = {};

            data.forEach(item => {
                categories[item.categoryName] = item.words.map(word => word.toUpperCase());
                categorySelectedWords[item.categoryName] = 0;
                categoryRowNumber[item.categoryName] = item.row;
            });

            setupGame(categories, data);  // Pass the categories and raw data to setupGame
        })
        .catch((error) => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function setupGame(categories, data) {
    // Setup guessed rows
    data.forEach(item => {
        const guessedRow = document.getElementById(`guessed_row${item.row}`);
        if (guessedRow) {
            guessedRow.querySelector('h2').textContent = item.categoryName;
            guessedRow.querySelector('p').textContent = item.words.join(', ');
        }
    });

    // Shuffle and assign words to letter inputs
    const allWords = Object.values(categories).flat();
    shuffledWords = shuffleArray(allWords);
    const letterInputs = document.querySelectorAll('#game_container .letter input');

    letterInputs.forEach((input, index) => {
        input.placeholder = shuffledWords[index] || ""; // Use an empty string if there are not enough words
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
}


// fetch with authentication
function getUserInformation() {
    // get the token from local storage
    const token = localStorage.getItem('token');
    fetch(`http://localhost:3000/users/${token}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then((response) => response.json())
        .then((data) => {
            // Handle the user information
            console.log(data);
            $('#username').innerText = data.username;
            $('#name').innerText = data.user;
            $('#updateEmail').innerText = data.email;

        })
        .catch((err) => {
            console.error('Error fetching user information:', err)
            window.location.href = '/index.html';
        });
}

// debug
function unauthorized() {
    const username = $('#username').innerText;
    if (username === undefined) {
        console.log('Username is undefined');
    } else {
        console.log('Username is defined');
    }
}

switch (sessionStorage.getItem('level')) {
    case "FIELD":
        { in_level = 0; break; }
    case "BEGIN":
        { in_level = 1; break; }
    case "SOLVE":
        { in_level = 2; break; }
    case "LANDS":
        { in_level = 3; break; }
    case "STICK":
        { in_level = 4; break; }
    default:
        { in_level = 0; break; }

}



// level display
var heading = $(".title");
if (heading !== null) {
    heading.innerHTML = "Level " + (in_level + 1);
}

//MODALS
if (rules || close || play) {
    rules.addEventListener('click', () => {
        rules_container.classList.add('popup');
        settings_container.classList.add('hidden');
        root.classList.add('blured');
    });
    close.addEventListener('click', () => {
        rules_container.classList.remove('popup');
        settings_container.classList.remove('hidden');
        root.classList.remove('blured');
    });
    play.addEventListener('click', () => {
        rules_container.classList.remove('popup');
        settings_container.classList.remove('hidden');
        root.classList.remove('blured');
    });
    rules.addEventListener('keydown', (event) => {
        var key = event.key;
        if (key == "Escape") {
            rules_container.classList.remove('popup');
            root.classList.remove('blured');
        }
    });
};
if (open || close_settings) {
    open.addEventListener('click', () => {
        settings_container.classList.add('popup');
        rules_container.classList.add('hidden');
        root.classList.add('blured');
    });
    close_settings.addEventListener('click', () => {
        rules_container.classList.remove('hidden');
        settings_container.classList.remove('popup');
        root.classList.remove('blured');
    });
    open.addEventListener('keydown', (event) => {
        var key = event.key;
        if (key == "Escape") {
            settings_container.classList.remove('popup');
            root.classList.remove('blured');

        }
    });
};


//ROWS
if (game_container) {
    rows = Array.from(game_container.children).slice(1); // Convert children to array and skip the first element
} else {
    console.error('game_container not found!');
    // Handle the lack of game_container accordingly
}
var words = ['', '', '', '', '', ''];
var in_row = 0;
var mywords = [];

// update button action - email and name information update
$('#updateBtn').addEventListener('click', () => {
    // check to make sure no fields aren't blank
    if (!$('#updateName').value || !$('#updateEmail').value) {
        showError('Fields cannot be blank.');
        return;
    }
    // grab all user info from input fields

    //debug
    // console.log("name " +$('#updateName').value + " email " + $('#updateEmail').value+ " " + $('#username').innerText);
    const data = {
        username: $('#username').innerText,
        name: $('#updateName').value,
        email: $('#updateEmail').value
    };

    fetch(`http://localhost:3000/users/${$('#username').innerText}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then((r) => r.json())
        .then((doc) => {
            if (doc.error)
                showError(doc.error);
            else {
                $('#name').innerText = doc.user;
                alert("Your name and email have been updated.");
                location.reload();
            }
        })
        .catch(err => showError('ERROR: ' + err))
});
// Delete button action
$('#deleteBtn').addEventListener('click', () => {
    // confirm that the user wants to delete
    if (!confirm("Are you sure you want to delete your profile?"))
        return;

    const username = $('#username').innerText;
    const token = localStorage.getItem('token');

    fetch(`http://localhost:3000/users/${username}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
        .then((r) => r.json())
        .then((doc) => {
            if (doc.error) {
                showError(doc.error);
            } else {
                localStorage.removeItem('token');
                window.location.href = "/index.html";
            }
        })
        .catch(err => showError('ERROR: ' + err))
});



$('#logoutLink').addEventListener('click', () => {
    const username = $('#username').innerText;

    fetch(`http://localhost:3000/logout/${username}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => {
            if (response.ok) {
                rules_container.classList.remove('popup');
                root.classList.remove('blured');
                localStorage.removeItem('token');
                window.location.href = "/index.html";


            } else {
                response.json().then(data => {
                    showError('ERROR: ' + data.error);
                });
            }
        })
        .catch(err => showError('ERROR: ' + err));
});


function showError(err) {
    $('#error').innerText = err;
}

function restart_the_game() {
    location.reload();
}

