// import { Session } from 'inspector';
import { getData, setData, data, Question, SessionState, AdminAction, Player, SessionAnswer } from './dataStore';
import { generateUniqueId, getRandomColor, ErrorReturn, generatePlayerName } from './other';
import validator from 'validator';
import { validAdminAction, updateSessionState, findPlayerSession, validMessage } from './helper';
// import { join } from 'path';

const MAX_DESCRIPTION_LENGTH = 100;
const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 30;
const INVALID_ID = -1;
const MS_PER_SEC = 1000;
const MAX_SESSIONS = 10;
const MAX_AUTO_START_NUM = 50;

interface QuizList {
  quizId: number,
  name: string
}

interface QuizListReturn {
  quizzes: QuizList[]
}

interface QuizCreateReturn {
  quizId: number
}

interface QuizInfoReturn {
  quizId: number,
  name: string,
  timeCreated: number,
  timeLastEdited: number,
  description: string
}

interface QuestionCreateReturn {
  questionId: number
}

interface JoinObject {
  sessionId: number,
  name: string
}

interface Thumbnail {
  imgUrl: string
}

interface ChatMessage {
  message: {
    messageBody: string
    playerId: number,
    playerName: string,
    timeSent: number
  }
}
/**
  * adminQuizList retrieves a list of quizzes associated with a specific user
  * based on their unique authorization user ID (authUserId). It ensures that
  * the provided authUserId exists in the system and returns the list of quizzes
  * if found. If the authUserId is invalid or not found, an error message is returned.
  *
  * @param {number} authUserId - unique authorization user ID used to identify a specific user
  *
  * @returns {{ quizzes: Array<{ quizId: number, name: string }> }} - returns an array of quizzes with their
  *                                                                  quiz IDs and names upon successful retrieval
  * @returns {{ error: string }} - returns an error message if the authUserId is invalid or not found
  */
function adminQuizList(authUserId: number): QuizListReturn | ErrorReturn {
  const data = getData();

  // error check id authUserId exists
  const userIndex = data.users.findIndex(user => user.authUserId === authUserId);
  const user = data.users[userIndex];

  const quizzes: QuizList[] = [];
  for (const userQuizId of user.quizId) {
    for (const quiz of data.quizzes) {
      if (quiz.quizId === userQuizId) {
        quizzes.push({
          quizId: userQuizId,
          name: quiz.name,
        });
      }
    }
  }

  return { quizzes };
}

/**
  * adminQuizCreate generates a new quiz, alongside a unique id and timestamp
  * Returns an error if quiz creation fails and returns the quiz id if
  * successful.
  *
  * @param {number} authUserId - unique id number assigned to a user
  * @param {string} name - name of the quiz being created
  * @param {string} description - decription of the quiz being created
  *
  * @returns {{ quizId: number }} - return upon successful quiz creation
  * @returns {{ error: string }} - return upon failed quiz creation
*/
function adminQuizCreate(authUserId: number, name: string, description: string): QuizCreateReturn | ErrorReturn {
  const data = getData();
  const quizId = generateUniqueId();

  // Check if valid id has been entered, else return error
  const userIndex = data.users.findIndex(user => user.authUserId === authUserId);

  // Check if characters in the quiz name are alphanumeric or spaces
  const validName = /^[a-zA-Z0-9 ]*$/;
  if (!validName.test(name)) {
    return { error: 'Invalid quiz name, must be alphanumeric or spaces' };
  }
  // Check if name length is between 3 - 30 characters
  if (name.length < MIN_NAME_LENGTH || name.length > MAX_NAME_LENGTH) {
    return { error: 'Invalid quiz name, must be between 3 - 30 characters' };
  }

  // Check if name is in use by the current user
  // COMPLETE THIS TEST
  for (const quiz of data.quizzes) {
    if (quiz.authUserId === authUserId && quiz.name === name) {
      return { error: 'Quiz name is already in use by this user' };
    }
  }

  // Check if description is less than 100 characters
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return { error: 'Invalid description, must be 100 characters or less' };
  }

  const newQuiz = {
    quizId: quizId,
    authUserId: authUserId,
    name: name,
    description: description,
    timeCreated: Math.floor(Date.now() / MS_PER_SEC),
    timeLastEdited: Math.floor(Date.now() / MS_PER_SEC),
    questions: [] as Question[],
    duration: 0,
    thumbnailUrl: '',
  };

  data.quizzes.push(newQuiz);
  data.users[userIndex].quizId.push(quizId);

  setData(data);

  return {
    quizId: quizId,
  };
}

// Stub for the adminQuizRemove function.
// Given a particular quiz, permanently
// remove the quiz.
/**
 * @param {{authUserId: number}}  - Id of user
 * @param {{quizId: number}}  - Id of quiz removed
 *
 * @returns {{object}} - empty object {} upon successeful quiz removal
 * @return {{error: string}} - error upon unsuccessful quiz removal
*/

function adminQuizRemove(authUserId: number, quizId: number): object | ErrorReturn {
  const data = getData();
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  const Quiz = data.quizzes[quizIndex];

  Quiz.timeLastEdited = Math.floor(Date.now() / MS_PER_SEC);
  data.trash.push(Quiz);
  data.quizzes.splice(quizIndex, 1);
  setData(data);

  return {};
}

/**
 * Takes an admin's authUserId and quizId, returns all relevant information
 * about the current quiz
 *
 * @param {number} authUserId - unique identifier for an user
 * @param {number} quizId - unique identifier for a quiz owned by the user
 * @returns {{quizId: number,
 *          name: string,
 *          timeCreated: number,
 *          timeLastEdited: number,
 *          description: string}}
 * @returns {{error: string}} on error
 */

