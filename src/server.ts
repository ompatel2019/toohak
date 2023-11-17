/*  server.ts */
import express, { json, Request, Response } from 'express';
import { echo } from './newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import HTTPError from 'http-errors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
// import { join } from 'path';
import process from 'process';
import { adminAuthRegister, adminAuthLogin, adminUserDetails, adminAuthLogout, adminUserUpdate, adminPasswordUpdate } from './auth';
import { adminQuizCreate, adminQuizRemove, adminQuizList, adminQuizInfo, adminQuizNameUpdate, adminQuizTransfer, adminQuizDescriptionUpdate, adminQuizQuestionCreate, adminQuizQuestionUpdate, adminQuizQuestionDelete, adminViewTrash, adminRestoreTrash, adminEmptyTrash, adminQuizQuestionMove, adminSessionStart, adminViewSessions, adminUpdateSessionState, adminQuizQuestionDuplicate, playerJoin, sessionStatus, adminQuizQuestionInformation, playerSendChat, playerChatView, quizThumbnailUpdate, playerJoinStatus, adminQuizQuestionAnswer, adminQuizQuestionResult, quizFinalResults, quizResultsCSV, quizSessionFinalResults } from './quiz';
import { getData, setData, AdminAction } from './dataStore';
import { generateUniqueId, clear } from './other';
import { isQuizOwner, isQuizOwnerQuery, validToken, validTokenQuery, validTokenv1, isQuizOwnerv1 } from './helper';

// import { encode } from 'punycode';
// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', sui.serve, sui.setup(YAML.parse(file)));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================

const INVALID_ID = -1;
let data = getData();
const jsonstr = fs.readFileSync('src/database.json');
data = JSON.parse(String(jsonstr));

// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

// adminAuthRegister Wrapper
app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  const register = adminAuthRegister(email, password, nameFirst, nameLast);

  if ('error' in register) {
    return res.status(400).json(register);
  }

  // Generating token for the user that is logging in
  const sessionId = generateUniqueId();
  const token = {
    authUserId: register.authUserId,
    sessionId: sessionId
  };

  data.tokens.push(token);
  fs.writeFileSync('src/database.json', JSON.stringify(data));

  const response = {
    token: encodeURIComponent(JSON.stringify(token)),
  };
  res.json(response);
});

// adminAuthLogin Wrapper
app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const login = adminAuthLogin(email, password);

  if ('error' in login) {
    return res.status(400).json(login);
  }

  // Generating token for the user that is logging in
  const sessionId = generateUniqueId();
  const token = {
    authUserId: login.authUserId,
    sessionId: sessionId
  };

  data.tokens.push(token);
  fs.writeFileSync('src/database.json', JSON.stringify(data));
  setData(data);
  const response = {
    token: encodeURIComponent(JSON.stringify(token)),
  };
  res.json(response);
});

// adminUserDetails
app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const token = req.query.token;
  const tokenIndex = data.tokens.findIndex(t => encodeURIComponent(JSON.stringify(t)) === token);

  if (token === '' || tokenIndex === INVALID_ID) {
    return res.status(401).json({ error: 'Token is empty or invalid' });
  }
  const userId = data.tokens[tokenIndex].authUserId;
  const response = adminUserDetails(userId);
  res.json(response);
});

// adminQuizCreate Wrapper
app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const { token, name, description } = req.body;

  const tokenIndex = data.tokens.findIndex(t => encodeURIComponent(JSON.stringify(t)) === token);
  if (token === '' || tokenIndex === INVALID_ID) {
    return res.status(401).json({ error: 'Token is empty or invalid' });
  }

  const userId = data.tokens[tokenIndex].authUserId;
  const response = adminQuizCreate(userId, name, description);
  if ('error' in response) {
    return res.status(400).json(response);
  }
  fs.writeFileSync('src/database.json', JSON.stringify(data));
  res.json(response);
});

// adminQuizRemove Wrapper
app.delete('/v1/admin/quiz/:quizId', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const quizid = parseInt(req.params.quizId);

  data = getData();

  if (!validTokenQuery(req, res)) {
    return;
  }

  isQuizOwnerQuery(req, res, quizid);

  const userId = data.tokens.find(t => encodeURIComponent(JSON.stringify(t)) === token).authUserId;
  const result = adminQuizRemove(userId, quizid);
  data = getData();
  fs.writeFileSync('src/database.json', JSON.stringify(data));
  res.json(result);
});

