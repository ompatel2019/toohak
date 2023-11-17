// Do not delete this file
import request from 'sync-request-curl';
import config from './config.json';
// import { string } from 'yaml/dist/schema/common/string';
import { requestClear } from './other.server.test';

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

const longName = 'thisnameisverylongandmuchlongerthantwentycharacters';
const invalidName = '@!#$@';
const shortName = 'a';

const ERROR = { error: expect.any(String) };

function requestRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
        `${url}:${port}/v1/admin/auth/register`,
        {
          json: {
            email: email,
            password: password,
            nameFirst: nameFirst,
            nameLast: nameLast,
          }
        }
  );

  return JSON.parse(res.body.toString());
}

// Tests for Registering a user
describe('adminAuthRegister Tests', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Check successful registration', () => {
    requestClear();
    const response = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    expect(response.token).toStrictEqual(expect.any(String));
  });

  test('Check email is used by another user', () => {
    requestRegister(validEmail, validPassword, validNameFirst, validNameLast); // First registration
    const result = requestRegister(validEmail, validPassword, validNameFirst, validNameLast); // Second registration with the same email
    expect(result).toStrictEqual(ERROR);
  });

  test.each([
    ['foo@@bar.com', ERROR],
    ['foo@.com', ERROR],
  ])('Check email address "%s" satisfies validator', (input, expectedOutput) => {
    expect(requestRegister(input, validPassword, validNameFirst, validNameLast)).toStrictEqual(expectedOutput);
  });

  test.each([
    ['J0hn', ERROR],
    ['$am', ERROR],
    ['John@', ERROR],
    ['S', ERROR],
    ['Skejslsurjqhdbqhakrkjdjw', ERROR]
  ])('Check if first name "%s" is valid', (inputNameFirst, expectedOutput) => {
    expect(requestRegister(validEmail, validPassword, inputNameFirst, validNameLast)).toStrictEqual(expectedOutput);
  });

  test.each([
    ['Sm1th', ERROR],
    ['William$', ERROR],
    ['Ch3n', ERROR],
    ['S', ERROR],
    ['Skejslsurjqhdbqhakrkjdjw', ERROR]
  ])('Check if last name "%s" is valid', (inputNameLast, expectedOutput) => {
    expect(requestRegister(validEmail, validPassword, validNameFirst, inputNameLast)).toStrictEqual(expectedOutput);
  });

  test.each([
    ['pswrd', ERROR],
    ['$$$$$', ERROR],
  ])('Check if password "%s" length is valid', (inputPassword, expectedOutput) => {
    expect(requestRegister(validEmail, inputPassword, validNameFirst, validNameLast)).toStrictEqual(expectedOutput);
  });

  test.each([
    ['pa$$word', ERROR],
    ['password', ERROR],
    ['1234', ERROR],
  ])('Check if password "%s" composition is valid', (inputPassword, expectedOutput) => {
    expect(requestRegister(validEmail, inputPassword, validNameFirst, validNameLast)).toStrictEqual(expectedOutput);
  });
});

function requestLogin(email: string, password: string) {
  const res = request(
    'POST',
        `${url}:${port}/v1/admin/auth/login`,
        {
          json: {
            email: email,
            password: password,
          }
        }
  );

  return JSON.parse(res.body.toString());
}

describe('adminAuthLogin tests', () => {
  let token;
  beforeEach(() => {
    requestClear();
    token = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    token = token.token;
  });

  test.each([
    { email: '', password: validEmail },
    { email: 'qwertyuiop', password: validEmail },
  ])("error: Wrong email - ('$email', '$password')", ({ email, password }) => {
    expect(requestLogin(email, password)).toStrictEqual(ERROR);
  });

  test.each([
    { email: validEmail, password: '' },
    { email: validEmail, password: 'notRealPassword123' },
  ])("error: Wrong password - ('$email', '$password')", ({ email, password }) => {
    expect(requestLogin(email, password)).toStrictEqual(ERROR);
  });

  test('error: Wrong password and Email - (\'\', \'\')', () => {
    expect(requestLogin('', '')).toStrictEqual(ERROR);
  });

  test('Valid input - failed password count', () => {
    requestClear();
    const user = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    token = user.token;
    requestLogin(validEmail, '');
    const details = requestUserDetails(token);
    const fails = details.user.numFailedPasswordsSinceLastLogin;
    expect(fails).toStrictEqual(expect.any(Number));
  });

  test('Valid input test', () => {
    const expected = requestLogin(validEmail, validPassword);
    expect(expected).toStrictEqual({ token: expect.any(String) });
  });
});