function adminQuizInfo(authUserId: number, quizId: number): QuizInfoReturn | ErrorReturn {
  const data = getData();
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  const Quiz = data.quizzes[quizIndex];
  // no error, quizId is a quiz owned by authUserId
  // return relevant information
  return {
    quizId: Quiz.quizId,
    name: Quiz.name,
    timeCreated: Quiz.timeCreated,
    timeLastEdited: Quiz.timeLastEdited,
    description: Quiz.description,
  };
}

/**
  * Updates the name of the relevant quiz if it is owned by the user.
  *
  * @param {number} authUserId - Id of user
  * @param {number} quizId - Id of quiz
  * @param {string} name - New name for the quiz
  *
  *
  * @returns {Object} - Returns an empty object after successfully updating name
  * @returns {Object} - Returns an object containing the reason for failure
*/
function adminQuizNameUpdate (authUserId: number, quizId: number, name: string): object | ErrorReturn {
  const validQuiz = data.quizzes.find(q => q.quizId === quizId);

  if (name.length < MIN_NAME_LENGTH || name.length > MAX_NAME_LENGTH) {
    return { error: 'Name must be between 3 and 30 characters' };
  }

  const validName = /^[a-zA-Z0-9 ]*$/;
  if (!validName.test(name)) {
    return { error: 'Name contains invalid characters' };
  }

  if (data.quizzes.some(q => q.name === name && q.quizId !== quizId)) {
    return { error: 'Name is already used by the current logged in user for another quiz' };
  }

  validQuiz.name = name;
  validQuiz.timeLastEdited = Math.floor(Date.now() / MS_PER_SEC);

  return {

  };
}

// adminQuizDescriptionUpdate function
// it will update the description of the relevant quiz.
/**
 * @param {{authUserId: number}}  - Id of user
 * @param {{quizId: number}}  - Id of quiz decription to be updates
 * @param {{description: string}}  - New quiz description
 *
 * @returns {{object}} - empty object {} upon successeful quiz description update
 * @return {{error: string}} - error upon unsuccessful quiz update
*/

function adminQuizDescriptionUpdate(authUserId: number, quizId: number, description: string): object | ErrorReturn {
  const data = getData();
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return { error: 'Invalid description, must be 100 characters or less' };
  }
  data.quizzes[quizIndex].description = description;
  data.quizzes[quizIndex].timeLastEdited = Math.floor(Date.now() / MS_PER_SEC);

  setData(data);
  return {};
}

/**
  * Transfer ownership of a quiz to a different user based on their email
  *
  * @param {string} token - Token of current user
  * @param {string} userEmail - Email of user to transfer quiz to
  * @param {number} quizId - Id of quiz being transferred
  *
  *
  * @returns {Object} - Returns an empty object after successfully transferring the quiz
  * @returns {Object} - Returns an object containing the reason for failure
*/

function adminQuizTransfer(token: string, userEmail: string, quizId: number): object | ErrorReturn {
  const data = getData();
  if (!validator.isEmail(userEmail)) {
    return { error: 'Invalid email' };
  }

  const target = data.users.find(u => u.email === userEmail);
  if (!target) {
    return { error: 'Target email is not found' };
  }

  const quiz = data.quizzes.find(q => q.quizId === quizId);
  quiz.authUserId = target.authUserId;
  return {};
}

/**
  * adminViewtrash retrieves a list of quizzes that are in the trash and are
  * owned by a specific user based on the user Id (authUserId).
  *
  * @param {number} authUserId - unique authorization user ID used to identify a specific user
  *
  * @returns {{ quizzes: Array<{ quizId: number, name: string }> }} - returns an array of quizzes with their
  *                                                                  quiz IDs and names upon successful retrieval
  */
function adminViewTrash(authUserId: number): QuizListReturn | ErrorReturn {
  const data = getData();

  const quizzes: QuizList[] = [];
  // Iterate through the trash and push the name and Id of quizzes that have
  // a mathching user Id
  for (const quiz of data.trash) {
    if (quiz.authUserId === authUserId) {
      quizzes.push({
        quizId: quiz.quizId,
        name: quiz.name
      });
    }
  }
  return { quizzes };
}

/**
  * adminRestore transfers a quiz from the trash back to the list of active
  * quizzes given a user's Id and a valid quizId that they own. If the quiz Id
  * is not valid and error message is returned and if the owner has created a
  * new quiz with the same name as the one being retrieved an error will be
  * returned
  *
  * @param {number} authUserId - unique authorization user ID used to identify a specific user
  * @param {number} quizId - unique Id for a quiz
  *
  * @returns { {} } - returns an empty object
  * @returns {{ error: string }} - returns an error message if the quiz isn't in
  *                                the trash or if an active quiz has the same
  *                                name as the one being restored
  */
function adminRestoreTrash(authUserId: number, quizId: number): object | ErrorReturn {
  const data = getData();

  // Check if the given quizId exists in the trash, if so return an error
  const trashIndex = data.trash.findIndex(trash => trash.quizId === quizId && trash.authUserId === authUserId);
  if (trashIndex === INVALID_ID) {
    return { error: 'quizId does not exist in trash' };
  }

  // Check if the quizId in the trash has the same name as an active quiz.
  // If so, return an error
  const restore = data.trash[trashIndex];
  const active = data.quizzes.find(quiz => quiz.name === restore.name && quiz.authUserId === authUserId);
  if (active !== undefined) {
    return { error: 'An active quiz has the same name as the quiz being restored' };
  }

  // Update the time last edited of the quiz and push it back into the quizzes
  // data store.
  restore.timeLastEdited = Math.floor(Date.now() / MS_PER_SEC);
  data.quizzes.push(restore);
  data.trash.splice(trashIndex, 1);
  setData(data);

  return {};
}

