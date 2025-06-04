var vowels = ['a', 'e', 'i', 'o', 'u', 'y'];
var vowels_weights = [8, 13, 6, 8, 2, 2];
var consonants = ['b', 'c', 'd', 'f', 'g', 'h',	'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'x', 'z'];
var consonants_weights = [1.4, 2.7, 3.9, 2.9, 2.0, 5.2, 0.2, 0.4, 3.4, 2.5, 7.2, 2.0, 6.9, 6.1, 10.5, 0.9, 1.5, 0.2, 0.1]
var clicks = 0;
var letters = [];
var NUMBER_OF_LETTERS = 9;
var jsonDict = [];

async function main(){
    var vowelButton = document.getElementById("vowel");
    var consonantButton = document.getElementById("consonant");
    var submitButton = document.getElementById('answer_button');
    var refresh_button = document.getElementById('refresh_button');
    var wordInput = document.getElementById("answer");

    vowelButton.onclick = getVowel;
    consonantButton.onclick = getConsonant;
    submitButton.onclick = submitAnswer;
    refresh_button.onclick = startGame;
    initCards();
    await initDictionary();

    wordInput.addEventListener("keypress", function(event) {
      if (event.key === "Enter") {
        event.preventDefault();
        submitButton.click();
      }
    });

    window.addEventListener("keypress", function(event){
      if (event.key === "v" && clicks < NUMBER_OF_LETTERS){
        event.preventDefault();
        vowelButton.click();
      }
      if (event.key === "c" && clicks < NUMBER_OF_LETTERS){
        event.preventDefault();
        consonantButton.click();
      }
    });
};

var wordsByLength = {};

async function initDictionary() {
  const response = await fetch('words_dictionary.json');
  jsonDict = await response.json();
  wordsByLength = {};
  for (const word in jsonDict) {
    const len = word.length;
    if (!wordsByLength[len]) {
      wordsByLength[len] = [];
    }
    wordsByLength[len].push(word);
  }
}

function initCards(){
  var lettersBlock = document.getElementsByClassName('letters')[0];
  for (var i = 0; i < NUMBER_OF_LETTERS; i++){
    var letterDiv = document.createElement("div");
    letterDiv.classList.add("letter");
    letterDiv.dataset.number = i;

    var p = document.createElement("p");
    letterDiv.append(p);
    lettersBlock.append(letterDiv);
  }
}

function startGame()
{ 
  document.getElementsByClassName('letters')[0].innerHTML = "";
  initCards();
  document.getElementsByClassName("choice")[0].hidden = false;
  document.getElementsByClassName("word_input")[0].hidden = true;
  document.getElementById('answer').value = '';
  document.getElementsByClassName("message_of_result")[0].hidden = true;
  
  clicks = 0;
  letters = [];
}

function getVowel(event){
    var vowel = weightedRandom(vowels, vowels_weights);
    // console.log(vowel);
    addLetter(vowel);
    clicks++;
    checkEndOfChoice();
};

function getConsonant(event){
  var consonant = weightedRandom(consonants, consonants_weights);
  // console.log(consonant);
  addLetter(consonant);
  clicks++;
  checkEndOfChoice();
};

function checkEndOfChoice(){
  if(clicks == NUMBER_OF_LETTERS){
    document.getElementsByClassName("word_input")[0].hidden = false;
    document.getElementsByClassName("choice")[0].hidden = true;
    document.getElementById("answer").focus();
  }
};

function addLetter(letter){
  var letterDiv = document.getElementsByClassName("letter")[clicks].children[0];
  letterDiv.innerHTML = letter.toUpperCase();
  letters.push(letter);
};

function submitAnswer(){
  var input = document.getElementById('answer');
  var word = input.value.toLowerCase();
  var gameBlock = document.getElementsByClassName('game_block')[0];
  var messageBlock = document.getElementsByClassName('message_of_result')[0];

  gameBlock.classList.add('loading');
  messageBlock.hidden = true;

  check_word(word, letters);
}

async function check_word(word, letters){
  if(Object.keys(wordsByLength).length === 0){
    await initDictionary();
  }
  const counts = getLetterCounts(letters);
  const longest = findLongestWord(letters);
  if(!word || !jsonDict[word] || !canFormWord(word, counts)){
    show_result(false, longest);
    return;
  }
  show_result(true, longest);
}



// Вспомогательные для логики функции 
function weightedRandom(items, weights) {
    if (items.length !== weights.length) {
      throw new Error('Items and weights must be of the same size');
    }
  
    if (!items.length) {
      throw new Error('Items must not be empty');
    }
  
    // Preparing the cumulative weights array.
    // For example:
    // - weights = [1, 4, 3]
    // - cumulativeWeights = [1, 5, 8]
    const cumulativeWeights = [];
    for (let i = 0; i < weights.length; i += 1) {
      cumulativeWeights[i] = weights[i] + (cumulativeWeights[i - 1] || 0);
    }
  
    // Getting the random number in a range of [0...sum(weights)]
    // For example:
    // - weights = [1, 4, 3]
    // - maxCumulativeWeight = 8
    // - range for the random number is [0...8]
    const maxCumulativeWeight = cumulativeWeights[cumulativeWeights.length - 1];
    const randomNumber = maxCumulativeWeight * Math.random();
  
    // Picking the random item based on its weight.
    // The items with higher weight will be picked more often.
    for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
      if (cumulativeWeights[itemIndex] >= randomNumber) {
        return items[itemIndex];
      }
    }
};


function getLetterCounts(arr) {
  const counts = {};
  for (const ch of arr) {
    counts[ch] = (counts[ch] || 0) + 1;
  }
  return counts;
}

function canFormWord(word, counts) {
  const wc = {};
  for (const ch of word) {
    wc[ch] = (wc[ch] || 0) + 1;
    if (wc[ch] > (counts[ch] || 0)) {
      return false;
    }
  }
  return true;
}

function findLongestWord(letters) {
  const counts = getLetterCounts(letters);
  for (let len = letters.length; len >= 1; len--) {
    const words = wordsByLength[len] || [];
    for (const w of words) {
      if (canFormWord(w, counts)) {
        return w;
      }
    }
  }
  return '';
}


function show_result(result_of_check, longestWord='')
{
  var messageBlock = document.getElementsByClassName('message_of_result')[0];
  messageBlock.hidden = false;  

  document.getElementsByClassName('game_block')[0].classList.remove('loading');
  if(result_of_check){
    messageBlock.innerHTML = 'Well done! 👍<br> You could do: '+capitalizeFirstLetter(longestWord);
  }
  else {
    messageBlock.innerHTML = 'Try again! 🤔<br> You could do: '+capitalizeFirstLetter(longestWord);
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}