// wrapper for adminQuizList
app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const tokenString = decodeURIComponent(token);
  const tokenObject = JSON.parse(tokenString);

  const data = getData();
  let tokenFound = false;

  for (const token of data.tokens) {
    if (token.authUserId === tokenObject.authUserId) {
      tokenFound = true;
      break;
    }
  }

  if (!tokenFound) {
    return res.status(401).json({ error: 'Token is empty or not valid' });
  }

  const response = adminQuizList(tokenObject.authUserId);
  res.json(response); // Return the list of quizzes
});

// adminEmptyTrash
app.delete('/v1/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const quizIds = JSON.parse(req.query.quizIds as string);
  data = getData();

  const tokenIndex = data.tokens.findIndex(t => encodeURIComponent(JSON.stringify(t)) === token);
  const tokenId = data.tokens[tokenIndex];
  if (token === '' || tokenIndex === INVALID_ID) {
    return res.status(401).json({ error: 'Token is empty or invalid' });
  }

  const userId = tokenId.authUserId;
  const userIndex = data.users.findIndex(u => u.authUserId === userId);
  const user = data.users[userIndex];
  for (const currentId of quizIds) {
    if (user.quizId.findIndex(Id => Id === currentId) === INVALID_ID) {
      return res.status(403).json({ error: 'This user is not an owner of this quiz' });
    }
  }
  const response = adminEmptyTrash(userId, quizIds);
  if ('error' in response) {
    return res.status(400).json(response);
  }

  data = getData();
  fs.writeFileSync('src/database.json', JSON.stringify(data));
  res.json(response);
});

// adminRestoreTrash
app.post('/v1/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const token = req.body.token;
  const quizId = parseInt(req.params.quizid);
  data = getData();

  const tokenIndex = data.tokens.findIndex(t => encodeURIComponent(JSON.stringify(t)) === token);
  const tokenId = data.tokens[tokenIndex];
  if (token === '' || tokenIndex === INVALID_ID) {
    return res.status(401).json({ error: 'Token is empty or invalid' });
  }

  const userId = tokenId.authUserId;
  const userIndex = data.users.findIndex(u => u.authUserId === userId);
  const user = data.users[userIndex];
  if (!user.quizId.find(Id => Id === quizId)) {
    return res.status(403).json({ error: 'This user is not an owner of this quiz' });
  }

  const response = adminRestoreTrash(userId, quizId);
  if ('error' in response) {
    return res.status(400).json(response);
  }
  data = getData();
  fs.writeFileSync('src/database.json', JSON.stringify(data));
  res.json(response);
});

// adminViewTrash wrapper
app.get('/v1/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.query.token as string;
  data = getData();
  const tokenIndex = data.tokens.findIndex(t => encodeURIComponent(JSON.stringify(t)) === token);

  if (token === '' || tokenIndex === INVALID_ID) {
    return res.status(401).json({ error: 'Token is empty or invalid' });
  }
  const userId = data.tokens[tokenIndex].authUserId;
  const response = adminViewTrash(userId);
  res.json(response);
});

// adminQuizInfo
app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const token = req.query.token;
  const quizId = parseInt(req.params.quizid);
  const data = getData();

  const tokenIndex = data.tokens.findIndex(t => encodeURIComponent(JSON.stringify(t)) === token);
  if (token === '' || tokenIndex === INVALID_ID) {
    return res.status(401).json({ error: 'Token is empty or invalid' });
  }

  const quizIndex = data.quizzes.findIndex(q => q.quizId === quizId);
  const quizAdmin = data.quizzes[quizIndex].authUserId;
  const userId = data.tokens[tokenIndex].authUserId;
  if (quizAdmin !== userId) {
    return res.status(403).json({ error: 'User does not own this quiz' });
  }

  const result = adminQuizInfo(userId, quizId);
  res.json(result);
});

// Clear Wrapper
app.delete('/v1/clear', (req: Request, res: Response) => {
  const clearReturn = clear();
  data = getData();
  fs.writeFileSync('src/database.json', JSON.stringify(data));
  res.json(clearReturn);
});

// adminAuthLogoutv2 Wrapper
app.post('/v2/admin/auth/logout', (req: Request, res: Response) => {
  const token = req.headers.token as string;

  validToken(req, res);

  const response = adminAuthLogout(token);
  data = getData();
  fs.writeFileSync('src/database.json', JSON.stringify(data));
  res.json(response);
});