/**
  * adminRestore transfers a quiz from the trash back to the list of active
  * quizzes given a user's Id and a valid quizId that they own. If the quiz Id
  * is not valid and error message is returned and if the owner has created a
  * new quiz with the same name as the one being retrieved an error will be
  * returned
  *
  * @param {number} authUserId - unique authorization user ID used to identify a
  *                              specific user
  * @param {number[]} quizIds - An array of unique Id's for quizzes owned by the
  *                             user
  *
  * @returns { {} } - returns an empty object
  * @returns {{ error: string }} - returns an error message if the user doesn't
  *                                own the quiz
  */
function adminEmptyTrash(authUserId: number, quizIds: number[]): object | ErrorReturn {
  const data = getData();

  // Iterate through the array of quizId's to make sure they all exist in the
  // trash, otherwise return error

  let trashIndex: number;
  for (const quizId of quizIds) {
    trashIndex = data.trash.findIndex(trash => trash.quizId === quizId);
    if (trashIndex === INVALID_ID) {
      return { error: 'One or more quizId\'s does not exist in the trash' };
    }
  }

  // Iterate through the trash and remove the respective quiz based on the
  // quiz Id.
  const userIndex = data.users.findIndex(user => user.authUserId === authUserId);
  for (const trashId of quizIds) {
    const trashIndex = data.trash.findIndex(trash => trash.quizId === trashId);
    data.trash.splice(trashIndex, 1);
    const userTrashIndex = data.users[userIndex].quizId.findIndex(q => q === trashId);
    data.users[userIndex].quizId.splice(userTrashIndex, 1);
    setData(data);
  }

  return {};
}

/**
  * adminQuizQuestionCreate generates a question and checks if the question is
  * 5 - 50 characters, answers are 2 - 20 characters, duration is positive and
  * in total less than 3 mins, points are 1 - 10, answer length 1 - 10 and the
  * question isnt a duplicate, otherwise return an error.
  *
  * @param {number} authUserId - unique authorization user ID used to identify a
  *                              specific user
  * @param {number} quizIds - An array of unique Id's for quizzes owned by the
  *                             user
  * @param {Question} questionBody - An object containing question details
  *
  * @returns { {} } - returns an empty object
  * @returns {{ error: string }} - returns an error message if questions are not
  *                                 created properly
  */
function adminQuizQuestionCreate(authUserId: number, quizId: number, questionBody: Question): QuestionCreateReturn | ErrorReturn {
  const data = getData();

  // Validate the question length
  if (questionBody.question.length < 5 || questionBody.question.length > 50) {
    return { error: 'Invalid question length' };
  }

  // Validate the number of answers
  if (questionBody.answers.length < 2 || questionBody.answers.length > 6) {
    return { error: 'Invalid amount of answers' };
  }

  // Validate the question duration
  if (questionBody.duration < 0) {
    return { error: 'Invalid question duration' };
  }

  // Validate sum of question durations
  const quiz = data.quizzes.find(q => q.quizId === quizId);

  const totalDuration = quiz.questions.reduce((sum, q) => sum + q.duration, 0) + questionBody.duration;
  if (totalDuration > 180) {
    return { error: 'The sum of question durations in the quiz exceeds 3 minutes' };
  }

  // Validate the points awarded for the question
  if (questionBody.points < 1 || questionBody.points > 10) {
    return { error: 'Invalid points awarded for question' };
  }

  // Validate the length of answers
  for (const answer of questionBody.answers) {
    if (answer.answer.length < 1 || answer.answer.length > 30) {
      return { error: 'Invalid answer length' };
    }
  }

  // Check for duplicate answers
  const answerSet = new Set();
  for (const answer of questionBody.answers) {
    if (answerSet.has(answer.answer)) {
      return { error: 'Duplicate answers detected' };
    }
    answerSet.add(answer.answer);
  }

  // Check if there's at least one correct answer
  let correctAnswer = false;
  for (const answer of questionBody.answers) {
    if (answer.correct === true) {
      correctAnswer = true;
      break;
    }
  }

  if (!correctAnswer) {
    return { error: 'Invalid question, no correct answer' };
  }

  // Validate thumbnail URL
  if (questionBody.thumbnailUrl === '') {
    return { error: 'Invalid thumbnail URL, URL is empty' };
  }

  const lowerCaseUrl = questionBody.thumbnailUrl.toLowerCase();
  const validExtensions = ['.jpg', '.jpeg', '.png'];

  const hasValidExtension = validExtensions.some(ext => lowerCaseUrl.endsWith(ext));
  if (!hasValidExtension) {
    return { error: 'Invalid thumbnail URL, URL does not end with valid filetype' };
  }

  const hasValidProtocol = lowerCaseUrl.startsWith('http://') || lowerCaseUrl.startsWith('https://');
  if (!hasValidProtocol) {
    return { error: 'Invalid thumbnail URL, URL does not begin with valid method' };
  }

  // Construct the new question with a unique questionId
  const newQuestion = {
    ...questionBody,
    questionId: generateUniqueId(),
    thumbnailUrl: questionBody.thumbnailUrl,

    answers: questionBody.answers.map(answer => ({
      ...answer,
      answerId: generateUniqueId(), // Generate a unique ID for each answer
      color: getRandomColor(), // Assuming you have a function to generate random colors
    }))
  };

  // Push the new question to the quiz's questions array
  quiz.questions.push(newQuestion);

  // Update the quiz's last edited time
  quiz.timeLastEdited = Math.floor(Date.now() / MS_PER_SEC); // If you're using seconds since epoch

  // Save the updated data back to the dataStore
  setData(data);

  // Return the new question's ID
  return { questionId: newQuestion.questionId };
}

