import {loadStdlib, ask} from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
const stdlib = loadStdlib();
console.log('Launching...');

const isA = await ask.ask(
  `Are you initiating this contract?`,
  ask.yesno
);

const who = isA ? 'A' : 'B';
console.log(`Starting The Price is Right as ${who}`);

const createAcc = await ask.ask(
  `Would you like to create an account?`,
  ask.yesno
);

let acc = null;
if(createAcc){
  acc = await stdlib.newTestAccount(stdlib.parseCurrency(1000));
} else {
  const secret = await ask.ask(
    `What is your account secret?`,
    (x => x)
  );
  acc = await stdlib.newAccountFromSecret(secret);
}

// who is it?
// deploy or attach accordingly
let ctc = null;
if (isA){
  ctc = acc.contract(backend);
  ctc.getInfo().then((info) => {
    console.log(`The contract is deployed as ${JSON.stringify(info)}`);
  });
} else {
  const info = await ask.ask(
    `Please paste the contract information`,
    JSON.parse
  );
  ctc = acc.contract(backend, info);
}

const fmt = (x) => stdlib.formatCurrency(x, 4);
const getBalance = async () => fmt(await stdlib.balanceOf(acc));

const before = await getBalance();
console.log(`Your balance is ${before}`);

const interact = { ...stdlib.hasRandom };

interact.informTimeout = () => {
  console.log(`There was a timeout`);
  process.exit(1);
};

if (isA) {
  const amount = await ask.ask(
    `How much would you like to wager?`,
    stdlib.parseCurrency
  );
  interact.wager = amount;
} else {
  interact.acceptWager = async (amount) => {
    const accepted = await ask.ask(
      `Do you agree on the wager of ${fmt(amount)}`,
      ask.yesno
    );
    if(!accepted){
      process.exit(0);
    }
  };
}

interact.getNum = async () => {
  const num = Math.floor(Math.random() * 50);
  return num;
};

interact.getGuess = async () => {
  const guess = await ask.ask(`Guess a number`);
  console.log(`You guessed ${guess}`);
  return guess;
};

interact.seeActual = async (magicNum) => {
  const num = parseInt(magicNum);
  console.log(`Actual number is ${num}`);
};

const OUTCOME = ['A wins', 'B wins', 'Draw'];
interact.seeOutcome = (outcome) => {
  console.log(`The outcome is: ${OUTCOME[outcome]}`);
};

const part = isA ? ctc.p.A : ctc.p.B;
await part(interact);

const after = await getBalance();
console.log(`Your balance is now ${after}`);


/*
console.log('Starting backends...');
await Promise.all([
  backend.A(ctcAlice, {
    ...stdlib.hasRandom,
    // implement Alice's interact object here
  }),
  backend.B(ctcBob, {
    ...stdlib.hasRandom,
    // implement Bob's interact object here
  }),
]);
*/

console.log('Goodbye, Alice and Bob!');
ask.done();
