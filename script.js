var vowels = ['a', 'e', 'i', 'o', 'u', 'y'];
var vowels_weights = [8, 13, 6, 8, 2, 2];
var consonants = ['b', 'c', 'd', 'f', 'g', 'h',	'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'x', 'z'];
var consonants_weights = [1.4, 2.7, 3.9, 2.9, 2.0, 5.2, 0.2, 0.4, 3.4, 2.5, 7.2, 2.0, 6.9, 6.1, 10.5, 0.9, 1.5, 0.2, 0.1]
var clicks = 0;
var letters = [];
var NUMBER_OF_LETTERS = 9;

function main(){
    var vowelButton = document.getElementById("vowel");
    var consonantButton = document.getElementById("consonant");
    var submitButton = document.getElementById('answer_button');
    var refresh_button = document.getElementById('refresh_button');

    vowelButton.onclick = getVowel;
    consonantButton.onclick = getConsonant;
    submitButton.onclick = submitAnswer;
    refresh_button.onclick = startGame;
    initCards();

    getLongestWord();
};

function getLongestWord() {
  var letters = 'EONODHARE';
  var url = "https://www.wordunscrambler.net/unscramble-letters.aspx?word=jfdjsjijsd";
  httpRequest = new XMLHttpRequest();
  httpRequest.open('GET', url, false);
  httpRequest.setRequestHeader('X-Test', 'one');
  httpRequest.send();

  httpRequest.onreadystatechange = function(){
    if(httpRequest.readyState == XMLHttpRequest.DONE && httpRequest.status == 200){
      console.log('запрос прошёл');
      console.log(httpRequest.response);
    } else {
      console.log('С запросом возникла проблема.');
    }   
  }
};

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
    document.getElementsByClassName("choice")[0].hidden = true;
    document.getElementsByClassName("word_input")[0].hidden = false;
  }
};

function addLetter(letter){
  var letterDiv = document.getElementsByClassName("letter")[clicks].children[0];
  letterDiv.innerHTML = letter.toUpperCase();
  letters.push(letter);
};

function submitAnswer(){
  var input = document.getElementById('answer');
  var word = input.value;
  var gameBlock = document.getElementsByClassName('game_block')[0];
  var messageBlock = document.getElementsByClassName('message_of_result')[0];

  gameBlock.classList.add('loading');
  messageBlock.hidden = true;
  check_word(word, letters);
}

function check_word(word, letters){
  var temp_list_of_letters = [...letters];

  for (var i=0; i<word.length; i++){
    if(temp_list_of_letters.includes(word[i])){
      temp_list_of_letters = removeItemOnce(temp_list_of_letters, word[i]);
    }
    else {
      return false;
    }
  }
  return check_word_exists_in_dic(word);
}

function removeItemOnce(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
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

function check_word_exists_in_dic(word) {
  var result_of_check = false;
  const url = "https://api.wordnik.com/v4/word.json/" + word + "/definitions?limit=200&includeRelated=false&useCanonical=false&includeTags=false&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5";
  httpRequest = new XMLHttpRequest();
  httpRequest.open('GET', url, true);
  httpRequest.onreadystatechange = function(){
    if(httpRequest.readyState == XMLHttpRequest.DONE && httpRequest.status == 200){
      console.log('запрос прошёл');
      result_of_check = true;
    } else {
      console.log('С запросом возникла проблема.');
    }
    setTimeout(show_result, 300, result_of_check);
  }
  httpRequest.send();
  return result_of_check;
};

function show_result(result_of_check)
{
  var messageBlock = document.getElementsByClassName('message_of_result')[0];
  messageBlock.hidden = false;

  document.getElementsByClassName('game_block')[0].classList.remove('loading');
  if(result_of_check){
    messageBlock.innerHTML = '👍';
  }
  else {
    messageBlock.innerHTML = '👎';
  }
}