/**
 * adminQuizQuestionDelete function. Given a particular question, permanently
 * remove the question.
 *
 * @param {{authUserId: number}}  - Id of user
 * @param {{quizId: number}}  - Id of quiz
 * @param {{questionId: number}} - Id of question being deleted
 *
 * @returns {{object}} - empty object {} upon successeful question removal
 * @return {{error: string}} - error upon unsuccessful question removal
*/
function adminQuizQuestionDelete(quizId: number, questionId: number, authUserId: number): object | ErrorReturn {
  const data = getData();
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  const Quiz = data.quizzes[quizIndex];
  const questionIndex = Quiz.questions.findIndex(question => question.questionId === questionId);

  Quiz.questions.splice(questionIndex, 1);
  setData(data);

  return {};
}

/**
  * adminQuizQuestionMove moves the position of a question in a quiz, if the
  * question Id is incorrect and the position is less than 0 or greater than the
  * number of questions an error is returned.
  *
  * @param {number} quizId - The unique Id of the quiz that is going to have the
  *                           question
  * @param {number} questionId - The unique Id for the quiz being updated
  * @param {number} authUserId - The Id of the owner of the quiz
  *
  * @returns { {} } - returns an empty object
  * @returns {{ error: string }} - returns an error message if questions are not
  *                                 created properly
  */
function adminQuizQuestionMove(quizId: number, questionId: number, authUserId: number, newPosition: number): object | ErrorReturn {
  const data = getData();
  const targetQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  const targetQuestion = targetQuiz.questions.find(question => question.questionId === questionId);
  if (!targetQuestion) {
    return { error: 'Question Id does not refer to a valid question within this quiz.' };
  }

  const numOfQuest = targetQuiz.questions.length;
  if ((newPosition) < 0 || newPosition >= numOfQuest) {
    return { error: 'Invalid newPosition' };
  }

  const currentIndex = targetQuiz.questions.findIndex(question => question.questionId === questionId);
  const [removedQuestion] = targetQuiz.questions.splice(currentIndex, 1);
  targetQuiz.questions.splice(newPosition, 0, removedQuestion);

  // Update timeLastEdited
  targetQuiz.timeLastEdited = Math.floor(Date.now() / MS_PER_SEC);

  setData(data);

  return {};
}

/**
  * adminQuizQuestionUpdate updates an question and checks if the question is
  * 5 - 50 characters, answers are 2 - 20 characters, duration is positive and
  * in total less than 3 mins, points are 1 - 10, answer length 1 - 10 and the
  * question isnt a duplicate, otherwise return an error.
  *
  * @param {number} quizId - The unique Id of the quiz that is going to have the
  *                           question
  * @param {number} questionId - The unique Id for the quiz being updated
  * @param {Question} questionBody - An object containing question details
  *
  * @returns { {} } - returns an empty object
  * @returns {{ error: string }} - returns an error message if questions are not
  *                                 created properly
  */
function adminQuizQuestionUpdate(quizId: number, questionId: number, questionBody: Question): object | ErrorReturn {
  const data = getData();
  // Validate the question length
  const quizIndex = data.quizzes.findIndex(q => q.quizId === quizId);
  const quiz = data.quizzes[quizIndex];
  if (quiz.questions.findIndex(q => q.questionId === questionId)) {
    return { error: 'Questions does not exist in this quiz' };
  }
  if (questionBody.question.length < 5 || questionBody.question.length > 50) {
    return { error: 'Invalid question length' };
  }
  // Validate the number of answers
  if (questionBody.answers.length < 2 || questionBody.answers.length > 6) {
    return { error: 'Invalid amount of answers' };
  }
  // Validate the question duration
  if (questionBody.duration < 0) {
    return { error: 'Invalid question duration' };
  }
  // Validate sum of question durations
  const totalDuration = quiz.questions.reduce((sum, q) => sum + q.duration, 0) + questionBody.duration;
  if (totalDuration > 180) {
    return { error: 'The sum of question durations in the quiz exceeds 3 minutes' };
  }
  // Validate the points awarded for the question
  if (questionBody.points < 1 || questionBody.points > 10) {
    return { error: 'Invalid points awarded for question' };
  }
  // Validate the length of answers
  for (const answer of questionBody.answers) {
    if (answer.answer.length < 1 || answer.answer.length > 30) {
      return { error: 'Invalid answer length' };
    }
  }
  // Check for duplicate answers
  const answerSet = new Set();
  for (const answer of questionBody.answers) {
    if (answerSet.has(answer.answer)) {
      return { error: 'Duplicate answers detected' };
    }
    answerSet.add(answer.answer);
  }
  // Check if there's at least one correct answer
  let correctAnswer = false;
  for (const answer of questionBody.answers) {
    if (answer.correct === true) {
      correctAnswer = true;
      break;
    }
  }
  if (!correctAnswer) {
    return { error: 'Invalid question, no correct answer' };
  }
  // Still need to add other URL error's once thumbnail function has been implemented
  if (questionBody.thumbnailUrl === '') {
    return { error: 'Invalid URL, must not be empty' };
  }
  const newQuestion = {
    questionId: generateUniqueId(),
    question: questionBody.question,
    duration: questionBody.duration,
    points: questionBody.points,
    answers: questionBody.answers.map(answer => ({
      ...answer,
      color: getRandomColor()
    })),
    thumbnailUrl: 'placeholder',
  };
  // Push the updated question to the quiz's questions array
  quiz.questions.push(newQuestion);
  // Update the quiz's last edited time
  quiz.timeLastEdited = Math.floor(Date.now() / MS_PER_SEC); // If you're using seconds since epoch
  // Save the updated data back to the dataStore
  setData(data);
  // Return the new question's ID
  return { };
}

