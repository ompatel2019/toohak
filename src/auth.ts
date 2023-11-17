import { getData, setData } from './dataStore';
import { generateUniqueId, ErrorReturn } from './other';
import validator from 'validator';
import { validName, validNameLength, validPassword, validPasswordLength, hashPassword } from './helper';

// Constants
const MIN_PASSWORD_LENGTH = 8;
const MIN_USER_NAME_LENGTH = 2;
const MAX_USER_NAME_LENGTH = 20;
const INITIAL_FAILED_LOGIN = 0;
const INITIAL_SUCCESSFUL_LOGIN = 1;
const INVALID_ID = -1;

// Interfaces
interface RegisterReturn {
  authUserId: number
}

interface UserDetailReturn {
  user: {
    userId: number,
    name: string,
    email: string,
    numSuccessfulLogins: number,
    numFailedPasswordsSinceLastLogin: number
  }
}

interface UserDetails {
    email: string;
    nameFirst: string;
    nameLast: string;
}

interface UserPassword {
  oldPassword: string;
  newPassword: string;
}

/**
  * Registers a new user by validating input details. It ensures the provided email
  * is unique and not already registered. Moreover, it conducts validations on the
  * email, password, and user names to ascertain they adhere to set criteria.
  *
  * @param {string} email - unique email for login
  * @param {string} password - at least 8 characters, including one number and one letter
  * @param {string} nameFirst - 2-20 characters; letters, spaces, hyphens, and apostrophes only
  * @param {string} nameLast - 2-20 characters; letters, spaces, hyphens, and apostrophes only
  *
  * @returns {{ authUserId: number }} - unique user ID on successful registration
  * @returns {{ error: string }} - error message on failure
  */
function adminAuthRegister(email: string, password: string, nameFirst: string, nameLast: string): RegisterReturn | ErrorReturn {
  const data = getData();

  const userId = generateUniqueId(); // Generate unique ID
  const quizId: number[] = [];

  // Error check if email is used by another user

  if (data.users.some(user => user.email === email)) {
    return { error: 'invalid email, password, name OR lastname' };
  }

  // Error check if email does not satisfy validator

  if (!validator.isEmail(email)) {
    return { error: 'invalid email, password, name OR lastname' };
  }

  // Error check if nameFirst is valid

  if (nameFirst.length < MIN_USER_NAME_LENGTH || nameFirst.length > MAX_USER_NAME_LENGTH) {
    return { error: 'invalid email, password, name OR lastname' };
  }

  for (const char of nameFirst) {
    if (!((char >= 'a' && char <= 'z') ||
              (char >= 'A' && char <= 'Z') ||
              char === ' ' || char === '-' || char === "'")) {
      return { error: 'invalid email, password, name OR lastname' };
    }
  }

  // Error check if nameLast is valid
  if (nameLast.length < MIN_USER_NAME_LENGTH || nameLast.length > MAX_USER_NAME_LENGTH) {
    return { error: 'invalid email, password, name OR lastname' };
  }

  for (const char of nameLast) {
    if (!((char >= 'a' && char <= 'z') ||
              (char >= 'A' && char <= 'Z') ||
              char === ' ' || char === '-' || char === "'")) {
      return { error: 'invalid email, password, name OR lastname' };
    }
  }

  // Error check if passsword is valid

  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: 'invalid email, password, name OR lastname' };
  }

  if (!/\d/.test(password) || (!/[A-Z]/.test(password) && !/[a-z]/.test(password))) {
    return { error: 'invalid email, password, name OR lastname' };
  }

  const hashedPassword = hashPassword(password);
  const newUser = {
    authUserId: userId, // Set the authUserId here
    email: email,
    password: hashedPassword, // Use the hashed password
    passwordHistory: [] as string[],
    nameFirst: nameFirst,
    nameLast: nameLast,
    numFailedPasswordsSinceLastLogin: INITIAL_FAILED_LOGIN,
    numSuccessfulLogins: INITIAL_SUCCESSFUL_LOGIN,
    quizId: quizId
  };

  data.users.push(newUser);
  setData(data);

  return {
    authUserId: userId, // Return generated ID
  };
}

/**
  * adminAuthLogin allows for registered users to login, it counts the amount
  * of login failures and resets upon successful logins which are also counted.
  * Returns an error if the incorrect login details are provided, otherwise
  * returns the user id with the correct email and password.
  *
  * @param {string} email - unique id number assigned to a user
  * @param {string} password - name of the quiz being created
  *
  * @returns {{ userId: number }} - return upon successful login
  * @returns {{ error: string }} - return upon failed login
*/
function adminAuthLogin(email: string, password: string): RegisterReturn | ErrorReturn {
  const data = getData();

  // Check if a valid email has been entered
  const adminIndex = data.users.findIndex(user => user.email === email);
  if (adminIndex === INVALID_ID) {
    return { error: 'Invalid email has been entered' };
  }

  const admin = data.users[adminIndex];

  // Hash the input password and compare it with the stored hashed password
  const hashedInputPassword = hashPassword(password);
  if (admin.email === email && admin.password === hashedInputPassword) {
    admin.numFailedPasswordsSinceLastLogin = 0;
    admin.numSuccessfulLogins++;
    setData(data);
    return {
      authUserId: admin.authUserId,
    };
  } else {
    admin.numFailedPasswordsSinceLastLogin++;
    setData(data);
    return {
      error: 'Invalid password has been entered'
    };
  }
}