// adminAuthLogoutv1 Wrapper
app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const { token } = req.body;

  if (!validTokenv1(req, res)) {
    return;
  }
  const response = adminAuthLogout(token);
  data = getData();
  fs.writeFileSync('src/database.json', JSON.stringify(data));
  res.json(response);
});

// adminQuizNameUpdatev2 Wrapper
app.put('/v2/admin/quiz/:quizId/name', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const { name } = req.body;
  const quizId = parseInt(req.params.quizId);

  validToken(req, res);
  isQuizOwner(req, res, quizId);

  const userId = data.tokens.find(t => encodeURIComponent(JSON.stringify(t)) === token).authUserId;
  const response = adminQuizNameUpdate(userId, quizId, name);

  if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  fs.writeFileSync('src/database.json', JSON.stringify(data));
  res.json(response);
});

// adminQuizNameUpdatev1 Wrapper
app.put('/v1/admin/quiz/:quizId/name', (req: Request, res: Response) => {
  const { token, name } = req.body;
  const quizId = parseInt(req.params.quizId);

  if (!validTokenv1(req, res)) {
    return;
  }
  if (!isQuizOwnerv1(req, res, quizId)) {
    return;
  }

  const userId = data.tokens.find(t => encodeURIComponent(JSON.stringify(t)) === token).authUserId;
  const response = adminQuizNameUpdate(userId, quizId, name);

  if ('error' in response) {
    return res.status(400).json(response);
  }
  fs.writeFileSync('src/database.json', JSON.stringify(data));
  res.json(response);
});

// adminPasswordUpdatev2 Wrapper
app.put('/v2/admin/user/password', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const { oldPassword, newPassword } = req.body;

  validToken(req, res);

  const data = getData();
  const response = adminPasswordUpdate(token, { oldPassword, newPassword });

  if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  fs.writeFileSync('src/database.json', JSON.stringify(data));
  res.json(response);
});

// adminPasswordUpdatev1 Wrapper
app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const { token, oldPassword, newPassword } = req.body;

  if (!validTokenv1(req, res)) {
    return;
  }

  const data = getData();
  const response = adminPasswordUpdate(token, { oldPassword, newPassword });

  if ('error' in response) {
    return res.status(400).json(response);
  }
  fs.writeFileSync('src/database.json', JSON.stringify(data));
  res.json(response);
});

// adminQuizDescriptionUpdatev2 Wrapper
app.put('/v2/admin/quiz/:quizId/description', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const { description } = req.body;
  const quizId = parseInt(req.params.quizId);

  validToken(req, res);
  isQuizOwner(req, res, quizId);

  const userId = data.tokens.find(t => encodeURIComponent(JSON.stringify(t)) === token).authUserId;
  const response = adminQuizDescriptionUpdate(userId, quizId, description);

  if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  fs.writeFileSync('src/database.json', JSON.stringify(data));
  res.json(response);
});

// adminQuizDescriptionUpdatev1 Wrapper
app.put('/v1/admin/quiz/:quizId/description', (req: Request, res: Response) => {
  const { token, description } = req.body;
  const quizId = parseInt(req.params.quizId);

  if (!validTokenv1(req, res)) {
    return;
  }
  if (!isQuizOwnerv1(req, res, quizId)) {
    return;
  }

  const userId = data.tokens.find(t => encodeURIComponent(JSON.stringify(t)) === token).authUserId;
  const response = adminQuizDescriptionUpdate(userId, quizId, description);

  if ('error' in response) {
    return res.status(400).json(response);
  }
  fs.writeFileSync('src/database.json', JSON.stringify(data));
  res.json(response);
});

// adminUserDetailsv2 Wrapper
app.put('/v2/admin/user/details', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const { email, nameFirst, nameLast } = req.body;

  validToken(req, res);

  const data = getData();
  const response = adminUserUpdate(token, { email, nameFirst, nameLast });

  if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  fs.writeFileSync('src/database.json', JSON.stringify(data));
  res.json(response);
});

// adminUserDetailsv1 Wrapper
app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const { token, email, nameFirst, nameLast } = req.body;

  if (!validTokenv1(req, res)) {
    return;
  }
  const data = getData();
  const response = adminUserUpdate(token, { email, nameFirst, nameLast });

  if ('error' in response) {
    return res.status(400).json(response);
  }
  fs.writeFileSync('src/database.json', JSON.stringify(data));
  res.json(response);
});

// adminQuizTransferv2 Wrapper
app.post('/v2/admin/quiz/:quizId/transfer', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const { userEmail } = req.body;
  const quizId = parseInt(req.params.quizId);

  validToken(req, res);
  isQuizOwner(req, res, quizId);

  const response = adminQuizTransfer(token, userEmail, quizId);
  if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  fs.writeFileSync('src/database.json', JSON.stringify(data));
  res.json(response);
});