/**
  * adminSessionStart makes a new session for a quiz to be played, if the given
  * autoStartNum exceeds 50, active sessions are more than 10, the quiz doesn't
  * exist, or the the quiz has no questions an error will be returned. Otherwise
  * the Id of the new session is returned
  *
  * @param {number} quizId - The unique Id of the quiz that is going to have the
  *                           question
  * @param {string} token - The token containing the userId
  * @param {number} autoStartNum - The time for the quiz to automatically start
  *
  * @returns {sessionId: number } - returns the Id of the session
  * @returns {{ error: string }} - returns an error message if an error occurs
  */
function adminSessionStart(quizId: number, token: string, autoStartNum: number): object | ErrorReturn {
  const data = getData();
  const userId = data.tokens.find(t => encodeURIComponent(JSON.stringify(t)) === token);
  const authUserId = userId.authUserId;
  if (autoStartNum > MAX_AUTO_START_NUM) {
    return { error: 'autoStartNum is greater than 50' };
  }

  const activeSessions = data.sessions.filter(s => s.quizId === quizId && s.state !== SessionState.END);
  if (activeSessions.length >= MAX_SESSIONS) {
    return { error: 'There are too many active sessions!' };
  }

  const quiz = data.quizzes.find(q => q.quizId === quizId);

  if (quiz.questions.length === 0) {
    return { error: 'The quiz does not have any questions' };
  }

  const player: Player[] = [];
  const playerMessages: ChatMessage[] = [];
  const newSession = {
    sessionId: generateUniqueId(),
    quizId: quizId,
    authUserId: authUserId,
    state: SessionState.LOBBY,
    autoStartNum: autoStartNum,
    players: player,
    atQuestion: 0,
    playerMessages: playerMessages,
    answers: [] as SessionAnswer[]
  };

  data.sessions.push(newSession);
  return { sessionId: newSession.sessionId };
}

/**
  * adminViewSessions shows a list of active and inactive sessions
  *
  * @param {number} quizId - The unique Id of the quiz thats details are to be
  *                           retrieved
  * @param {string} token - The token containing the userId
  *
  * @returns {{activeSessions: number, inactiveSessions: number}} - returns an
  *                                                               empty object
  */
function adminViewSessions(quizId: number, token: string): object | ErrorReturn {
  const data = getData();
  const activeSessions = data.sessions.filter(s => s.quizId === quizId && s.state !== SessionState.END).map(s => s.sessionId);
  const inactiveSessions = data.sessions.filter(s => s.quizId === quizId && s.state === SessionState.END).map(s => s.sessionId);

  return {
    activeSessions: activeSessions,
    inactiveSessions: inactiveSessions
  };
}

/**
  * adminUpdateSessionState updates the session state to a different one, return
  * an error if the quizId is invalid, the sessionId is invalid, the action does
  * not exist or the action can not be applied currently. Otherwise return an
  * object
  *
  * @param {number} quizId - The unique Id of the quiz that is going to have the
  *                           question
  * @param {string} token - The token containing the userId
  * @param {number} autoStartNum - The time for the quiz to automatically start
  *
  * @returns {{}} - returns an empty object
  * @returns {{ error: string }} - returns an error message if an error occurs
  */
function adminUpdateSessionState(quizId: number, sessionId: number, token: string, action: AdminAction): object | ErrorReturn {
  const data = getData();
  const session = data.sessions.find(s => s.sessionId === sessionId && s.quizId === quizId);

  if (!session) {
    return { error: 'Session Id does not refer to a valid session within this quiz' };
  }

  if (!Object.values(AdminAction).includes(action)) {
    return { error: 'Action provided is not a valid Action enum' };
  }

  if (!validAdminAction(action, session.state)) {
    return { error: 'Action enum cannot be applied in the current state' };
  }

  session.state = updateSessionState(sessionId, action);
  if (session.state === SessionState.LOBBY || session.state === SessionState.END ||
      session.state === SessionState.FINAL_RESULTS) {
    session.atQuestion = 0;
  } else if (session.state === SessionState.QUESTION_OPEN) {
    session.atQuestion++;
  }

  setData(data);

  return {};
}

/**
 * adminQuizQuestionDuplicate function. Given a particular question duplicate
 * the question right after the question.
 *
 * @param {{authUserId: number}}  - Id of user
 * @param {{quizId: number}}  - Id of quiz
 * @param {{questionId: number}} - Id of question being duplicated
 *
 * @returns {{newQuestionId: number}} - Id of newQuestion
 * @return {{error: string}} - error upon unsuccessful question duplication
*/
function adminQuizQuestionDuplicate(quizId: number, questionId: number, authUserId: number) {
  const data = getData();

  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  const Quiz = data.quizzes[quizIndex];
  const questionIndex = Quiz.questions.findIndex(question => question.questionId === questionId);
  if (questionIndex === INVALID_ID) {
    return { error: 'Question Id does not refer to a valid question within this quiz' };
  }
  const Question = Quiz.questions[questionIndex];

  const duplicateQuestion = {
    ...Question,
    questionId: generateUniqueId(),
  };

  Quiz.questions.splice(questionIndex + 1, 0, duplicateQuestion);

  setData(data);

  return { newQuestionId: duplicateQuestion.questionId };
}

/**
  * playerJoin adds a player to a session so they can participate in a quiz,
  * It takes in a question body containing
  *
  * @param {{quizId: number}}  - Id of quiz
  * @param {{body: object}} - image URL
  *
  * @returns {{}} - returns an empty object
  * @returns {{ error: string }} - returns an error message upon unsuccessful thumbnail update
  */
