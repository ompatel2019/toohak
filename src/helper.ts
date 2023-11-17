import crypto from 'crypto';
import { Request, Response } from 'express';
import { getData, SessionState, AdminAction } from './dataStore';
import validator from 'validator';
import HTTPError from 'http-errors';

const INVALID_ID = -1;
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 20;
const MIN_PASSWORD_LENGTH = 8;
const MS_PER_SEC = 1000;
const COUNTDOWN = 3000;

/**
  * Checks if the provided token is valid and exists within the database, false
  * is returned if invalid
  *
  * @param {Request} req - The http request
  * @param {Response} res - The response from the http route
  *
  * @returns {boolean} - Returns a boolean value
*/
function validToken(req: Request, res: Response): boolean {
  const token = req.headers.token as string;
  const data = getData();
  const tokenIndex = data.tokens.findIndex(t => encodeURIComponent(JSON.stringify(t)) === token);

  if (token === '' || tokenIndex === INVALID_ID) {
    throw HTTPError(401, 'Token is empty or invalid');
  }
  return true;
}

function validTokenv1(req: Request, res: Response): boolean {
  const token = req.body.token;
  const data = getData();
  const tokenIndex = data.tokens.findIndex(t => encodeURIComponent(JSON.stringify(t)) === token);

  if (token === '' || tokenIndex === INVALID_ID) {
    res.status(401).json({ error: 'Token is empty or invalid' });
    return false;
  }
  return true;
}

/**
  * Checks if the provided token is valid and exists within the database
  * (for query based requests)
  *
  * @param {Request} req - The http request
  * @param {Response} res - The response from the http route
  *
  * @returns {boolean} - Returns a boolean value
*/
function validTokenQuery(req: Request, res: Response): boolean {
  const token = req.query.token;
  const data = getData();
  const tokenIndex = data.tokens.findIndex(t => encodeURIComponent(JSON.stringify(t)) === token);

  if (!token || tokenIndex === INVALID_ID || token === undefined) {
    res.status(401).json({ error: 'Token is empty or invalid' });
    return false;
  }
  return true;
}

/**
  * Checks if the user owns the quiz, if not a false boolean value is returned
  *
  * @param {Request} req - The http request
  * @param {Response} res - The response from the http route
  * @param {number} quizId - The quizId of a given quiz
  *
  * @returns {boolean} - Returns a boolean value
*/
function isQuizOwner(req: Request, res: Response, quizId: number): boolean {
  const token = req.headers.token as string;
  const data = getData();
  const userToken = data.tokens.find(t => encodeURIComponent(JSON.stringify(t)) === token);

  const validQuiz = data.quizzes.find(q => q.quizId === quizId);
  if (!validQuiz) {
    throw HTTPError(404, 'Invalid quizId');
  }

  if (validQuiz.authUserId !== userToken.authUserId) {
    throw HTTPError(403, 'Valid token is provided, but user is not an owner of this quiz');
  }
  return true;
}

function isQuizOwnerv1(req: Request, res: Response, quizId: number): boolean {
  const token = req.body.token;
  const data = getData();
  const userToken = data.tokens.find(t => encodeURIComponent(JSON.stringify(t)) === token);

  const validQuiz = data.quizzes.find(q => q.quizId === quizId);
  if (!validQuiz) {
    res.status(404).json({ error: 'Invalid quizId' });
    return false;
  }

  if (validQuiz.authUserId !== userToken.authUserId) {
    res.status(403).json({ error: 'Valid token is provided, but user is not an owner of this quiz' });
    return false;
  }
  return true;
}