// adminQuizTransferv1 Wrapper
app.post('/v1/admin/quiz/:quizId/transfer', (req: Request, res: Response) => {
  const { token, userEmail } = req.body;
  const quizId = parseInt(req.params.quizId);

  if (!validTokenv1(req, res)) {
    return;
  }

  if (!isQuizOwnerv1(req, res, quizId)) {
    return;
  }

  const response = adminQuizTransfer(token, userEmail, quizId);
  if ('error' in response) {
    return res.status(400).json(response);
  }
  fs.writeFileSync('src/database.json', JSON.stringify(data));
  res.json(response);
});

// wrapper for quizQuestionCreatev2
app.post('/v2/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const questionBody = req.body;
  const quizId = req.params.quizid;

  // Validate token
  let data = getData();
  let tokenObject: { authUserId: number } | null = null;

  try {
    const tokenString = decodeURIComponent(token); // Decoding the token from the body directly
    tokenObject = JSON.parse(tokenString);
  } catch (error) {
    throw HTTPError(401, 'Token is empty or not valid');
  }

  const tokenExists = data.tokens.some(t => t.authUserId === tokenObject.authUserId);

  if (!tokenExists) {
    throw HTTPError(401, 'Token is empty or not valid');
  }

  // Convert string to number
  const quizIdNumber = parseInt(quizId, 10);

  // Find the quiz by its ID
  const targetQuiz = data.quizzes.find(quiz => quiz.quizId === quizIdNumber);

  // Valid token but not the owner
  if (!targetQuiz) {
    throw HTTPError(403, 'Token valid but user does not own the quiz');
  }

  data = getData();
  // Call function to create a question
  const response = adminQuizQuestionCreate(tokenObject.authUserId, quizIdNumber, questionBody);

  if ('error' in response) {
    throw HTTPError(400, `${response}`);
  }
  fs.writeFileSync('src/database.json', JSON.stringify(data));

  res.json(response);
});

// wrapper function for adminQuizQuestionDelete
app.delete('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const token = req.query.token;

  data = getData();
  const tokenIndex = data.tokens.findIndex(t => encodeURIComponent(JSON.stringify(t)) === token);
  if (!validTokenQuery(req, res)) {
    return;
  }

  const quizIndex = data.quizzes.findIndex(q => q.quizId === quizId);
  const quizAdmin = data.quizzes[quizIndex].authUserId;
  const userId = data.tokens[tokenIndex].authUserId;
  if (quizAdmin !== userId || quizIndex === INVALID_ID) {
    return res.status(403).json({ error: 'User does not own this quiz' });
  }

  const questionIndex = data.quizzes[quizIndex].questions.findIndex(question => question.questionId === questionId);
  if (questionIndex === INVALID_ID) {
    return res.status(400).json({ error: 'Question Id does not refer to a valid question within this quiz' });
  }

  const response = adminQuizQuestionDelete(quizId, questionId, userId);
  fs.writeFileSync('src/database.json', JSON.stringify(data));

  res.json(response);
});

// Wrapper for question Update
app.put('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const { token, questionBody } = req.body;
  const quizId = req.params.quizid;
  const questionId = parseInt(req.params.questionid);

  // Validate token
  let data = getData();
  let tokenObject: { authUserId: number } | null = null;
  try {
    const tokenString = decodeURIComponent(token); // Decoding the token from the body directly
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tokenObject = JSON.parse(tokenString);
  } catch (error) {
    return res.status(401).json({ error: 'Token is empty or not valid' });
  }

  // Convert string to number
  const quizIdNumber = parseInt(quizId, 10);
  // Find the quiz by its ID
  const targetQuiz = data.quizzes.find(quiz => quiz.quizId === quizIdNumber);
  // If the quiz doesn't exist, return an error
  if (!targetQuiz) {
    return res.status(403).json({ error: 'Token is valid but user does not own quiz' });
  }

  // Call function to create question
  const response = adminQuizQuestionUpdate(quizIdNumber, questionId, questionBody);
  data = getData();
  if ('error' in response) {
    return res.status(400).json(response);
  }
  fs.writeFileSync('src/database.json', JSON.stringify(data));
  res.json(response);
});