function quizThumbnailUpdate(quizId: number, body: Thumbnail) {
  const data = getData();
  const validFileEnd = ['.jpg', '.jpeg', 'png'];
  const isValidEnd = validFileEnd.some(ext => body.imgUrl.toLowerCase().endsWith(ext));

  if (!isValidEnd) {
    return { error: 'Invalid file extension' };
  }

  if (!body.imgUrl.toLowerCase().startsWith('http://') && !body.imgUrl.toLowerCase().startsWith('https://')) {
    return { error: 'Invalid URL format' };
  }

  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  data.quizzes[quizIndex].thumbnailUrl = body.imgUrl;

  setData(data);
  return {};
}

/**
  * playerJoin adds a player to a session so they can participate in a quiz,
  * It takes in a question body containing
  *
  * @param {JoinObject} joinBody - The body containing sessionId and player name

  *
  * @returns { {playerId: number} } - returns an empty object
  * @returns {{ error: string }} - returns an error message if questions are not
  *                                 created properly
  */
function playerJoin(joinBody: JoinObject) {
  const data = getData();
  const sessionId = joinBody.sessionId;
  let player = joinBody.name;

  if (player === '') {
    player = generatePlayerName();
  }

  const sessionIndex = data.sessions.findIndex(s => s.sessionId === sessionId);
  if (sessionIndex === INVALID_ID) {
    return { error: 'Invalid session' };
  }

  if (data.sessions[sessionIndex].state !== SessionState.LOBBY) {
    return { error: 'Invalid State' };
  }

  if (data.sessions[sessionIndex].players.find(p => p.name === player)) {
    return { error: 'Invalid name' };
  }

  const playerId = generateUniqueId();
  const INITIAL_SCORE = 0;
  data.sessions[sessionIndex].players.push({
    playerId: playerId,
    name: player,
    score: INITIAL_SCORE
  });
  setData(data);
  return { playerId: playerId };
}

interface playerStatusReturn {
  state: SessionState;
  numQuestions: number;
  atQuestion: number;
}

/**
  * playerJoinStatus gets the status of a guest player that already joined a session
  *
  * @param { {playerId: number} } - the id of the guest player
  *
  * @returns {{state: SessionState, numQuestions: number, atQuestion: number}} - returns status object
  * @returns {{ error: string }} - returns an error message if playerid does not exist
  */
function playerJoinStatus(playerId: number): playerStatusReturn | ErrorReturn {
  const data = getData();

  const playerSession = data.sessions.find(session => session.players.some(player => player.playerId === playerId));
  if (!playerSession) {
    return { error: 'Player ID does not exist' };
  }

  const { state, atQuestion, quizId } = playerSession;

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);

  const numQuestions = quiz.questions.length;

  return { state, numQuestions, atQuestion };
}

function sessionStatus(quizId: number, sessionId: number) {
  const data = getData();
  const quiz = data.quizzes.find(q => q.quizId === quizId);
  const session = data.sessions.find(s => s.quizId === quizId && s.sessionId === sessionId);
  if (!session) {
    return { error: 'Session does not exist for this quiz' };
  }

  const players = session.players.map(player => player.name);

  const status = {
    state: session.state,
    atQuestion: session.atQuestion,
    players: players,
    metedata: quiz,
  };

  return status;
}

/**
  * adminQuizQuestionInformation retrieves information about a specific question
  *
  * @param {number} playerId - The ID of the player whose current session is being
  *                            queried.
  * @param {number} questionPosition - The position of the question within the quiz
  *                                    (1-indexed).
  *
  * @returns {{ questionId: number, question: string, duration: number,
*             thumbnailUrl: string, points: number, answers: Answer[] }} -
*             Returns an object containing the question information along with
*             the correct answer(s).
* @returns {{ error: string }} - Returns an error message if the player ID does
*                                not exist, the question position is invalid, the
*                                session is not on the current question, or the
*                                session is in LOBBY or END state.
*/

function adminQuizQuestionInformation(playerId: number, questionPosition: number): object | ErrorReturn {
  const data = getData();

  // Find the session for the given player
  const playerSession = data.sessions.find(session => session.players.some(player => player.playerId === playerId));
  if (!playerSession) {
    return { error: 'Player ID does not exist' };
  }

  // Get quizId from the session
  const quizId = playerSession.quizId;

  // Fetch the quiz
  const quiz = data.quizzes.find(q => q.quizId === quizId);

  // Check if question position is valid
  if (questionPosition < 1 || questionPosition > quiz.questions.length) {
    return { error: 'Question position is not valid' };
  }

  // Check session state
  if (playerSession.state === SessionState.LOBBY || playerSession.state === SessionState.END) {
    return { error: 'Session is in LOBBY or END state' };
  }

  if (playerSession.atQuestion !== questionPosition) {
    return { error: 'Session is currently NOT on this question' };
  }

  // Retrieve question information
  const question = quiz.questions[questionPosition - 1]; // Arrays are zero-indexed

  // Filter to include only the correct answer
  const correctAnswers = question.answers.filter(answer => answer.correct).map(answer => {
    return {
      answerId: answer.answerId,
      answer: answer.answer,
      color: answer.color
    };
  });

  return {
    questionId: question.questionId,
    question: question.question,
    duration: question.duration,
    thumbnailUrl: question.thumbnailUrl,
    points: question.points,
    answers: correctAnswers
  };
}

