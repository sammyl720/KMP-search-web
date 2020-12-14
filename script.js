const textInput = document.getElementById('text')
const patternInput = document.getElementById('pattern')
const searchBtn = document.getElementById('search');
const form = document.getElementById('form');
const resultsHook = document.getElementById('results');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = textInput.value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const pattern = patternInput.value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  textInput.value = '';
  patternInput.value = '';
  if(text.length === 0 || pattern.length === 0 || pattern.length > text.length){
    // console.log('No Matches Can Be Found\nInvalid Input.')
    return alert('No Matches Can Be Found\nInvalid Input.')
  }

  let matches = searchForPattern(text, pattern) || [];
  const resultsContainer = document.createElement('div')
  resultsContainer.classList.add('results-container')
  if(matches.length) {
    const resultText = formatText(text, matches);
    let links = '';
    for(let j = 1;j <= matches.length;j++){
      links += `<li class='link-item'><a href='#result-${j}'>Match ${j}</a></li>`;
    }
    resultsContainer.innerHTML = `
    <div class='matches-info'>Found <span class='number-of-matches'>${matches.length} match${matches.length > 1 ? 'es': ''}</span> for <span class='result-ptrn'>"${pattern}"</span> in <br /><span class='result-txt-substr'>"${text.substr(0,40)}..."</span>
    <br />
    <ul class='links'>${links}</ul>
    </div>
    <div class='result-text'>
      ${resultText}
    </div>
    `
  } else {
    resultsContainer.innerHTML = `<div class='no-result'>
    No results for <span class='result-ptrn'>"${pattern}"</span> found in <br /><span class='result-txt-substr'>"${text.substr(0,20)}..."</span>
    </div>`
  }

  resultsHook.innerHTML = ''
  resultsHook.appendChild(resultsContainer);
})

function formatText(text, matchesArray){
  let resultText = '';
  let textToArray = text.split('');
  let start = 0;
  let matchStart = 0;
  while(start < textToArray.length){
    if(matchStart > matchesArray.length - 1){
      resultText += textToArray.splice(start).join('');
      break;
    }
    if(start === matchesArray[matchStart]['begin']){
      resultText += `<span class='highlight' id='result-${matchStart + 1}'>${textToArray[start]}`
    } else if(start === matchesArray[matchStart]['end']){
      resultText += `${textToArray[start]}</span>`
      matchStart++;
    } else {
      resultText += textToArray[start];
    }
    start++;
  }
  resultText = '<p>' + resultText + "</p>";
  return resultText;
}

function searchForPattern(txt, ptrn){
  if(txt.length === 0 || ptrn.length === 0 || ptrn.length > txt.length){
    // console.log('No Matches Can Be Found\nInvalid Input.')
    return null;
  }
  txt = txt.toLowerCase()
  ptrn = ptrn.toLowerCase()
  // console.log(`Text: ${txt}\nPattern: ${ptrn}`)
  // KMP Pattern
  // steps
  // 1. Create a prefix array which has length of pattern
  const prefixs = Array(ptrn.length);
  // 2. Loop through array and insert the length of the max prefix that is also a
  // suffix at that point of pattern
  // - Hint: the max prefix/suffix value of each index can at most be 1 more than previous index - (i - 1) + 1. Also the value of first index is always 0, because a prefix cannot be its own suffix.
  // 3. The max prefix/suffix can be determined by a corresponding string of characters at the beginning of pattern/array
  let k = 1;
  for(let p = 0; p < prefixs.length; p++){
    if(p === 0){
      prefixs[p] = 0;
    } else if(ptrn[k - 1] === ptrn[p]){
      prefixs[p] = k;
      k++;
    } else {
      k = 1;
      prefixs[p] = 0;
    }
  }

  // console.log(`Pattern: ${ptrn}\nPrefixs: ${prefixs}`)
  // 4. After the prefix array initialization is done, Start looping through the text to search normaly, if ptrn[i] - where i (index of ptrn) equals 0 - does not match txt[j] - where j (index of txt) equals 0, increase j by 1 (j++). Effectively, restarting search at the second index. 

  // 5. If there is a match (ptrn[i] === txt[j]) you can increase i by 1 to check the next letter for match (ptrn[i] === text[j + i])
  // 6. If there is a mismatch after subsequent matches, increase j by the length of the pattern minus the value of prefix[i]
  // NOTE: The real improvement of KMP over Naive Search, is realized once there is a mismatch after subsequent matches. Instead of just increasing j (index of txt) by 1, we can increase it by the length of the pattern minus the value of prefix[i] - the max prefix/suffix possible at that index. This is because we can already determine that there will not be any matches between j and j plus (the length of pattern minus the value of prefix[i]) because prefix[i] determines the length of the max value of matches preceding j plus (the length of pattern).
  // 7. Repeat steps 4 through 6 until a complete match is found (step 8) or the end of the text has been reached (step 9).
  // 8. Once a complete is found, you can store the starting index of the match (j - i) and/or increase a tally of matches so far.
  // 9. Here is where the function has effectivily ended. Yo can return the number of matches found, an array of indexes at which a match begins in the text, or null / 0 if there where no matches
  let j = 0;
  let matches = [];
  textLoop:
  while(j < txt.length){
    // console.log(j, txt.length)
    ptrnLoop:
    for(let i = 0; i < ptrn.length; i++){
      if(txt[j] !== ptrn[i]){
        // eg ptrn = abdoab, prefix = [0,0,0,0,1,2], txt = welcomabdoabehome
        // initial run: txt[0 + 0] ?== ptrn[0], w ?= a ? no
        // increase index of txt by value of minus prefix[i]
        // increase j by i (0) - minus prefix[i] (0) = j + 0, j remains the same
        // break from i loop 
        // restart i loop
        j += (i + 1) - prefixs[i];
        break ptrnLoop;
      } else if(i === ptrn.length - 1){
        // i has checked its last index and where still in the loop
        // There is a match
        // the match starts at j - 1;
        // console.log(j - i);
        matches.push({ begin: j - i, end: j })
        j += (i + 1) - prefixs[i];
      } else {
        j++;
      }
    }
  }
  // console.log(matches)
  return matches.length ? matches : null;
}