// wrapper function for adminQuizQuestionMove
app.put('/v1/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const { token, newPosition } = req.body;
  const quizId = req.params.quizid;
  const questionId = parseInt(req.params.questionid);

  // Validate token
  let data = getData();
  let tokenObject: { authUserId: number } | null = null;
  try {
    const tokenString = decodeURIComponent(token); // Decoding the token from the body directly
    tokenObject = JSON.parse(tokenString);
  } catch (error) {
    return res.status(401).json({ error: 'Token is empty or not valid' });
  }
  const tokenExists = data.tokens.some(t => t.authUserId === tokenObject.authUserId);
  if (!tokenExists) {
    return res.status(401).json({ error: 'Token is empty or not valid' });
  }
  // Convert string to number
  const quizIdNumber = parseInt(quizId, 10);
  const newPositionNumber = parseInt(newPosition, 10);
  // Find the quiz by its ID
  const targetQuiz = data.quizzes.find(quiz => quiz.quizId === quizIdNumber);
  // If the quiz doesn't exist, return an error
  if (!targetQuiz) {
    return res.status(403).json({ error: 'Token is valid but user does not own quiz' });
  }

  data = getData();
  // Call function to move question
  const response = adminQuizQuestionMove(quizIdNumber, questionId, tokenObject.authUserId, newPositionNumber);
  if ('error' in response) {
    return res.status(400).json(response); // Return 400 for all other errors
  }
  fs.writeFileSync('src/database.json', JSON.stringify(data));

  res.json(response);
});

app.post('/v1/admin/quiz/:quizid/question/:questionid/duplicate', (req: Request, res: Response) => {
  const { token } = req.body;
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);

  data = getData();
  const tokenIndex = data.tokens.findIndex(t => encodeURIComponent(JSON.stringify(t)) === token);
  if (token === '' || tokenIndex === INVALID_ID) {
    return res.status(401).json({ error: 'Token is empty or not valid' });
  }

  const userId = data.tokens[tokenIndex].authUserId;
  const quiz = data.quizzes.find(q => q.authUserId === userId && q.quizId === quizId);
  if (!quiz) {
    return res.status(403).json({ error: 'User does not own this quiz' });
  }

  const response = adminQuizQuestionDuplicate(quizId, questionId, userId);
  if ('error' in response) {
    return res.status(400).json({ error: 'Question Id does not refer to a valid question within this quiz' });
  }

  fs.writeFileSync('src/database.json', JSON.stringify(data));

  res.json(response);
});

// adminQuizQuestionInformation wrapper
app.get('/v1/player/:playerid/question/:questionposition', (req, res) => {
  const playerId = parseInt(req.params.playerid);
  const questionPosition = parseInt(req.params.questionposition);

  const response = adminQuizQuestionInformation(playerId, questionPosition);

  if ('error' in response) {
    throw HTTPError(400, `${response}`);
  } else {
    res.json(response);
  }
});

// adminQuizQuestionAnswer wrapper
app.put('/v1/player/:playerid/question/:questionposition/answer', (req, res) => {
  const playerId = parseInt(req.params.playerid);
  const questionPosition = parseInt(req.params.questionposition);
  const answerIds = req.body.answerIds; // Correctly extract answerIds from the request body

  const data = getData();
  const response = adminQuizQuestionAnswer(playerId, questionPosition, answerIds);

  if ('error' in response) {
    throw HTTPError(400, response.error);
  }

  fs.writeFileSync('src/database.json', JSON.stringify(data));
  res.json(response);
});

// adminQuizQuestionResult wrapper
app.get('/v1/player/:playerid/question/:questionposition/results', (req, res) => {
  const playerId = parseInt(req.params.playerid);
  const questionPosition = parseInt(req.params.questionposition);

  const response = adminQuizQuestionResult(playerId, questionPosition);

  if ('error' in response) {
    throw HTTPError(400, response.error);
  } else {
    res.json(response);
  }
});

// ====================================================================
//  =========================== V2 ROUTES ============================
// ====================================================================

app.get('/v2/admin/user/details', (req: Request, res: Response) => {
  const token = req.headers.token;
  const tokenIndex = data.tokens.findIndex(t => encodeURIComponent(JSON.stringify(t)) === token);

  if (token === '' || tokenIndex === INVALID_ID) {
    return res.status(401).json({ error: 'Token is empty or invalid' });
  }
  const userId = data.tokens[tokenIndex].authUserId;
  const response = adminUserDetails(userId);
  res.json(response);
});

