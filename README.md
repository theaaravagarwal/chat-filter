# Advanced Profanity Filter

A sophisticated JavaScript-based profanity detection system that goes beyond simple word matching to detect various forms of profanity, including leetspeak, character substitutions, and word boundary cases.

## Features

- **Comprehensive Profanity Detection**
  - Direct word matching
  - Leetspeak detection (e.g., "f*ck", "sh1t")
  - Character substitution detection
  - Word boundary checking
  - Repeated character handling
  - Verb form detection (e.g., "fucking", "fucked")

- **Smart Filtering**
  - Dictionary-based validation to prevent false positives
  - Context-aware word boundary checking
  - Support for legitimate words containing profanity substrings
  - Customizable strictness levels

- **Performance Optimized**
  - Trie-based word lookup
  - Regex-based quick checks
  - Efficient dictionary loading and caching

## Installation

This is a local project. Simply clone or download the repository to use it:

```bash
git clone https://github.com/theaaravagarwal/chat-filter.git
```

## Usage

```javascript
const profanityFilter = require('./profanities.js');

// Initialize the filter
profanityFilter.init();

// Check if text is clean
const isClean = profanityFilter.isClean("Your text here");
console.log(isClean); // true or false
```

## Configuration Options

The filter can be configured with the following options:

```javascript
profanityFilter.init({
    strictness: 'medium', // 'low', 'medium', 'high'
    checkWordBoundaries: true,
    allowRepeatedLetters: false,
    checkLeetSpeak: true,
    useRegexForQuickCheck: true,
    useDictionary: true
});
```

## Testing

The project includes a comprehensive test suite that can be run using:

```bash
node profanity-tester.js
```

The test suite includes:

- Single message testing
- Preset test cases
- Edge case generation
- Performance benchmarking
- Comprehensive test suite

## Performance

The filter is optimized for performance with:

- Trie-based word lookup
- Regex-based quick checks
- Efficient dictionary loading
- Caching mechanisms

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Dictionary data sourced from standard English word lists
- Inspired by various open-source profanity filters
- Contributions from the open-source community