function requestUserDetails(token: string) {
  const res = request(
    'GET',
      `${url}:${port}/v1/admin/user/details`,
      {
        qs: {
          token: token,
        }
      }
  );
  return JSON.parse(res.body.toString());
}

function requestUserDetailsV2(token: string) {
  const res = request(
    'GET',
      `${url}:${port}/v2/admin/user/details`,
      {
        qs: {
          token: token,
        }
      }
  );
  return JSON.parse(res.body.toString());
}

describe('adminUserDetails tests', () => {
  beforeEach(() => {
    requestClear();
  });
  // Test for invalid authUserId input
  test('Invalid authUserId input', () => {
    const invalidUserID = requestUserDetails('-1');
    expect(invalidUserID).toStrictEqual(ERROR);
  });

  // Test for valid authUserId input
  test('Valid authUserId input', () => {
    const user = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    const authUserId = user.token;
    const validUserID = requestUserDetails(authUserId);
    expect(validUserID).toEqual(expect.any(Object));
  });
});

describe('adminUserDetailsV2 tests', () => {
  beforeEach(() => {
    requestClear();
  });
  // Test for invalid authUserId input
  test('Invalid authUserId input', () => {
    const invalidUserID = requestUserDetailsV2('-1');
    expect(invalidUserID).toStrictEqual(ERROR);
  });

  // Test for valid authUserId input
  test('Valid authUserId input', () => {
    const user = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    const authUserId = user.token;
    const validUserID = requestUserDetailsV2(authUserId);
    expect(validUserID).toEqual(expect.any(Object));
  });
});