/**
 * adminQuizQuestionAnswer processes a player's answer submission for a specific question in a quiz session.
 *
 * @param {number} playerId - The ID of the player submitting the answers.
 * @param {number} questionPosition - The position of the question within the quiz (1-indexed).
 * @param {number[]} answerIds - An array of IDs representing the answers submitted by the player.
 *
 * @returns {{}} - Returns an empty object on successful submission of answers.
 * @returns {{ error: string }} - Returns an error message if any of the following conditions are met:
 *                                1. The player ID does not exist.
 *                                2. The question position is not valid for the current session.
 *                                3. The session is not in the QUESTION_OPEN state.
 *                                4. The session has not yet reached the specified question.
 *                                5. The submitted answer IDs are invalid for the question.
 *                                6. Duplicate answer IDs are provided.
 *                                7. Less than one answer ID is submitted.
 */

function adminQuizQuestionAnswer(playerId: number, questionPosition: number, answerIds: number[]): object | ErrorReturn {
  const data = getData(); // Assuming this function fetches your current data state

  // If player ID does not exist
  const playerSession = data.sessions.find(session => session.players.some(player => player.playerId === playerId));
  if (!playerSession) {
    return { error: 'Player ID does not exist' };
  }

  // Get quizId from the session
  const quizId = playerSession.quizId;

  // Fetch the quiz
  const quiz = data.quizzes.find(q => q.quizId === quizId);
  // if (!quiz) {
  //   return { error: 'Quiz not found' };
  // }

  // If question position is not valid for the session this player is in
  if (questionPosition < 1 || questionPosition > quiz.questions.length) {
    return { error: 'Question position is not valid' };
  }

  // Session is not in QUESTION_OPEN state
  if (playerSession.state !== SessionState.QUESTION_OPEN) {
    return { error: 'Session is not in QUESTION_OPEN state' };
  }

  // If session is not yet up to this question
  if (playerSession.atQuestion !== questionPosition) {
    return { error: 'Session is not up to this question' };
  }

  // Retrieve the current question
  const question = quiz.questions[questionPosition - 1];
  const validAnswerIds = new Set(question.answers.map(a => a.answerId));

  // Answer IDs are not valid for this particular question
  if (!answerIds.every(id => validAnswerIds.has(id))) {
    return { error: 'Invalid answer IDs for this question' };
  }

  // There are duplicate answer IDs provided
  const uniqueAnswerIds = new Set(answerIds);
  if (uniqueAnswerIds.size !== answerIds.length) {
    return { error: 'Duplicate answer IDs provided' };
  }

  // Less than 1 answer ID was submitted
  if (answerIds.length < 1) {
    return { error: 'Less than 1 answer ID was submitted' };
  }

  // Store the answer
  const sessionAnswer = {
    playerId: playerId,
    questionId: question.questionId,
    answerIds: answerIds,
    timeTaken: 1 // calculateTimeTaken()
  };

  playerSession.answers.push(sessionAnswer);
  setData(data);

  return {};
}

function adminQuizQuestionResult(playerId: number, questionPosition: number): object | ErrorReturn {
  const data = getData();

  // Find the session for the given player
  const playerSession = data.sessions.find(session => session.players.some(player => player.playerId === playerId));
  if (!playerSession) {
    return { error: 'Player ID does not exist' };
  }

  // Get quizId from the session
  const quizId = playerSession.quizId;

  // Fetch the quiz
  const quiz = data.quizzes.find(q => q.quizId === quizId);

  // Check if question position is valid
  if (questionPosition < 1 || questionPosition > quiz.questions.length) {
    return { error: 'Question position is not valid' };
  }

  // Check session state
  if (playerSession.state !== SessionState.ANSWER_SHOW) {
    return { error: 'Session is NOT in ANSWER_SHOW state' };
  }

  if (playerSession.atQuestion !== questionPosition) {
    return { error: 'Session is currently NOT on this question' };
  }

  // Retrieve the current question
  const question = quiz.questions[questionPosition - 1];

  // Get answers for this question
  const answersForQuestion = playerSession.answers.filter(answer => answer.questionId === question.questionId);

  // Determine correct answer IDs
  const correctAnswerIds = new Set(question.answers.filter(answer => answer.correct).map(answer => answer.answerId));

  // Calculate results
  let totalAnswerTime = 0;
  let correctAnswersCount = 0;
  const playersCorrectList: string[] = [];

  answersForQuestion.forEach(answer => {
    totalAnswerTime += answer.timeTaken;
    const isCorrect = answer.answerIds.some(id => correctAnswerIds.has(id));
    if (isCorrect) {
      correctAnswersCount++;
      // Find the player's name or use 'Unknown Player' if not found
      const playerName = data.users.find(user => user.authUserId === answer.playerId)?.nameFirst || generatePlayerName();
      playersCorrectList.push(playerName);
    }
  });

  let averageAnswerTime = 0;

  if (answersForQuestion.length > 0) {
    totalAnswerTime = answersForQuestion.reduce((sum, answer) => sum + answer.timeTaken, 0);

    averageAnswerTime = totalAnswerTime / answersForQuestion.length;
  }

  let percentCorrect = 0;

  if (answersForQuestion.length > 0) {
    correctAnswersCount = answersForQuestion.filter(answer => {
      return answer.answerIds.some(id => correctAnswerIds.has(id));
    }).length;

    percentCorrect = (correctAnswersCount / answersForQuestion.length) * 100;
  }

  return {
    questionId: question.questionId,
    playersCorrectList: playersCorrectList,
    averageAnswerTime: averageAnswerTime,
    percentCorrect: percentCorrect
  };
}

/**
  * playerSendChat sends a new chat message to everyone in the session,
  *
  * @param {{ playerId }}  - player id
  * @param {{ chatMessage }} - The body containing messageBody, playerId, playerName, timeSent
  *
  * @returns {{}} - returns an empty object if successful
  * @returns {{ error: string }} - returns an error message if questions are not
  *                                 created properly
  */

