// Do not delete this file
import request from 'sync-request-curl';
import config from './config.json';
import { requestRegister } from './auth.server.test';
import { requestClear } from './other.server.test';
import { parseBody } from './helper';
import { AdminAction, SessionState } from './dataStore';

const sleep = require('atomic-sleep');
const MS_PER_SEC = 1000;

const OK = 200;
const INPUT_ERROR = 400;
const port = config.port;
const url = config.url;

const validEmail = 'test@example.com';
const validPassword = 'testPassword1';
const validNameFirst = 'John';
const validNameLast = 'Doe';

const validEmail1 = 'test1@example.com';
const validPassword1 = 'testPassword2';
const validNameFirst1 = 'Jane';
const validNameLast1 = 'Smith';

const fakeEmail = 'notRealUser@gmail.com';

const quizName = 'toohak quiz';
const quizDescription = 'A new toohak quiz';
const longDescription = 'This description has at least one hundred characters in it and is too long for toohak, therefore there is an error';
const ERROR = { error: expect.any(String) };

const MAX_SESSIONS = 10;

function requestQuizCreate(token: string, name: string, description: string) {
  const res = request(
    'POST',
        `${url}:${port}/v1/admin/quiz`,
        {
          json: {
            token: token,
            name: name,
            description: description,
          }
        }
  );

  return JSON.parse(res.body.toString());
}

function requestQuizRemove(token: string, quizId: number) {
  const res = request(
    'DELETE',
    `${url}:${port}/v1/admin/quiz/${quizId}`,
    {
      qs: {
        token: token
      }
    }
  );
  return JSON.parse(res.body.toString());
}

function requestQuizInfo(token: string, quizId: number) {
  const res = request(
    'GET',
      `${url}:${port}/v1/admin/quiz/${quizId}`,
      {
        qs: {
          token: token,
        },
      }
  );
  return res;
}

function requestQuizList(token: string) {
  const fullUrl = `${url}:${port}/v1/admin/quiz/list?token=${token}`;
  const res = request('GET', fullUrl);
  return res;
}

function requestQuizListv2(token: string) {
  const res = request(
    'GET',
        `${url}:${port}/v2/admin/quiz/list`,
        {
          headers: {
            token,
          }
        }
  );

  return res;
}

function requestNameUpdate(token: string, quizId: number, name: string) {
  const res = request(
    'PUT',
    `${url}:${port}/v1/admin/quiz/${quizId}/name`,
    {
      json: {
        token: token,
        name: name
      }
    }
  );
  return JSON.parse(res.body.toString());
}

function requestNameUpdatev2(token: string, quizId: number, name: string) {
  const res = request(
    'PUT',
    `${url}:${port}/v2/admin/quiz/${quizId}/name`,
    {
      headers: {
        token: token
      },
      json: {
        name: name
      }
    }
  );
  return JSON.parse(res.body.toString());
}

function requestDescriptionUpdate(token: string, quizId: number, description: string) {
  const res = request(
    'PUT',
    `${url}:${port}/v1/admin/quiz/${quizId}/description`,
    {
      json: {
        token: token,
        description: description
      }
    }
  );
  return JSON.parse(res.body.toString());
}

function requestDescriptionUpdatev2(token: string, quizId: number, description: string) {
  const res = request(
    'PUT',
    `${url}:${port}/v2/admin/quiz/${quizId}/description`,
    {
      headers: {
        token: token
      },
      json: {
        description: description
      }
    }
  );
  return JSON.parse(res.body.toString());
}

function requestSessionStart(quizId: number, token: string, autoStartNum: number) {
  const res = request(
    'POST',
      `${url}:${port}/v1/admin/quiz/${quizId}/session/start`,
      {
        headers: {
          token: token
        },
        json: {
          autoStartNum: autoStartNum
        },
      }
  );
  return JSON.parse(res.body.toString());
}

function requestPlayerAdd(sessionId: number, name: string) {
  const res = request(
    'POST',
    `${url}:${port}/v1/player/join`,
    {
      json: {
        sessionId: sessionId,
        name: name
      },
      timeout: 100
    }
  );
  return res;
}

function requestPlayerJoinStatus(playerid: number) {
  const res = request(
    'GET',
    `${url}:${port}/v1/player/${playerid}`,
    {
      json: {

      },
    }
  );
  return res;
}

function requestSessionStatus(quizId: number, sessionId: number, token: string) {
  const res = request(
    'GET',
        `${url}:${port}/v1/admin/quiz/${quizId}/session/${sessionId}`,
        {
          headers: {
            token,
          }
        }
  );
  return res;
}

function requestUpdateState(quizId: number, sessionId: number, token: string, action: AdminAction) {
  const res = request(
    'PUT',
      `${url}:${port}/v1/admin/quiz/${quizId}/session/${sessionId}`,
      {
        headers: {
          token: token
        },
        json: {
          action: action
        },
      }
  );
  return JSON.parse(res.body.toString());
}

function requestPlayerSendChat(playerId: number, chatMessage: ChatMessage) {
  const res = request(
    'POST',
    `${url}:${port}/v1/player/${playerId}/chat`,
    {
      json: {
        message: chatMessage.message,
      },
      timeout: 100
    }
  );
  return res;
}

function requestPlayerChatView(playerId: number) {
  const res = request(
    'GET',
    `${url}:${port}/v1/player/${playerId}/chat`,
    {
      json: {
        playerId: playerId
      },
      timeout: 100
    }
  );
  return res;
}

function requestSessionUpdate(quizId: number, sessionId: number, token: string, action: string) {
  const res = request(
    'PUT',
      `${url}:${port}/v1/admin/quiz/${quizId}/session/${sessionId}`,
      {
        headers: {
          token: token
        },
        json: {
          action: action
        },
        timeout: 100
      }
  );
  return res;
}

function requestFinalResult(quizId: number, sessionId: number, token: string) {
  const res = request(
    'GET',
        `${url}:${port}/v1/admin/quiz/${quizId}/session/${sessionId}/results`,
        {
          headers: {
            token,
          }
        }
  );
  return res;
}

function requestSessionFinalResult(playerId: number) {
  const res = request(
    'GET',
        `${url}:${port}/v1/player/${playerId}/results`,
        {
          json: {
            playerId: playerId
          },
          timeout: 100
        }
  );
  return res;
}

interface Answer {
  answer: string,
  correct: boolean
}

interface QuestionBody {
  question: string,
  duration: number,
  points: number,
  answers: Answer[],
  thumbnailUrl: string
}

interface QuestionBodyV2 {
  question: string,
  duration: number,
  points: number,
  answers: Answer[],
  thumbnailUrl: string
}

interface ChatMessage {
  message: {
    messageBody: string;
  };
}

const questionBody: QuestionBody = {
  question: 'What is the capital of France?',
  duration: 1,
  points: 5,
  answers: [
    { answer: 'Berlin', correct: false },
    { answer: 'Madrid', correct: false },
    { answer: 'Paris', correct: true },
    { answer: 'Rome', correct: false }
  ],
  thumbnailUrl: 'http://google.com/some/image/path.jpg'
};

const questionBody2: QuestionBody = {
  question: 'Who wrote "Hamlet"?',
  duration: 15,
  points: 10,
  answers: [
    { answer: 'William Shakespeare', correct: true },
    { answer: 'Charles Dickens', correct: false },
    { answer: 'Jane Austen', correct: false },
    { answer: 'Mark Twain', correct: false }
  ],
  thumbnailUrl: 'http://google.com/some/other/image/path.jpg'
};

const questionBody3: QuestionBody = {
  question: 'Which planet is known as the Red Planet?',
  duration: 12,
  points: 8,
  answers: [
    { answer: 'Jupiter', correct: false },
    { answer: 'Mars', correct: true },
    { answer: 'Venus', correct: false },
    { answer: 'Saturn', correct: false }
  ],
  thumbnailUrl: 'http://google.com/different/image/path.jpg'
};

const questionBodyNew: QuestionBody = {
  question: 'Who are you?',
  duration: 10,
  points: 5,
  answers: [
    { answer: 'Me', correct: false },
    { answer: 'You', correct: true }
  ],
  thumbnailUrl: 'http://google.com/some/image/path.jpg'
};

function requestQuizQuestionCreate(token: string, questionBody: QuestionBody, quizid: number) {
  const res = request(
    'POST',
    `${url}:${port}/v2/admin/quiz/${quizid}/question`,
    {
      json: questionBody, // Directly pass questionBody here
      headers: {
        token,
      },
    }
  );

  return res;
}

interface QuestionMoveBody {
  token: string
  newPosition: number
}

function requestQuizQuestionMove(quizid: number, questionid: number, questionMoveBody: QuestionMoveBody) {
  const res = request(
    'PUT',
    `${url}:${port}/v1/admin/quiz/${quizid}/question/${questionid}/move`,
    {
      json: questionMoveBody
    }
  );

  return res;
}

function requestQuizQuestionDuplicate(quizid: number, questionid: number, token: string) {
  const res = request(
    'POST',
    `${url}:${port}/v1/admin/quiz/${quizid}/question/${questionid}/duplicate`,
    {
      json: { token }
    }
  );
  return res;
}

function requestQuizQuestionDuplicateV2(quizid: number, questionid: number, token: string) {
  const res = request(
    'POST',
    `${url}:${port}/v2/admin/quiz/${quizid}/question/${questionid}/duplicate`,
    {
      json: { token }
    }
  );
  return res;
}

function requestQuizThumbnailUpdate(token: string, quizid: number, thumbnail: string) {
  const res = request(
    'PUT',
    `${url}:${port}/v1/admin/quiz/${quizid}/thumbnail`,
    {
      json: {
        token,
        imgUrl: thumbnail,
      },
    }
  );
  return res;
}

// Tests for creating a quiz

describe('adminQuizCreate tests', () => {
  let userId: string;
  beforeEach(() => {
    requestClear();
    const user = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    userId = user.token;
  });

  test.each([
    ['', quizName, quizDescription],
    ['-1', quizName, quizDescription]
  ])("error: invalid user Id ('$userId', '$name', '$description')",
    (authUserId, name, description) => {
      expect(requestQuizCreate(authUserId, name, description)).toEqual(ERROR);
    });

  test.each([
    [userId, '!@#$%^&*', quizDescription],
    [userId, 'quiz-name', quizDescription],
    [userId, 'quiz (new_2023)', quizDescription]
  ])("error: quiz name contains symbols ('$userId', '$name', '$description')",
    (authUserId, name, description) => {
      authUserId = userId;
      expect(requestQuizCreate(authUserId, name, description)).toEqual(ERROR);
    });

  test.each([
    [userId, '', quizDescription],
    [userId, 'MQ', quizDescription],
    [userId, 'This name is over 30 characters long', quizDescription]
  ])("error: quiz name is not 3 - 30 characters long ('$userId', '$name', '$description')",
    (authUserId, name, description) => {
      authUserId = userId;
      expect(requestQuizCreate(authUserId, name, description)).toEqual(ERROR);
    });

  test('error: quiz name is already in use', () => {
    requestQuizCreate(userId, quizName, quizDescription);
    expect(requestQuizCreate(userId, quizName, quizDescription)).toEqual(ERROR);
  });

  test('error: quiz description has more than 100 characters', () => {
    expect(requestQuizCreate(userId, quizName, longDescription)).toEqual(ERROR);
  });

  test('Valid test', () => {
    expect(requestQuizCreate(userId, quizName, quizDescription)).toEqual({ quizId: expect.any(Number) });
  });
});

// Tests for removing quiz
describe('adminQuizRemove tests', () => {
  let user1Id: string;
  let quiz1Id: number;

  beforeEach(() => {
    requestClear();
    const user1 = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    user1Id = user1.token;
    const quiz1 = requestQuizCreate(user1.token, 'Quiz1', 'Description1');
    quiz1Id = quiz1.quizId;
  });

  test('Successfully removed quiz', () => {
    expect(requestQuizRemove(user1Id, quiz1Id)).toEqual({});
  });

  test('Invalid quizId', () => {
    expect(requestQuizRemove(user1Id, -1)).toStrictEqual(ERROR);
  });

  test.each([
    ['', quiz1Id, 'validName'],
    ['-1', quiz1Id, 'validName']
  ])('Invalid token',
    (authUserId, quizId) => {
      expect(requestQuizRemove(authUserId, quizId)).toEqual(ERROR);
    });
});

// Tests for receiving information about a particular quiz
describe('adminQuizInfo tests', () => {
  let user1Id: string;
  let user2Id: string;
  let quiz1Id: number;
  let quiz2Id: number;

  beforeEach(() => {
    requestClear();
    const user1 = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    const user2 = requestRegister(validEmail1, validPassword1, validNameFirst1, validNameLast1);
    user1Id = user1.token;
    user2Id = user2.token;
    const quiz1 = requestQuizCreate(user1Id, 'Quiz1', 'Description1');
    const quiz2 = requestQuizCreate(user2Id, 'Quiz2', 'Description2');
    quiz1Id = quiz1.quizId;
    quiz2Id = quiz2.quizId;
  });

  // Tests for invalid authUserId and/or quizId
  test.each([
    ['-1', quiz1Id],
    [user1Id, -1],
    ['-1', -1],
    ['', quiz1Id],
  ])('Invalid authUserId and/or QuizId inputs', (authUserId, quizId) => {
    expect(requestQuizInfo(authUserId, quizId).statusCode).toBe(401);
    expect(parseBody(requestQuizInfo(authUserId, quizId).body)).toStrictEqual(ERROR);
  });

  // Test for invalid quizId, not owned by authUserId
  test('Invalid quizId (not owned by authUserId)', () => {
    const result1 = requestQuizInfo(user1Id, quiz2Id);
    const result2 = requestQuizInfo(user2Id, quiz1Id);
    expect(result1.statusCode).toBe(403);
    expect(result2.statusCode).toBe(403);
    expect(parseBody(result1.body)).toEqual(ERROR);
    expect(parseBody(result2.body)).toEqual(ERROR);
  });

  // Test for valid authUserId and quizId
  test('Valid test with valid authUserId and quizId', () => {
    const result = requestQuizInfo(user1Id, quiz1Id);
    // expect(result.statusCode).toBe(200);
    expect(parseBody(result.body)).toEqual(expect.any(Object));
  });
});
// Tests for viewing quiz list

// Test for viewing quiz list
describe('adminQuizList tests', () => {
  let userId: string;
  beforeEach(() => {
    requestClear();
    const user = requestRegister(validEmail, validPassword,
      validNameFirst, validNameLast);
    userId = user.token;
  });

  test.each([
    ['0', ERROR],
    ['-1', ERROR],
    ['0.5', ERROR]
  ])('for input "%s", it should return error', (input, expectedOutput) => {
    const response = requestQuizList(input);

    expect(response.statusCode).toBe(401);
    expect((parseBody(response.body))).toEqual(expectedOutput);
  });

  test('Successful list creation', () => {
    requestQuizCreate(userId, quizName, quizDescription);
    const resQuizList = requestQuizList(userId);
    expect(resQuizList.statusCode).toBe(200);
    expect((parseBody(resQuizList.body))).toStrictEqual(expect.any(Object));
  });
});

describe('adminQuizListv2 tests', () => {
  let userId: string;
  beforeEach(() => {
    requestClear();
    const user = requestRegister(validEmail, validPassword,
      validNameFirst, validNameLast);
    userId = user.token;
  });

  test('Successful list creation', () => {
    requestQuizCreate(userId, quizName, quizDescription);
    const resQuizList = requestQuizListv2(userId);
    expect(resQuizList.statusCode).toBe(200);
    expect((parseBody(resQuizList.body))).toStrictEqual(expect.any(Object));
  });

  test.each([
    ['0', ERROR],
    ['-1', ERROR],
    ['', ERROR]
  ])('for input "%s", it should return error', async (input, expectedOutput) => {
    const response = requestQuizListv2(input);
    expect(response.statusCode).toBe(401);
    expect(parseBody(response.body)).toEqual(expectedOutput);
  });
});

// Tests for updating the name of a quiz.

describe('adminQuizNameUpdatev2 tests', () => {
  let user1Id: string;
  let user2Id: string;
  let quiz1Id: number;
  let quiz2Id: number;
  let quiz3Id: number;

  beforeEach(() => {
    requestClear();
    const user1 = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    const user2 = requestRegister(validEmail1, validPassword1, validNameFirst1, validNameLast1);
    user1Id = user1.token;
    user2Id = user2.token;
    const quiz1 = requestQuizCreate(user1Id, 'Quiz1', 'Description1');
    const quiz2 = requestQuizCreate(user1Id, 'Quiz2', 'Description2');
    const quiz3 = requestQuizCreate(user2Id, 'Quiz3', 'Description3');
    quiz1Id = quiz1.quizId;
    quiz2Id = quiz2.quizId;
    quiz3Id = quiz3.quizId;
  });

  test('Successfully updated quiz name', () => {
    expect(requestNameUpdatev2(user1Id, quiz1Id, 'newName')).toEqual({});
  });

  test.each([
    ['%@!@#'],
    ['ab'],
    ['thishasmorethanthirtycharactersyep']
  ])('Invalid names', (name) => {
    expect(requestNameUpdatev2(user1Id, quiz1Id, name)).toStrictEqual(ERROR);
  });

  test('Name is taken', () => {
    expect(requestNameUpdatev2(user1Id, quiz2Id, 'Quiz1')).toStrictEqual(ERROR);
  });

  test('Invalid quizId', () => {
    expect(requestNameUpdatev2(user1Id, -1, 'validName')).toStrictEqual(ERROR);
  });

  test.each([
    [''],
    ['-1']
  ])('Invalid userId',
    (userId) => {
      expect(requestNameUpdatev2(userId, quiz1Id, 'validName')).toEqual(ERROR);
    });

  test('Valid token, but user is not an owner of this quiz', () => {
    expect(requestNameUpdatev2(user1Id, quiz3Id, 'validName')).toStrictEqual(ERROR);
  });
});