// adminAuthLogoutv2 tests
describe('HTTP tests for adminAuthLogout', () => {
  let userId: string;

  beforeEach(() => {
    requestClear();
    const user = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    userId = user.token;
  });

  test('Successfully logs out user', () => {
    const res = request(
      'POST',
        `${url}:${port}/v2/admin/auth/logout`,
        {
          headers: {
            token: userId,
          },
          timeout: 100
        }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
  });

  test.each([
    [''],
    ['-1']
  ])('Invalid token', (token) => {
    const res = request(
      'POST',
          `${url}:${port}/v2/admin/auth/logout`,
          {
            headers: {
              token: token,
            },
            timeout: 100
          }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(401);
    expect(bodyObj).toStrictEqual(ERROR);
  });
});

// adminAuthLogoutv1 tests
describe('HTTP tests for adminAuthLogout', () => {
  let userId: string;

  beforeEach(() => {
    requestClear();
    const user = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    userId = user.token;
  });

  test('Successfully logs out user', () => {
    const res = request(
      'POST',
        `${url}:${port}/v1/admin/auth/logout`,
        {
          json: {
            token: userId,
          },
          timeout: 100
        }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
  });

  test.each([
    [''],
    ['-1']
  ])('Invalid token', (token) => {
    const res = request(
      'POST',
          `${url}:${port}/v1/admin/auth/logout`,
          {
            json: {
              token: token,
            },
            timeout: 100
          }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(401);
    expect(bodyObj).toStrictEqual(ERROR);
  });
});

describe('HTTP tests for adminUserUpdatev2', () => {
  let userId: string;
  beforeEach(() => {
    requestClear();
    const user = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user2 = requestRegister(validEmail1, validPassword1, validNameFirst1, validNameLast1);
    userId = user.token;
  });

  test('Successfully updated user details', () => {
    const res = request(
      'PUT',
          `${url}:${port}/v2/admin/user/details`,
          {
            headers: {
              token: userId
            },
            json: {
              email: 'new@gmail.com',
              nameFirst: 'newFirst',
              nameLast: 'newLast'
            },
            timeout: 100
          }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
  });

  test.each([
    [validEmail1],
    ['invalidEmail'],
    ['email@@gmail.com']
  ])('Testing adminUserUpdate with email: %s', (email) => {
    const res = request(
      'PUT',
          `${url}:${port}/v2/admin/user/details`,
          {
            headers: {
              token: userId
            },
            json: {
              email: email,
              nameFirst: validNameFirst,
              nameLast: validNameLast
            },
            timeout: 100
          }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toStrictEqual(ERROR);
  });

  test.each([
    [shortName],
    [longName],
    [invalidName],
  ])('Testing adminUserUpdate with nameFirst: %s', (name) => {
    const res = request(
      'PUT',
          `${url}:${port}/v2/admin/user/details`,
          {
            headers: {
              token: userId
            },
            json: {
              email: validEmail,
              nameFirst: name,
              nameLast: validNameLast
            },
            timeout: 100
          }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toStrictEqual(ERROR);
  });

  test.each([
    [shortName],
    [longName],
    [invalidName],
  ])('Testing adminUserUpdate with nameLast: %s', (name) => {
    const res = request(
      'PUT',
          `${url}:${port}/v2/admin/user/details`,
          {
            headers: {
              token: userId
            },
            json: {
              email: validEmail,
              nameFirst: name,
              nameLast: validNameLast
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
  ])('Testing adminUserUpdate with invalid token: %s', (token) => {
    const res = request(
      'PUT',
          `${url}:${port}/v2/admin/user/details`,
          {
            headers: {
              token: token
            },
            json: {
              email: validEmail,
              nameFirst: validNameFirst,
              nameLast: validNameLast
            },
            timeout: 100
          }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(401);
    expect(bodyObj).toStrictEqual(ERROR);
  });
});

describe('HTTP tests for adminUserUpdatev1', () => {
  let userId: string;
  beforeEach(() => {
    requestClear();
    const user = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user2 = requestRegister(validEmail1, validPassword1, validNameFirst1, validNameLast1);
    userId = user.token;
  });

  test('Successfully updated user details', () => {
    const res = request(
      'PUT',
          `${url}:${port}/v1/admin/user/details`,
          {
            json: {
              token: userId,
              email: 'new@gmail.com',
              nameFirst: 'newFirst',
              nameLast: 'newLast'
            },
            timeout: 100
          }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
  });

  test.each([
    [validEmail1],
    ['invalidEmail'],
    ['email@@gmail.com']
  ])('Testing adminUserUpdate with email: %s', (email) => {
    const res = request(
      'PUT',
          `${url}:${port}/v1/admin/user/details`,
          {
            json: {
              token: userId,
              email: email,
              nameFirst: validNameFirst,
              nameLast: validNameLast
            },
            timeout: 100
          }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toStrictEqual(ERROR);
  });

  test.each([
    [shortName],
    [longName],
    [invalidName],
  ])('Testing adminUserUpdate with nameFirst: %s', (name) => {
    const res = request(
      'PUT',
          `${url}:${port}/v1/admin/user/details`,
          {
            json: {
              token: userId,
              email: validEmail,
              nameFirst: name,
              nameLast: validNameLast
            },
            timeout: 100
          }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toStrictEqual(ERROR);
  });

  test.each([
    [shortName],
    [longName],
    [invalidName],
  ])('Testing adminUserUpdate with nameLast: %s', (name) => {
    const res = request(
      'PUT',
          `${url}:${port}/v1/admin/user/details`,
          {
            json: {
              token: userId,
              email: validEmail,
              nameFirst: name,
              nameLast: validNameLast
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
  ])('Testing adminUserUpdate with invalid token: %s', (token) => {
    const res = request(
      'PUT',
          `${url}:${port}/v1/admin/user/details`,
          {
            json: {
              token: token,
              email: validEmail,
              nameFirst: validNameFirst,
              nameLast: validNameLast
            },
            timeout: 100
          }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(401);
    expect(bodyObj).toStrictEqual(ERROR);
  });
});

// adminPasswordUpdatev2 tests
describe('HTTP tests for adminPasswordUpdate', () => {
  let userId: string;
  let oldPassword: string;
  let newPassword: string;
  beforeEach(() => {
    requestClear();
    const user = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    userId = user.token;
    oldPassword = validPassword;
    newPassword = 'newPassword1';
  });

  test('Successfully updated user password', () => {
    const res = request(
      'PUT',
        `${url}:${port}/v2/admin/user/password`,
        {
          headers: {
            token: userId
          },
          json: {
            oldPassword: oldPassword,
            newPassword: newPassword
          },
          timeout: 100
        }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
  });

  test.each([
    [''],
    ['-1']
  ])('Testing adminPasswordUpdate with invalid token: %s', (token) => {
    const res = request(
      'PUT',
        `${url}:${port}/v2/admin/user/password`,
        {
          headers: {
            token: token
          },
          json: {
            oldPassword: oldPassword,
            newPassword: newPassword
          },
          timeout: 100
        }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(401);
    expect(bodyObj).toStrictEqual(ERROR);
  });

  test('Old password is incorrect', () => {
    const res = request(
      'PUT',
        `${url}:${port}/v2/admin/user/password`,
        {
          headers: {
            token: userId
          },
          json: {
            oldPassword: 'incorrectPassword1',
            newPassword: newPassword
          },
          timeout: 100
        }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toStrictEqual(ERROR);
  });

  test('New password matches old password', () => {
    const res = request(
      'PUT',
        `${url}:${port}/v2/admin/user/password`,
        {
          headers: {
            token: userId
          },
          json: {
            oldPassword: validPassword,
            newPassword: validPassword
          },
          timeout: 100
        }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toStrictEqual(ERROR);
  });

  test('New password has been used before by this user', () => {
    const res1 = request(
      'PUT',
      `${url}:${port}/v2/admin/user/password`,
      {
        headers: {
          token: userId
        },
        json: {
          oldPassword: oldPassword,
          newPassword: newPassword
        },
        timeout: 100
      }
    );
    expect(res1.statusCode).toBe(OK); // Ensure the password is successfully changed

    // Try to change the password back to the original (should trigger an error)
    const res2 = request(
      'PUT',
      `${url}:${port}/v2/admin/user/password`,
      {
        headers: {
          token: userId
        },
        json: {
          oldPassword: newPassword, // Use the new password as the old password
          newPassword: oldPassword // Try to change it back to the original password
        },
        timeout: 100
      }
    );
    const bodyObj2 = JSON.parse(res2.body as string);
    expect(res2.statusCode).toBe(INPUT_ERROR); // Ensure it returns an error
    expect(bodyObj2).toStrictEqual(ERROR);
  });

  test.each([
    ['a1'],
    ['numberlessPassword'],
    ['12345678'],
  ])('Testing adminPassword with new password: %s', (newPassword) => {
    const res = request(
      'PUT',
        `${url}:${port}/v2/admin/user/password`,
        {
          headers: {
            token: userId
          },
          json: {
            oldPassword: oldPassword,
            newPassword: newPassword
          },
          timeout: 100
        }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toStrictEqual(ERROR);
  });
});

// adminPasswordUpdatev1 tests
describe('HTTP tests for adminPasswordUpdate', () => {
  let userId: string;
  let oldPassword: string;
  let newPassword: string;
  beforeEach(() => {
    requestClear();
    const user = requestRegister(validEmail, validPassword, validNameFirst, validNameLast);
    userId = user.token;
    oldPassword = validPassword;
    newPassword = 'newPassword1';
  });

  test('Successfully updated user password', () => {
    const res = request(
      'PUT',
        `${url}:${port}/v1/admin/user/password`,
        {
          json: {
            token: userId,
            oldPassword: oldPassword,
            newPassword: newPassword
          },
          timeout: 100
        }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
  });

  test.each([
    [''],
    ['-1']
  ])('Testing adminPasswordUpdate with invalid token: %s', (token) => {
    const res = request(
      'PUT',
        `${url}:${port}/v1/admin/user/password`,
        {
          json: {
            token: token,
            oldPassword: oldPassword,
            newPassword: newPassword
          },
          timeout: 100
        }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(401);
    expect(bodyObj).toStrictEqual(ERROR);
  });

  test('Old password is incorrect', () => {
    const res = request(
      'PUT',
        `${url}:${port}/v1/admin/user/password`,
        {
          json: {
            token: userId,
            oldPassword: 'incorrectPassword1',
            newPassword: newPassword
          },
          timeout: 100
        }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toStrictEqual(ERROR);
  });

  test('New password matches old password', () => {
    const res = request(
      'PUT',
        `${url}:${port}/v1/admin/user/password`,
        {
          json: {
            token: userId,
            oldPassword: validPassword,
            newPassword: validPassword
          },
          timeout: 100
        }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toStrictEqual(ERROR);
  });

  test('New password has been used before by this user', () => {
    const res1 = request(
      'PUT',
      `${url}:${port}/v1/admin/user/password`,
      {
        json: {
          token: userId,
          oldPassword: oldPassword,
          newPassword: newPassword
        },
        timeout: 100
      }
    );
    expect(res1.statusCode).toBe(OK); // Ensure the password is successfully changed

    // Try to change the password back to the original (should trigger an error)
    const res2 = request(
      'PUT',
      `${url}:${port}/v1/admin/user/password`,
      {
        json: {
          token: userId,
          oldPassword: newPassword, // Use the new password as the old password
          newPassword: oldPassword // Try to change it back to the original password
        },
        timeout: 100
      }
    );
    const bodyObj2 = JSON.parse(res2.body as string);
    expect(res2.statusCode).toBe(INPUT_ERROR); // Ensure it returns an error
    expect(bodyObj2).toStrictEqual(ERROR);
  });

  test.each([
    ['a1'],
    ['numberlessPassword'],
    ['12345678'],
  ])('Testing adminPassword with new password: %s', (newPassword) => {
    const res = request(
      'PUT',
        `${url}:${port}/v1/admin/user/password`,
        {
          json: {
            token: userId,
            oldPassword: oldPassword,
            newPassword: newPassword
          },
          timeout: 100
        }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toStrictEqual(ERROR);
  });
});

export {
  requestRegister,
  requestLogin,
  requestUserDetails
};