app.get('/v2/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.headers.token as string;

  // Check if the token is provided
  if (!token) {
    throw HTTPError(401, 'Token is Empty');
  }

  const tokenString = decodeURIComponent(token);
  const tokenObject = JSON.parse(tokenString);

  const data = getData();
  let tokenFound = false;

  for (const token of data.tokens) {
    if (token.authUserId === tokenObject.authUserId) {
      tokenFound = true;
      break;
    }
  }

  if (!tokenFound) {
    throw HTTPError(401, 'Token is empty or invalid');
  }

  const response = adminQuizList(tokenObject.authUserId);
  res.json(response);
});

// adminQuizCreate V2 Wrapper
app.post('/v2/admin/quiz', (req: Request, res: Response) => {
  const token = req.headers.token;
  const { name, description } = req.body;

  const tokenIndex = data.tokens.findIndex(t => encodeURIComponent(JSON.stringify(t)) === token);
  if (token === '' || tokenIndex === INVALID_ID) {
    throw HTTPError(401, 'Token is empty or invalid');
  }

  const userId = data.tokens[tokenIndex].authUserId;
  const response = adminQuizCreate(userId, name, description);
  if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  fs.writeFileSync('src/database.json', JSON.stringify(data));
  res.json(response);
});

// adminEmptyTrash
app.delete('/v2/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizIds = JSON.parse(req.query.quizIds as string);
  data = getData();

  const tokenIndex = data.tokens.findIndex(t => encodeURIComponent(JSON.stringify(t)) === token);
  const tokenId = data.tokens[tokenIndex];
  if (token === '' || tokenIndex === INVALID_ID) {
    throw HTTPError(401, 'Token is empty or invalid');
  }

  const userId = tokenId.authUserId;
  const userIndex = data.users.findIndex(u => u.authUserId === userId);
  const user = data.users[userIndex];
  for (const currentId of quizIds) {
    if (user.quizId.findIndex(Id => Id === currentId) === INVALID_ID) {
      throw HTTPError(403, 'This user is not an owner of the quiz');
    }
  }
  const response = adminEmptyTrash(userId, quizIds);
  if ('error' in response) {
    throw HTTPError(400, response.error);
  }

  data = getData();
  fs.writeFileSync('src/database.json', JSON.stringify(data));
  res.json(response);
});

// adminRestoreTrashV2
app.post('/v2/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const token = req.headers.token;
  const quizId = parseInt(req.params.quizid);
  data = getData();

  const tokenIndex = data.tokens.findIndex(t => encodeURIComponent(JSON.stringify(t)) === token);
  const tokenId = data.tokens[tokenIndex];
  if (token === '' || tokenIndex === INVALID_ID) {
    throw HTTPError(401, 'Token is empty or invalid');
  }

  const userId = tokenId.authUserId;
  const userIndex = data.users.findIndex(u => u.authUserId === userId);
  const user = data.users[userIndex];
  if (!user.quizId.find(Id => Id === quizId)) {
    throw HTTPError(403, 'This user is not an owner of the quiz');
  }

  const response = adminRestoreTrash(userId, quizId);
  if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  data = getData();
  fs.writeFileSync('src/database.json', JSON.stringify(data));
  res.json(response);
});

// adminViewTrash wrapper
app.get('/v2/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  data = getData();
  const tokenIndex = data.tokens.findIndex(t => encodeURIComponent(JSON.stringify(t)) === token);

  if (token === '' || tokenIndex === INVALID_ID) {
    throw HTTPError(401, 'Token is empty or invalid');
  }
  const userId = data.tokens[tokenIndex].authUserId;
  const response = adminViewTrash(userId);
  res.json(response);
});

// Wrapper for question Update
app.put('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const { questionBody } = req.body;
  const quizId = req.params.quizid;
  const questionId = parseInt(req.params.questionid);

  // Validate token
  let data = getData();
  let tokenObject: { authUserId: number } | null = null;
  try {
    const tokenString = decodeURIComponent(token); // Decoding the token from the body directly
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tokenObject = JSON.parse(tokenString);
  } catch (error) {
    throw HTTPError(401, 'Token is empty or invalid');
  }

  // Convert string to number
  const quizIdNumber = parseInt(quizId, 10);
  // Find the quiz by its ID
  const targetQuiz = data.quizzes.find(quiz => quiz.quizId === quizIdNumber);
  // If the quiz doesn't exist, return an error
  if (!targetQuiz) {
    throw HTTPError(403, 'This user is not an owner of the quiz');
  }

  // Call function to create question
  const response = adminQuizQuestionUpdate(quizIdNumber, questionId, questionBody);
  data = getData();
  if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  fs.writeFileSync('src/database.json', JSON.stringify(data));
  res.json(response);
});