/**
  * Checks if the given email address is valid or not, returns false if invalid
  *
  * @param {string} name - The name of an email address
  *
  * @returns {boolean} - Returns a boolean value
*/
function validName(name: string): boolean {
  const regex = /^[a-zA-Z\s-']+$/;
  return validator.matches(name, regex);
}

/**
  * Checks if the given name is less than 2 characters or if it is greater than
  * 20 characters, if it is either a false
  * boolean is returned
  *
  * @param {string} name - The name of a quiz
  *
  * @returns {boolean} - Returns a boolean value
*/
function validNameLength(name: string): boolean {
  return name.length >= MIN_NAME_LENGTH && name.length <= MAX_NAME_LENGTH;
}

/**
  * Checks if the user owns the quiz, if not a false boolean value is returned
  * (for query based requests)
  * @param {Request} req - The http request
  * @param {Response} res - The response from the http route
  * @param {number} quizId - The quizId of a given quiz
  *
  * @returns {boolean} - Returns a boolean value
*/
function isQuizOwnerQuery(req: Request, res: Response, quizId: number): boolean {
  const data = getData();

  const validQuiz = data.quizzes.find(q => q.quizId === quizId);
  if (!validQuiz) {
    throw HTTPError(403, 'Invalid quizId');
  }
  return true;
}

/**
  * Checks if the given password is greater than 8 characters
  *
  * @param {string} password - The name of a password
  *
  * @returns {boolean} - Returns a boolean value
*/
function validPasswordLength(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH;
}

/**
  * Checks if the given password contains alphanumeric characters and specific
  * characters
  *
  * @param {string} password - The name of a password
  *
  * @returns {boolean} - Returns a boolean value
*/
function validPassword(password: string): boolean {
  const regex = /^(?=.*[A-Za-z])(?=.*\d).+$/;
  return validator.matches(password, regex);
}
/**
  * Allows the request to be parsed as a JSON object
  *
  * @param {string | buffer} body - The body of a http request
  *
  * @returns {object} - Returns a JSON object
*/
const parseBody = (body: string | Buffer) => {
  if (Buffer.isBuffer(body)) {
    return JSON.parse(body.toString());
  }
  return JSON.parse(body);
};

function validAdminAction(action: AdminAction, sessionState: SessionState): boolean {
  switch (sessionState) {
    case SessionState.LOBBY:
      return action === AdminAction.END || action === AdminAction.NEXT_QUESTION;
    case SessionState.QUESTION_COUNTDOWN:
      return action === AdminAction.END || action === AdminAction.SKIP_COUNTDOWN;
    case SessionState.QUESTION_OPEN:
      return action === AdminAction.END || action === AdminAction.GO_TO_ANSWER;
    case SessionState.QUESTION_CLOSE:
      return action === AdminAction.END || action === AdminAction.GO_TO_FINAL_RESULTS || action === AdminAction.GO_TO_ANSWER || action === AdminAction.NEXT_QUESTION;
    case SessionState.ANSWER_SHOW:
      return action === AdminAction.GO_TO_FINAL_RESULTS || action === AdminAction.NEXT_QUESTION || action === AdminAction.END;
    case SessionState.FINAL_RESULTS:
      return action === AdminAction.END;
    case SessionState.END:
      return false;
    default:
      return false;
  }
}

function updateSessionState(sessionId: number, action: AdminAction): SessionState {
  const data = getData();
  const session = data.sessions.find(s => s.sessionId === sessionId);

  if (data.sessionTimers[sessionId]) {
    clearTimeout(data.sessionTimers[sessionId]);
    delete data.sessionTimers[sessionId];
  }

  switch (action) {
    case AdminAction.END:
      session.state = SessionState.END;
      break;
    case AdminAction.GO_TO_ANSWER:
      session.state = SessionState.ANSWER_SHOW;
      break;
    case AdminAction.SKIP_COUNTDOWN: {
      session.state = SessionState.QUESTION_OPEN;
      const quiz = data.quizzes.find(q => q.quizId === session.quizId);
      const currentQuestion = quiz.questions[session.atQuestion];
      const questionDuration = currentQuestion.duration;
      data.sessionTimers[sessionId] = setTimeout(() => {
        session.state = SessionState.QUESTION_CLOSE;
        delete data.sessionTimers[sessionId];
      }, questionDuration * MS_PER_SEC);
      break;
    }
    case AdminAction.GO_TO_FINAL_RESULTS:
      session.state = SessionState.FINAL_RESULTS;
      break;
    case AdminAction.NEXT_QUESTION:
      session.state = SessionState.QUESTION_COUNTDOWN;
      data.sessionTimers[sessionId] = setTimeout(() => {
        session.state = SessionState.QUESTION_OPEN;
        delete data.sessionTimers[sessionId];
      }, COUNTDOWN);
      break;
    default:
      break;
  }
  return session.state;
}

/**
 * findPlayerSession - Finds the session containing a player with the specified playerId.
 *
 * @param {number} playerId - The unique identifier of the player to find within a session.
 *
 * @returns {object | undefined} - The session object containing the player, or undefined if not found.
 */

function findPlayerSession(playerId: number) {
  const data = getData();
  return data.sessions.find((session) => session.players.some((player) => player.playerId === playerId));
}

/**
 * validMessage - Checks if a message meets the valid length.
 *
 * @param {string} message - The message to be validated.
 *
 * @returns {boolean} - Returns true if the message is valid, false otherwise.
 */
function validMessage(message: string): boolean {
  return (message.length >= 1 && message.length <= 100);
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export {
  validToken,
  validTokenv1,
  validTokenQuery,
  isQuizOwner,
  isQuizOwnerv1,
  isQuizOwnerQuery,
  validName,
  validNameLength,
  validPassword,
  validPasswordLength,
  parseBody,
  validAdminAction,
  updateSessionState,
  findPlayerSession,
  validMessage,
  hashPassword
};