describe('adminQuizNameUpdatev1 tests', () => {
  let user1Id: string;
  let user2Id: string;
  let quiz1Id: number;
  let quiz2Id: number;
  let quiz3Id: number;

  beforeEach(() => {
    requestClear();
    const user1 = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    const user2 = requestRegister(validEmail1, validPassword1, validNameFirst1, validNameLast1);
    user1Id = user1.token;
    user2Id = user2.token;
    const quiz1 = requestQuizCreate(user1Id, 'Quiz1', 'Description1');
    const quiz2 = requestQuizCreate(user1Id, 'Quiz2', 'Description2');
    const quiz3 = requestQuizCreate(user2Id, 'Quiz3', 'Description3');
    quiz1Id = quiz1.quizId;
    quiz2Id = quiz2.quizId;
    quiz3Id = quiz3.quizId;
  });

  test('Successfully updated quiz name', () => {
    expect(requestNameUpdate(user1Id, quiz1Id, 'newName')).toEqual({});
  });

  test.each([
    ['%@!@#'],
    ['ab'],
    ['thishasmorethanthirtycharactersyep']
  ])('Invalid names', (name) => {
    expect(requestNameUpdate(user1Id, quiz1Id, name)).toStrictEqual(ERROR);
  });

  test('Name is taken', () => {
    expect(requestNameUpdate(user1Id, quiz2Id, 'Quiz1')).toStrictEqual(ERROR);
  });

  test('Invalid quizId', () => {
    expect(requestNameUpdate(user1Id, -1, 'validName')).toStrictEqual(ERROR);
  });

  test.each([
    [''],
    ['-1']
  ])('Invalid userId',
    (userId) => {
      expect(requestNameUpdate(userId, quiz1Id, 'validName')).toEqual(ERROR);
    });

  test('Valid token, but user is not an owner of this quiz', () => {
    expect(requestNameUpdate(user1Id, quiz3Id, 'validName')).toStrictEqual(ERROR);
  });
});

// test for updating the description of a quiz
describe('adminQuizDescriptionUpdatev2 tests', () => {
  let user1Id: string;
  let quiz1Id: number;

  beforeEach(() => {
    requestClear();
    const user1 = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    user1Id = user1.token;
    const quiz1 = requestQuizCreate(user1.token, 'Quiz1', 'Description1');
    quiz1Id = quiz1.quizId;
  });

  test('Successfully updated quiz name', () => {
    expect(requestDescriptionUpdatev2(user1Id, quiz1Id, 'description')).toEqual({});
  });

  test('Description more than 100 characters', () => {
    expect(requestDescriptionUpdatev2(user1Id, quiz1Id, longDescription)).toStrictEqual(ERROR);
  });

  test('Invalid quizId', () => {
    expect(requestDescriptionUpdatev2(user1Id, -1, 'validDescription')).toStrictEqual(ERROR);
  });

  test.each([
    [''],
    ['-1']
  ])('Invalid userId',
    (userId) => {
      expect(requestDescriptionUpdatev2(userId, quiz1Id, 'validName')).toEqual(ERROR);
    });
});

// test for updating the description of a quiz
describe('adminQuizDescriptionUpdatev1 tests', () => {
  let user1Id: string;
  let quiz1Id: number;

  beforeEach(() => {
    requestClear();
    const user1 = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    user1Id = user1.token;
    const quiz1 = requestQuizCreate(user1.token, 'Quiz1', 'Description1');
    quiz1Id = quiz1.quizId;
  });

  test('Successfully updated quiz name', () => {
    expect(requestDescriptionUpdate(user1Id, quiz1Id, 'description')).toEqual({});
  });

  test('Description more than 100 characters', () => {
    expect(requestDescriptionUpdate(user1Id, quiz1Id, longDescription)).toStrictEqual(ERROR);
  });

  test('Invalid quizId', () => {
    expect(requestDescriptionUpdate(user1Id, -1, 'validDescription')).toStrictEqual(ERROR);
  });

  test.each([
    [''],
    ['-1']
  ])('Invalid userId',
    (userId) => {
      expect(requestDescriptionUpdate(userId, quiz1Id, 'validName')).toEqual(ERROR);
    });
});