/**
 * Takes in an admin user's authUserid and return details of user if user exists
 *
 * @param {number} authUserId - unique identifier for an user
 * @returns {{user:
*                {userId: number,
  *                 name: string,
  *                 email: string,
  *                 numSuccessfulLogins: number,
  *                 numFailedPasswordsSinceLastLogin: number}}}
  * @returns {{error: string}} on error
 */
function adminUserDetails(authUserId: number): UserDetailReturn | ErrorReturn {
  const data = getData();
  for (const i in data.users) {
    if (data.users[i].authUserId === authUserId) {
      return {
        user:
        {
          userId: authUserId,
          name: data.users[i].nameFirst + ' ' + data.users[i].nameLast,
          email: data.users[i].email,
          numSuccessfulLogins: data.users[i].numSuccessfulLogins,
          numFailedPasswordsSinceLastLogin: data.users[i].numFailedPasswordsSinceLastLogin,
        }
      };
    }
  }
  return {
    error: 'Invalid authUserId has been entered'
  };
}

/**
  * Logs out a an adminUser who has an active session, by ending the session.
  *
  * @param {string} token - Token of current user
  *
  *
  * @returns {Object} - Returns an empty object if the update is successful
*/
function adminAuthLogout(token: string): object {
  const data = getData();
  const decodedToken = data.tokens.find(t => encodeURIComponent(JSON.stringify(t)) === token);
  const sessionIndex = data.sessions.findIndex(session => session.authUserId === decodedToken.authUserId);
  data.sessions.splice(sessionIndex, 1);

  setData(data);
  return {};
}
/**
  * Given a set of properties, update those properties of this logged in admin user.
  *
  * @param {string} token - Token of current user
  * @param {UserDetails} userDetails - Object containing email, nameFirst and nameLast
  *
  *
  * @returns {Object} - Returns an empty object if the update is successful
  * @returns {Object} - Returns an object containing the reason for failure
*/

function adminUserUpdate(token: string, userDetails: UserDetails): object | ErrorReturn {
  const data = getData();
  const userToken = data.tokens.find(t => encodeURIComponent(JSON.stringify(t)) === token);
  const authUserId = userToken.authUserId;

  const validUser = data.users.find(u => u.authUserId === authUserId);

  if (!validator.isEmail(userDetails.email)) {
    return { error: 'Invalid email' };
  }

  if (data.users.some(u => u.email === userDetails.email && u.authUserId !== authUserId)) {
    return { error: 'Email is currently used by another user' };
  }
  if (!validName(userDetails.nameFirst) || !validName(userDetails.nameLast)) {
    return { error: 'Name contains invalid characters' };
  }

  if (!validNameLength(userDetails.nameFirst) || !validNameLength(userDetails.nameLast)) {
    return { error: 'Name is less than 2 characters or more than 20 characters' };
  }

  validUser.email = userDetails.email;
  validUser.nameFirst = userDetails.nameFirst;
  validUser.nameLast = userDetails.nameLast;

  return {};
}
/**
  * Updates the password of a user, if it is the same as a previous one, invalid
  * user id is given or the password is invalid an error is returned. Otherwise
  * an empty object is returned.
  *
  * @param {string} token - Token of current user
  * @param {UserPassword} userPassword - an object containing old and new password
  *
  *
  * @returns {Object} - Returns an empty object if the update is successful
  * @returns {Object} - Returns an object containing the reason for failure
*/
function adminPasswordUpdate(token: string, userPassword: UserPassword): object | ErrorReturn {
  const data = getData();
  const userToken = data.tokens.find(t => encodeURIComponent(JSON.stringify(t)) === token);
  if (!userToken) {
    return { error: 'Invalid token' };
  }

  const authUserId = userToken.authUserId;
  const validUser = data.users.find(u => u.authUserId === authUserId);
  if (!validUser) {
    return { error: 'User not found' };
  }

  // Hash the old password to compare with the stored hash
  const hashedOldPassword = hashPassword(userPassword.oldPassword);
  if (hashedOldPassword !== validUser.password) {
    return { error: 'Old password is not correct' };
  }

  if (hashedOldPassword === hashPassword(userPassword.newPassword)) {
    return { error: 'Old password and new password match exactly' };
  }

  if (!validPassword(userPassword.newPassword)) {
    return { error: 'New password needs to contain at least one number and at least one letter' };
  }

  if (!validPasswordLength(userPassword.newPassword)) {
    return { error: 'New password is less than 8 characters' };
  }

  // Check if the new password (hashed) has been used before
  const hashedNewPassword = hashPassword(userPassword.newPassword);
  if (validUser.passwordHistory.includes(hashedNewPassword)) {
    return { error: 'New password has already been used before by this user' };
  }

  // Update the password and password history
  validUser.passwordHistory.push(validUser.password); // Store the old hashed password
  validUser.password = hashedNewPassword; // Update with the new hashed password

  setData(data);
  return {};
}

export {
  RegisterReturn,
  UserDetailReturn,
  adminAuthRegister,
  adminAuthLogin,
  adminAuthLogout,
  adminUserDetails,
  adminPasswordUpdate,
  adminUserUpdate
};
