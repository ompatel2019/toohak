import { setData, getData } from './dataStore';

const MIN_10_DIGIT_NUMBER = 1000000000;
const RANGE = 9000000000;

// Interfaces
interface ErrorReturn {
  error: string
}

/**
  * Clears all user and quiz data, resetting the state of the application
  * back to the start
  *
  * @returns {Object} - returns empty object after succesfully clearing data
*/
function clear(): object {
  const clearedData = getData();
  Object.values(clearedData.sessionTimers).forEach(timerId => clearTimeout(timerId));
  clearedData.sessionTimers = {};
  clearedData.users = [];
  clearedData.quizzes = [];
  clearedData.tokens = [];
  clearedData.sessions = [];
  clearedData.trash = [];
  setData(clearedData);
  return {};
}

/**
  * Generates a random 10 digit number to be used as an Id
  *
  * @returns {number} - returns a randomly generated number
*/
function generateUniqueId() {
  return Math.floor(MIN_10_DIGIT_NUMBER + Math.random() * RANGE);
}

/**
  * Generates a letter or number as a string to represent a colour
  *
  * @returns {string} - returns a randomly generated letter
*/
function getRandomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

/**
  * Generates a string with 5 unique letters and 3 unique numbers
  *
  * @returns {string} - returns a randomly generated string
*/
function generatePlayerName() {
  let player = '';
  let alphabet = 'abcdefghijklmnopqrstuvwxyz';
  let numbers = '1234567890';
  let count = 0;
  while (count < 5) {
    const letter = Math.floor((Math.random() * 10000) % (26 - count));
    player = player.concat(alphabet[letter]);
    alphabet = alphabet.replace(alphabet[letter], '');
    count++;
  }
  count = 0;
  while (count < 3) {
    const number = Math.floor((Math.random() * 10000) % (10 - count));
    player = player.concat(`${numbers[number]}`);
    numbers = numbers.replace(numbers[number], '');
    count++;
  }

  return player;
}

export {
  ErrorReturn,
  clear,
  generateUniqueId,
  getRandomColor,
  generatePlayerName
};
