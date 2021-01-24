const https = require('https')
const http = require('http')
const readline = require('readline').createInterface({ input: process.stdin, output: process.stdout })
const yourAnswers = [];
let originalWord = '', shuffledWord = '', anagrams, score = 0;
const printHelp = () => {
  const commands = [
    { command: 'help', description: 'Show this help table' },
    { command: 'letters', description: 'Show letters for this game' },
    { command: 'score', description: 'Show your current score' },
    { command: 'restart', description: 'Restart game with new letters' },
    { command: 'quit', description: 'Quit the game' },
  ]
  console.table(commands.map(command => ({
      "Command": command.command,
      Description: command.description
    })
  ));
}
const printRules = () => {
  ['------------------------------------- RULES -------------------------------------',
    '> A random word will be shuffled. Use the letters to guess other words.',
    '> For each letter in a correct guess you get 1 point.',
    '> Guessing the original word will give you 2x the points as the length of the word.',
    '> All words less than 3 letters long are omitted.'].forEach(rule => console.log('\x1b[1m%s\x1b[0m', `${rule}`))
}

const shuffleWord = word => {
  const array = word.split('')
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i)
    const temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
  return array.join('');
}

const verifyWord = word => {
  if (anagrams.includes(word)) {
    anagrams = anagrams.filter(anagram => anagram !== word)
    const multiplier = word === originalWord ? 2 : 1
    score += word.length * multiplier
    console.log('\x1b[32m%s\x1b[0m', `\nLetters: ${shuffledWord}. Anagrams left: ${anagrams.length}`)
    console.log('\x1b[1m%s\x1b[0m', `Score: ${score}\n`)
    return true
  }
  return false
}

const beginUserInput = (fromError) => {
  const question = fromError ? 'Try again: ' : 'Type in a word without spaces: '
  readline.question(question, (word) => {
    if (commandMap[word]) {
      commandMap[word]()
      return
    }
    if (verifyWord(word)) {
      beginUserInput()
      return;
    }
    beginUserInput(true)
  })
}

const getAllAnagrams = () => {
  return new Promise((resolve, reject) => {
    const options = { hostname: 'www.anagramica.com', path: `/all/${shuffledWord}`, method: 'GET' }
    const req = http.request(options, res => {
      res.setEncoding('utf8');
      res.on('data', (response) => {
        try {
          anagrams = JSON.parse(response).all.filter(anagram => anagram.length > 2)
          anagrams.push(originalWord)
          resolve(anagrams)
        } catch(e) {
          startGame()
        }
      });
    })
    req.end()
  })
}

const startGame = () => {
  const randomWordOptions = { hostname: 'random-word-api.herokuapp.com', port: 443, path: `/word?number=1`, method: 'GET' }
  const randomWordRequest = https.request(randomWordOptions, res => {
    res.setEncoding('utf8');
    res.on('data', function (body) {
      originalWord = JSON.parse(body)[0]
      shuffledWord = shuffleWord(originalWord)
      getAllAnagrams().then((results) => {
        if (results.length < 10) {
          return startGame()
        }
        console.log('\x1b[32m%s\x1b[0m', `\nYour letters are: ${shuffledWord}`);
        console.log('\x1b[1m%s\x1b[0m', `There are ${anagrams.length} possible words\n`)
        printHelp()
        beginUserInput()
      })
    });
  })
  randomWordRequest.end()
}

const commandMap = {
  help: printHelp,
  letters: () => console.log({letters: shuffledWord}),
  score: () => console.log({score}),
  restart: startGame,
  quit: () => process.exit(),
}

console.log('\nStarting a new game! While we grab a random word for you please read the rules...\n')
printRules()
startGame()
