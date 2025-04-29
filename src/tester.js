const fs = require('fs');
const readline = require('readline');
const profanityFilter = require('./profanities.js');

profanityFilter.init();

const logFile = 'profanity-test-results.txt';
fs.writeFileSync(logFile, `PROFANITY FILTER TEST RESULTS\n${new Date().toISOString()}\n\n`);

function log(message) {
  console.log(message);
  fs.appendFileSync(logFile, message + '\n');
}

function testMessage(message) {
  log(`\n---- TESTING MESSAGE ----`);
  log(`Message: "${message}"`);
  
  const startTime = performance.now();
  const isClean = profanityFilter.isClean(message);
  const endTime = performance.now();
  const timeTaken = (endTime - startTime).toFixed(2);
  
  log(`Result: ${isClean ? 'CLEAN ✓' : 'PROFANITY DETECTED ✗'}`);
  log(`Time taken: ${timeTaken}ms`);
  
  if (!isClean) {
    const words = message.split(/[\s.,!?;:()[\]{}'"\/\\-]+/);
    const profanities = words.filter(word => word.length > 2 && !profanityFilter.isClean(word));
    
    if (profanities.length > 0) {
      log(`Possible triggering words: ${profanities.join(', ')}`);
    } else {
      log('Profanity detected in combined words or with character substitutions');
    }
  }
  
  return isClean;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function showMainMenu() {
  console.clear();
  console.log('=== PROFANITY FILTER TESTER ===');
  console.log('1. Test a single message');
  console.log('2. Run preset test cases');
  console.log('3. Change filter settings');
  console.log('4. Run benchmark test');
  console.log('5. Run edge case generator tests');
  console.log('6. Run comprehensive test suite');
  console.log('7. Exit');
  rl.question('\nSelect an option (1-7): ', handleMenuSelection);
}

function handleMenuSelection(choice) {
  switch(choice) {
    case '1':
      testSingleMessage();
      break;
    case '2':
      runPresetTests();
      break;
    case '3':
      changeSettings();
      break;
    case '4':
      runBenchmark();
      break;
    case '5':
      runEdgeCaseGenerator();
      break;
    case '6':
      runComprehensiveTests();
      break;
    case '7':
      log('\nExiting profanity tester');
      log(`Results saved to ${logFile}`);
      rl.close();
      break;
    default:
      console.log('Invalid option, please try again');
      setTimeout(showMainMenu, 1000);
  }
}

function testSingleMessage() {
  rl.question('\nEnter message to test (or "back" to return to menu): ', message => {
    if (message.toLowerCase() === 'back') {
      showMainMenu();
      return;
    }
    
    testMessage(message);
    
    rl.question('\nPress Enter to continue or type another message: ', response => {
      if (response.trim() === '') {
        showMainMenu();
      } else {
        testMessage(response);
        rl.question('\nPress Enter to continue...', () => showMainMenu());
      }
    });
  });
}

function generateVariations(word, depth = 1, maxDepth = 3) {
  if (depth > maxDepth) return [word];
  
  const variations = [word];
  
  const substitutions = {
    'a': ['4', '@'],
    'e': ['3'],
    'i': ['1', '!'],
    'o': ['0'],
    's': ['5', '$'],
    't': ['7'],
    'u': ['v']
  };
  
  for (let i = 0; i < word.length; i++) {
    const letter = word[i].toLowerCase();
    const possibleSubs = substitutions[letter];
    
    if (possibleSubs) {
      for (const sub of possibleSubs) {
        const newVar = word.substring(0, i) + sub + word.substring(i + 1);
        variations.push(newVar);
        
        if (depth < maxDepth) {
          const nextVars = generateVariations(newVar, depth + 1, maxDepth);
          variations.push(...nextVars);
        }
      }
    }
  }
  
  return [...new Set(variations)];
}

function generateObfuscated(word) {
  const results = [];
  const separators = ['*', '.', '-', '_', ' ', '+'];
  
  for (const separator of separators) {
    let obfuscated = '';
    for (let i = 0; i < word.length; i++) {
      obfuscated += word[i];
      if (i < word.length - 1) {
        obfuscated += separator;
      }
    }
    results.push(obfuscated);
  }
  
  let mixedObfuscated = '';
  for (let i = 0; i < word.length; i++) {
    mixedObfuscated += word[i];
    if (i < word.length - 1) {
      const randSep = separators[Math.floor(Math.random() * separators.length)];
      mixedObfuscated += randSep;
    }
  }
  results.push(mixedObfuscated);
  
  return results;
}

function generateRepeatedChars(word) {
  const results = [];
  
  for (let i = 0; i < word.length; i++) {
    const repeats = Math.floor(Math.random() * 2) + 2;
    const repeated = word.substring(0, i) + word[i].repeat(repeats) + word.substring(i + 1);
    results.push(repeated);
  }
  
  let multipleRepeated = '';
  for (let i = 0; i < word.length; i++) {
    const repeats = Math.random() > 0.5 ? 1 : Math.floor(Math.random() * 2) + 2;
    multipleRepeated += word[i].repeat(repeats);
  }
  results.push(multipleRepeated);
  
  return results;
}

function generateMixedCase(word) {
  const results = [];
  
  let alternateCase = '';
  for (let i = 0; i < word.length; i++) {
    alternateCase += i % 2 === 0 ? word[i].toUpperCase() : word[i].toLowerCase();
  }
  results.push(alternateCase);
  
  let randomCase = '';
  for (let i = 0; i < word.length; i++) {
    randomCase += Math.random() > 0.5 ? word[i].toUpperCase() : word[i].toLowerCase();
  }
  results.push(randomCase);
  
  return results;
}

function generateCompoundWords(word) {
  const prefixes = ['super', 'mega', 'ultra', 'hyper', 'over', 'under', 'inter'];
  const suffixes = ['ism', 'ize', 'ify', 'able', 'tion', 'ing', 'ed'];
  
  const results = [];
  
  for (const prefix of prefixes) {
    results.push(prefix + word);
  }
  
  for (const suffix of suffixes) {
    results.push(word + suffix);
  }
  
  for (const prefix of prefixes.slice(0, 2)) {
    for (const suffix of suffixes.slice(0, 2)) {
      results.push(prefix + word + suffix);
    }
  }
  
  return results;
}

function runEdgeCaseGenerator() {
  log('\n======= RUNNING EDGE CASE GENERATOR TESTS =======');
  
  const baseWords = ['fuck', 'shit', 'ass', 'dick', 'cock', 'bitch'];
  
  let passed = 0;
  let total = 0;
  
  for (const baseWord of baseWords) {
    log(`\n--- Testing variations of "${baseWord}" ---`);
    
    const leetSpeakVariations = generateVariations(baseWord);
    const obfuscatedVariations = generateObfuscated(baseWord);
    const repeatedCharVariations = generateRepeatedChars(baseWord);
    const mixedCaseVariations = generateMixedCase(baseWord);
    const compoundWords = generateCompoundWords(baseWord);
    
    log('\nTesting leetspeak substitutions:');
    for (const variation of leetSpeakVariations) {
      total++;
      const isClean = profanityFilter.isClean(variation);
      log(`"${variation}": ${isClean ? 'CLEAN ✓' : 'PROFANITY DETECTED ✗'}`);
      
      if (!isClean) passed++;
      else log('  ⚠️ Failed to detect this variant');
    }
    
    log('\nTesting character insertion/obfuscation:');
    for (const variation of obfuscatedVariations) {
      total++;
      const isClean = profanityFilter.isClean(variation);
      log(`"${variation}": ${isClean ? 'CLEAN ✓' : 'PROFANITY DETECTED ✗'}`);
      
      if (!isClean) passed++;
      else log('  ⚠️ Failed to detect this variant');
    }
    
    log('\nTesting repeated characters:');
    for (const variation of repeatedCharVariations) {
      total++;
      const isClean = profanityFilter.isClean(variation);
      log(`"${variation}": ${isClean ? 'CLEAN ✓' : 'PROFANITY DETECTED ✗'}`);
      
      if (!isClean) passed++;
      else log('  ⚠️ Failed to detect this variant');
    }
    
    log('\nTesting mixed case:');
    for (const variation of mixedCaseVariations) {
      total++;
      const isClean = profanityFilter.isClean(variation);
      log(`"${variation}": ${isClean ? 'CLEAN ✓' : 'PROFANITY DETECTED ✗'}`);
      
      if (!isClean) passed++;
      else log('  ⚠️ Failed to detect this variant');
    }
    
    log('\nTesting compound words with embedded profanity:');
    for (const variation of compoundWords) {
      total++;
      const isClean = profanityFilter.isClean(variation);
      log(`"${variation}": ${isClean ? 'CLEAN ✓' : 'PROFANITY DETECTED ✗'}`);
      
      if (!isClean) passed++;
      else log('  ⚠️ Failed to detect this variant');
    }
  }
  
  log(`\nEdge Case Test Results: ${passed}/${total} variants detected (${Math.round(passed/total*100)}% detection rate)`);
  
  rl.question('\nPress Enter to continue...', showMainMenu);
}

function runPresetTests() {
  log('\n======= RUNNING PRESET TESTS =======');
  
  const testCases = [
    { message: 'This is a perfectly clean message', expected: true, category: 'Basic' },
    { message: 'This message has a bad word: fuck', expected: false, category: 'Basic' },
    { message: 'I need to assess the situation', expected: true, category: 'Whitelist' },
    { message: 'This message has l33t sp34k like sh1t', expected: false, category: 'Evasion' },
    { message: 'This message has f*u*c*k hidden', expected: false, category: 'Evasion' },
    { message: 'This message has fuuuuck with repeated chars', expected: false, category: 'Evasion' },
    { message: 'This message has FuCk with mixed case', expected: false, category: 'Evasion' },
    { message: 'This message has the word ass', expected: false, category: 'Word Boundary' },
    { message: 'This assignment needs to be completed', expected: true, category: 'Word Boundary' },
    { message: 'Assassin is a word that contains a bad substring', expected: true, category: 'Word Boundary' }
  ];
  
  let passed = 0;
  for (const testCase of testCases) {
    log(`\n[${testCase.category}] Testing: "${testCase.message}"`);
    const isClean = testMessage(testCase.message);
    
    if (isClean === testCase.expected) {
      log('✓ TEST PASSED');
      passed++;
    } else {
      log(`✗ TEST FAILED - Expected ${testCase.expected ? 'clean' : 'profanity'} but got ${isClean ? 'clean' : 'profanity'}`);
    }
  }
  
  log(`\nTest Results: ${passed}/${testCases.length} tests passed`);
  
  rl.question('\nPress Enter to continue...', showMainMenu);
}

function runComprehensiveTests() {
  log('\n======= RUNNING COMPREHENSIVE TEST SUITE =======');
  
  const testSuites = [
    {
      name: "Basic Profanity",
      cases: [
        { message: "fuck", expected: false },
        { message: "shit", expected: false },
        { message: "ass", expected: false },
        { message: "bitch", expected: false },
        { message: "cunt", expected: false },
        { message: "nigga", expected: false },
        { message: "This text contains fuck in it", expected: false },
        { message: "Clean text", expected: true }
      ]
    },
    {
      name: "Leetspeak & Character Substitution",
      cases: [
        { message: "sh1t", expected: false },
        { message: "f0ck", expected: false },
        { message: "b!tch", expected: false },
        { message: "a$$", expected: false },
        { message: "c0ck", expected: false },
        { message: "l33t sp34k 15 c00l", expected: true }
      ]
    },
    {
      name: "Character Insertion & Obfuscation",
      cases: [
        { message: "f*u*c*k", expected: false },
        { message: "s-h-i-t", expected: false },
        { message: "f.u.c.k", expected: false },
        { message: "f_u_c_k", expected: false },
        { message: "f**k", expected: false },
        { message: "s**t", expected: false }
      ]
    },
    {
      name: "Repeated Characters",
      cases: [
        { message: "fuuuck", expected: false },
        { message: "shiiiit", expected: false },
        { message: "asssss", expected: false },
        { message: "fuuuuuuck", expected: false },
        { message: "bassssic", expected: true }
      ]
    },
    {
      name: "Case Variation",
      cases: [
        { message: "FuCk", expected: false },
        { message: "sHiT", expected: false },
        { message: "BiTcH", expected: false },
        { message: "FUCK", expected: false },
        { message: "ASS", expected: false }
      ]
    },
    {
      name: "Word Boundaries",
      cases: [
        { message: "assessment", expected: true },
        { message: "assassin", expected: true },
        { message: "saturday", expected: true },
        { message: "cockroach", expected: true },
        { message: "scunthorpe", expected: true },
        { message: "bassoon", expected: true },
        { message: "passport", expected: true }
      ]
    },
    {
      name: "Mixed Techniques",
      cases: [
        { message: "f*u**c**k", expected: false },
        { message: "fUuÜcK", expected: false },
        { message: "sh-1-t", expected: false },
        { message: "a$*$", expected: false },
        { message: "f**********k", expected: false }
      ]
    },
    {
      name: "Edge Cases",
      cases: [
        { message: "thisisgoodbutfuckthis", expected: false },
        { message: "f u c k", expected: false },
        { message: "⓯⓾©⓴", expected: true },
        { message: "as*as*in", expected: true },
        { message: "Completely innocuous text", expected: true }
      ]
    }
  ];
  
  let totalPassed = 0;
  let totalTests = 0;
  
  for (const suite of testSuites) {
    log(`\n--- ${suite.name} Test Suite ---`);
    let suitePassed = 0;
    
    for (const testCase of suite.cases) {
      totalTests++;
      log(`\nTesting: "${testCase.message}"`);
      const isClean = profanityFilter.isClean(testCase.message);
      
      if (isClean === testCase.expected) {
        log(`✓ PASSED - ${isClean ? 'Clean as expected' : 'Profanity detected as expected'}`);
        suitePassed++;
        totalPassed++;
      } else {
        log(`✗ FAILED - Expected ${testCase.expected ? 'clean' : 'profanity'} but got ${isClean ? 'clean' : 'profanity'}`);
      }
    }
    
    log(`\n${suite.name} Results: ${suitePassed}/${suite.cases.length} tests passed`);
  }
  
  log(`\nComprehensive Test Suite Results: ${totalPassed}/${totalTests} tests passed (${Math.round(totalPassed/totalTests*100)}% success rate)`);
  
  rl.question('\nPress Enter to continue...', showMainMenu);
}

function changeSettings() {
  console.clear();
  console.log('=== FILTER SETTINGS ===');
  console.log(`1. Strictness: ${profanityFilter.options.strictness}`);
  console.log(`2. Check Word Boundaries: ${profanityFilter.options.checkWordBoundaries}`);
  console.log(`3. Allow Repeated Letters: ${profanityFilter.options.allowRepeatedLetters}`);
  console.log(`4. Check Leetspeak: ${profanityFilter.options.checkLeetSpeak}`);
  console.log(`5. Use Regex For Quick Check: ${profanityFilter.options.useRegexForQuickCheck}`);
  console.log('6. Back to main menu');
  
  rl.question('\nSelect setting to change (1-6): ', choice => {
    switch(choice) {
      case '1':
        rl.question('Enter strictness (low, medium, high): ', value => {
          if (['low', 'medium', 'high'].includes(value)) {
            profanityFilter.init({ ...profanityFilter.options, strictness: value });
            log(`Setting changed: strictness = ${value}`);
          } else {
            console.log('Invalid value. Using medium.');
            profanityFilter.init({ ...profanityFilter.options, strictness: 'medium' });
          }
          setTimeout(changeSettings, 1000);
        });
        break;
      case '2':
        profanityFilter.init({ ...profanityFilter.options, checkWordBoundaries: !profanityFilter.options.checkWordBoundaries });
        log(`Setting changed: checkWordBoundaries = ${profanityFilter.options.checkWordBoundaries}`);
        setTimeout(changeSettings, 1000);
        break;
      case '3':
        profanityFilter.init({ ...profanityFilter.options, allowRepeatedLetters: !profanityFilter.options.allowRepeatedLetters });
        log(`Setting changed: allowRepeatedLetters = ${profanityFilter.options.allowRepeatedLetters}`);
        setTimeout(changeSettings, 1000);
        break;
      case '4':
        profanityFilter.init({ ...profanityFilter.options, checkLeetSpeak: !profanityFilter.options.checkLeetSpeak });
        log(`Setting changed: checkLeetSpeak = ${profanityFilter.options.checkLeetSpeak}`);
        setTimeout(changeSettings, 1000);
        break;
      case '5':
        profanityFilter.init({ ...profanityFilter.options, useRegexForQuickCheck: !profanityFilter.options.useRegexForQuickCheck });
        log(`Setting changed: useRegexForQuickCheck = ${profanityFilter.options.useRegexForQuickCheck}`);
        setTimeout(changeSettings, 1000);
        break;
      case '6':
        showMainMenu();
        break;
      default:
        console.log('Invalid option, please try again');
        setTimeout(changeSettings, 1000);
    }
  });
}

function runBenchmark() {
  log('\n======= RUNNING PERFORMANCE BENCHMARK =======');
  const iterations = 1000;
  const testCases = [
    { input: 'This is a clean message without any bad words', desc: 'Clean text' },
    { input: 'This message contains the word fuck hidden inside', desc: 'Text with profanity' },
    { input: 'This message has a l33t sp34k b@d w0rd sh1t', desc: 'Text with leetspeak' }
  ];
  
  for (const testCase of testCases) {
    log(`\nBenchmarking: ${testCase.desc}`);
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      profanityFilter.isClean(testCase.input);
    }
    
    const endTime = performance.now();
    const timeTaken = (endTime - startTime).toFixed(2);
    
    log(`Processed ${iterations} iterations in ${timeTaken}ms`);
    log(`Average time per check: ${(timeTaken / iterations).toFixed(4)}ms`);
  }
  
  rl.question('\nPress Enter to continue...', showMainMenu);
}

log('Starting profanity filter tester...');
showMainMenu();
