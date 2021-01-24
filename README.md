# Anagram

A simple anagram game built with Nodejs. This was written in an attempt to create the game in less than 100 lines of JavaScript.

## Rules
* A random word will be shuffled. Use the letters to guess other words.
* For each letter in a correct guess you get 1 point.
* Guessing the original word will give you 2x the points as the length of the word.
* All words less than 3 letters long are omitted.

## Implementation Details
This app uses two freely available APIs. The first is `random-word-api.herokuapp.com` to fetch a single random word. The second is `www.anagramica.com`, which is passed the random word to retrieve all possible anagrams. If there are less than 10 possible anagrams it will fetch another random word to ensure the game is at least somewhat challenging. Then it strips out all anagrams that are less than 3 letters long.
