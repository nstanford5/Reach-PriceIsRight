/**
 * Come on down! You are the next contestant on...
 * 
 * The Price is Right!
 * 
 * Each player sends in their guesses, the program
 * has each user create a random number locally and combines
 * these two numbers to produce the winning number - the closest 
 * without going over, wins!
 * 
 * Note: The users are committed to their numbers before they
 * generate their random number. There is no way they could cheat
 * or change their number after randomness is generated.
 */

'reach 0.1';

const [gameOutcome, A_WINS, B_WINS, DRAW] = makeEnum(3);
const DEADLINE = 20;

// function to compute the winner
const winner = (aGuess, bGuess, magicNum) => {
  // A is over and B isn't
  if(aGuess > magicNum && bGuess <= magicNum){
    return B_WINS;
  } else {
    // B is over and A isn't
    if(bGuess > magicNum && aGuess <= magicNum){
      return A_WINS;
    } else {
      // both are over
      if(aGuess > magicNum && bGuess > magicNum){
        return DRAW;
      } else {
        // neither is over, who is closer?
        const aDist = magicNum - aGuess;
        const bDist = magicNum - bGuess;
        return (aDist < bDist ? A_WINS : B_WINS);
      }
    }
  }
};

const Shared = {
  ...hasRandom,
  getGuess: Fun([], UInt),
  seeOutcome: Fun([UInt], Null),
  seeActual: Fun([UInt], Null),
  informTimeout: Fun([], Null),
  getNum: Fun([], UInt),
};

export const main = Reach.App(() => {
  const A = Participant('A', {
    // Specify Alice's interact interface here
    ...Shared,
    wager: UInt,
  });
  const B = Participant('B', {
    // Specify Bob's interact interface here
    ...Shared,
    acceptWager: Fun([UInt], Null),
  });
  init();

  const informTimeout = () => {
    each([A, B], () => {
      interact.informTimeout();
    });
  };
  A.only(() => {
    const wager = declassify(interact.wager);
  });
  A.publish(wager)
    .pay(wager);
  commit();

  B.only(() => {
    interact.acceptWager(wager);
  });
  B.pay(wager)
    .timeout(relativeTime(DEADLINE), () => closeTo(A, informTimeout));
  
  var outcome = DRAW;
  invariant(balance() == 2 * wager);
  while(outcome == DRAW){
    commit();

    A.only(() => {
      const _aGuess = interact.getGuess();
      const [_aCommit, _aSalt] = makeCommitment(interact, _aGuess);
      const aCommit = declassify(_aCommit);
    });

    A.publish(aCommit)
      .timeout(relativeTime(DEADLINE), () => closeTo(B, informTimeout));
    commit();

    unknowable(B, A(_aGuess, _aSalt));
    
    B.only(() => {
      const _bGuess = interact.getGuess();
      const [_bCommit, _bSalt] = makeCommitment(interact, _bGuess);
      const bCommit = declassify(_bCommit);
    });

    B.publish(bCommit)
      .timeout(relativeTime(DEADLINE), () => closeTo(A, informTimeout));
    commit();

    // both players have guessed
    // generate random number
    A.only(() => {
      const aNum = declassify(interact.getNum());
    });
    A.publish(aNum);
    commit();

    B.only(() => {
      const bNum = declassify(interact.getNum());
    });
    B.publish(bNum);
    commit();

    // declassify salt value
    A.only(() => {
      const [aSalt, aGuess] = declassify([_aSalt, _aGuess]);
    });

    A.publish(aSalt, aGuess)
      .timeout(relativeTime(DEADLINE), () => closeTo(B, informTimeout));
    commit();

    // declassify salt value
    B.only(() => {
      const [bSalt, bGuess] = declassify([_bSalt, _bGuess]);
    });
    B.publish(bSalt, bGuess);
    
    checkCommitment(aCommit, aSalt, aGuess);
    checkCommitment(bCommit, bSalt, bGuess);

    const magicNum = aNum + bNum;

    each([A, B], () => {
      interact.seeActual(magicNum);
    });
    
    outcome = winner(aGuess, bGuess, magicNum);
    continue;
  }

  transfer(2 * wager).to(outcome == A_WINS ? A : B);
  commit();

  wait(relativeTime(2));
  each([A, B], () => {
    interact.seeOutcome(outcome);
  });
  exit();
});
