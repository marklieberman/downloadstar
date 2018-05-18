'use strict';

// Initialize the options interface.
let inputKeepHistory = {
  never: document.getElementById('keep-history-never'),
  session: document.getElementById('keep-history-session'),
  always: document.getElementById('keep-history-always')
};
let inputMaxHistory = document.getElementById('max-history');

// Restore settings from local storage.
browser.storage.local.get({
  keepHistory: 'never',
  maxHistory: 1000
}).then(results => {
  inputKeepHistory[results.keepHistory].checked = true;

  // Disable max history when keep history is not always.
  inputMaxHistory.disabled = !inputKeepHistory.always.checked;
  inputMaxHistory.value = results.maxHistory;
});

// Bind event handlers to the form.
let optionsForm = document.getElementById('options-form');
optionsForm.addEventListener('submit', saveOptions);

// Disable max history when keep history is not always.
Object.keys(inputKeepHistory).forEach(key => {
  inputKeepHistory[key].addEventListener('input', () => {
    inputMaxHistory.disabled = !inputKeepHistory.always.checked;
  });
});

// ---------------------------------------------------------------------------------------------------------------------

// Save the options to local storage.
function saveOptions () {
  let keepHistory = Object.keys(inputKeepHistory)
    .find(key => inputKeepHistory[key].checked);

  return browser.storage.local.set({
    keepHistory,
    maxHistory: Number(inputMaxHistory.value)
  });
}