// quizThumbnailUpdate Wrapper
app.put('/v1/admin/quiz/:quizid/thumbnail', (req: Request, res: Response) => {
  const { token } = req.body;
  const quizId = parseInt(req.params.quizid);
  const thumbnailBody = req.body;

  data = getData();
  const tokenIndex = data.tokens.findIndex(t => encodeURIComponent(JSON.stringify(t)) === token);
  if (token === '' || tokenIndex === INVALID_ID) {
    throw HTTPError(401, 'Token is empty or not valid');
  }

  const userId = data.tokens[tokenIndex].authUserId;
  const quiz = data.quizzes.find(q => q.authUserId === userId && q.quizId === quizId);
  if (!quiz) {
    throw HTTPError(403, 'User does not own this quiz');
  }

  const response = quizThumbnailUpdate(quizId, thumbnailBody);
  if ('error' in response) {
    throw HTTPError(400, response.error);
  }

  fs.writeFileSync('src/database.json', JSON.stringify(data));
  res.json(response);
});

// adminSessionStart Wrapper
app.post('/v1/admin/quiz/:quizid/session/start', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);
  const { autoStartNum } = req.body;

  validToken(req, res);
  isQuizOwner(req, res, quizId);

  try {
    const response = adminSessionStart(quizId, token, autoStartNum);

    if ('error' in response) {
      throw HTTPError(400, response.error);
    }
    data = getData();
    fs.writeFileSync('src/database.json', JSON.stringify(data));
    res.json(response);
  } catch (err) {
    throw HTTPError(400, err.message);
  }
});

// adminViewSessions Wrapper
app.get('/v1/admin/quiz/:quizid/sessions', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);

  validToken(req, res);
  isQuizOwner(req, res, quizId);

  const response = adminViewSessions(quizId, token);
  res.json(response);
});

// adminUpdateSessionState Wrapper
app.put('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);
  const sesisonId = parseInt(req.params.sessionid);
  const action = req.body.action as AdminAction;

  validToken(req, res);
  isQuizOwner(req, res, quizId);

  try {
    const response = adminUpdateSessionState(quizId, sesisonId, token, action);
    if ('error' in response) {
      throw HTTPError(400, response.error);
    }
    data = getData();
    fs.writeFileSync('src/database.json', JSON.stringify(data));
    res.json(response);
  } catch (err) {
    throw HTTPError(400, err.message);
  }
});

// playerJoin wrapper
app.post('/v1/player/join', (req: Request, res: Response) => {
  const joinBody = req.body;
  const response = (playerJoin(joinBody));
  if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  data = getData();
  fs.writeFileSync('src/database.json', JSON.stringify(data));
  res.json(response);
});

// playerJoinStatus wrapper function
app.get('/v1/player/:playerid', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const response = playerJoinStatus(playerId);

  if ('error' in response) {
    throw HTTPError(400, response.error);
  }

  fs.writeFileSync('src/database.json', JSON.stringify(data));
  res.json(response);
});

app.get('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const sessionId = parseInt(req.params.sessionid);
  const quizId = parseInt(req.params.quizid);

  validToken(req, res);
  isQuizOwner(req, res, quizId);

  const response = sessionStatus(quizId, sessionId);
  if ('error' in response) {
    throw HTTPError(400, response.error);
  }

  res.json(response);
});

// wrapper function for adminQuizQuestionMovev2
app.put('/v2/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const newPosition = req.body;
  const quizId = req.params.quizid;
  const questionId = parseInt(req.params.questionid);

  // Validate token
  let data = getData();
  let tokenObject: { authUserId: number } | null = null;
  try {
    const tokenString = decodeURIComponent(token); // Decoding the token from the body directly
    tokenObject = JSON.parse(tokenString);
  } catch (error) {
    throw HTTPError(401, 'Token is empty or not valid');
  }
  const tokenExists = data.tokens.some(t => t.authUserId === tokenObject.authUserId);
  if (!tokenExists) {
    throw HTTPError(401, 'Token is empty or not valid');
  }
  // Convert string to number
  const quizIdNumber = parseInt(quizId, 10);
  const newPositionNumber = parseInt(newPosition, 10);
  // Find the quiz by its ID
  const targetQuiz = data.quizzes.find(quiz => quiz.quizId === quizIdNumber);
  // If the quiz doesn't exist, return an error
  if (!targetQuiz) {
    throw HTTPError(403, 'Token is valid but user does not own quiz');
  }

  data = getData();
  // Call function to move question
  const response = adminQuizQuestionMove(quizIdNumber, questionId, tokenObject.authUserId, newPositionNumber);
  if ('error' in response) {
    throw HTTPError(400, `${response}`);
  }
  fs.writeFileSync('src/database.json', JSON.stringify(data));

  res.json(response);
});

