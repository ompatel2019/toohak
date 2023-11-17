// Interfaces
interface User {
  authUserId: number, // Set the authUserId here
  email: string,
  password: string,
  passwordHistory: string[],
  nameFirst: string,
  nameLast: string,
  numFailedPasswordsSinceLastLogin: number,
  numSuccessfulLogins: number,
  quizId: number[]
}

interface SessionAnswer {
  playerId: number;
  questionId: number;
  answerIds: number[];
  timeTaken: number;
}

interface Answer {
  answer: string,
  correct: boolean,
  color: string
  answerId: number
}

interface Question {
  questionId: number,
  question: string,
  duration: number,
  thumbnailUrl: string,
  points: number,
  answers: Answer[],
}

interface Quiz {
  quizId: number,
  authUserId: number,
  name: string,
  description: string,
  timeCreated: number,
  timeLastEdited: number,
  questions: Question[],
  duration: number,
  thumbnailUrl: string,
}

interface Token {
  authUserId: number,
  sessionId: number
}

enum SessionState {
  LOBBY = 'LOBBY',
  QUESTION_COUNTDOWN = 'QUESTION_COUNTDOWN',
  QUESTION_OPEN = 'QUESTION_OPEN',
  QUESTION_CLOSE = 'QUESTION_CLOSE',
  ANSWER_SHOW = 'ANSWER_SHOW',
  FINAL_RESULTS = 'FINAL_RESULTS',
  END = 'END'
}

enum AdminAction {
  NEXT_QUESTION = 'NEXT_QUESTION',
  SKIP_COUNTDOWN = 'SKIP_COUNTDOWN',
  GO_TO_ANSWER = 'GO_TO_ANSWER',
  GO_TO_FINAL_RESULTS = 'GO_TO_FINAL_RESULTS',
  END = 'END'
}

interface Player {
  playerId: number,
  name: string,
  score: number
}

interface ChatMessage {
  message: {
    messageBody: string;
    playerId: number;
    playerName: string;
    timeSent: number;
  };
}

interface Session {
  sessionId: number,
  authUserId: number,
  quizId: number,
  state: SessionState,
  players: Player[],
  atQuestion: number,
  playerMessages: ChatMessage[]
  answers: SessionAnswer[];
}

interface DataSet {
  users: User[],
  quizzes: Quiz[],
  tokens: Token[],
  sessions: Session[],
  trash: Quiz[],
  sessionTimers: { [sessionId: number]: ReturnType<typeof setTimeout> }
}

// YOU SHOULD MODIFY THIS OBJECT BELOW
let data: DataSet = {
  users: [],
  quizzes: [],
  tokens: [],
  sessions: [],
  trash: [],
  sessionTimers: {}
};

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
function getData() {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData:DataSet) {
  data = newData;
}

export {
  User,
  Quiz,
  DataSet,
  Session,
  Player,
  SessionState,
  Question,
  Answer,
  AdminAction,
  getData,
  setData,
  data,
  SessionAnswer
};
