require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;

// Node packages
const childProcess = require('child_process');
const path = require('path');

// --------------------- CONSTANTS ---------------------

const DICE_FACES_NB = 6;
const LETTERS_DIR_PATH = path.join(__dirname, 'letters');
const OUTPUT_GRID_FILEPATH = path.join(__dirname, 'grids', 'grid.png');

// From the original dices of the french "Super" edition of the game
const DICES_5x5 = [
  "MIRSOA", "OEATIA", "OSETDN", "CMPDAE", "ONEDST",
  "ZAVEDN", "EEISFH", "RITABL", "NKETUO", "IHESNR",
  "RIEUWL", "TPSLUE", "AMORSI", "OXIARF", "GTNVEI",
  "ELUPTS", "AMOQJB", "OEUNKT", "PACEMD", "LGNYUE",
  "IEESHF", "LRBTIA", "EATIAO", "ARELCS", "OQAMJB",
];

// TODO: Update using the true dices from the game
const DICES_4x4 = [
  "MIRSOA", "OEATIA", "OSETDN", "CMPDAE",
  "ZAVEDN", "EEISFH", "RITABL", "NKETUO",
  "RIEUWL", "TPSLUE", "AMORSI", "OXIARF",
  "ELUPTS", "AMOQJB", "OEUNKT", "PACEMD",
];

// --------------------- FUNCTIONS ---------------------

// suffle the dices = shuffle the dices array
function shuffle(array) {
  let sArray = Array.from(array);
  for (let i = sArray.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [sArray[i], sArray[j]] = [sArray[j], sArray[i]];
  }
  return sArray;
}

function generateGrid(gridSize, orientLetters, lettersDirPath, outputGridFilePath) {

  // Default is 5x5
  let baseDices = DICES_5x5;
  if (gridSize === 4)
    baseDices = DICES_4x4;

  // Shuffle dices
  let shuffledDices = shuffle(DICES_5x5);
  console.log("After Shuffle: " + shuffledDices);


  // For each dice, select a random face (= a random letter)
  let rowNumberOfLetters = 0;
  let gridContentSequence = '';
  for (let dice of shuffledDices) {
    rowNumberOfLetters++;

    let randIdx = Math.floor(Math.random() * DICE_FACES_NB); // random between 0 and 5 included
    gridContentSequence += dice[randIdx];

    // Start a new line
    if (rowNumberOfLetters === gridSize)
      rowNumberOfLetters = 0;
  }

  let orientLettersPy = 'False';
  if (orientLetters)
    orientLettersPy = 'True';

  let GenerateGridCommand = 'python3 GenerateGrid.py 5 ' + gridContentSequence + ' ' + orientLettersPy + ' ' + lettersDirPath + ' ' + outputGridFilePath;
  console.log("Call '" + GenerateGridCommand + "'");

  // Generate grid subprocess
  childProcess.execSync(GenerateGridCommand, {
    cwd: __dirname
  });

}

/*
// If you want to manually generate 1000 grids for example
for (let i = 0; i < 1000; i++) {
  generateGrid(5, false, LETTERS_DIR_PATH, path.join(__dirname, 'grids', 'grid' + i + '.png') );
}
*/


// --------------------- DISCORD LOGIC ---------------------

bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});


bot.on('message', msg => {


  // ====================== Standard grid 5x5 (not oriented) ======================
  if (msg.content === '!bagle') {

    generateGrid(5, false, LETTERS_DIR_PATH, OUTPUT_GRID_FILEPATH);

    // Send image to channel
    msg.channel.send('Voici votre grille ! Bon jeu ;)', {
      files: [
        OUTPUT_GRID_FILEPATH
      ]
    });


    // ====================== Real grid 5x5 (oriented) ======================
  } else if (msg.content === '!vraibagle') {

    generateGrid(5, true, LETTERS_DIR_PATH, OUTPUT_GRID_FILEPATH);

    msg.channel.send('Voici votre grille ! Bon jeu ;)', {
      files: [
        OUTPUT_GRID_FILEPATH
      ]
    });


    // ====================== TESTING ======================
  } else if (msg.content === '!test') {

    generateGrid(5, true, LETTERS_DIR_PATH, OUTPUT_GRID_FILEPATH);
    msg.author.send('Voici la grille de test: ', {
      files: [
        OUTPUT_GRID_FILEPATH
      ]
    });

    // ====================== Help ======================
  } else if (msg.content === '!help') {

    msg.reply('Voici les commandes :' + '\n' +
      '!bagle pour une grille 5v5 (lettres droites)' + '\n' +
      '!vraibagle pour une grille 5v5 (lettres orientées aléatoirement)' + '\n' +
      'Bon jeu à toutes et à tous ! :)'
    );

  }

});