// (v2) wrapper function for adminQuizQuestionDelete
app.delete('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const token = req.headers.token;

  data = getData();
  const tokenIndex = data.tokens.findIndex(t => encodeURIComponent(JSON.stringify(t)) === token);

  validToken(req, res);

  const quizIndex = data.quizzes.findIndex(q => q.quizId === quizId);
  const quizAdmin = data.quizzes[quizIndex].authUserId;
  const userId = data.tokens[tokenIndex].authUserId;
  if (quizAdmin !== userId || quizIndex === INVALID_ID) {
    throw HTTPError(403, 'User does not own this quiz');
  }

  const questionIndex = data.quizzes[quizIndex].questions.findIndex(question => question.questionId === questionId);
  if (questionIndex === INVALID_ID) {
    throw HTTPError(400, 'Question Id does not refer to a valid question within this quiz');
  }

  const response = adminQuizQuestionDelete(quizId, questionId, userId);
  fs.writeFileSync('src/database.json', JSON.stringify(data));

  res.json(response);
});

// (v2) wrapper function for adminQuizQuestionDuplicate
app.post('/v2/admin/quiz/:quizid/question/:questionid/duplicate', (req: Request, res: Response) => {
  const { token } = req.body;
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);

  data = getData();
  const tokenIndex = data.tokens.findIndex(t => encodeURIComponent(JSON.stringify(t)) === token);
  if (token === '' || tokenIndex === INVALID_ID) {
    throw HTTPError(401, 'Token is empty or not valid');
  }

  const userId = data.tokens[tokenIndex].authUserId;
  const quiz = data.quizzes.find(q => q.authUserId === userId && q.quizId === quizId);
  if (!quiz) {
    throw HTTPError(403, 'User does not own this quiz');
  }

  const response = adminQuizQuestionDuplicate(quizId, questionId, userId);
  if ('error' in response) {
    throw HTTPError(400, 'Question Id does not refer to a valid question within this quiz');
  }

  fs.writeFileSync('src/database.json', JSON.stringify(data));
  res.json(response);
});

// Wrapper for playerSendChat
app.post('/v1/player/:playerid/chat', (req: Request, res: Response) => {
  const { message = {} } = req.body;
  const { messageBody } = message || {};
  const playerId = parseInt(req.params.playerid);

  const response = playerSendChat(playerId, {
    message:
    {
      messageBody,
      playerId,
      playerName: '',
      timeSent: Math.floor(Date.now() / 1000)
    }
  });

  if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  fs.writeFileSync('src/database.json', JSON.stringify(data));
  res.json(response);
});

// Wrapper for playerChatView
app.get('/v1/player/:playerid/chat', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);

  const response = playerChatView(playerId);

  if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  fs.writeFileSync('src/database.json', JSON.stringify(data));
  res.json(response);
});

// Wrapper for quizFinalResults
app.get('/v1/admin/quiz/:quizid/session/:sessionid/results', (req: Request, res: Response) => {
  const sessionId = parseInt(req.params.sessionid);
  const quizId = parseInt(req.params.quizid);
  validToken(req, res);
  isQuizOwner(req, res, quizId);
  const response = quizFinalResults(quizId, sessionId);
  if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  res.json(response);
});

// Wrapper for quizResultsCSV
app.get('/v1/admin/quiz/:quizid/session/:sessionid/results/csv', (req: Request, res: Response) => {
  const sessionId = parseInt(req.params.sessionid);
  const quizId = parseInt(req.params.quizid);
  validToken(req, res);
  isQuizOwner(req, res, quizId);
  const response = quizResultsCSV(quizId, sessionId);
  if ('error' in response) {
    throw HTTPError(400, response.error);
  }

  res.json(response);
});

// Wrapper for quizSessionFinalResults
app.get('/v1/player/:playerid/results', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const response = quizSessionFinalResults(playerId);

  if ('error' in response) {
    throw HTTPError(400, response.error);
  }
  fs.writeFileSync('src/database.json', JSON.stringify(data));
  res.json(response);
});

// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================

// For handling errors
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