describe('HTTP tests for adminQuizTransfer', () => {
  let user1Id: string;
  let user2Id: string;
  let quiz1Id: number;
  let quiz2Id: number;
  let quiz3Id: number;
  beforeEach(() => {
    requestClear();

    const user1 = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user2 = requestRegister(validEmail1, validPassword1, validNameFirst1, validNameLast1);

    user1Id = user1.token;
    user2Id = user2.token;

    const quiz1 = requestQuizCreate(user1Id, 'newQuiz', 'newDescription');
    const quiz2 = requestQuizCreate(user2Id, 'myQuiz', 'myDescription');
    const quiz3 = requestQuizCreate(user1Id, 'anotherQuiz', 'newDescription');

    quiz1Id = quiz1.quizId;
    quiz2Id = quiz2.quizId;
    quiz3Id = quiz3.quizId;
  });

  test('Successfully transfers quiz', () => {
    const res = request(
      'POST',
      `${url}:${port}/v2/admin/quiz/${quiz3Id}/transfer`,
      {
        headers: {
          token: user1Id
        },
        json: {
          userEmail: validEmail1
        },
        timeout: 100
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
  });

  test.each([
    [fakeEmail],
    ['invalidEmail'],
    ['email@@gmail.com']
  ])('Testing adminQuizTransfer with email: %s', (email) => {
    const res = request(
      'POST',
      `${url}:${port}/v2/admin/quiz/${quiz1Id}/transfer`,
      {
        headers: {
          token: user1Id
        },
        json: {
          userEmail: email
        },
        timeout: 100
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toStrictEqual(ERROR);
  });

  test.each([
    [''],
    ['-1']
  ])('Testing adminQuizTransfer with invalid token: %s', (token) => {
    const res = request(
      'POST',
        `${url}:${port}/v2/admin/quiz/${quiz1Id}/transfer`,
        {
          headers: {
            token: token
          },
          json: {
            userEmail: validEmail1
          },
          timeout: 100
        }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(401);
    expect(bodyObj).toStrictEqual(ERROR);
  });

  test('Valid token, but user is not an owner', () => {
    const res = request(
      'POST',
      `${url}:${port}/v2/admin/quiz/${quiz2Id}/transfer`,
      {
        headers: {
          token: user1Id
        },
        json: {
          userEmail: validEmail1
        },
        timeout: 100
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj).toStrictEqual(ERROR);
  });
});

describe('HTTP tests for adminQuizTransferv1', () => {
  let user1Id: string;
  let user2Id: string;
  let quiz1Id: number;
  let quiz2Id: number;
  let quiz3Id: number;
  beforeEach(() => {
    requestClear();

    const user1 = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user2 = requestRegister(validEmail1, validPassword1, validNameFirst1, validNameLast1);

    user1Id = user1.token;
    user2Id = user2.token;

    const quiz1 = requestQuizCreate(user1Id, 'newQuiz', 'newDescription');
    const quiz2 = requestQuizCreate(user2Id, 'myQuiz', 'myDescription');
    const quiz3 = requestQuizCreate(user1Id, 'anotherQuiz', 'newDescription');

    quiz1Id = quiz1.quizId;
    quiz2Id = quiz2.quizId;
    quiz3Id = quiz3.quizId;
  });

  test('Successfully transfers quiz', () => {
    const res = request(
      'POST',
      `${url}:${port}/v1/admin/quiz/${quiz3Id}/transfer`,
      {
        json: {
          token: user1Id,
          userEmail: validEmail1
        },
        timeout: 100
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
  });

  test.each([
    [fakeEmail],
    ['invalidEmail'],
    ['email@@gmail.com']
  ])('Testing adminQuizTransfer with email: %s', (email) => {
    const res = request(
      'POST',
      `${url}:${port}/v1/admin/quiz/${quiz1Id}/transfer`,
      {
        json: {
          token: user1Id,
          userEmail: email
        },
        timeout: 100
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toStrictEqual(ERROR);
  });

  test.each([
    [''],
    ['-1']
  ])('Testing adminQuizTransfer with invalid token: %s', (token) => {
    const res = request(
      'POST',
        `${url}:${port}/v1/admin/quiz/${quiz1Id}/transfer`,
        {
          json: {
            token: token,
            userEmail: validEmail1
          },
          timeout: 100
        }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(401);
    expect(bodyObj).toStrictEqual(ERROR);
  });

  test('Valid token, but user is not an owner', () => {
    const res = request(
      'POST',
      `${url}:${port}/v1/admin/quiz/${quiz2Id}/transfer`,
      {
        json: {
          token: user1Id,
          userEmail: validEmail1
        },
        timeout: 100
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj).toStrictEqual(ERROR);
  });
});

describe('HTTP tests for /v1/admin/quiz/trash', () => {
  let userId1: string;
  let quizId1: number;
  beforeEach(() => {
    requestClear();
    const user1 = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    userId1 = user1.token;
    const quiz1 = requestQuizCreate(userId1, 'newQuiz', 'newDescription');
    quizId1 = quiz1.quizId;
    requestQuizRemove(userId1, quizId1);
  });

  test('Test successful trash view', () => {
    const res = request(
      'GET',
          `${url}:${port}/v1/admin/quiz/trash`,
          {
            qs: {
              token: userId1,
            },
            timeout: 100
          }
    );

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual({ quizzes: expect.any(Array) });
  });
  test('Test successful trash view with multiple quizzes', () => {
    const quiz2 = requestQuizCreate(userId1, 'dsfsdf', 'newDescription');
    const quizId2 = quiz2.quizId;
    requestQuizRemove(userId1, quizId2);
    const res = request(
      'GET',
          `${url}:${port}/v1/admin/quiz/trash`,
          {
            qs: {
              token: userId1,
            },
            timeout: 100
          }
    );

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual({ quizzes: expect.any(Array) });
  });

  test.each([
    ['Invalid'],
    [''],
    ['0.5']
  ])('Test trash view error - 401 - invalid token', (invalidToken) => {
    const res = request(
      'GET',
            `${url}:${port}/v1/admin/quiz/trash`,
            {
              qs: {
                token: invalidToken,
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(401);
    expect(bodyObj).toEqual(ERROR);
  });
});

describe('HTTP tests for /v1/admin/quiz/:quizid/restore', () => {
  let userId1: string;
  let quizId1: number;
  let quizId2: number;
  beforeEach(() => {
    requestClear();
    const user1 = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    userId1 = user1.token;
    const quiz1 = requestQuizCreate(userId1, 'newQuiz', 'newDescription');
    const quiz2 = requestQuizCreate(userId1, 'anotherQuiz', 'newDescription');
    quizId1 = quiz1.quizId;
    quizId2 = quiz2.quizId;
    requestQuizRemove(userId1, quizId1);
  });

  test('Test successful trash restore', () => {
    const res = request(
      'POST',
            `${url}:${port}/v1/admin/quiz/${quizId1}/restore`,
            {
              json: {
                token: userId1,
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual({});
  });

  test('Test trash view error - 400 - quiz not in trash', () => {
    const res = request(
      'POST',
            `${url}:${port}/v1/admin/quiz/${quizId2}/restore`,
            {
              json: {
                token: userId1,
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toEqual(ERROR);
  });
  test('Test trash view error - 400 - active quiz name', () => {
    requestQuizCreate(userId1, 'newQuiz', 'Active quiz name in use');
    const res = request(
      'POST',
            `${url}:${port}/v1/admin/quiz/${quizId1}/restore`,
            {
              json: {
                token: userId1,
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toEqual(ERROR);
  });
  test.each([
    ['Invalid'],
    [''],
    ['5']
  ])('Test trash view error - 401 - Invalid token', (invalidToken) => {
    const res = request(
      'POST',
            `${url}:${port}/v1/admin/quiz/${quizId1}/restore`,
            {
              json: {
                token: invalidToken,
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(401);
    expect(bodyObj).toEqual(ERROR);
  });
  test('Test trash view error - 403 - User does not own quiz', () => {
    const user2 = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    const userId2 = user2.token;
    const quizId4 = requestQuizCreate(userId2, 'quiz', 'another user').quizId;

    const res = request(
      'POST',
            `${url}:${port}/v1/admin/quiz/${quizId4}/restore`,
            {
              json: {
                token: userId1,
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj).toEqual(ERROR);
  });
});

// Tests for emptying trash
describe('HTTP tests for /v1/admin/quiz/trash/empty', () => {
  let userId1: string;
  let quizId1: number;
  let quizId2: number;
  beforeEach(() => {
    requestClear();
    const user1 = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    userId1 = user1.token;
    const quiz1 = requestQuizCreate(userId1, 'newQuiz', 'newDescription');
    const quiz2 = requestQuizCreate(userId1, 'anotherQuiz', 'newDescription');
    quizId1 = quiz1.quizId;
    quizId2 = quiz2.quizId;
    requestQuizRemove(userId1, quizId1);
    requestQuizRemove(userId1, quizId2);
  });

  test('Test successful trash emptying - single', () => {
    const quizzes = `[${quizId1}, ${quizId2}]`;
    let res = request(
      'DELETE',
            `${url}:${port}/v1/admin/quiz/trash/empty`,
            {
              qs: {
                token: userId1,
                quizIds: quizzes,
              },
              timeout: 100
            }
    );
    let bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual({ });
    res = request(
      'GET',
          `${url}:${port}/v1/admin/quiz/trash`,
          {
            qs: {
              token: userId1,
            },
            timeout: 100
          }
    );

    bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual({ quizzes: [] });
  });
  test('Test successful trash emptying - multiple', () => {
    const quizzes = `[${quizId1}, ${quizId2}]`;
    const res = request(
      'DELETE',
            `${url}:${port}/v1/admin/quiz/trash/empty`,
            {
              qs: {
                token: userId1,
                quizIds: quizzes,
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual({ });
  });

  test('Test trash view error - 400 - Quiz not in trash', () => {
    const quiz3 = requestQuizCreate(userId1, 'quiz', 'newDescription');
    const quizId3 = quiz3.quizId;
    const quizzes = `[${quizId1}, ${quizId2}, ${quizId3}]`;
    const res = request(
      'DELETE',
            `${url}:${port}/v1/admin/quiz/trash/empty`,
            {
              qs: {
                token: userId1,
                quizIds: quizzes
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toEqual(ERROR);
  });

  test('Test trash view error - 401 - Invalid token', () => {
    const quizzes = `[${quizId1}]`;
    const res = request(
      'DELETE',
            `${url}:${port}/v1/admin/quiz/trash/empty`,
            {
              qs: {
                token: 'userId1',
                quizIds: quizzes
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(401);
    expect(bodyObj).toEqual(ERROR);
  });
  test('Test trash view error - 403 - Quiz is not owned by user', () => {
    const user2 = requestRegister(validEmail1, validPassword1, validNameFirst1, validNameLast1);
    const userId2 = user2.token;
    const quiz3 = requestQuizCreate(userId2, 'quiz', 'newDescription');
    const quizId3 = quiz3.quizId;
    const quizzes = `[${quizId1}, ${quizId2}, ${quizId3}]`;
    const res = request(
      'DELETE',
            `${url}:${port}/v1/admin/quiz/trash/empty`,
            {
              qs: {
                token: userId1,
                quizIds: quizzes
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj).toEqual(ERROR);
  });
});

// Tests for creating a question in a quiz.

describe('adminQuizQuestionCreate tests', () => {
  let userId: string;
  let quizId: number;

  beforeEach(() => {
    requestClear();
    const user1 = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    userId = user1.token;
    const quiz = requestQuizCreate(user1.token, quizName, quizDescription);
    quizId = quiz.quizId;
  });

  test('Successfully create a question', () => {
    const questionBody: QuestionBody = {
      question: 'Valid question here?',
      duration: 3,
      points: 5,
      answers: [
        { answer: 'Answer 1', correct: true },
        { answer: 'Answer 2', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };
    const response = requestQuizQuestionCreate(userId, questionBody, quizId);
    expect(response.statusCode).toBe(200);
  });

  test.each([
    ['que?', ERROR],
    ['Why is this question string way too long to be considered valid?', ERROR]
  ])('Invalid question length: %s', (input, expectedOutput) => {
    const questionBody: QuestionBody = {
      question: input,
      duration: 3,
      points: 5,
      answers: [
        { answer: 'Answer 1', correct: true },
        { answer: 'Answer 2', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };

    const response = requestQuizQuestionCreate(userId, questionBody, quizId);

    expect(response.statusCode).toBe(400);
    expect(parseBody(response.body)).toEqual(expectedOutput);
  });

  test.each([
    [
      [{ answer: 'Only Answer', correct: true }],
      ERROR
    ],
    [
      [
        { answer: 'Answer 1', correct: true },
        { answer: 'Answer 2', correct: false },
        { answer: 'Answer 3', correct: false },
        { answer: 'Answer 4', correct: false },
        { answer: 'Answer 5', correct: false },
        { answer: 'Answer 6', correct: false },
        { answer: 'Answer 7', correct: false }
      ],
      ERROR
    ]
  ])('Invalid number of answers', (answers, expectedOutput) => {
    const questionBody: QuestionBody = {
      question: 'Valid question here?',
      duration: 3,
      points: 5,
      answers: answers,
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };

    const response = requestQuizQuestionCreate(userId, questionBody, quizId);

    expect(response.statusCode).toBe(400);
    expect(parseBody(response.body)).toEqual(expectedOutput);
  });

  test('Question duration is not a positive number', () => {
    const questionBody: QuestionBody = {
      question: 'Valid question here?',
      duration: -3,
      points: 5,
      answers: [
        { answer: 'Answer 1', correct: true },
        { answer: 'Answer 2', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };
    const response = requestQuizQuestionCreate(userId, questionBody, quizId);

    expect(response.statusCode).toBe(400);
    expect(parseBody(response.body)).toEqual(ERROR);
  });

  // the sum of the question durations in the quiz exceeds 3 minutes
  test('Sum of question durations exceeds 3 minutes', () => {
    const questionDuration = 31; // in seconds
    const maxQuestions = (3 * 60) / questionDuration; // 3 minutes in seconds

    for (let i = 0; i < maxQuestions; i++) {
      const questionBody: QuestionBody = {
        question: `Valid question text ${i}?`,
        duration: questionDuration,
        points: 5,
        answers: [
          { answer: 'Answer 1', correct: true },
          { answer: 'Answer 2', correct: false }
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg'
      };

      const response = requestQuizQuestionCreate(userId, questionBody, quizId);
      if (i < maxQuestions - 1) {
        expect(response.statusCode).toBe(200);
      } else {
        expect(response.statusCode).toBe(400);
        expect(parseBody(response.body)).toEqual(ERROR);
      }
    }
  });

  // the points awarded for the question are less than 1 or greater than 10
  test.each([
    [0, ERROR],
    [11, ERROR]
  ])('Invalid points awarded: %s', (input, expectedOutput) => {
    const questionBody: QuestionBody = {
      question: 'Valid question here?',
      duration: 3,
      points: input,
      answers: [
        { answer: 'Answer 1', correct: true },
        { answer: 'Answer 2', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };

    const response = requestQuizQuestionCreate(userId, questionBody, quizId);

    expect(response.statusCode).toBe(400);
    expect(parseBody(response.body)).toEqual(expectedOutput);
  });

  // the length of any answer is shorter than 1 character long, or longer than 30 characters long
  test.each([
    [''],
    ['massive answer that should not work']
  ])('Invalid answer length: %s', (input) => {
    const questionBody: QuestionBody = {
      question: 'Valid question here?',
      duration: 3,
      points: 5,
      answers: [
        { answer: input, correct: true },
        { answer: 'Answer 2', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };

    const response = requestQuizQuestionCreate(userId, questionBody, quizId);

    expect(response.statusCode).toBe(400);
    expect(parseBody(response.body)).toEqual(ERROR);
  });

  // any answer strings are duplicates of one another (within the same question)
  test('Test for duplicate answer strings', () => {
    const questionBody: QuestionBody = {
      question: 'Valid question here?',
      duration: 3,
      points: 5,
      answers: [
        { answer: 'Answer 1', correct: true },
        { answer: 'Answer 1', correct: true }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };
    const response = requestQuizQuestionCreate(userId, questionBody, quizId);

    expect(response.statusCode).toBe(400);
    expect(parseBody(response.body)).toEqual(ERROR);
  });

  // there are no correct answers
  test('Test for no correct answers', () => {
    const questionBody: QuestionBody = {
      question: 'Valid question here?',
      duration: 3,
      points: 5,
      answers: [
        { answer: 'Answer 1', correct: false },
        { answer: 'Answer 2', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };
    const response = requestQuizQuestionCreate(userId, questionBody, quizId);

    expect(response.statusCode).toBe(400);
    expect(parseBody(response.body)).toEqual(ERROR);
  });

  // token is empty or invalid (does not refer to valid logged in user session)
  test.each([
    ['', ERROR],
    ['5', ERROR]
  ])('Invalid token: %s', (input, expectedOutput) => {
    const questionBody: QuestionBody = {
      question: 'Valid question here?',
      duration: 3,
      points: 5,
      answers: [
        { answer: 'Answer 1', correct: true },
        { answer: 'Answer 1', correct: true }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };

    const response = requestQuizQuestionCreate(input, questionBody, quizId);

    expect(response.statusCode).toBe(401);
    expect(parseBody(response.body)).toEqual(expectedOutput);
  });

  // invalid thumbnail URL
  test.each([
    ['', ERROR],
    ['http://google.com/some/image/path.svg', ERROR],
    ['www.google.com/some/image/path.jpg', ERROR]
  ])('Invalid thumbnail URL: %s', (input, expectedOutput) => {
    const questionBody = {
      question: 'Valid question here?',
      duration: 3,
      points: 5,
      answers: [
        { answer: 'Answer 1', correct: true },
        { answer: 'Answer 2', correct: false }
      ],
      thumbnailUrl: input
    };

    const response = requestQuizQuestionCreate(userId, questionBody, quizId);

    expect(response.statusCode).toBe(400);
    expect(parseBody(response.body)).toEqual(expectedOutput);
  });

  // valid token is provided, but user is not an owner of this quiz
  test('Token is valid but user is not owner of this quiz: User2 tries to create question for Quiz1', () => {
    const questionBody: QuestionBody = {
      question: 'Valid question here?',
      duration: 3,
      points: 5,
      answers: [
        { answer: 'Answer 1', correct: false },
        { answer: 'Answer 2', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };

    // Registering user1 and creating a quiz for them
    const user1 = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    const quiz1 = requestQuizCreate(user1.token, quizName, quizDescription);

    // Registering user2
    const user2 = requestRegister('test1@example.com', validPassword, validNameFirst, validNameLast);

    // User2 tries to create a question for Quiz1
    const response = requestQuizQuestionCreate(user2.token, questionBody, quiz1.quizId);

    // Expectations
    expect(response.statusCode).toBe(403);
    expect(parseBody(response.body)).toEqual(ERROR);
  });
});

function requestQuizQuestionDelete(quizid: number, questionid: number, token: string) {
  const res = request(
    'DELETE',
    `${url}:${port}/v1/admin/quiz/${quizid}/question/${questionid}`,
    {
      qs: {
        quizid: quizid,
        questionid: questionid,
        token: token,
      }
    }
  );

  return res;
}

function requestQuizQuestionDeleteV2(quizid: number, questionid: number, token: string) {
  const res = request(
    'DELETE',
    `${url}:${port}/v2/admin/quiz/${quizid}/question/${questionid}`,
    {
      headers: {
        token: token,
      },
      qs: {
        quizid: quizid,
        questionid: questionid,
      }
    }
  );

  return res;
}

// HTTP tests for deleting a quiz question
describe('adminQuizQuestionDelete tests', () => {
  let user1Id: string;
  let user2Id: string;
  let quiz1Id: number;
  let quiz2Id: number;
  let question1Id: number;
  let question2Id: number;

  beforeEach(() => {
    requestClear();
    const user1 = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    const user2 = requestRegister(validEmail1, validPassword1, validNameFirst1, validNameLast1);
    user1Id = user1.token;
    user2Id = user2.token;
    const quiz1 = requestQuizCreate(user1.token, 'Quiz1', 'Description1');
    const quiz2 = requestQuizCreate(user2.token, 'Quiz2', 'Description2');
    quiz1Id = quiz1.quizId;
    quiz2Id = quiz2.quizId;
    const questionBody1 = {
      question: 'Valid question here?',
      duration: 3,
      points: 5,
      answers: [
        { answer: 'Answer 1', correct: true },
        { answer: 'Answer 2', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };
    const questionBody2 = {
      question: 'Valid question here2?',
      duration: 3,
      points: 5,
      answers: [
        { answer: 'Answer 3', correct: true },
        { answer: 'Answer 4', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };
    const question1 = parseBody(requestQuizQuestionCreate(user1Id, questionBody1, quiz1Id).body);
    const question2 = parseBody(requestQuizQuestionCreate(user2Id, questionBody2, quiz2Id).body);
    question1Id = question1.questionId;
    question2Id = question2.questionId;
  });

  test('Successfully removed quiz question', () => {
    const response = requestQuizQuestionDelete(quiz1Id, question1Id, user1Id);
    expect(response.statusCode).toBe(200);
    expect(parseBody(response.body)).toEqual({});
  });

  // Tests for questionId does not refer to a valid question within this quiz
  test('invalid questionId (not in the quiz)', () => {
    const result1 = requestQuizQuestionDelete(quiz1Id, question2Id, user1Id);
    const result2 = requestQuizQuestionDelete(quiz2Id, question1Id, user2Id);
    expect(result1.statusCode).toBe(400);
    expect(result2.statusCode).toBe(400);
    expect(parseBody(result1.body)).toEqual(ERROR);
    expect(parseBody(result2.body)).toEqual(ERROR);
  });

  // Tests for user is not an owner of this quiz
  test('invalid quizId (not owned by authUserId)', () => {
    const result1 = requestQuizQuestionDelete(quiz1Id, question1Id, user2Id);
    const result2 = requestQuizQuestionDelete(quiz2Id, question2Id, user1Id);
    expect(result1.statusCode).toBe(403);
    expect(result2.statusCode).toBe(403);
    expect(parseBody(result1.body)).toEqual(ERROR);
    expect(parseBody(result2.body)).toEqual(ERROR);
  });

  test('Invalid token', () => {
    const result1 = requestQuizQuestionDelete(quiz1Id, question1Id, '');
    const result2 = requestQuizQuestionDelete(quiz2Id, question2Id, '-1');
    expect(result1.statusCode).toBe(401);
    expect(result2.statusCode).toBe(401);
    expect(parseBody(result1.body)).toEqual(ERROR);
    expect(parseBody(result2.body)).toEqual(ERROR);
  });
});

// Tests for moving a position of a question in a particular quiz

describe('adminQuizQuestionMove tests', () => {
  let userId: string;
  let quizId: number;
  let questionId: number;
  let question2Id: number;

  beforeEach(() => {
    requestClear();
    const user1 = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    userId = user1.token;
    const quiz = requestQuizCreate(user1.token, 'Quiz1', 'Description1');
    quizId = quiz.quizId;
    const question = parseBody(requestQuizQuestionCreate(userId, questionBody, quizId).body);
    questionId = question.questionId;
  });

  test('Successfully moves question', () => {
    const question2 = parseBody(requestQuizQuestionCreate(userId, questionBodyNew, quizId).body);
    question2Id = question2.questionId;
    const newPosition = 0;
    const moveBody = {
      token: userId,
      newPosition: newPosition
    };

    const response = requestQuizQuestionMove(quizId, question2Id, moveBody);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body as string)).toEqual({});
  });

  // question Id does not refer to a valid question within this quiz
  test('Invalid Question Id', () => {
    const invalidQuestionId = questionId + 10;

    const moveBody = {
      token: userId,
      newPosition: 0 // Assuming you want to move the question to the second position (0-indexed)
    };

    const response = requestQuizQuestionMove(quizId, invalidQuestionId, moveBody);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body as string)).toEqual(ERROR);
  });

  // newPosition is less than 0, or NewPosition is greater than n-1 where n is the number of questions
  test.each([
    [-1, ERROR],
    [3, ERROR]
  ])('Invalid newPosition: %s', (input, expectedOutput) => {
    const moveBody = {
      token: userId,
      newPosition: input
    };

    const response = requestQuizQuestionMove(quizId, questionId, moveBody);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body as string)).toEqual(expectedOutput);
  });

  // newPosition is the position of the current question
  test('New position is same position of the current question', () => {
    const moveBody = {
      token: userId,
      newPosition: 1
    };

    const response = requestQuizQuestionMove(quizId, questionId, moveBody);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body as string)).toEqual(ERROR);
  });

  // token is empty or invalid (does not refer to valid logged in user session)
  test.each([
    ['', ERROR],
    ['5', ERROR]
  ])('Invalid token: %s', (input, expectedOutput) => {
    const moveBody = {
      token: input,
      newPosition: 0
    };

    const response = requestQuizQuestionMove(quizId, questionId, moveBody);

    expect(response.statusCode).toBe(401);
    expect(parseBody(response.body)).toEqual(expectedOutput);
  });

  // valid token is provided, but user is not an owner of this quiz
  // valid token is provided, but user is not an owner of this quiz
  test('Token is valid but user is not owner of this quiz: User2 tries to create question for Quiz1', () => {
  // Registering user1 and creating a quiz for them
    const user1 = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    const quiz1 = requestQuizCreate(user1.token, quizName, quizDescription);

    // Registering user2
    const user2 = requestRegister('test1@example.com', validPassword, validNameFirst, validNameLast);

    // Prepare the move request with user2's token
    const moveBody = {
      token: user2.token, // Use user2's token here
      newPosition: 0
    };

    // User2 tries to move a question in Quiz1
    const response = requestQuizQuestionMove(quiz1.quizId, questionId, moveBody);

    // Expectations
    expect(response.statusCode).toBe(403);
    expect(parseBody(response.body)).toEqual(ERROR);
  });
});

// adminQuizQuestionUpdate
describe('HTTP tests for /v1/admin/quiz/:quizid/question/:questionid', () => {
  let userId1: string;
  let userId2: string;
  let quizId1: number;
  let quizId2: number;
  let questionId1: number;
  beforeEach(() => {
    requestClear();
    const user1 = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    userId1 = user1.token;
    const user2 = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    userId2 = user2.token;
    const quiz1 = requestQuizCreate(userId1, 'newQuiz', 'newDescription');
    quizId1 = quiz1.quizId;
    const quiz2 = requestQuizCreate(userId2, 'newQuiz', 'newDescription');
    quizId2 = quiz2.quizId;
    const questionBody: QuestionBodyV2 = {
      question: 'Valid question here?',
      duration: 3,
      points: 5,
      answers: [
        { answer: 'Answer 1', correct: true },
        { answer: 'Answer 2', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };
    const res = requestQuizQuestionCreate(userId1, questionBody, quizId1);
    const question = (parseBody(res.body));
    questionId1 = question.questionId;
  });
  test('Test successful question update', () => {
    const res = request(
      'PUT',
            `${url}:${port}/v1/admin/quiz/${quizId1}/question/${questionId1}`,
            {
              json: {
                token: userId1,
                questionBody: {
                  question: 'Updated question?',
                  duration: 2,
                  points: 2,
                  answers: [
                    { answer: 'Answer 1', correct: false },
                    { answer: 'Answer 2', correct: true }
                  ],
                  thumbnailUrl: 'http://google.com/some/image/path.jpg'
                }
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual({});
  });

  test('Invalid question Id - not in quiz', () => {
    const res = request(
      'PUT',
            `${url}:${port}/v1/admin/quiz/${quizId1}/question/${questionId1 + 1}`,
            {
              json: {
                token: userId1,
                questionBody: {
                  question: 'Updated question?',
                  duration: 2,
                  points: 2,
                  answers: [
                    { answer: 'Answer 1', correct: false },
                    { answer: 'Answer 2', correct: true }
                  ],
                  thumbnailUrl: 'http://google.com/some/image/path.jpg'
                }
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toEqual(ERROR);
  });

  test.each([
    ['1234'],
    ['1'],
    [''],
    ['thisIsLongerThan50CharactersAndWillReturnAnErrorForThat']
  ])('Invalid question Id - too short or too long', (invalidQuestion) => {
    const res = request(
      'PUT',
            `${url}:${port}/v1/admin/quiz/${quizId1}/question/${questionId1}`,
            {
              json: {
                token: userId1,
                questionBody: {
                  question: invalidQuestion,
                  duration: 2,
                  points: 2,
                  answers: [
                    { answer: 'Answer 1', correct: false },
                    { answer: 'Answer 2', correct: true }
                  ],
                  thumbnailUrl: 'http://google.com/some/image/path.jpg'
                }
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toEqual(ERROR);
  });

  test.each([
    [
      { answer: 'Answer 1', correct: false },
    ],
    [
      { answer: 'Answer 1', correct: false },
      { answer: 'Answer 2', correct: true },
      { answer: 'Answer 3', correct: false },
      { answer: 'Answer 4', correct: true },
      { answer: 'Answer 5', correct: false },
      { answer: 'Answer 6', correct: true }
    ],

  ])('Invalid answer count', (invalidAnswers) => {
    const res = request(
      'PUT',
            `${url}:${port}/v1/admin/quiz/${quizId1}/question/${questionId1}`,
            {
              json: {
                token: userId1,
                questionBody: {
                  question: 'Updated question?',
                  duration: 2,
                  points: 2,
                  answers: [invalidAnswers],
                  thumbnailUrl: 'http://google.com/some/image/path.jpg'
                }
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toEqual(ERROR);
  });

  test.each([
    [-1],
    [-2],
    [-10000],
    [500],
    [180]
  ])('Invalid question duration - Negative or over 180 seconds', (invalidDuration) => {
    const res = request(
      'PUT',
            `${url}:${port}/v1/admin/quiz/${quizId1}/question/${questionId1}`,
            {
              json: {
                token: userId1,
                questionBody: {
                  question: 'Updated question?',
                  duration: invalidDuration,
                  points: 2,
                  answers: [
                    { answer: 'Answer 1', correct: false },
                    { answer: 'Answer 2', correct: true }
                  ],
                  thumbnailUrl: 'http://google.com/some/image/path.jpg'
                }
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toEqual(ERROR);
  });

  test.each([
    [0],
    [-1],
    [11],
    [20]
  ])('Invalid points - less than 1 or more than 10', (invalidpoints) => {
    const res = request(
      'PUT',
            `${url}:${port}/v1/admin/quiz/${quizId1}/question/${questionId1}`,
            {
              json: {
                token: userId1,
                questionBody: {
                  question: 'Updated question?',
                  duration: 50,
                  points: invalidpoints,
                  answers: [
                    { answer: 'Answer 1', correct: false },
                    { answer: 'Answer 2', correct: true }
                  ],
                  thumbnailUrl: 'http://google.com/some/image/path.jpg'
                }
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toEqual(ERROR);
  });

  test.each([
    ['', false, 'Answer 2', true],
    ['Answer 1 is extra long for this test', false, 'Answer 2', true],
    ['Answer 1', false, 'Answer 1', true],
  ])('Invalid answer - too short or too long or duplicate answer', (input, correctness, input2, correctness2) => {
    const res = request(
      'PUT',
            `${url}:${port}/v1/admin/quiz/${quizId1}/question/${questionId1}`,
            {
              json: {
                token: userId1,
                questionBody: {
                  question: 'Updated question?',
                  duration: 2,
                  points: 2,
                  answers: [
                    { answer: input, correct: correctness },
                    { answer: input2, correct: correctness2 }
                  ],
                  thumbnailUrl: 'http://google.com/some/image/path.jpg'
                }
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toEqual(ERROR);
  });

  test('Invalid answer - too short or too long or duplicate answer', () => {
    const res = request(
      'PUT',
            `${url}:${port}/v1/admin/quiz/${quizId1}/question/${questionId1}`,
            {
              json: {
                token: userId1,
                questionBody: {
                  question: 'Updated question?',
                  duration: 2,
                  points: 2,
                  answers: [
                    { answer: 'Answer 1', correct: false },
                    { answer: 'Answer 2', correct: false },
                  ],
                  thumbnailUrl: 'http://google.com/some/image/path.jpg'
                }
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toEqual(ERROR);
  });

  test.each([
    [''],
    // ['doesnt return a valid file'],
    // ['not jpg or png'],

  ])('Invalid answer - too short or too long or duplicate answer', (invalidUrl) => {
    const res = request(
      'PUT',
            `${url}:${port}/v1/admin/quiz/${quizId1}/question/${questionId1}`,
            {
              json: {
                token: userId1,
                questionBody: {
                  question: 'Updated question?',
                  duration: 2,
                  points: 2,
                  answers: [
                    { answer: 'Answer 1', correct: false },
                    { answer: 'Answer 2', correct: true },
                  ],
                  thumbnailUrl: invalidUrl
                }
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toEqual(ERROR);
  });

  test('Invalid token', () => {
    const res = request(
      'PUT',
            `${url}:${port}/v1/admin/quiz/${quizId1}/question/${questionId1}`,
            {
              json: {
                token: userId1 + 1,
                questionBody: {
                  question: 'Updated question?',
                  duration: 2,
                  points: 2,
                  answers: [
                    { answer: 'Answer 1', correct: false },
                    { answer: 'Answer 2', correct: true }
                  ],
                  thumbnailUrl: 'http://google.com/some/image/path.jpg'
                }
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(401);
    expect(bodyObj).toEqual(ERROR);
  });

  test('Quiz doesnt belong to user', () => {
    const res = request(
      'PUT',
            `${url}:${port}/v1/admin/quiz/${quizId2}/question/${questionId1}`,
            {
              json: {
                token: userId1,
                questionBody: {
                  question: 'Updated question?',
                  duration: 2,
                  points: 2,
                  answers: [
                    { answer: 'Answer 1', correct: false },
                    { answer: 'Answer 2', correct: true }
                  ],
                  thumbnailUrl: 'http://google.com/some/image/path.jpg'
                }
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj).toEqual(ERROR);
  });
});

// Tests for duplicating a quiz question
describe('adminQuizQuestionDuplicate tests', () => {
  let userId1: string;
  let userId2: string;
  let quizId1: number;
  let quizId2: number;
  let questionId1: number;
  let questionId2: number;
  beforeEach(() => {
    requestClear();
    const user1 = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    userId1 = user1.token;
    const user2 = requestRegister(validEmail1, validPassword1, validNameFirst1, validNameLast1);
    userId2 = user2.token;
    const quiz1 = requestQuizCreate(userId1, 'newQuiz', 'newDescription');
    quizId1 = quiz1.quizId;
    const quiz2 = requestQuizCreate(userId2, 'newQuiz', 'newDescription');
    quizId2 = quiz2.quizId;
    const questionBody1: QuestionBody = {
      question: 'Valid question here?',
      duration: 3,
      points: 5,
      answers: [
        { answer: 'Answer 1', correct: true },
        { answer: 'Answer 2', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };
    const questionBody2 = {
      question: 'Valid question here2?',
      duration: 3,
      points: 5,
      answers: [
        { answer: 'Answer 3', correct: true },
        { answer: 'Answer 4', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };
    const res1 = requestQuizQuestionCreate(userId1, questionBody1, quizId1);
    const question1 = (parseBody(res1.body));
    questionId1 = question1.questionId;
    const res2 = requestQuizQuestionCreate(userId2, questionBody2, quizId2);
    const question2 = (parseBody(res2.body));
    questionId2 = question2.questionId;
  });

  test('Successfully duplicate a question', () => {
    const response = requestQuizQuestionDuplicate(quizId1, questionId1, userId1);
    expect(response.statusCode).toBe(200);
    expect(parseBody(response.body)).toEqual({ newQuestionId: expect.any(Number) });
  });

  test('QuestionId does not refer to a valid question within this quiz', () => {
    const result1 = requestQuizQuestionDuplicate(quizId1, questionId2, userId1);
    const result2 = requestQuizQuestionDuplicate(quizId2, questionId1, userId2);
    expect(result1.statusCode).toBe(400);
    expect(result2.statusCode).toBe(400);
    expect(parseBody(result1.body)).toEqual(ERROR);
    expect(parseBody(result2.body)).toEqual(ERROR);
  });

  test('Token is empty or invalid', () => {
    const result1 = requestQuizQuestionDuplicate(quizId1, questionId1, '');
    const result2 = requestQuizQuestionDuplicate(quizId2, questionId2, '-1');
    expect(result1.statusCode).toBe(401);
    expect(result2.statusCode).toBe(401);
    expect(parseBody(result1.body)).toEqual(ERROR);
    expect(parseBody(result2.body)).toEqual(ERROR);
  });

  test('User is not an owner of this quiz', () => {
    const result1 = requestQuizQuestionDuplicate(quizId1, questionId1, userId2);
    const result2 = requestQuizQuestionDuplicate(quizId2, questionId2, userId1);
    expect(result1.statusCode).toBe(403);
    expect(result2.statusCode).toBe(403);
    expect(parseBody(result1.body)).toEqual(ERROR);
    expect(parseBody(result2.body)).toEqual(ERROR);
  });
});
export {
  requestQuizCreate,
  requestQuizInfo
};

function requestQuizQuestionInformation(playerId: number, questionPosition: number) {
  const res = request(
    'GET',
    `${url}:${port}/v1/player/${playerId}/question/${questionPosition}`
  );

  return res;
}

describe('HTTP tests for adminQuizQuestionInformation', () => {
  let userId: string;
  let quizId: number;
  let playerId: number;
  let sessionId: number;

  beforeEach(() => {
    requestClear();
    const user = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    userId = user.token;
    const quiz = requestQuizCreate(userId, 'newQuiz', 'newDescription');
    quizId = quiz.quizId;
    requestQuizQuestionCreate(userId, questionBody, quizId);
    requestQuizQuestionCreate(userId, questionBody2, quizId);
    requestQuizQuestionCreate(userId, questionBody3, quizId);
    const session = request(
      'POST',
        `${url}:${port}/v1/admin/quiz/${quizId}/session/start`,
        {
          headers: {
            token: userId
          },
          json: {
            autoStartNum: 3
          },
          timeout: 100
        }
    );
    const sessionObj = JSON.parse(session.body as string);
    sessionId = sessionObj.sessionId;
    expect(session.statusCode).toBe(200);
    const player = requestPlayerAdd(sessionId, 'Hayden Smith');
    const playerIdObject = parseBody(player.body);
    playerId = playerIdObject.playerId;
  });

  test('Successful retrieval of question information', () => {
    requestUpdateState(quizId, sessionId, userId, AdminAction.NEXT_QUESTION);
    const toCountdown = requestSessionStatus(quizId, sessionId, userId);
    const countdown = JSON.parse(toCountdown.body as string);
    expect(countdown.state).toBe(SessionState.QUESTION_COUNTDOWN);

    requestUpdateState(quizId, sessionId, userId, AdminAction.SKIP_COUNTDOWN);
    const toOpen = requestSessionStatus(quizId, sessionId, userId);
    const open = JSON.parse(toOpen.body as string);
    expect(open.state).toBe(SessionState.QUESTION_OPEN);

    const response = requestQuizQuestionInformation(playerId, 1);
    expect(response.statusCode).toBe(200);
    expect(parseBody(response.body)).toEqual(expect.any(Object));
  });

  test.each([
    [playerId + 10, ERROR],
    [playerId * 10, ERROR],
    [playerId - 10, ERROR],
    [playerId / 10, ERROR],
  ])('Invalid player id: %j', (input, expectedOutput) => {
    requestUpdateState(quizId, sessionId, userId, AdminAction.NEXT_QUESTION);
    const toCountdown = requestSessionStatus(quizId, sessionId, userId);
    const countdown = JSON.parse(toCountdown.body as string);
    expect(countdown.state).toBe(SessionState.QUESTION_COUNTDOWN);

    requestUpdateState(quizId, sessionId, userId, AdminAction.SKIP_COUNTDOWN);
    const toOpen = requestSessionStatus(quizId, sessionId, userId);
    const open = JSON.parse(toOpen.body as string);
    expect(open.state).toBe(SessionState.QUESTION_OPEN);

    const response = requestQuizQuestionInformation(input, 1);
    expect(response.statusCode).toBe(400);
    expect(parseBody(response.body)).toEqual(expectedOutput);
  });

  test.each([
    [-1, ERROR],
    [5, ERROR],
  ])('Invalid question number: %j', (input, expectedOutput) => {
    requestUpdateState(quizId, sessionId, userId, AdminAction.NEXT_QUESTION);
    const toCountdown = requestSessionStatus(quizId, sessionId, userId);
    const countdown = JSON.parse(toCountdown.body as string);
    expect(countdown.state).toBe(SessionState.QUESTION_COUNTDOWN);

    requestUpdateState(quizId, sessionId, userId, AdminAction.SKIP_COUNTDOWN);
    const toOpen = requestSessionStatus(quizId, sessionId, userId);
    const open = JSON.parse(toOpen.body as string);
    expect(open.state).toBe(SessionState.QUESTION_OPEN);

    const response = requestQuizQuestionInformation(playerId, input);
    expect(response.statusCode).toBe(400);
    expect(parseBody(response.body)).toEqual(expectedOutput);
  });

  test('Session is NOT currently on this question', () => {
    requestUpdateState(quizId, sessionId, userId, AdminAction.NEXT_QUESTION);
    const toCountdown1 = requestSessionStatus(quizId, sessionId, userId);
    const countdown1 = JSON.parse(toCountdown1.body as string);
    expect(countdown1.state).toBe(SessionState.QUESTION_COUNTDOWN);

    requestUpdateState(quizId, sessionId, userId, AdminAction.SKIP_COUNTDOWN);
    const toOpen1 = requestSessionStatus(quizId, sessionId, userId);
    const open1 = JSON.parse(toOpen1.body as string);
    expect(open1.state).toBe(SessionState.QUESTION_OPEN);

    // Initial check to confirm the session is on the first question
    const response = requestQuizQuestionInformation(playerId, 1);
    expect(response.statusCode).toBe(200);

    requestUpdateState(quizId, sessionId, userId, AdminAction.GO_TO_ANSWER);
    const toAnswer = requestSessionStatus(quizId, sessionId, userId);
    const answer = JSON.parse(toAnswer.body as string);
    expect(answer.state).toBe(SessionState.ANSWER_SHOW);

    requestUpdateState(quizId, sessionId, userId, AdminAction.NEXT_QUESTION);
    const toCountdown = requestSessionStatus(quizId, sessionId, userId);
    const countdown = JSON.parse(toCountdown.body as string);
    expect(countdown.state).toBe(SessionState.QUESTION_COUNTDOWN);

    requestUpdateState(quizId, sessionId, userId, AdminAction.SKIP_COUNTDOWN);
    const toOpen = requestSessionStatus(quizId, sessionId, userId);
    const open = JSON.parse(toOpen.body as string);
    expect(open.state).toBe(SessionState.QUESTION_OPEN);

    const sessionStatusResponse = requestSessionStatus(quizId, sessionId, userId);
    expect(sessionStatusResponse.statusCode).toBe(200);

    // Check that requesting information for the first question now returns an error
    const responseAfterUpdate = requestQuizQuestionInformation(playerId, 1);
    expect(responseAfterUpdate.statusCode).toBe(400);
    expect(parseBody(responseAfterUpdate.body)).toEqual(ERROR);
  });

  test('Session is in LOBBY or END state', () => {
    const responseQuestionInLobby = requestQuizQuestionInformation(playerId, 1);
    expect(responseQuestionInLobby.statusCode).toBe(400);
    expect(parseBody(responseQuestionInLobby.body)).toEqual(ERROR);

    requestUpdateState(quizId, sessionId, userId, AdminAction.END);
    const toEnd = requestSessionStatus(quizId, sessionId, userId);
    const end = JSON.parse(toEnd.body as string);
    expect(end.state).toBe(SessionState.END);

    // Verify fetching question information in END state fails
    const responseQuestionInEnd = requestQuizQuestionInformation(playerId, 1);
    expect(responseQuestionInEnd.statusCode).toBe(400);
    expect(parseBody(responseQuestionInEnd.body)).toEqual(ERROR);
  });
});

function requestQuizQuestionAnswer(playerId: number, questionPosition: number, answerIds: number[]) {
  const res = request(
    'PUT',
    `${url}:${port}/v1/player/${playerId}/question/${questionPosition}/answer`,
    {
      json: {
        answerIds: answerIds // Pass the array directly without wrapping it
      },
    }
  );

  return res;
}

describe('HTTP tests for adminQuizQuestionAnswer', () => {
  let userId: string;
  let quizId: number;
  let playerId: number;
  let sessionId: number;
  let answerId: number [];

  beforeEach(() => {
    requestClear();
    const user = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    userId = user.token;
    const quiz = requestQuizCreate(userId, 'newQuiz', 'newDescription');
    quizId = quiz.quizId;
    requestQuizQuestionCreate(userId, questionBody, quizId);
    requestQuizQuestionCreate(userId, questionBody2, quizId);
    requestQuizQuestionCreate(userId, questionBody3, quizId);
    const session = request(
      'POST',
        `${url}:${port}/v1/admin/quiz/${quizId}/session/start`,
        {
          headers: {
            token: userId
          },
          json: {
            autoStartNum: 3
          },
          timeout: 100
        }
    );
    const sessionObj = JSON.parse(session.body as string);
    sessionId = sessionObj.sessionId;
    expect(session.statusCode).toBe(200);
    const player = requestPlayerAdd(sessionId, 'Hayden Smith');
    const playerIdObject = parseBody(player.body);
    playerId = playerIdObject.playerId;

    requestUpdateState(quizId, sessionId, userId, AdminAction.NEXT_QUESTION);
    const toCountdown = requestSessionStatus(quizId, sessionId, userId);
    const countdown = JSON.parse(toCountdown.body as string);
    expect(countdown.state).toBe(SessionState.QUESTION_COUNTDOWN);

    requestUpdateState(quizId, sessionId, userId, AdminAction.SKIP_COUNTDOWN);
    const countdownToOpen = requestSessionStatus(quizId, sessionId, userId);
    const open = JSON.parse(countdownToOpen.body as string);
    expect(open.state).toBe(SessionState.QUESTION_OPEN);

    const questionInformation = requestQuizQuestionInformation(playerId, 1);
    const questionInfoObj = JSON.parse(questionInformation.body.toString());
    answerId = [questionInfoObj.answers[0].answerId];
  });

  // successful HTTP call
  test('Successful answer submission', () => {
    const response = requestQuizQuestionAnswer(playerId, 1, answerId);
    expect(parseBody(response.body)).toEqual(expect.any(Object));
  });

  // invalid player id
  test.each([
    [playerId + 10, ERROR],
    [playerId * 10, ERROR],
    [playerId - 10, ERROR],
    [playerId / 10, ERROR],
  ])('Invalid player id: %j', (input, expectedOutput) => {
    const response = requestQuizQuestionAnswer(input, 1, answerId);
    expect(response.statusCode).toBe(400);
    expect(parseBody(response.body)).toEqual(expectedOutput);
  });

  // question position is NOT valid for the session this player is in
  test.each([
    [-1, ERROR],
    [5, ERROR],
  ])('Invalid question number: %j', (input, expectedOutput) => {
    const response = requestQuizQuestionAnswer(playerId, input, answerId);

    expect(response.statusCode).toBe(400);
    expect(parseBody(response.body)).toEqual(expectedOutput);
  });

  test('Session is NOT in QUESTION_OPEN state', () => {
    const responseActive = request(
      'PUT',
      `${url}:${port}/v1/admin/quiz/${quizId}/session/${sessionId}`,
      {
        headers: {
          token: userId
        },
        json: {
          action: 'END'
        },
        timeout: 100
      }
    );
    expect(responseActive.statusCode).toBe(200);

    const responseQuestionInEnd = requestQuizQuestionAnswer(playerId, 1, answerId);
    expect(responseQuestionInEnd.statusCode).toBe(400);
    expect(parseBody(responseQuestionInEnd.body)).toEqual(ERROR);
  });

  // If session is not upto this question yet
  test('Session is NOT currently on this question', () => {
    requestUpdateState(quizId, sessionId, userId, AdminAction.GO_TO_ANSWER);
    const openToAnswer = requestSessionStatus(quizId, sessionId, userId);
    const answer = JSON.parse(openToAnswer.body as string);
    expect(answer.state).toBe(SessionState.ANSWER_SHOW);

    requestUpdateState(quizId, sessionId, userId, AdminAction.NEXT_QUESTION);
    const showToCountdown = requestSessionStatus(quizId, sessionId, userId);
    const countdown = JSON.parse(showToCountdown.body as string);
    expect(countdown.state).toBe(SessionState.QUESTION_COUNTDOWN);

    requestUpdateState(quizId, sessionId, userId, AdminAction.SKIP_COUNTDOWN);
    const countdownToOpen = requestSessionStatus(quizId, sessionId, userId);
    const open = JSON.parse(countdownToOpen.body as string);
    expect(open.state).toBe(SessionState.QUESTION_OPEN);

    const responseAfterUpdate = requestQuizQuestionAnswer(playerId, 1, answerId);
    expect(responseAfterUpdate.statusCode).toBe(400);
    expect(parseBody(responseAfterUpdate.body)).toEqual(ERROR);
  });

  // Test for invalid answer IDs
  test.each([
    [10, ERROR],
    [-10, ERROR],
    [1, ERROR],
  ])('Invalid answer ID: %j', (input, expectedOutput) => {
    const modifiedAnswerId = answerId[0] + input;
    // Pass the altered answer ID as an array
    const response = requestQuizQuestionAnswer(playerId, 1, [modifiedAnswerId]);

    // Expect an error response
    expect(response.statusCode).toBe(400);
    expect(parseBody(response.body)).toEqual(expectedOutput);
  });

  test('Less than 1 answer ID submitted results in error', () => {
    // Submitting an empty array of answer IDs
    const response = requestQuizQuestionAnswer(playerId, 1, []);

    // Expecting an error response
    expect(response.statusCode).toBe(400);
    expect(parseBody(response.body)).toEqual(ERROR); // Ensure ERROR matches the expected format
  });
});

function requestQuizQuestionResult(playerId: number, questionPosition: number) {
  const res = request(
    'GET',
    `${url}:${port}/v1/player/${playerId}/question/${questionPosition}/results`
  );

  return res;
}

describe('HTTP tests for adminQuizQuestionResult', () => {
  let userId: string;
  let quizId: number;
  let playerId: number;
  let sessionId: number;
  let answerId: number [];

  beforeEach(() => {
    requestClear();
    const user = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    userId = user.token;
    const quiz = requestQuizCreate(userId, 'newQuiz', 'newDescription');
    quizId = quiz.quizId;
    requestQuizQuestionCreate(userId, questionBody, quizId);
    requestQuizQuestionCreate(userId, questionBody2, quizId);
    requestQuizQuestionCreate(userId, questionBody3, quizId);

    const session = requestSessionStart(quizId, userId, 3);
    sessionId = session.sessionId;
    const player = requestPlayerAdd(sessionId, 'Hayden Smith');
    const playerIdObject = parseBody(player.body);
    playerId = playerIdObject.playerId;

    requestUpdateState(quizId, sessionId, userId, AdminAction.NEXT_QUESTION);
    const lobbyToCountdown = requestSessionStatus(quizId, sessionId, userId);
    const countdown = JSON.parse(lobbyToCountdown.body as string);
    expect(countdown.state).toBe(SessionState.QUESTION_COUNTDOWN);

    requestUpdateState(quizId, sessionId, userId, AdminAction.SKIP_COUNTDOWN);
    const countdownToOpen = requestSessionStatus(quizId, sessionId, userId);
    const open = JSON.parse(countdownToOpen.body as string);
    expect(open.state).toBe(SessionState.QUESTION_OPEN);
    const questionInformation = requestQuizQuestionInformation(playerId, 1);
    const questionInfoObj = JSON.parse(questionInformation.body.toString());
    answerId = [questionInfoObj.answers[0].answerId];
    requestQuizQuestionAnswer(playerId, 1, answerId);
  });

  // successful HTTP call
  test('Successful result received', () => {
    const updateStatus3 = request(
      'PUT',
      `${url}:${port}/v1/admin/quiz/${quizId}/session/${sessionId}`,
      {
        headers: {
          token: userId
        },
        json: {
          action: 'GO_TO_ANSWER'
        },
        timeout: 100
      }
    );
    expect(updateStatus3.statusCode).toBe(200);
    const response = requestQuizQuestionResult(playerId, 1);
    expect(response.statusCode).toBe(200);
    expect(parseBody(response.body)).toEqual(expect.any(Object));
  });

  // playerId does not exist
  test.each([
    [playerId + 10, ERROR],
    [playerId * 10, ERROR],
    [playerId - 10, ERROR],
    [playerId / 10, ERROR],
  ])('Invalid player id: %j', (input, expectedOutput) => {
    const updateStatus3 = request(
      'PUT',
      `${url}:${port}/v1/admin/quiz/${quizId}/session/${sessionId}`,
      {
        headers: {
          token: userId
        },
        json: {
          action: 'GO_TO_ANSWER'
        },
        timeout: 100
      }
    );
    expect(updateStatus3.statusCode).toBe(200);

    const response = requestQuizQuestionResult(input, 1);
    expect(response.statusCode).toBe(400);
    expect(parseBody(response.body)).toEqual(expectedOutput);
  });

  // question position is not valid for the session this player is in
  test.each([
    [-1, ERROR],
    [5, ERROR],
  ])('Invalid question number: %j', (input, expectedOutput) => {
    const updateStatus3 = request(
      'PUT',
      `${url}:${port}/v1/admin/quiz/${quizId}/session/${sessionId}`,
      {
        headers: {
          token: userId
        },
        json: {
          action: 'GO_TO_ANSWER'
        },
        timeout: 100
      }
    );
    expect(updateStatus3.statusCode).toBe(200);

    const response = requestQuizQuestionResult(playerId, input);
    expect(response.statusCode).toBe(400);
    expect(parseBody(response.body)).toEqual(expectedOutput);
  });

  // session is not on this question yet
  test('Session is NOT currently on this question', () => {
    const updateStatus3 = request(
      'PUT',
      `${url}:${port}/v1/admin/quiz/${quizId}/session/${sessionId}`,
      {
        headers: {
          token: userId
        },
        json: {
          action: 'GO_TO_ANSWER'
        },
        timeout: 100
      }
    );
    expect(updateStatus3.statusCode).toBe(200);

    // Initial check to confirm the session is on the first question
    const response = requestQuizQuestionResult(playerId, 1);
    expect(response.statusCode).toBe(200);

    requestUpdateState(quizId, sessionId, userId, AdminAction.NEXT_QUESTION);
    const update = requestSessionStatus(quizId, sessionId, userId);
    const countdown = JSON.parse(update.body as string);
    expect(countdown.state).toBe(SessionState.QUESTION_COUNTDOWN);

    requestUpdateState(quizId, sessionId, userId, AdminAction.SKIP_COUNTDOWN);
    const toOpen = requestSessionStatus(quizId, sessionId, userId);
    const open = JSON.parse(toOpen.body as string);
    expect(open.state).toBe(SessionState.QUESTION_OPEN);

    requestUpdateState(quizId, sessionId, userId, AdminAction.GO_TO_ANSWER);
    const toAnswer = requestSessionStatus(quizId, sessionId, userId);
    const answer = JSON.parse(toAnswer.body as string);
    expect(answer.state).toBe(SessionState.ANSWER_SHOW);

    // Check that requesting information for the first question now returns an error
    const responseAfterUpdate = requestQuizQuestionResult(playerId, 1);
    expect(responseAfterUpdate.statusCode).toBe(400);
    expect(parseBody(responseAfterUpdate.body)).toEqual(ERROR);
  });

  // Session is not in ANSWER_SHOW state
  test('Session is not in ANSWER_SHOW state', () => {
    const response = requestQuizQuestionResult(playerId, 1);
    expect(response.statusCode).toBe(400);
    expect(parseBody(response.body)).toEqual(ERROR);
  });
});

// ====================================================================
//  =========================== V2 ROUTES ============================
// ====================================================================

function requestQuizCreateV2(token: string, name: string, description: string) {
  const res = request(
    'POST',
        `${url}:${port}/v2/admin/quiz`,
        {
          headers: {
            token: token
          },
          json: {
            name: name,
            description: description,
          }
        }
  );

  return JSON.parse(res.body.toString());
}

describe('adminQuizCreate tests', () => {
  let userId: string;
  beforeEach(() => {
    requestClear();
    const user = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    userId = user.token;
  });

  test.each([
    ['', quizName, quizDescription],
    ['-1', quizName, quizDescription]
  ])("error: invalid user Id ('$userId', '$name', '$description')",
    (authUserId, name, description) => {
      expect(requestQuizCreateV2(authUserId, name, description)).toEqual(ERROR);
    });

  test.each([
    [userId, '!@#$%^&*', quizDescription],
    [userId, 'quiz-name', quizDescription],
    [userId, 'quiz (new_2023)', quizDescription]
  ])("error: quiz name contains symbols ('$userId', '$name', '$description')",
    (authUserId, name, description) => {
      authUserId = userId;
      expect(requestQuizCreateV2(authUserId, name, description)).toEqual(ERROR);
    });

  test.each([
    [userId, '', quizDescription],
    [userId, 'MQ', quizDescription],
    [userId, 'This name is over 30 characters long', quizDescription]
  ])("error: quiz name is not 3 - 30 characters long ('$userId', '$name', '$description')",
    (authUserId, name, description) => {
      authUserId = userId;
      expect(requestQuizCreateV2(authUserId, name, description)).toEqual(ERROR);
    });

  test('error: quiz name is already in use', () => {
    requestQuizCreate(userId, quizName, quizDescription);
    expect(requestQuizCreateV2(userId, quizName, quizDescription)).toEqual(ERROR);
  });

  test('error: quiz description has more than 100 characters', () => {
    expect(requestQuizCreateV2(userId, quizName, longDescription)).toEqual(ERROR);
  });

  test('Valid test', () => {
    expect(requestQuizCreateV2(userId, quizName, quizDescription)).toEqual({ quizId: expect.any(Number) });
  });
});

// Trash view V2
describe('HTTP tests for /v2/admin/quiz/trash', () => {
  let userId1: string;
  let quizId1: number;
  beforeEach(() => {
    requestClear();
    const user1 = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    userId1 = user1.token;
    const quiz1 = requestQuizCreateV2(userId1, 'newQuiz', 'newDescription');
    quizId1 = quiz1.quizId;
    requestQuizRemove(userId1, quizId1);
  });

  test('Test successful trash view', () => {
    const res = request(
      'GET',
          `${url}:${port}/v2/admin/quiz/trash`,
          {
            headers: {
              token: userId1,
            },
            timeout: 100
          }
    );

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual({ quizzes: expect.any(Array) });
  });
  test('Test successful trash view with multiple quizzes', () => {
    const quiz2 = requestQuizCreate(userId1, 'dsfsdf', 'newDescription');
    const quizId2 = quiz2.quizId;
    requestQuizRemove(userId1, quizId2);
    const res = request(
      'GET',
          `${url}:${port}/v2/admin/quiz/trash`,
          {
            headers: {
              token: userId1,
            },
            timeout: 100
          }
    );

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual({ quizzes: expect.any(Array) });
  });

  test.each([
    ['Invalid'],
    [''],
    ['0.5']
  ])('Test trash view error - 401 - invalid token', (invalidToken) => {
    const res = request(
      'GET',
            `${url}:${port}/v2/admin/quiz/trash`,
            {
              headers: {
                token: invalidToken,
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(401);
    expect(bodyObj).toEqual(ERROR);
  });
});

// quizRestoreV2
describe('HTTP tests for /v1/admin/quiz/:quizid/restore', () => {
  let userId1: string;
  let quizId1: number;
  let quizId2: number;
  beforeEach(() => {
    requestClear();
    const user1 = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    userId1 = user1.token;
    const quiz1 = requestQuizCreateV2(userId1, 'newQuiz', 'newDescription');
    const quiz2 = requestQuizCreateV2(userId1, 'anotherQuiz', 'newDescription');
    quizId1 = quiz1.quizId;
    quizId2 = quiz2.quizId;
    requestQuizRemove(userId1, quizId1);
  });

  test('Test successful trash restore', () => {
    const res = request(
      'POST',
            `${url}:${port}/v2/admin/quiz/${quizId1}/restore`,
            {
              headers: {
                token: userId1,
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual({});
  });

  test('Test trash view error - 400 - quiz not in trash', () => {
    const res = request(
      'POST',
            `${url}:${port}/v2/admin/quiz/${quizId2}/restore`,
            {
              headers: {
                token: userId1,
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toEqual(ERROR);
  });
  test('Test trash view error - 400 - active quiz name', () => {
    requestQuizCreate(userId1, 'newQuiz', 'Active quiz name in use');
    const res = request(
      'POST',
            `${url}:${port}/v2/admin/quiz/${quizId1}/restore`,
            {
              headers: {
                token: userId1,
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toEqual(ERROR);
  });
  test.each([
    ['Invalid'],
    [''],
    ['5']
  ])('Test trash view error - 401 - Invalid token', (invalidToken) => {
    const res = request(
      'POST',
            `${url}:${port}/v2/admin/quiz/${quizId1}/restore`,
            {
              headers: {
                token: invalidToken,
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(401);
    expect(bodyObj).toEqual(ERROR);
  });
  test('Test trash view error - 403 - User does not own quiz', () => {
    const user2 = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    const userId2 = user2.token;
    const quizId4 = requestQuizCreate(userId2, 'quiz', 'another user').quizId;

    const res = request(
      'POST',
            `${url}:${port}/v2/admin/quiz/${quizId4}/restore`,
            {
              headers: {
                token: userId1,
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj).toEqual(ERROR);
  });
});

// Tests for emptying trash V2
describe('HTTP tests for /v2/admin/quiz/trash/empty', () => {
  let userId1: string;
  let quizId1: number;
  let quizId2: number;
  beforeEach(() => {
    requestClear();
    const user1 = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    userId1 = user1.token;
    const quiz1 = requestQuizCreateV2(userId1, 'newQuiz', 'newDescription');
    const quiz2 = requestQuizCreateV2(userId1, 'anotherQuiz', 'newDescription');
    quizId1 = quiz1.quizId;
    quizId2 = quiz2.quizId;
    requestQuizRemove(userId1, quizId1);
    requestQuizRemove(userId1, quizId2);
  });

  test('Test successful trash emptying - single', () => {
    const quizzes = `[${quizId1}, ${quizId2}]`;
    let res = request(
      'DELETE',
            `${url}:${port}/v2/admin/quiz/trash/empty`,
            {
              headers: {
                token: userId1
              },
              qs: {
                quizIds: quizzes,
              },
              timeout: 100
            }
    );
    let bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual({ });
    res = request(
      'GET',
          `${url}:${port}/v2/admin/quiz/trash`,
          {
            headers: {
              token: userId1,
            },
            timeout: 100
          }
    );

    bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual({ quizzes: [] });
  });
  test('Test successful trash emptying - multiple', () => {
    const quizzes = `[${quizId1}, ${quizId2}]`;
    const res = request(
      'DELETE',
            `${url}:${port}/v2/admin/quiz/trash/empty`,
            {
              headers: {
                token: userId1,
              },
              qs: {
                quizIds: quizzes,
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual({ });
  });

  test('Test trash view error - 400 - Quiz not in trash', () => {
    const quiz3 = requestQuizCreate(userId1, 'quiz', 'newDescription');
    const quizId3 = quiz3.quizId;
    const quizzes = `[${quizId1}, ${quizId2}, ${quizId3}]`;
    const res = request(
      'DELETE',
            `${url}:${port}/v2/admin/quiz/trash/empty`,
            {
              headers: {
                token: userId1
              },
              qs: {
                quizIds: quizzes
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toEqual(ERROR);
  });

  test('Test trash view error - 401 - Invalid token', () => {
    const quizzes = `[${quizId1}]`;
    const res = request(
      'DELETE',
            `${url}:${port}/v2/admin/quiz/trash/empty`,
            {
              headers: {
                token: 'userId1'
              },
              qs: {
                quizIds: quizzes
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(401);
    expect(bodyObj).toEqual(ERROR);
  });
  test('Test trash view error - 403 - Quiz is not owned by user', () => {
    const user2 = requestRegister(validEmail1, validPassword1, validNameFirst1, validNameLast1);
    const userId2 = user2.token;
    const quiz3 = requestQuizCreateV2(userId2, 'quiz', 'newDescription');
    const quizId3 = quiz3.quizId;
    const quizzes = `[${quizId1}, ${quizId2}, ${quizId3}]`;
    const res = request(
      'DELETE',
            `${url}:${port}/v2/admin/quiz/trash/empty`,
            {
              headers: {
                token: userId1,
              },
              qs: {
                quizIds: quizzes
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj).toEqual(ERROR);
  });
});

// adminQuizQuestionUpdate
describe('HTTP tests for /v2/admin/quiz/:quizid/question/:questionid', () => {
  let userId1: string;
  let userId2: string;
  let quizId1: number;
  let quizId2: number;
  let questionId1: number;
  beforeEach(() => {
    requestClear();
    const user1 = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    userId1 = user1.token;
    const user2 = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    userId2 = user2.token;
    const quiz1 = requestQuizCreateV2(userId1, 'newQuiz', 'newDescription');
    quizId1 = quiz1.quizId;
    const quiz2 = requestQuizCreateV2(userId2, 'newQuiz', 'newDescription');
    quizId2 = quiz2.quizId;
    const questionBody: QuestionBodyV2 = {
      question: 'Valid question here?',
      duration: 3,
      points: 5,
      answers: [
        { answer: 'Answer 1', correct: true },
        { answer: 'Answer 2', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };
    const res = requestQuizQuestionCreate(userId1, questionBody, quizId1);
    const question = (parseBody(res.body));
    questionId1 = question.questionId;
  });
  test('Test successful question update', () => {
    const res = request(
      'PUT',
            `${url}:${port}/v2/admin/quiz/${quizId1}/question/${questionId1}`,
            {
              headers: {
                token: userId1,
              },
              json: {
                questionBody: {
                  question: 'Updated question?',
                  duration: 2,
                  points: 2,
                  answers: [
                    { answer: 'Answer 1', correct: false },
                    { answer: 'Answer 2', correct: true }
                  ],
                  thumbnailUrl: 'http://google.com/some/image/path.jpg'
                }
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual({});
  });

  test('Invalid question Id - not in quiz', () => {
    const res = request(
      'PUT',
            `${url}:${port}/v2/admin/quiz/${quizId1}/question/${questionId1 + 1}`,
            {
              headers: {
                token: userId1,
              },
              json: {
                questionBody: {
                  question: 'Updated question?',
                  duration: 2,
                  points: 2,
                  answers: [
                    { answer: 'Answer 1', correct: false },
                    { answer: 'Answer 2', correct: true }
                  ],
                  thumbnailUrl: 'http://google.com/some/image/path.jpg'
                }
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toEqual(ERROR);
  });

  test.each([
    ['1234'],
    ['1'],
    [''],
    ['thisIsLongerThan50CharactersAndWillReturnAnErrorForThat']
  ])('Invalid question Id - too short or too long', (invalidQuestion) => {
    const res = request(
      'PUT',
            `${url}:${port}/v2/admin/quiz/${quizId1}/question/${questionId1}`,
            {
              headers: {
                token: userId1,
              },
              json: {
                questionBody: {
                  question: invalidQuestion,
                  duration: 2,
                  points: 2,
                  answers: [
                    { answer: 'Answer 1', correct: false },
                    { answer: 'Answer 2', correct: true }
                  ],
                  thumbnailUrl: 'http://google.com/some/image/path.jpg'
                }
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toEqual(ERROR);
  });

  test.each([
    [
      { answer: 'Answer 1', correct: false },
    ],
    [
      { answer: 'Answer 1', correct: false },
      { answer: 'Answer 2', correct: true },
      { answer: 'Answer 3', correct: false },
      { answer: 'Answer 4', correct: true },
      { answer: 'Answer 5', correct: false },
      { answer: 'Answer 6', correct: true }
    ],

  ])('Invalid answer count', (invalidAnswers) => {
    const res = request(
      'PUT',
            `${url}:${port}/v2/admin/quiz/${quizId1}/question/${questionId1}`,
            {
              headers: {
                token: userId1,
              },
              json: {
                questionBody: {
                  question: 'Updated question?',
                  duration: 2,
                  points: 2,
                  answers: [invalidAnswers],
                  thumbnailUrl: 'http://google.com/some/image/path.jpg'
                }
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toEqual(ERROR);
  });

  test.each([
    [-1],
    [-2],
    [-10000],
    [500],
    [180]
  ])('Invalid question duration - Negative or over 180 seconds', (invalidDuration) => {
    const res = request(
      'PUT',
            `${url}:${port}/v2/admin/quiz/${quizId1}/question/${questionId1}`,
            {
              headers: {
                token: userId1,
              },
              json: {
                questionBody: {
                  question: 'Updated question?',
                  duration: invalidDuration,
                  points: 2,
                  answers: [
                    { answer: 'Answer 1', correct: false },
                    { answer: 'Answer 2', correct: true }
                  ],
                  thumbnailUrl: 'http://google.com/some/image/path.jpg'
                }
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toEqual(ERROR);
  });

  test.each([
    [0],
    [-1],
    [11],
    [20]
  ])('Invalid points - less than 1 or more than 10', (invalidpoints) => {
    const res = request(
      'PUT',
            `${url}:${port}/v2/admin/quiz/${quizId1}/question/${questionId1}`,
            {
              headers: {
                token: userId1,
              },
              json: {
                questionBody: {
                  question: 'Updated question?',
                  duration: 50,
                  points: invalidpoints,
                  answers: [
                    { answer: 'Answer 1', correct: false },
                    { answer: 'Answer 2', correct: true }
                  ],
                  thumbnailUrl: 'http://google.com/some/image/path.jpg'
                }
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toEqual(ERROR);
  });

  test.each([
    ['', false, 'Answer 2', true],
    ['Answer 1 is extra long for this test', false, 'Answer 2', true],
    ['Answer 1', false, 'Answer 1', true],
  ])('Invalid answer - too short or too long or duplicate answer', (input, correctness, input2, correctness2) => {
    const res = request(
      'PUT',
            `${url}:${port}/v2/admin/quiz/${quizId1}/question/${questionId1}`,
            {
              headers: {
                token: userId1,
              },
              json: {
                questionBody: {
                  question: 'Updated question?',
                  duration: 2,
                  points: 2,
                  answers: [
                    { answer: input, correct: correctness },
                    { answer: input2, correct: correctness2 }
                  ],
                  thumbnailUrl: 'http://google.com/some/image/path.jpg'
                }
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toEqual(ERROR);
  });

  test('Invalid answer - too short or too long or duplicate answer', () => {
    const res = request(
      'PUT',
            `${url}:${port}/v2/admin/quiz/${quizId1}/question/${questionId1}`,
            {
              headers: {
                token: userId1,
              },
              json: {
                questionBody: {
                  question: 'Updated question?',
                  duration: 2,
                  points: 2,
                  answers: [
                    { answer: 'Answer 1', correct: false },
                    { answer: 'Answer 2', correct: false },
                  ],
                  thumbnailUrl: 'http://google.com/some/image/path.jpg'
                }
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toEqual(ERROR);
  });

  test.each([
    [''],
    // ['doesnt return a valid file'],
    // ['not jpg or png'],

  ])('Invalid answer - too short or too long or duplicate answer', (invalidUrl) => {
    const res = request(
      'PUT',
            `${url}:${port}/v2/admin/quiz/${quizId1}/question/${questionId1}`,
            {
              headers: {
                token: userId1,
              },
              json: {
                questionBody: {
                  question: 'Updated question?',
                  duration: 2,
                  points: 2,
                  answers: [
                    { answer: 'Answer 1', correct: false },
                    { answer: 'Answer 2', correct: true },
                  ],
                  thumbnailUrl: invalidUrl
                }
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toEqual(ERROR);
  });

  test('Invalid token', () => {
    const res = request(
      'PUT',
            `${url}:${port}/v2/admin/quiz/${quizId1}/question/${questionId1}`,
            {
              headers: {
                token: userId1 + 1,
              },
              json: {
                questionBody: {
                  question: 'Updated question?',
                  duration: 2,
                  points: 2,
                  answers: [
                    { answer: 'Answer 1', correct: false },
                    { answer: 'Answer 2', correct: true }
                  ],
                  thumbnailUrl: 'http://google.com/some/image/path.jpg'
                }
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(401);
    expect(bodyObj).toEqual(ERROR);
  });

  test('Quiz doesnt belong to user', () => {
    const res = request(
      'PUT',
            `${url}:${port}/v2/admin/quiz/${quizId2}/question/${questionId1}`,
            {
              headers: {
                token: userId1,
              },
              json: {
                questionBody: {
                  question: 'Updated question?',
                  duration: 2,
                  points: 2,
                  answers: [
                    { answer: 'Answer 1', correct: false },
                    { answer: 'Answer 2', correct: true }
                  ],
                  thumbnailUrl: 'http://google.com/some/image/path.jpg'
                }
              },
              timeout: 100
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj).toEqual(ERROR);
  });
});

// tests for deleting a quiz question (v2)
describe('adminQuizQuestionDelete tests for v2 route', () => {
  let user1Id: string;
  let user2Id: string;
  let quiz1Id: number;
  let quiz2Id: number;
  let question1Id: number;
  let question2Id: number;

  beforeEach(() => {
    requestClear();
    const user1 = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    const user2 = requestRegister(validEmail1, validPassword1, validNameFirst1, validNameLast1);
    user1Id = user1.token;
    user2Id = user2.token;
    const quiz1 = requestQuizCreate(user1.token, 'Quiz1', 'Description1');
    const quiz2 = requestQuizCreate(user2.token, 'Quiz2', 'Description2');
    quiz1Id = quiz1.quizId;
    quiz2Id = quiz2.quizId;
    const questionBody1 = {
      question: 'Valid question here?',
      duration: 3,
      points: 5,
      answers: [
        { answer: 'Answer 1', correct: true },
        { answer: 'Answer 2', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };
    const questionBody2 = {
      question: 'Valid question here2?',
      duration: 3,
      points: 5,
      answers: [
        { answer: 'Answer 3', correct: true },
        { answer: 'Answer 4', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };
    const question1 = parseBody(requestQuizQuestionCreate(user1Id, questionBody1, quiz1Id).body);
    const question2 = parseBody(requestQuizQuestionCreate(user2Id, questionBody2, quiz2Id).body);
    question1Id = question1.questionId;
    question2Id = question2.questionId;
  });

  test('Successfully removed quiz question', () => {
    const response = requestQuizQuestionDeleteV2(quiz1Id, question1Id, user1Id);
    expect(response.statusCode).toBe(200);
    expect(parseBody(response.body)).toEqual({});
  });

  // Tests for questionId does not refer to a valid question within this quiz
  test('invalid questionId (not in the quiz)', () => {
    const result1 = requestQuizQuestionDeleteV2(quiz1Id, question2Id, user1Id);
    const result2 = requestQuizQuestionDeleteV2(quiz2Id, question1Id, user2Id);
    expect(result1.statusCode).toBe(400);
    expect(result2.statusCode).toBe(400);
    expect(parseBody(result1.body)).toEqual(ERROR);
    expect(parseBody(result2.body)).toEqual(ERROR);
  });

  // Tests for user is not an owner of this quiz
  test('invalid quizId (not owned by authUserId)', () => {
    const result1 = requestQuizQuestionDeleteV2(quiz1Id, question1Id, user2Id);
    const result2 = requestQuizQuestionDeleteV2(quiz2Id, question2Id, user1Id);
    expect(result1.statusCode).toBe(403);
    expect(result2.statusCode).toBe(403);
    expect(parseBody(result1.body)).toEqual(ERROR);
    expect(parseBody(result2.body)).toEqual(ERROR);
  });

  test('Invalid token', () => {
    const result1 = requestQuizQuestionDeleteV2(quiz1Id, question1Id, '');
    const result2 = requestQuizQuestionDeleteV2(quiz2Id, question2Id, '-1');
    expect(result1.statusCode).toBe(401);
    expect(result2.statusCode).toBe(401);
    expect(parseBody(result1.body)).toEqual(ERROR);
    expect(parseBody(result2.body)).toEqual(ERROR);
  });
});

// Tests for duplicating a quiz question (v2)
describe('adminQuizQuestionDuplicate tests for V2 route', () => {
  let userId1: string;
  let userId2: string;
  let quizId1: number;
  let quizId2: number;
  let questionId1: number;
  let questionId2: number;
  beforeEach(() => {
    requestClear();
    const user1 = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    userId1 = user1.token;
    const user2 = requestRegister(validEmail1, validPassword1, validNameFirst1, validNameLast1);
    userId2 = user2.token;
    const quiz1 = requestQuizCreate(userId1, 'newQuiz', 'newDescription');
    quizId1 = quiz1.quizId;
    const quiz2 = requestQuizCreate(userId2, 'newQuiz', 'newDescription');
    quizId2 = quiz2.quizId;
    const questionBody1: QuestionBody = {
      question: 'Valid question here?',
      duration: 3,
      points: 5,
      answers: [
        { answer: 'Answer 1', correct: true },
        { answer: 'Answer 2', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };
    const questionBody2 = {
      question: 'Valid question here2?',
      duration: 3,
      points: 5,
      answers: [
        { answer: 'Answer 3', correct: true },
        { answer: 'Answer 4', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };
    const res1 = requestQuizQuestionCreate(userId1, questionBody1, quizId1);
    const question1 = (parseBody(res1.body));
    questionId1 = question1.questionId;
    const res2 = requestQuizQuestionCreate(userId2, questionBody2, quizId2);
    const question2 = (parseBody(res2.body));
    questionId2 = question2.questionId;
  });

  test('Successfully duplicate a question', () => {
    const response = requestQuizQuestionDuplicateV2(quizId1, questionId1, userId1);
    expect(response.statusCode).toBe(200);
    expect(parseBody(response.body)).toEqual({ newQuestionId: expect.any(Number) });
  });

  test('QuestionId does not refer to a valid question within this quiz', () => {
    const result1 = requestQuizQuestionDuplicateV2(quizId1, questionId2, userId1);
    const result2 = requestQuizQuestionDuplicateV2(quizId2, questionId1, userId2);
    expect(result1.statusCode).toBe(400);
    expect(result2.statusCode).toBe(400);
    expect(parseBody(result1.body)).toEqual(ERROR);
    expect(parseBody(result2.body)).toEqual(ERROR);
  });

  test('Token is empty or invalid', () => {
    const result1 = requestQuizQuestionDuplicateV2(quizId1, questionId1, '');
    const result2 = requestQuizQuestionDuplicateV2(quizId2, questionId2, '-1');
    expect(result1.statusCode).toBe(401);
    expect(result2.statusCode).toBe(401);
    expect(parseBody(result1.body)).toEqual(ERROR);
    expect(parseBody(result2.body)).toEqual(ERROR);
  });

  test('User is not an owner of this quiz', () => {
    const result1 = requestQuizQuestionDuplicateV2(quizId1, questionId1, userId2);
    const result2 = requestQuizQuestionDuplicateV2(quizId2, questionId2, userId1);
    expect(result1.statusCode).toBe(403);
    expect(result2.statusCode).toBe(403);
    expect(parseBody(result1.body)).toEqual(ERROR);
    expect(parseBody(result2.body)).toEqual(ERROR);
  });
});

describe('HTTP tests for adminSessionStart', () => {
  let userId: string;
  let user2Id: string;
  let quizId: number;
  let quiz2Id: number;
  beforeEach(() => {
    requestClear();
    const user = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    userId = user.token;
    const user2 = requestRegister(validEmail1, validPassword1, validNameFirst1, validNameLast1);
    user2Id = user2.token;
    const quiz = requestQuizCreate(userId, 'newQuiz', 'newDescription');
    quizId = quiz.quizId;
    const quiz2 = requestQuizCreate(user2Id, 'anotherQuiz', 'anotherDescription');
    quiz2Id = quiz2.quizId;
    requestQuizQuestionCreate(userId, questionBody, quizId);
  });

  test('Successfully starts a session', () => {
    const res = request(
      'POST',
        `${url}:${port}/v1/admin/quiz/${quizId}/session/start`,
        {
          headers: {
            token: userId
          },
          json: {
            autoStartNum: 3
          },
          timeout: 100
        }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(200);
    expect(bodyObj).toEqual({ sessionId: expect.any(Number) });
  });

  test('autoStartNum is greater than 50', () => {
    const res = request(
      'POST',
        `${url}:${port}/v1/admin/quiz/${quizId}/session/start`,
        {
          headers: {
            token: userId
          },
          json: {
            autoStartNum: 52
          },
          timeout: 100
        }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toEqual(ERROR);
  });

  test('Too many sessions', () => {
    for (let i = 0; i < MAX_SESSIONS; i++) {
      requestSessionStart(quizId, userId, 3);
    }
    const res = request(
      'POST',
        `${url}:${port}/v1/admin/quiz/${quizId}/session/start`,
        {
          headers: {
            token: userId
          },
          json: {
            autoStartNum: 3
          },
          timeout: 100
        }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toEqual(ERROR);
  });

  test('Quiz does not have any questions', () => {
    const res = request(
      'POST',
        `${url}:${port}/v1/admin/quiz/${quiz2Id}/session/start`,
        {
          headers: {
            token: user2Id
          },
          json: {
            autoStartNum: 3
          },
          timeout: 100
        }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toEqual(ERROR);
  });

  test.each([
    [''],
    ['-1']
  ])('Invalid tokens', (token) => {
    const res = request(
      'POST',
        `${url}:${port}/v1/admin/quiz/${quizId}/session/start`,
        {
          headers: {
            token: token
          },
          json: {
            autoStartNum: 3
          },
          timeout: 100
        }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(401);
    expect(bodyObj).toEqual(ERROR);
  });

  test('Valid token but user is not the owner', () => {
    const res = request(
      'POST',
        `${url}:${port}/v1/admin/quiz/${quiz2Id}/session/start`,
        {
          headers: {
            token: userId
          },
          json: {
            autoStartNum: 3
          },
          timeout: 100
        }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj).toEqual(ERROR);
  });
});

describe('HTTP tests for adminViewSessions', () => {
  let userId: string;
  let user2Id: string;
  let quizId: number;
  let sessionId: number;
  beforeEach(() => {
    requestClear();
    const user = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    userId = user.token;
    const user2 = requestRegister(validEmail1, validPassword1, validNameFirst1, validNameLast1);
    user2Id = user2.token;
    const quiz = requestQuizCreate(userId, 'newQuiz', 'newDescription');
    quizId = quiz.quizId;
    requestQuizQuestionCreate(userId, questionBody, quizId);
    const session = requestSessionStart(quizId, userId, 3);
    sessionId = session.sessionId;
    requestSessionStart(quizId, userId, 3);
    requestSessionStart(quizId, userId, 3);
    requestSessionStart(quizId, userId, 3);
  });

  test('Successfully retrieves session IDs', () => {
    requestUpdateState(quizId, sessionId, userId, AdminAction.END);
    const inactiveSession = requestSessionStatus(quizId, sessionId, userId);
    const inactive = JSON.parse(inactiveSession.body as string);
    expect(inactive.state).toBe(SessionState.END);
    const res = request(
      'GET',
        `${url}:${port}/v1/admin/quiz/${quizId}/sessions`,
        {
          headers: {
            token: userId
          },
          timeout: 100
        }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(200);
    expect(bodyObj).toEqual({ activeSessions: expect.any(Object), inactiveSessions: expect.any(Object) });
  });

  test.each([
    [''],
    ['-1']
  ])('Invalid tokens', (token) => {
    const res = request(
      'GET',
        `${url}:${port}/v1/admin/quiz/${quizId}/sessions`,
        {
          headers: {
            token: token
          },
          timeout: 100
        }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(401);
    expect(bodyObj).toEqual(ERROR);
  });

  test('Valid token but user is not the owner', () => {
    const res = request(
      'GET',
        `${url}:${port}/v1/admin/quiz/${quizId}/sessions`,
        {
          headers: {
            token: user2Id
          },
          timeout: 100
        }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj).toEqual(ERROR);
  });
});

describe('HTTP tests for adminUpdateSessionState', () => {
  let userId: string;
  let user2Id: string;
  let quizId: number;
  let sessionId: number;
  beforeEach(() => {
    requestClear();
    const user = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    userId = user.token;
    const user2 = requestRegister(validEmail1, validPassword1, validNameFirst1, validNameLast1);
    user2Id = user2.token;
    const quiz = requestQuizCreate(userId, 'newQuiz', 'newDescription');
    quizId = quiz.quizId;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const question = requestQuizQuestionCreate(userId, questionBody, quizId);
    const session = requestSessionStart(quizId, userId, 3);
    sessionId = session.sessionId;
  });

  test('Successfully updates session state', () => {
    const res = request(
      'PUT',
        `${url}:${port}/v1/admin/quiz/${quizId}/session/${sessionId}`,
        {
          headers: {
            token: userId
          },
          json: {
            action: 'END'
          },
          timeout: 100
        }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(200);
    expect(bodyObj).toEqual({});
  });

  test('State goes from countdown to open', () => {
    requestUpdateState(quizId, sessionId, userId, AdminAction.NEXT_QUESTION);
    const initialSession = requestSessionStatus(quizId, sessionId, userId);
    const initial = JSON.parse(initialSession.body as string);
    expect(initial.state).toBe(SessionState.QUESTION_COUNTDOWN);
    sleep(3000);
    const updatedSession = requestSessionStatus(quizId, sessionId, userId);
    const updated = JSON.parse(updatedSession.body as string);
    expect(updated.state).toBe(SessionState.QUESTION_OPEN);
  });

  test('State goes from open to closed after question duration', () => {
    requestUpdateState(quizId, sessionId, userId, AdminAction.NEXT_QUESTION);
    const lobbyToCountdown = requestSessionStatus(quizId, sessionId, userId);
    const atCountdown = JSON.parse(lobbyToCountdown.body as string);
    expect(atCountdown.state).toBe(SessionState.QUESTION_COUNTDOWN);

    requestUpdateState(quizId, sessionId, userId, AdminAction.SKIP_COUNTDOWN);
    const countdownToOpen = requestSessionStatus(quizId, sessionId, userId);
    const atOpen = JSON.parse(countdownToOpen.body as string);
    expect(atOpen.state).toBe(SessionState.QUESTION_OPEN);

    const questionDuration = questionBody.duration;
    sleep(questionDuration * MS_PER_SEC);

    const durationOver = requestSessionStatus(quizId, sessionId, userId);
    const close = JSON.parse(durationOver.body as string);
    expect(close.state).toBe(SessionState.QUESTION_CLOSE);
  });

  test('state going from lobby to answer show and then end.', () => {
    requestUpdateState(quizId, sessionId, userId, AdminAction.NEXT_QUESTION);
    const lobbyToCountdown = requestSessionStatus(quizId, sessionId, userId);
    const atCountdown = JSON.parse(lobbyToCountdown.body as string);
    expect(atCountdown.state).toBe(SessionState.QUESTION_COUNTDOWN);

    requestUpdateState(quizId, sessionId, userId, AdminAction.SKIP_COUNTDOWN);
    const countdownToOpen = requestSessionStatus(quizId, sessionId, userId);
    const atOpen = JSON.parse(countdownToOpen.body as string);
    expect(atOpen.state).toBe(SessionState.QUESTION_OPEN);

    requestUpdateState(quizId, sessionId, userId, AdminAction.GO_TO_ANSWER);
    const openToAnswer = requestSessionStatus(quizId, sessionId, userId);
    const atAnswer = JSON.parse(openToAnswer.body as string);
    expect(atAnswer.state).toBe(SessionState.ANSWER_SHOW);

    requestUpdateState(quizId, sessionId, userId, AdminAction.END);
    const answerToEnd = requestSessionStatus(quizId, sessionId, userId);
    const atEnd = JSON.parse(answerToEnd.body as string);
    expect(atEnd.state).toBe(SessionState.END);
  });

  test.each([
    ['GO_TO_ANSWER', 'ANSWER_SHOW'],
    ['GO_TO_FINAL_RESULTS', 'FINAL_RESULTS'],
    ['END', 'END'],
    ['NEXT_QUESTION', 'QUESTION_COUNTDOWN']
  ])('closed state can use other actions', (action, state) => {
    requestUpdateState(quizId, sessionId, userId, AdminAction.NEXT_QUESTION);
    const lobbyToCountdown = requestSessionStatus(quizId, sessionId, userId);
    const atCountdown = JSON.parse(lobbyToCountdown.body as string);
    expect(atCountdown.state).toBe(SessionState.QUESTION_COUNTDOWN);

    requestUpdateState(quizId, sessionId, userId, AdminAction.SKIP_COUNTDOWN);
    const countdownToOpen = requestSessionStatus(quizId, sessionId, userId);
    const atOpen = JSON.parse(countdownToOpen.body as string);
    expect(atOpen.state).toBe(SessionState.QUESTION_OPEN);

    const questionDuration = questionBody.duration;
    sleep(questionDuration * MS_PER_SEC);

    const durationOver = requestSessionStatus(quizId, sessionId, userId);
    const close = JSON.parse(durationOver.body as string);
    expect(close.state).toBe(SessionState.QUESTION_CLOSE);

    const actionEnum = action as keyof typeof AdminAction;
    const stateEnum = state as keyof typeof SessionState;

    requestUpdateState(quizId, sessionId, userId, AdminAction[actionEnum]);
    const response = requestSessionStatus(quizId, sessionId, userId);
    const result = JSON.parse(response.body as string);
    expect(result.state).toBe(SessionState[stateEnum]);
  });

  test('testing if final results can go to end', () => {
    requestUpdateState(quizId, sessionId, userId, AdminAction.NEXT_QUESTION);
    const lobbyToCountdown = requestSessionStatus(quizId, sessionId, userId);
    const atCountdown = JSON.parse(lobbyToCountdown.body as string);
    expect(atCountdown.state).toBe(SessionState.QUESTION_COUNTDOWN);

    requestUpdateState(quizId, sessionId, userId, AdminAction.SKIP_COUNTDOWN);
    const countdownToOpen = requestSessionStatus(quizId, sessionId, userId);
    const atOpen = JSON.parse(countdownToOpen.body as string);
    expect(atOpen.state).toBe(SessionState.QUESTION_OPEN);

    requestUpdateState(quizId, sessionId, userId, AdminAction.GO_TO_ANSWER);
    const openToAnswer = requestSessionStatus(quizId, sessionId, userId);
    const atAnswer = JSON.parse(openToAnswer.body as string);
    expect(atAnswer.state).toBe(SessionState.ANSWER_SHOW);

    requestUpdateState(quizId, sessionId, userId, AdminAction.GO_TO_FINAL_RESULTS);
    const answerToFinal = requestSessionStatus(quizId, sessionId, userId);
    const atFinal = JSON.parse(answerToFinal.body as string);
    expect(atFinal.state).toBe(SessionState.FINAL_RESULTS);

    requestUpdateState(quizId, sessionId, userId, AdminAction.END);
    const finalToEnd = requestSessionStatus(quizId, sessionId, userId);
    const atEnd = JSON.parse(finalToEnd.body as string);
    expect(atEnd.state).toBe(SessionState.END);
  });

  test('no actions at end state', () => {
    requestUpdateState(quizId, sessionId, userId, AdminAction.END);
    const lobbyToEnd = requestSessionStatus(quizId, sessionId, userId);
    const atEnd = JSON.parse(lobbyToEnd.body as string);
    expect(atEnd.state).toBe(SessionState.END);

    const invalid = requestUpdateState(quizId, sessionId, userId, AdminAction.NEXT_QUESTION);
    expect(invalid).toStrictEqual(ERROR);
  });

  test('not an action', () => {
    const action = 'GO_TO_HOME' as unknown as AdminAction;
    const invalid = requestUpdateState(quizId, sessionId, userId, action);
    expect(invalid).toStrictEqual(ERROR);
  });

  test('Invalid sessionId', () => {
    const res = request(
      'PUT',
      `${url}:${port}/v1/admin/quiz/${quizId}/session/-1`,
      {
        headers: {
          token: userId
        },
        json: {
          action: 'NEXT_QUESTION'
        },
        timeout: 100
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toEqual(ERROR);
  });

  test('Action is not a valid action enum', () => {
    const res = request(
      'PUT',
      `${url}:${port}/v1/admin/quiz/${quizId}/session/${sessionId}`,
      {
        headers: {
          token: userId
        },
        json: {
          action: 'INVALID_ACTION'
        },
        timeout: 100
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toEqual(ERROR);
  });

  test('Action enum cannot be applied in current state', () => {
    const res = request(
      'PUT',
        `${url}:${port}/v1/admin/quiz/${quizId}/session/${sessionId}`,
        {
          headers: {
            token: userId
          },
          json: {
            action: 'SKIP_COUNTDOWN'
          },
          timeout: 100
        }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(bodyObj).toEqual(ERROR);
  });

  test.each([
    [''],
    ['-1']
  ])('Invalid tokens', (token) => {
    const res = request(
      'PUT',
        `${url}:${port}/v1/admin/quiz/${quizId}/session/${sessionId}`,
        {
          headers: {
            token: token
          },
          json: {
            action: 'NEXT_QUESTION'
          },
          timeout: 100
        }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(401);
    expect(bodyObj).toEqual(ERROR);
  });

  test('Valid token but user is not the owner', () => {
    const res = request(
      'PUT',
        `${url}:${port}/v1/admin/quiz/${quizId}/session/${sessionId}`,
        {
          headers: {
            token: user2Id
          },
          json: {
            action: 'NEXT_QUESTION'
          },
          timeout: 100
        }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(bodyObj).toEqual(ERROR);
  });
});

function requestQuizQuestionMovev2(token: string, quizId: number, questionId: number, newPositionNumber: number) {
  const res = request(
    'PUT',
    `${url}:${port}/v2/admin/quiz/${quizId}/question/${questionId}/move`,
    {
      json: newPositionNumber,
      headers: {
        token,
      },
    }
  );

  return res;
}

describe('adminQuizQuestionMove tests', () => {
  let userId: string;
  let quizId: number;
  let questionId: number;
  let question2Id: number;

  beforeEach(() => {
    requestClear();
    const user1 = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    userId = user1.token;
    const quiz = requestQuizCreate(user1.token, 'Quiz1', 'Description1');
    quizId = quiz.quizId;
    const question = parseBody(requestQuizQuestionCreate(userId, questionBody, quizId).body);
    questionId = question.questionId;
  });

  test('Successfully moves question', () => {
    const question2 = parseBody(requestQuizQuestionCreate(userId, questionBodyNew, quizId).body);
    question2Id = question2.questionId;
    const newPosition = 0;

    const response = requestQuizQuestionMovev2(userId, quizId, question2Id, newPosition);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body as string)).toEqual({});
  });

  // question Id does not refer to a valid question within this quiz
  test('Invalid Question Id', () => {
    const invalidQuestionId = questionId + 10;
    const newPosition = 0;

    const response = requestQuizQuestionMovev2(userId, quizId, invalidQuestionId, newPosition);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body as string)).toEqual(ERROR);
  });

  // newPosition is less than 0, or NewPosition is greater than n-1 where n is the number of questions
  test.each([
    [-1, ERROR],
    [3, ERROR]
  ])('Invalid newPosition: %s', (input, expectedOutput) => {
    const newPosition = input;

    const response = requestQuizQuestionMovev2(userId, quizId, questionId, newPosition);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body as string)).toEqual(expectedOutput);
  });

  // newPosition is the position of the current question
  test('New position is same position of the current question', () => {
    const newPosition = 1;

    const response = requestQuizQuestionMovev2(userId, quizId, questionId, newPosition);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body as string)).toEqual(ERROR);
  });

  // token is empty or invalid (does not refer to valid logged in user session)
  test.each([
    ['', ERROR],
    ['5', ERROR]
  ])('Invalid token: %s', (input, expectedOutput) => {
    const newPosition = 0;

    const response = requestQuizQuestionMovev2(input, quizId, questionId, newPosition);

    expect(response.statusCode).toBe(401);
    expect(parseBody(response.body)).toEqual(expectedOutput);
  });

  // valid token is provided, but user is not an owner of this quiz
  // valid token is provided, but user is not an owner of this quiz
  test('Token is valid but user is not owner of this quiz: User2 tries to create question for Quiz1', () => {
  // Registering user1 and creating a quiz for them
    const user1 = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    const quiz1 = requestQuizCreate(user1.token, quizName, quizDescription);

    // Registering user2
    const user2 = requestRegister('test1@example.com', validPassword, validNameFirst, validNameLast);

    // Prepare the move request with user2's token
    const newPosition = 0;

    // User2 tries to move a question in Quiz1
    const response = requestQuizQuestionMovev2(user2.token, quiz1.quizId, questionId, newPosition);

    // Expectations
    expect(response.statusCode).toBe(403);
    expect(parseBody(response.body)).toEqual(ERROR);
  });
});

export {
  requestQuizCreateV2,
};

// Tests for quizThumbnailUpdate
describe('HTTP tests for quizThumbnail Update', () => {
  let userId1: string;
  let quizId1: number;
  let userId2: string;
  let quizId2: number;
  let validThumbnail1: string;
  let validThumbnail2: string;
  let validThumbnail3: string;
  let invalidThumbnail1: string;
  let invalidThumbnail2: string;

  beforeEach(() => {
    requestClear();
    const user1 = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    userId1 = user1.token;
    const user2 = requestRegister(validEmail1, validPassword1, validNameFirst1, validNameLast1);
    userId2 = user2.token;
    const quiz1 = requestQuizCreate(userId1, 'newQuiz', 'newDescription');
    quizId1 = quiz1.quizId;
    const quiz2 = requestQuizCreate(userId2, 'newQuiz', 'newDescription');
    quizId2 = quiz2.quizId;
    validThumbnail1 = 'http://google.com/some/image/path.jpg';
    validThumbnail2 = 'https://google.com/some/image/path.jpeg';
    validThumbnail3 = 'http://google.com/some/image/path.png';
    invalidThumbnail1 = 'ht://google.com/some/image/path.jpg';
    invalidThumbnail2 = 'https://google.com/some/image/path.jps';
  });

  test('Successfully updates the thumbnail', () => {
    const result1 = requestQuizThumbnailUpdate(userId1, quizId1, validThumbnail1);
    const result2 = requestQuizThumbnailUpdate(userId1, quizId1, validThumbnail2);
    const result3 = requestQuizThumbnailUpdate(userId1, quizId1, validThumbnail3);
    expect(result1.statusCode).toBe(200);
    expect(result2.statusCode).toBe(200);
    expect(result3.statusCode).toBe(200);
    expect(parseBody(result1.body)).toEqual({});
    expect(parseBody(result2.body)).toEqual({});
    expect(parseBody(result3.body)).toEqual({});
  });

  test('imgUrl does not begin and end with the required', () => {
    const result1 = requestQuizThumbnailUpdate(userId1, quizId1, invalidThumbnail1);
    const result2 = requestQuizThumbnailUpdate(userId2, quizId2, invalidThumbnail2);
    expect(result1.statusCode).toBe(400);
    expect(result2.statusCode).toBe(400);
    expect(parseBody(result1.body)).toEqual(ERROR);
    expect(parseBody(result2.body)).toEqual(ERROR);
  });

  test('Token is empty or invalid', () => {
    const result1 = requestQuizThumbnailUpdate('', quizId1, validThumbnail1);
    const result2 = requestQuizThumbnailUpdate('-1', quizId1, validThumbnail1);
    expect(result1.statusCode).toBe(401);
    expect(result2.statusCode).toBe(401);
    expect(parseBody(result1.body)).toEqual(ERROR);
    expect(parseBody(result2.body)).toEqual(ERROR);
  });

  test('User is not an owner of this quiz', () => {
    const result1 = requestQuizThumbnailUpdate(userId2, quizId1, validThumbnail1);
    const result2 = requestQuizThumbnailUpdate(userId1, quizId2, validThumbnail1);
    expect(result1.statusCode).toBe(403);
    expect(result2.statusCode).toBe(403);
    expect(parseBody(result1.body)).toEqual(ERROR);
    expect(parseBody(result2.body)).toEqual(ERROR);
  });
});

// Tests for playerJoin
describe('HTTP tests for playerJoin', () => {
  let userId: string;
  let quizId: number;
  let sessionId: number;
  beforeEach(() => {
    requestClear();
    const user = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    userId = user.token;
    const quiz = requestQuizCreate(userId, 'newQuiz', 'newDescription');
    quizId = quiz.quizId;
    requestQuizQuestionCreate(userId, questionBody, quizId);
    const session = requestSessionStart(quizId, userId, 3);
    sessionId = session.sessionId;
  });

  test('Successfully starts a session', () => {
    const resPlayer = requestPlayerAdd(sessionId, validNameFirst);
    expect(resPlayer.statusCode).toBe(200);
    expect((parseBody(resPlayer.body))).toEqual({ playerId: expect.any(Number) });
  });

  test('Empty name - Generate new name', () => {
    const resPlayer = requestPlayerAdd(sessionId, '');
    expect(resPlayer.statusCode).toBe(200);
    expect((parseBody(resPlayer.body))).toEqual({ playerId: expect.any(Number) });
  });

  test('Same Name Error', () => {
    requestPlayerAdd(sessionId, validNameFirst);
    const resPlayer = requestPlayerAdd(sessionId, validNameFirst);
    expect(resPlayer.statusCode).toBe(400);
    expect((parseBody(resPlayer.body))).toEqual(ERROR);
  });

  test('Session does not exist', () => {
    const resPlayer = requestPlayerAdd(sessionId + 1, validNameFirst);
    expect(resPlayer.statusCode).toBe(400);
    expect((parseBody(resPlayer.body))).toEqual(ERROR);
  });

  test('Session not in lobby state', () => {
    request(
      'PUT',
        `${url}:${port}/v1/admin/quiz/${quizId}/session/${sessionId}`,
        {
          headers: {
            token: userId
          },
          json: {
            action: 'END'
          },
          timeout: 100
        }
    );
    const resPlayer = requestPlayerAdd(sessionId, validNameFirst);
    expect(resPlayer.statusCode).toBe(400);
    expect((parseBody(resPlayer.body))).toEqual(ERROR);
  });
});

// Tests for playerJoinStatus
describe('HTTP tests for playerJoinStatus', () => {
  let userId: string;
  let quizId: number;
  let playerId: number;
  let sessionId: number;

  beforeEach(() => {
    requestClear();
    const user = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    userId = user.token;
    const quiz = requestQuizCreate(userId, 'newQuiz', 'newDescription');
    quizId = quiz.quizId;
    requestQuizQuestionCreate(userId, questionBody, quizId);
    const session = requestSessionStart(quizId, userId, 3);
    sessionId = session.sessionId;
    const player = requestPlayerAdd(sessionId, validNameFirst);
    playerId = parseBody(player.body).playerId;
  });

  test('Successfully gets the status of a guest player', () => {
    const response = requestPlayerJoinStatus(playerId);
    expect(response.statusCode).toBe(200);
    expect(parseBody(response.body)).toEqual({
      state: 'LOBBY',
      numQuestions: expect.any(Number),
      atQuestion: expect.any(Number),
    });
  });

  test('Invalid playerId', () => {
    const invalidPlayerId = -1;
    const response1 = requestPlayerJoinStatus(invalidPlayerId);
    expect(response1.statusCode).toBe(400);
    expect(parseBody(response1.body)).toEqual(ERROR);
  });
});

// Tests for sessionStatus
describe('HTTP tests for sessionStatus', () => {
  let userId: string;
  let user2Id: string;
  let quizId: number;
  let sessionId: number;
  let session2Id: number;
  beforeEach(() => {
    requestClear();
    const user = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    userId = user.token;
    const user2 = requestRegister(validEmail1, validPassword1, validNameFirst1, validNameLast1);
    user2Id = user2.token;
    const quiz = requestQuizCreate(userId, 'newQuiz', 'newDescription');
    quizId = quiz.quizId;
    const quiz2 = requestQuizCreate(userId, 'newQuiz', 'newDescription');
    const quiz2Id = quiz2.quizId;
    requestQuizQuestionCreate(userId, questionBody, quizId);
    const session = requestSessionStart(quizId, userId, 3);
    sessionId = session.sessionId;
    const session2 = requestSessionStart(quiz2Id, userId, 3);
    session2Id = session2.sessionId;
  });

  test('Successful Session Status retrieval', () => {
    const resPlayer = requestSessionStatus(quizId, sessionId, userId);
    expect(resPlayer.statusCode).toBe(200);
    expect((parseBody(resPlayer.body))).toEqual(expect.any(Object));
  });

  test('Incorrect token', () => {
    const resPlayer = requestSessionStatus(quizId, sessionId, 'userId');
    expect(resPlayer.statusCode).toBe(401);
    expect((parseBody(resPlayer.body))).toEqual(ERROR);
  });

  test('Invalid user accessing session', () => {
    const resPlayer = requestSessionStatus(quizId, sessionId, user2Id);
    expect(resPlayer.statusCode).toBe(403);
    expect((parseBody(resPlayer.body))).toEqual(ERROR);
  });

  test('Session does not exist in quiz', () => {
    const resPlayer = requestSessionStatus(quizId, session2Id, userId);
    expect(resPlayer.statusCode).toBe(400);
    expect((parseBody(resPlayer.body))).toEqual(ERROR);
  });
});

// tests for playerSendChat
describe('HTTP tests for playerSendChat', () => {
  let userId: string;
  let quizId: number;
  let sessionId: number;
  let playerId: number;

  beforeEach(() => {
    // Reset data and set up necessary entities (user, quiz, session, player)
    requestClear();
    const user = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    userId = user.token;
    const quiz = requestQuizCreate(userId, 'newQuiz', 'newDescription');
    quizId = quiz.quizId;
    requestQuizQuestionCreate(userId, questionBody, quizId);
    const session = requestSessionStart(quizId, userId, 3);
    sessionId = session.sessionId;
    const player = requestPlayerAdd(sessionId, validNameFirst);
    playerId = parseBody(player.body).playerId;
  });

  test('Send a chat message successfully', () => {
    const chatMessage = {
      message: {
        messageBody: 'Hello, this is a test message.'
      }
    };
    const response = requestPlayerSendChat(playerId, chatMessage);
    expect(response.statusCode).toBe(OK);
    expect(parseBody(response.body)).toEqual({});
  });

  test('Player Id does not exist', () => {
    const invalidPlayerId = -1;
    const chatMessage = {
      message: {
        messageBody: 'Hello, this is a test message.'
      }
    };

    const response = requestPlayerSendChat(invalidPlayerId, chatMessage);
    expect(response.statusCode).toBe(400);
    expect(parseBody(response.body)).toEqual(ERROR);
  });

  test('Invalid message length (> 100 characters)', () => {
    const chatMessage = {
      message: {
        messageBody: 'a'.repeat(101)
      }
    };
    const response = requestPlayerSendChat(playerId, chatMessage);
    expect(response.statusCode).toBe(400);
    expect(parseBody(response.body)).toEqual(ERROR);
  });

  test('Invalid message length (< 1 character)', () => {
    const chatMessage = {
      message: {
        messageBody: ''
      }
    };
    const response = requestPlayerSendChat(playerId, chatMessage);
    expect(response.statusCode).toBe(400);
    expect(parseBody(response.body)).toEqual(ERROR);
  });
});

// tests for playerChatView
describe('HTTP tests for playerChatView', () => {
  let userId: string;
  let quizId: number;
  let sessionId: number;
  let playerId: number;

  beforeEach(() => {
    requestClear();
    const user = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    userId = user.token;
    const quiz = requestQuizCreate(userId, 'newQuiz', 'newDescription');
    quizId = quiz.quizId;
    requestQuizQuestionCreate(userId, questionBody, quizId);
    const session = requestSessionStart(quizId, userId, 3);
    sessionId = session.sessionId;
    const player = requestPlayerAdd(sessionId, validNameFirst);
    playerId = parseBody(player.body).playerId;
  });

  test('View messages successfully', () => {
    const chatMessage = {
      message: {
        messageBody: 'Hello, this is a test message.',
      }
    };
    const response = requestPlayerSendChat(playerId, chatMessage);
    expect(response.statusCode).toBe(OK);

    const response1 = requestPlayerChatView(playerId);

    expect(response1.statusCode).toBe(OK);
    expect(parseBody(response1.body)).toEqual(expect.any(Object));
  });

  test('view chat when there are multiple messages', () => {
    const chatMessage = {
      message: {
        messageBody: 'Hello, this is a test message.',
      }
    };
    const response = requestPlayerSendChat(playerId, chatMessage);
    expect(response.statusCode).toBe(OK);

    const chatMessage1 = {
      message: {
        messageBody: 'Hello, this is ANOTHER test message.',
      }
    };

    const response1 = requestPlayerSendChat(playerId, chatMessage1);
    expect(response1.statusCode).toBe(OK);

    const response2 = requestPlayerChatView(playerId);

    expect(response2.statusCode).toBe(OK);
    expect(parseBody(response2.body)).toEqual(expect.any(Object));
  });

  test('Invalid playerId', () => {
    const invalidPlayerId = -1;

    const response1 = requestPlayerChatView(invalidPlayerId);

    expect(response1.statusCode).toBe(400);
    expect(parseBody(response1.body)).toEqual(ERROR);
  });
});

// Tests for quizFinalResults
describe('HTTP tests for finalResults', () => {
  let userId: string;
  let user2Id: string;
  let quizId: number;
  let sessionId: number;
  let session2Id: number;
  beforeEach(() => {
    requestClear();
    const user = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    userId = user.token;
    const user2 = requestRegister(validEmail1, validPassword1, validNameFirst1, validNameLast1);
    user2Id = user2.token;
    const quiz = requestQuizCreate(userId, 'newQuiz', 'newDescription');
    quizId = quiz.quizId;
    const quiz2 = requestQuizCreate(user2Id, 'newQuiz', 'newDescription');
    const quiz2Id = quiz2.quizId;
    requestQuizQuestionCreate(userId, questionBody, quizId);
    requestQuizQuestionCreate(user2Id, questionBody, quiz2Id);
    const session = requestSessionStart(quizId, userId, 3);
    sessionId = session.sessionId;
    const session2 = requestSessionStart(quiz2Id, userId, 3);
    session2Id = session2.sessionId;
    requestSessionUpdate(quizId, sessionId, userId, 'NEXT_QUESTION');
    requestSessionUpdate(quizId, sessionId, userId, 'SKIP_COUNTDOWN');
    requestSessionUpdate(quizId, sessionId, userId, 'GO_TO_ANSWER');
    requestSessionUpdate(quizId, sessionId, userId, 'GO_TO_FINAL_RESULTS');
  });
  test('Successful final result retrieval', () => {
    const resPlayer = requestFinalResult(quizId, sessionId, userId);
    expect(resPlayer.statusCode).toBe(200);
    expect((parseBody(resPlayer.body))).toEqual(expect.any(Object));
  });
  test('Incorrect token', () => {
    const resPlayer = requestFinalResult(quizId, sessionId, 'userId');
    expect(resPlayer.statusCode).toBe(401);
    expect((parseBody(resPlayer.body))).toEqual(ERROR);
  });
  test('Invalid user accessing session', () => {
    const resPlayer = requestFinalResult(quizId, sessionId, user2Id);
    expect(resPlayer.statusCode).toBe(403);
    expect((parseBody(resPlayer.body))).toEqual(ERROR);
  });
  test('Session does not exist in quiz', () => {
    const resPlayer = requestFinalResult(quizId, session2Id, userId);
    expect(resPlayer.statusCode).toBe(400);
    expect((parseBody(resPlayer.body))).toEqual(ERROR);
  });
  test('Session is not in FINAL RESULTS state', () => {
    requestSessionUpdate(quizId, sessionId, userId, 'END');
    const resPlayer = requestFinalResult(quizId, sessionId, userId);
    expect(resPlayer.statusCode).toBe(400);
    expect((parseBody(resPlayer.body))).toEqual(ERROR);
  });
});

function requestFinalResultCSV(quizId: number, sessionId: number, token: string) {
  const res = request(
    'GET',
        `${url}:${port}/v1/admin/quiz/${quizId}/session/${sessionId}/results/csv`,
        {
          headers: {
            token,
          }
        }
  );
  return res;
}
describe('HTTP tests for finalResultsCSV', () => {
  let userId: string;
  let user2Id: string;
  let quizId: number;
  let sessionId: number;
  let session2Id: number;
  beforeEach(() => {
    requestClear();
    const user = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    userId = user.token;
    const user2 = requestRegister(validEmail1, validPassword1, validNameFirst1, validNameLast1);
    user2Id = user2.token;
    const quiz = requestQuizCreate(userId, 'newQuiz', 'newDescription');
    quizId = quiz.quizId;
    const quiz2 = requestQuizCreate(user2Id, 'newQuiz', 'newDescription');
    const quiz2Id = quiz2.quizId;
    requestQuizQuestionCreate(userId, questionBody, quizId);
    requestQuizQuestionCreate(user2Id, questionBody, quiz2Id);
    const session = requestSessionStart(quizId, userId, 3);
    sessionId = session.sessionId;
    const session2 = requestSessionStart(quiz2Id, userId, 3);
    session2Id = session2.sessionId;
    requestSessionUpdate(quizId, sessionId, userId, 'NEXT_QUESTION');
    requestSessionUpdate(quizId, sessionId, userId, 'SKIP_COUNTDOWN');
    requestSessionUpdate(quizId, sessionId, userId, 'GO_TO_ANSWER');
    requestSessionUpdate(quizId, sessionId, userId, 'GO_TO_FINAL_RESULTS');
  });
  test('Successful Session Status retrieval', () => {
    console.log(quizId);
    console.log(sessionId);
    console.log(userId);
    const resPlayer = requestFinalResultCSV(quizId, sessionId, userId);
    expect(resPlayer.statusCode).toBe(200);
    expect((parseBody(resPlayer.body))).toEqual(expect.any(Object));
  });
  test('Incorrect token', () => {
    const resPlayer = requestFinalResultCSV(quizId, sessionId, 'userId');
    expect(resPlayer.statusCode).toBe(401);
    expect((parseBody(resPlayer.body))).toEqual(ERROR);
  });
  test('Invalid user accessing session', () => {
    const resPlayer = requestFinalResultCSV(quizId, sessionId, user2Id);
    expect(resPlayer.statusCode).toBe(403);
    expect((parseBody(resPlayer.body))).toEqual(ERROR);
  });
  test('Session does not exist in quiz', () => {
    const resPlayer = requestFinalResultCSV(quizId, session2Id, userId);
    expect(resPlayer.statusCode).toBe(400);
    expect((parseBody(resPlayer.body))).toEqual(ERROR);
  });
  test('Session is not in FINAL RESULTS state', () => {
    requestSessionUpdate(quizId, sessionId, userId, 'END');
    const resPlayer = requestFinalResultCSV(quizId, sessionId, userId);
    expect(resPlayer.statusCode).toBe(400);
    expect((parseBody(resPlayer.body))).toEqual(ERROR);
  });
});

// Tests for quizSessionFinalResults
describe('HTTP tests for quizSessionFinalResults', () => {
  let user1Id: string;
  let user2Id: string;
  let quizId: number;
  let sessionId: number;
  let player1Id: number;
  beforeEach(() => {
    requestClear();
    const user1 = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    user1Id = user1.token;
    const user2 = requestRegister(validEmail, validPassword, 'Player2', 'Lastname2');
    user2Id = user2.token;
    const quiz = requestQuizCreate(user1Id, 'newQuiz', 'newDescription');
    quizId = quiz.quizId;
    requestQuizQuestionCreate(user1Id, questionBody, quizId);
    requestQuizQuestionCreate(user2Id, questionBody, quizId);
    const session = requestSessionStart(quizId, user1Id, 3);
    sessionId = session.sessionId;
    const player1 = requestPlayerAdd(sessionId, validNameFirst);
    player1Id = parseBody(player1.body).playerId;
    requestSessionUpdate(quizId, sessionId, user1Id, 'NEXT_QUESTION');
    requestSessionUpdate(quizId, sessionId, user1Id, 'SKIP_COUNTDOWN');
    requestSessionUpdate(quizId, sessionId, user1Id, 'GO_TO_ANSWER');
    requestSessionUpdate(quizId, sessionId, user1Id, 'GO_TO_FINAL_RESULTS');
  });

  test('Successful session final results retrieval', () => {
    const resPlayer = requestSessionFinalResult(player1Id);
    expect(resPlayer.statusCode).toBe(200);
    expect((parseBody(resPlayer.body))).toEqual(expect.any(Object));
  });
  test('PlayerId does not exist', () => {
    const invalidPlayerId = -1;
    const resPlayer = requestSessionFinalResult(invalidPlayerId);
    expect(resPlayer.statusCode).toBe(400);
    expect((parseBody(resPlayer.body))).toEqual(ERROR);
  });
  test('Session is not in FINAL RESULTS state', () => {
    requestSessionUpdate(quizId, sessionId, user1Id, 'END');
    const resPlayer = requestSessionFinalResult(player1Id);
    expect(resPlayer.statusCode).toBe(400);
    expect((parseBody(resPlayer.body))).toEqual(ERROR);
  });
});
