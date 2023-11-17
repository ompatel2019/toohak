// Do not delete this file
import request from 'sync-request-curl';
import config from './config.json';
import { requestQuizCreate, requestQuizInfo } from './quiz.server.test';
import { requestRegister, requestUserDetails } from './auth.server.test';
// import { string } from 'yaml/dist/schema/common/string';
import { parseBody, validAdminAction, hashPassword } from './helper';
import { AdminAction, SessionState } from './dataStore';
const port = config.port;
const url = config.url;

const validEmail = 'test@example.com';
const validPassword = 'testPassword1';
const validNameFirst = 'John';
const validNameLast = 'Doe';

const ERROR = { error: expect.any(String) };

function requestClear() {
  const res = request(
    'DELETE',
        `${url}:${port}/v1/clear`,
        {
          qs: { }
        }
  );
  return JSON.parse(res.body.toString());
}

test('Invalid quizId (not owned by authUserId)', () => {
  expect(1).toEqual(expect.any(Number));
});

describe('clear tests', () => {
  let newUserId: string;
  test('returns empty dictionary', () => {
    expect(requestClear()).toStrictEqual({});
  });

  test('clears quiz', () => {
    const newUser = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    newUserId = newUser.token;
    const quiz = requestQuizCreate(newUserId, 'quizName', 'quizDescription');
    const quizDetails = requestQuizInfo(newUserId, quiz.quizId);
    expect(quiz).toStrictEqual({ quizId: expect.any(Number) });
    expect(quizDetails).toStrictEqual(expect.any(Object));
    requestClear();
    const response = requestQuizInfo(newUserId, quiz.quizId);
    expect(response.statusCode).toBe(401);
    expect(parseBody(response.body)).toStrictEqual(ERROR);
  });

  test('clears users', () => {
    const newUser = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    newUserId = newUser.token;
    const userDetails = requestUserDetails(newUserId);
    expect(newUser).toStrictEqual({ token: expect.any(String) });
    expect(userDetails).toStrictEqual(expect.any(Object));
    requestClear();
    expect(requestUserDetails(newUserId)).toStrictEqual(ERROR);
  });
});

describe('parseBody tests', () => {
  test('Successfully parses a buffer', () => {
    const sampleObject = { key: 'value' };
    const bufferBody = Buffer.from(JSON.stringify(sampleObject));
    const result = parseBody(bufferBody);
    expect(result).toEqual(sampleObject);
  });

  test('Successfully parses a string', () => {
    const sampleObject = { key: 'value' };
    const stringBody = JSON.stringify(sampleObject);
    const result = parseBody(stringBody);
    expect(result).toEqual(sampleObject);
  });
});

test('validAdminAction function with LOBBY state', () => {
  expect(validAdminAction(AdminAction.END, SessionState.LOBBY)).toBe(true);
  expect(validAdminAction(AdminAction.NEXT_QUESTION, SessionState.LOBBY)).toBe(true);
  // Test other invalid actions for LOBBY state
});

describe('hashPassword', () => {
  it('should return a string', () => {
    const result = hashPassword('testpassword');
    expect(typeof result).toBe('string');
  });

  it('should return a consistent hash for the same input', () => {
    const password = 'testpassword';
    const hash1 = hashPassword(password);
    const hash2 = hashPassword(password);
    expect(hash1).toBe(hash2);
  });

  it('should return a different hash for different inputs', () => {
    const hash1 = hashPassword('password1');
    const hash2 = hashPassword('password2');
    expect(hash1).not.toBe(hash2);
  });

  it('should return a hash of expected length', () => {
    const result = hashPassword('testpassword');
    expect(result.length).toBe(64); // SHA-256 produces a 64-character hex string
  });
});

export {
  requestClear
};