function playerSendChat(playerId: number, chatMessage: ChatMessage): object | ErrorReturn {
  const data = getData();
  const session = findPlayerSession(playerId);
  if (!session) {
    return { error: 'PlayerId does not exist' };
  }

  const messageBody = chatMessage.message.messageBody;

  if (!validMessage(messageBody)) {
    return { error: 'Message needs to be between 1 to 100 characters' };
  }
  const player = session.players.find((p) => p.playerId === playerId);

  session.playerMessages.push({
    message: {
      messageBody: messageBody,
      playerId: player.playerId,
      playerName: player.name,
      timeSent: Math.floor(Date.now() / 1000)
    },
  });

  setData(data);
  return {};
}

/**
  * playerChatView returns all messages that are in the same session as the player,
  *
  * @param {{ playerId }}  - player id
  *
  * @returns {{ allMessages }} - returns an allMessages object that contains the messageBody,
  *                               playerId, playerName, timeSent
  * @returns {{ error: string }} - returns an error message if questions are not
  *                                 created properly
  */

function playerChatView(playerId: number): object | ErrorReturn {
  const session = findPlayerSession(playerId);
  if (!session) {
    return { error: 'PlayerId does not exist' };
  }
  const playerMessages = session.playerMessages;

  const allMessages = playerMessages.map(message => ({
    messageBody: message.message.messageBody,
    playerId: message.message.playerId,
    playerName: message.message.playerName,
    timeSent: message.message.timeSent,
  }));

  return { message: allMessages };
}

/**
  * playerFinalResults returns the final results for all players for a completed quiz session,
  *
  * @param {{ quizId }}  - quiz Id
  * @param {{ sessionId }}  - session Id
  *
  * @returns {{ usersRankedByScore: ranking, questionResults: questionResults }} - returns scores and questions results
  *                                                                                 if successful
  * @returns {{ error: string }} - returns an error if unsuccessful
  */
function quizFinalResults(quizId: number, sessionId: number) {
  const data = getData();
  const session = data.sessions.find(s => s.quizId === quizId && s.sessionId === sessionId);
  if (!session) {
    return { error: 'Session does not exist for this quiz' };
  }
  if (session.state !== SessionState.FINAL_RESULTS) {
    return { error: 'Session is not in FINAL RESULTS state' };
  }
  const ranking = [];
  for (const player of session.players) {
    ranking.push({
      name: player.name,
      score: player.score
    });
  }
  ranking.sort((p1, p2) => p2.score - p1.score);

  const questionResults = [];
  let position = 1;
  for (const result of session.answers) {
    questionResults.push(adminQuizQuestionResult(result.playerId, position));
    position++;
  }

  const results = {
    usersRankedByScore: ranking,
    questionResults: questionResults
  };
  return results;
}

function quizResultsCSV(quizId: number, sessionId: number) {
  const results = quizFinalResults(quizId, sessionId);
  if ('error' in results) {
    return { error: results.error };
  }
  const rankings = results.usersRankedByScore;
  const sortedRank = rankings;
  const csvData = [];

  sortedRank.sort((p1, p2) => {
    if (p1.name < p2.name) {
      return -1;
    }
    if (p1.name > p2.name) {
      return 1;
    }
    return 0;
  });

  for (const player of sortedRank) {
    const rank = rankings.findIndex(p => p.name === player.name) + 1;
    csvData.push([
      player.name,
      player.score,
      rank
    ]);
  }

  let csvResults = '';
  csvData.forEach(row => {
    csvResults += row.join(',') + '\n';
  });

  const blob = new Blob([csvResults], { type: 'text/csv;charset=utf-8,' });
  const url = URL.createObjectURL(blob);

  return {
    url: url
  };
}

/**
  * playerSessionFinalResults returns the final results for all players for a completed quiz session,
  *
  * @param {{ playerId }}  - player Id
  *
  * @returns {{ usersRankedByScore: ranking, questionResults: questionResults }} - returns scores and questions results
  *                                                                                 if successful
  * @returns {{ error: string }} - returns an error if unsuccessful
  */
function quizSessionFinalResults(playerId: number) {
  const session = findPlayerSession(playerId);
  if (!session) {
    return { error: 'PlayerId does not exist' };
  }

  if (session.state !== SessionState.FINAL_RESULTS) {
    return { error: 'Session is not in FINAL RESULTS state' };
  }

  const ranking = [];
  for (const player of session.players) {
    ranking.push({
      name: player.name,
      score: player.score
    });
  }
  ranking.sort((p1, p2) => p2.score - p1.score);

  const questionResults = [];
  let position = 1;
  for (const result of session.answers) {
    questionResults.push(adminQuizQuestionResult(result.playerId, position));
    position++;
  }

  const results = {
    usersRankedByScore: ranking,
    questionResults: questionResults
  };
  return results;
}

export {
  QuizListReturn,
  QuizCreateReturn,
  QuizInfoReturn,
  adminQuizList,
  adminQuizCreate,
  adminQuizRemove,
  adminQuizInfo,
  adminQuizNameUpdate,
  adminQuizDescriptionUpdate,
  adminQuizTransfer,
  adminQuizQuestionMove,
  adminViewTrash,
  adminRestoreTrash,
  adminEmptyTrash,
  adminQuizQuestionCreate,
  adminQuizQuestionUpdate,
  adminQuizQuestionDelete,
  adminSessionStart,
  adminViewSessions,
  adminUpdateSessionState,
  adminQuizQuestionDuplicate,
  quizThumbnailUpdate,
  playerJoin,
  playerJoinStatus,
  sessionStatus,
  adminQuizQuestionInformation,
  adminQuizQuestionAnswer,
  adminQuizQuestionResult,
  playerSendChat,
  playerChatView,
  quizFinalResults,
  quizResultsCSV,
  quizSessionFinalResults
};
