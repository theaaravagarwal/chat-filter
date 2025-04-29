const fs = require('fs');
const https = require('https');
const path = require('path');

const blacklistSet = new Set([
	'anal', 'anilingus', 'anus', 'areola', 'b1tch', 'ballsack', 'bitch', 'blowjob',
	'boner', 'boob', 'bukkake', 'cameltoe', 'carpetmuncher', 'chinc', 'chink', 'chode',
	'clit', 'cock', 'coital', 'coon', 'cum', 'cunilingus', 'cunnilingus', 'cunt',
	'dick', 'dike', 'dildo', 'dong', 'dyke', 'ejaculate', 'erection', 'fack', 'fag',
	'felch', 'fellate', 'fellatio', 'feltch', 'foreskin', 'fuck', 'fuk', 'goatse',
	'goldenshower', 'handjob', 'hardon', 'hitler', 'horny', 'jerkoff', 'jism', 'jiz',
	'kkk', 'labia', 'lesbo', 'lezbo', 'masterbat', 'masturbat', 'menstruat', 'muff',
	'nazi', 'negro', 'nigga', 'niger', 'nigger', 'nipple', 'nympho', 'oral', 'orgasm',
	'orgies', 'orgy', 'pantie', 'panty', 'pedo', 'penetrat', 'penial', 'penile',
	'penis', 'phalli', 'phuck', 'piss', 'pms', 'poon', 'porn', 'prostitut', 'pube',
	'pubic', 'pubis', 'puss', 'pussies', 'pussy', 'puto', 'queaf', 'queef', 'queer',
	'rape', 'rapist', 'rectal', 'rectum', 'rectus', 'reich', 'rimjob', 'schlong',
	'scrote', 'scrotum', 'semen', 'sex', 'shit', 'skank', 'slut', 'sodomize', 'sperm',
	'spunk', 'stfu', 'tampon', 'tard', 'testes', 'testicle', 'testis', 'tits', 'tramp',
	'turd', 'twat', 'undies', 'urinal', 'urine', 'uterus', 'vag', 'vagina', 'viagra',
	'virgin', 'vulva', 'wang', 'wank', 'weiner', 'wetback', 'whoralicious', 'whore',
	'whoring', 'wigger', 'gaes', 'gaez', 'nogger', 'ass'
]);

const problematicSubstrings = new Map([
  ['anal', ['analysis', 'analytics', 'analyze', 'canal', 'analgesia', 'anally', 'analytic', 'analyst', 'analization']],
  ['anus', ['tetanus', 'uranus', 'janus']],
  ['ass', ['assassin', 'assault', 'assemble', 'assess', 'asset', 'assign', 'assist', 'associate', 'assume', 'assure', 'bass', 
           'class', 'glass', 'grass', 'mass', 'pass', 'assimilate', 'passive', 'passion', 'assembly', 'cassette', 'chassis', 
           'classification', 'compass', 'sassafras', 'embassy', 'embarrass', 'ambassador', 'classic', 'compassion', 'trespass']],
  ['blow', ['blower', 'blowfish', 'blowout', 'below', 'blowgun', 'blowhole', 'blowpipe', 'blowhard', 'elbow']],
  ['cock', ['cockpit', 'cockroach', 'peacock', 'hancock', 'woodcock', 'cockatoo', 'cockatiel', 'cocktail', 'shuttlecock', 'gamecock', 'cockerel']],
  ['cunt', ['scunthorpe']],
  ['cum', ['accumulate', 'cucumber', 'document', 'circumstance', 'cumulative', 'scum', 'acumen', 'incumbent', 'circumference', 'documentary']],
  ['dick', ['dictionary', 'dickens', 'dickinson', 'benedict', 'addiction', 'predict', 'verdict', 'dictate', 'vindicate', 'abdicate']],
  ['fag', ['faggio', 'faggot bread']],
  ['hell', ['hello', 'shell', 'hellenic', 'helicopter']],
  ['homo', ['homogeneous', 'homologous', 'homonym', 'homophone', 'homology', 'homework', 'homeowner']],
  ['jerk', ['jerky', 'jerkily', 'kneejerk']],
  ['puss', ['pussy cat', 'pussycat', 'pushy', 'pustule']],
  ['sex', ['sexagesimal', 'sexangle', 'sexennial', 'sextant', 'sextile', 'sexual harassment', 'middlesex', 'essex', 'sussex', 'sexy']],
  ['shit', ['shitake']],
  ['tit', ['titanic', 'titian', 'titicaca', 'title', 'constitution', 'institution', 'petite', 'quantitative', 'entitled', 'entirety', 'entity']]
]);

const substitutions = {
	'a': ['4', '@', 'á', 'à', 'â', 'ä', 'å', 'ã', 'α', 'а'],
	'b': ['8', '6', 'ß', 'б'],
	'c': ['(', '<', 'ç', 'с'],
	'e': ['3', '€', 'è', 'é', 'ê', 'ë', 'ε', 'е', 'ё'],
	'i': ['1', '!', '|', 'í', 'ì', 'î', 'ï', 'ι', 'и'],
	'l': ['1', '|', 'í', 'l', 'і'],
	'o': ['0', '()', 'ø', 'ó', 'ò', 'ô', 'ö', 'õ', 'о'],
	's': ['5', '$', 'ś', 'š', 'с'],
	't': ['7', '+', 'т'],
	'u': ['μ', 'υ', 'ú', 'ù', 'û', 'ü', 'у'],
	'v': ['\\/', 'v'],
	'w': ['vv', '\\/\\/', 'w'],
	'x': ['%', '*', 'х'],
	'y': ['j', 'ý', 'ÿ', 'у']
};

const leetPatterns = [
    /sh[i!1|]t/i,
    /sh[i!1|][t7\+]/i,
    /sh1t/i,
    /5h[i!1|]t/i,
    /5h1t/i,
    /f[uμυúùûü][c(kк<]{1,2}/i,
    /f[uμυúùûü]k/i,
    /f[uμυúùûü][c(]k/i,
    /f[uμυúùûü]ck/i,
    /ph[uμυúùûü][c(]k/i,
    /f\*+[uμυúùûü]+[c(]*k/i,
    /f[\W_]*u[\W_]*c[\W_]*k/i,
    /f[\W_]*v[\W_]*c[\W_]*k/i,
    /f[\W_]*u[\W_]*k/i,
    /s[\W_]*h[\W_]*[i1!|][\W_]*t/i,
    /[a@4][s$5][s$5]/i,
    /[a@4]ss/i,
    /b[i!1|][t7]ch/i,
    /b[i!1|]tch/i,
    /b1tch/i,
    /p[uμυúùûü][s$5][s$5]y/i,
    /pu[s$5][s$5]y/i,
    /d[i!1|][c(]k/i, 
    /d1ck/i,
    /n[i!1|]gg[a@4]/i,
    /n1gg[a@4]/i,
    /[c(][uμυúùûü]nt/i,
    /t[i!1|]t[s$5]/i,
    /[c(][o0]ck/i,
    /sh[\W_]*[i1!|][\W_]*t/i,
    /f[\W_]*[o0u][\W_]*[c(][\W_]*k/i,
    /c[\W_]*[uv][\W_]*n[\W_]*t/i,
    /a[\W_]*s[\W_]*s/i,
    /a[\W_]*\$[\W_]*\$/i,
    /b[\W_]*[i!1][\W_]*t[\W_]*c[\W_]*h/i,
    /f[\W_]*\*+[\W_]*k/i,
    /s[\W_]*\*+[\W_]*t/i,
];

const dictionaryFile = 'english-words.txt';
const dictionaryPath = path.join(__dirname, dictionaryFile);
const dictionaryUrl = 'https://raw.githubusercontent.com/dwyl/english-words/master/words.txt';
const commonEnglishWords = new Set([ 
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it',
  'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this',
  'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
  'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'class', 'associate', 'assignment', 'assessment', 'assets', 'assembly',
  'assistance', 'assume', 'assure', 'classic', 'passion', 'compass',
  'document', 'circumstance', 'dictionary', 'hello', 'title', 'analysis'
]);

const verbForms = [
  /fuck(ing|ed|s)$/i,
  /dick(ing|ed|s)$/i,
  /cock(ing|ed|s)$/i,
  /ass(ing|ed|s)$/i,
  /bitch(ing|ed|s)$/i,
  /shit(ing|ed|s)$/i,
];

const charInsertionPatterns = [
	/c[\s.\-+_*]*o[\s.\-+_*]*c[\s.\-+_*]*k/i, 
	/d[\s.\-+_*]*i[\s.\-+_*]*c[\s.\-+_*]*k/i, 
	/f[\s.\-+_*]*u[\s.\-+_*]*c[\s.\-+_*]*k/i, 
	/s[\s.\-+_*]*h[\s.\-+_*]*i[\s.\-+_*]*t/i, 
	/a[\s.\-+_*]*s[\s.\-+_*]*s/i, 
	/b[\s.\-+_*]*i[\s.\-+_*]*t[\s.\-+_*]*c[\s.\-+_*]*h/i, 
	/c[\s.\-+_*]*u[\s.\-+_*]*n[\s.\-+_*]*t/i,
];

const complexLeetPatterns = [
	/[5$]h[i!1][7t]/i, 
	/[a@4][s$5][s$5]/i, 
	/[d][i!1][c(][k]/i,
];

const hardWhitelist = new Set([
	//add custom exceptions to the blacklist here
]);

module.exports = {
	tree: {},
	treeBuilt: false,
	substitutionMap: new Map(),
	problematicWordsMap: new Map(),
	englishDictionary: new Set(),
	dictionaryLoaded: false,
	lastDictionaryCheck: 0,
	profanityRegex: null,
	options: {
		strictness: 'medium', 
		checkWordBoundaries: true,
		allowRepeatedLetters: false,
		checkLeetSpeak: true,
		useRegexForQuickCheck: true,
		useDictionary: true
	},
	init: function (customOptions = {}) {
		this.options = { ...this.options, ...customOptions };
		this.tree = {};
		this.treeBuilt = false;
		this.substitutionMap.clear();
		this.problematicWordsMap.clear();
		for (const [char, subs] of Object.entries(substitutions)) {
			for (const sub of subs) {
				this.substitutionMap.set(sub, char);
			}
		}
		for (const [substring, words] of problematicSubstrings.entries()) {
		    for (const word of words) {
		        this.problematicWordsMap.set(word.toLowerCase(), true);
		    }
		}
		
		
		if (this.options.useRegexForQuickCheck) {
			
			const escapedWords = Array.from(blacklistSet).map(word => 
				word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
			);
			
			const pattern = this.options.checkWordBoundaries ? 
				'\\b(' + escapedWords.join('|') + ')\\b' : 
				'(' + escapedWords.join('|') + ')';
				
			this.profanityRegex = new RegExp(pattern, 'i');
		}
		
		
		if (this.options.useDictionary) {
			this.ensureDictionaryLoaded();
		}
		
		return this;
	},
	
	

	ensureDictionaryLoaded: function() {
		
		if (this.dictionaryLoaded) {
			return Promise.resolve();
		}
		
		
		const now = Date.now();
		if (now - this.lastDictionaryCheck < 10000) { 
			return Promise.resolve();
		}
		
		this.lastDictionaryCheck = now;
		
		
		if (fs.existsSync(dictionaryPath)) {
			
			return this.loadDictionaryFromFile();
		} else {
			
			return this.downloadAndLoadDictionary();
		}
	},
	
	

	downloadAndLoadDictionary: function() {
		console.log('Dictionary file not found. Downloading...');
		
		return new Promise((resolve) => {
			
			const file = fs.createWriteStream(dictionaryPath);
			
			https.get(dictionaryUrl, (response) => {
				
				if (response.statusCode !== 200) {
					console.error(`Failed to download dictionary: ${response.statusCode}`);
					file.close();
					
					try {
						fs.unlinkSync(dictionaryPath);
					} catch (e) {
						
					}
					resolve();
					return;
				}
				
				
				response.pipe(file);
				
				
				file.on('finish', () => {
					file.close();
					console.log('Dictionary downloaded successfully.');
					
					this.loadDictionaryFromFile().then(resolve);
				});
				
			}).on('error', (err) => {
				console.error('Error downloading dictionary:', err.message);
				file.close();
				
				try {
					fs.unlinkSync(dictionaryPath);
				} catch (e) {
					
				}
				resolve();
			});
		});
	},

	

	loadDictionaryFromFile: function() {
		console.log('Loading dictionary from file...');
		
		return new Promise((resolve) => {
			
			this.englishDictionary.clear();
			
			try {
				
				const lineReader = require('readline').createInterface({
					input: fs.createReadStream(dictionaryPath),
					crlfDelay: Infinity
				});
				
				lineReader.on('line', (line) => {
					
					if (line && line.trim().length > 1) {
						this.englishDictionary.add(line.trim().toLowerCase());
					}
				});
				
				lineReader.on('close', () => {
					console.log(`Dictionary loaded with ${this.englishDictionary.size} words.`);
					this.dictionaryLoaded = true;
					resolve();
				});
				
				lineReader.on('error', (err) => {
					console.error('Error reading dictionary file:', err.message);
					resolve();
				});
			} catch (err) {
				console.error('Error setting up dictionary reader:', err.message);
				resolve();
			}
		});
	},

	

	isInDictionary: function(word) {
		if (!word) return false;
		
		word = word.toLowerCase().trim();
		
		
		
		if (blacklistSet.has(word)) {
			return false;
		}
		
		
		if (hardWhitelist.has(word)) {
			return true;
		}
		
		
		if (commonEnglishWords.has(word)) {
			return true;
		}
		
		
		if (this.dictionaryLoaded) {
			return this.englishDictionary.has(word);
		}
		
		
		if (this.options.useDictionary) {
			this.ensureDictionaryLoaded();
		}
		
		
		return false;
	},

	

	buildTrieIfNeeded: function() {
		if (this.treeBuilt) return;
		
		
		for (const word of blacklistSet) {
			this.buildPath(word);
		}
		this.treeBuilt = true;
	},

	

	buildPath: function (chain, node) {
		node = node || this.tree;
		const letter = chain[0];

		if (!node[letter]) {
			node[letter] = {};
		}

		if (chain.length > 1) {
			this.buildPath(chain.substr(1), node[letter]);
		} else {
			
			node[letter]['$'] = true;
		}
	},

	

	isLegitimateWord: function(text) {
		if (!text) return false;
		const lower = text.toLowerCase().trim();
		
		
		if (hardWhitelist.has(lower)) {
			return true;
		}
		
		
		if (blacklistSet.has(lower)) {
			return false;
		}
		
		
		if (this.problematicWordsMap.has(lower)) {
			return true;
		}
		
		
		if (this.isInDictionary(lower)) {
			return true;
		}
		
		
		for (const [substring, words] of problematicSubstrings.entries()) {
			if (lower.includes(substring)) {
				
				for (const word of words) {
					
					
					if (word.includes(lower) || lower.includes(word)) {
						return true;
					}
					
					
					const prefixes = ['un', 're', 'de', 'in', 'im', 'dis', 'pre', 'post', 'non', 'anti'];
					const suffixes = ['s', 'es', 'ed', 'ing', 'er', 'or', 'ion', 'ions', 'ive', 'ment', 'ency', 'ence', 'able', 'ible'];
					
					for (const prefix of prefixes) {
						if (lower === prefix + word) return true;
					}
					
					for (const suffix of suffixes) {
						if (lower === word + suffix) return true;
					}
				}
			}
		}
		
		return false;
	},

	

	containsProfanityButIsLegitimate: function(word) {
		if (!word || word.length <= 3) return false;
		
		word = word.toLowerCase().trim();
		
		
		if (hardWhitelist.has(word)) {
			return true;
		}
		
		
		if (blacklistSet.has(word)) {
			return false;
		}
		
		
		
		if (this.isInDictionary(word)) {
			return true;
		}
		
		
		
		for (const profanity of blacklistSet) {
			if (profanity.length <= 2) continue; 
			
			
			if (word.includes(profanity)) {
				
				if (word === profanity) {
					return false;
				}

				
				if (this.problematicWordsMap.has(word)) {
					return true;
				}
				
				
				return false;
			}
		}
		
		return false;
	},

	

	normalizeText: function(text) {
		if (!this.options.checkLeetSpeak) {
			return text;
		}
		
		let normalized = '';
		const len = text.length;
		for (let i = 0; i < len; i++) {
			const char = text[i];
			
			normalized += this.substitutionMap.get(char) || char;
		}
		
		return normalized;
	},

	

	checkLeetPatterns: function(word) {
		
		if (!word || word.length < 3) return false;
		
		
		if (this.isLegitimateWord(word)) {
			return false;
		}
		
		
		return leetPatterns.some(pattern => pattern.test(word));
	},

	

	checkCharacterObfuscation: function(text) {
		
		if (this.isLegitimateWord(text)) {
			return false;
		}

		
		const simplified = text.replace(/[\W\s_]/g, '').toLowerCase();
		if (hardWhitelist.has(simplified)) {
			return false;
		}
		
		
		for (const pattern of charInsertionPatterns) {
			if (pattern.test(text)) {
				
				if (this.isLegitimateWord(simplified)) {
					return false;
				}
				return true;
			}
		}
		
		
		if (/f[\W_]*u[\W_]*c[\W_]*k/i.test(text)) {
			if (this.isLegitimateWord(simplified)) {
				return false;
			}
			return true;
		}
		
		if (/s[\W_]*h[\W_]*i[\W_]*t/i.test(text)) {
			if (this.isLegitimateWord(simplified)) {
				return false;
			}
			return true;
		}
		
		if (/c[\W_]*u[\W_]*n[\W_]*t/i.test(text)) {
			if (this.isLegitimateWord(simplified)) {
				return false;
			}
			return true;
		}
		
		if (/a[\W_]*s[\W_]*s/i.test(text)) {
			
			if (this.isLegitimateWord(simplified)) {
				return false;
			}
			
			for (const word of problematicSubstrings.get('ass') || []) {
				if (simplified.includes(word.toLowerCase()) || word.toLowerCase().includes(simplified)) {
					return false;
				}
			}
			return true;
		}
		
		
		if (/f\*+k/i.test(text) || /s\*+t/i.test(text)) {
			return true;
		}
		
		return false;
	},

	

	checkVerbForms: function(word) {
		if (!word || word.length <= 3) return null;
		
		
		for (const pattern of verbForms) {
			if (pattern.test(word)) {
				
				const match = word.match(pattern);
				if (match) {
					const baseProfanity = word.replace(/(ing|ed|s)$/i, '');
					if (blacklistSet.has(baseProfanity.toLowerCase())) {
						return baseProfanity;
					}
				}
			}
		}
		
		return null;
	},

	

	checkComplexLeetspeak: function(word) {
		if (!word || word.length <= 2) return null;
		
		
		for (const pattern of complexLeetPatterns) {
			if (pattern.test(word)) {
				return word;
			}
		}
		
		return null;
	},

	

	isStandaloneProfanity: function(word, text) {
		if (!word || word.length <= 2) return false;
		
		
		if (hardWhitelist.has(word.toLowerCase())) {
			return false;
		}
		
		
		if (this.isLegitimateWord(word)) {
			return false;
		}
		
		
		if (blacklistSet.has(word.toLowerCase())) {
			return true;
		}
		
		
		const wordBoundaryRegex = new RegExp(`\\b${word}\\b`, 'i');
		const originalText = text || word;
		
		return wordBoundaryRegex.test(originalText);
	},

	

	checkWordBoundaries: function(word, text) {
		
		if (word.length <= 2) return false;
		
		
		if (hardWhitelist.has(word.toLowerCase())) {
			return false;
		}
		
		
		if (this.isLegitimateWord(word)) {
			return false;
		}
		
		for (const badWord of blacklistSet) {
			
			if (badWord.length <= 2) continue;
			
			
			if (this.isLegitimateWord(word)) {
				continue;
			}
			
			
			if (word.toLowerCase().includes(badWord)) {
				
				if (word.toLowerCase() === badWord) {
					return true;
				}
				
				
				if (this.containsProfanityButIsLegitimate(word)) {
					return false;
				}
				
				
				if (text) {
					const regex = new RegExp(`\\b${badWord}\\b`, 'i');
					if (regex.test(text)) {
						return true;
					}
				}
				
				
				if (badWord.length >= 4 && 
				    !this.isLegitimateWord(word) && 
				    !text.match(/\w+/g)?.some(w => this.isLegitimateWord(w))) {
					return true;
				}
			}
		}
		
		return false;
	},

	

	isClean: function(text) {
		
		if (!text || text.length === 0) {
			return true;
		}
		
		
		const lowerText = text.toLowerCase().trim();
		
		
		
		if (blacklistSet.has(lowerText)) {
			return false;
		}
		
		
		
		const noSpacesText = lowerText.replace(/\s+/g, "");
		if (blacklistSet.has(noSpacesText)) {
			return false;
		}
		
		
		for (const word of blacklistSet) {
			if (word.length <= 3) continue; 
			
			
			const letterPattern = word.split('').join('\\s*');
			const spaceEvadeRegex = new RegExp(`\\b${letterPattern}\\b`, 'i');
			
			if (spaceEvadeRegex.test(text)) {
				return false;
			}
		}
		
		
		const verbEndingRegex = /(ing|ed|s|er|es)$/i;
		const possibleBase = lowerText.replace(verbEndingRegex, '');
		if (blacklistSet.has(possibleBase)) {
			
			return false;
		}
		
		
		
		const withoutRepeats = lowerText.replace(/(.)\1+/g, '$1');
		if (withoutRepeats !== lowerText) {
			
			if (blacklistSet.has(withoutRepeats) && !this.isInDictionary(lowerText)) {
				return false;
			}
			
			
			if (this.isInDictionary(withoutRepeats)) {
				return true;
			}
		}
		
		
		if ((lowerText.includes('ass') || lowerText.includes('a55') || 
			 lowerText.includes('a$$') || lowerText.includes('@ss')) &&
			!this.isInDictionary(lowerText)) {
			
			
			if (lowerText.match(/\b(cl|gr|br|p)ass/) || 
				lowerText.match(/\bass(ign|ist|ess|ume|et|emble|ociat|imil|ert)/) || 
				lowerText.match(/\b(b|cl|gl|m)ass\b/)) { 
				
			} else {
				
				return false;
			}
		}
		
		
		if (this.isInDictionary(lowerText)) {
			return true;
		}
		
		
		const processObfuscatedText = (text) => {
			
			const separators = ['.', '-', '+', ' ', '_', '*', '|', '/', '\\', '!', '@', '#', '$', '%', '^', '&'];
			
			
			for (const profanity of blacklistSet) {
				if (profanity.length <= 3) continue; 
				
				
				for (const sep of separators) {
					
					const obfuscated = profanity.split('').join(sep);
					if (text.includes(obfuscated)) {
						return false; 
					}
					
					
					const mixedCase = profanity.split('').map((c, i) => 
						i % 2 === 0 ? c.toUpperCase() : c).join(sep);
					if (text.toLowerCase().includes(mixedCase.toLowerCase())) {
						return false; 
					}
				}
			}
			
			return true; 
		};
		
		if (!processObfuscatedText(lowerText)) {
			return false;
		}
		
		for (const pattern of verbForms) {
			if (pattern.test(text)) {
				
				const match = text.match(pattern);
				if (match && match[0]) {
					
					
					const baseWord = match[0].replace(/ing$|ed$|s$/, '');
					if (blacklistSet.has(baseWord)) {
						return false;
					}
					
					if (!blacklistSet.has(baseWord) && this.isInDictionary(match[0])) {
						continue;
					}
					
					return false;
				}
			}
		}
		
		for (const pattern of charInsertionPatterns) {
			if (pattern.test(text)) {
				
				const match = text.match(pattern);
				if (match && match[0]) {
					
					const stripped = match[0].replace(/[^a-zA-Z0-9]/g, '');
					if (!blacklistSet.has(stripped) && this.isInDictionary(match[0])) {
						continue;
					}
					
					return false;
				}
			}
		}
		
		if (this.isLegitimateWord(text)) {
			return true;
		}
		
		if (this.checkCharacterObfuscation(text)) {
			return false;
		}
		
		
		this.buildTrieIfNeeded();
		
		
		const exactWordPatterns = [
			/\bass\b/i, 
			/\bshit\b/i,  
			/\bcunt\b/i, 
			/\bf0ck\b/i, 
			/\bb!tch\b/i,
			/\bf\*+k\b/i,
			/\bs\*+t\b/i,
			
			/[5$][h#][i!1][7t]/i,  
			/[fph][\*\.]?[u\*][c\*][k\*]/i  
		];
		
		for (const pattern of exactWordPatterns) {
			if (pattern.test(text)) {
				return false;
			}
		}
		
		
		const compoundWordPrefixes = ['super', 'mega', 'ultra', 'hyper', 'over', 'under', 'inter'];
		const compoundWordSuffixes = ['ing', 'ed', 's', 'ism', 'ize', 'ify', 'able', 'tion'];
		
		for (const profanity of blacklistSet) {
			if (profanity.length <= 3) continue;
			
			
			for (const prefix of compoundWordPrefixes) {
				if (lowerText === prefix + profanity) {
					return false;
				}
			}
			
			for (const suffix of compoundWordSuffixes) {
				if (lowerText === profanity + suffix) {
					return false;
				}
			}
		}
		
		
		const words = text.split(/[\s.,!?;:()[\]{}'"\/\\-]+/);
		
		
		for (const word of words) {
			
			if (word.length <= 2) {
				continue;
			}
			
			const lowerWord = word.toLowerCase();
			
			
			if (blacklistSet.has(lowerWord)) {
				return false;
			}
			
			
			const baseVerb = lowerWord.replace(/(ing|ed|s|er|es)$/, '');
			if (blacklistSet.has(baseVerb)) {
				return false;
			}
			
			
			const withoutWordRepeats = lowerWord.replace(/(.)\1+/g, '$1');
			if (withoutWordRepeats !== lowerWord && blacklistSet.has(withoutWordRepeats)) {
				return false;
			}
			
			
			if (this.isInDictionary(lowerWord)) {
				continue;
			}
			
			
			const profanityMatch = this.processWord(word, text);
			if (profanityMatch) {
				return false;
			}
			
			
			if (this.options.checkWordBoundaries && this.checkWordBoundaries(word, text)) {
					return false;
			}
		}

		
		for (const pattern of leetPatterns) {
			if (pattern.test(text)) {
				return false;
			}
		}

		return true;
	},

	

	handleRepeatedChars: function(word) {
		if (!word || word.length < 4) return null;
		
		
		
		const lowerWord = word.toLowerCase();
		
		
		if (lowerWord.includes('ass') || lowerWord.replace(/\d|\$/g, 's').includes('ass')) {
			
			if (lowerWord.match(/^(cl|gr|br|p)ass/) || 
				lowerWord.match(/ass(ign|ist|ess|ume|et|emble|ociat|imil|ert)/) ||
				lowerWord.match(/\b(b|cl|gl|m)ass\b/)) {
				
			} else {
				return "ass";
			}
		}
		
		
		for (const profanity of blacklistSet) {
			if (profanity.length >= 3 && lowerWord.includes(profanity)) {
				
				if (profanity === "ass") continue;
				
				return profanity;
			}
		}
		
		
		const withoutRepeats = lowerWord.replace(/(.)\1+/g, '$1');
		
		
		if (withoutRepeats === lowerWord) {
			return null;
		}
		
		
		
		if (blacklistSet.has(withoutRepeats)) {
			
			if (this.isInDictionary(withoutRepeats) && !blacklistSet.has(withoutRepeats)) {
				return null; 
			}
			return withoutRepeats;
		}
		
		
		const verbBase = withoutRepeats.replace(/(ing|ed|s|er|es)$/, '');
		if (blacklistSet.has(verbBase)) {
			return verbBase;
		}
		
		
		if (this.isInDictionary(withoutRepeats)) {
			return null;
		}
		
		
		let partialDedup = lowerWord;
		const chars = Array.from(lowerWord);
		for (let i = 0; i < chars.length - 1; i++) {
			if (chars[i] === chars[i+1]) {
				
				const reduced = chars.slice(0, i+1).concat(chars.slice(i+2)).join('');
				if (this.isInDictionary(reduced)) {
					return null; 
				}
				
				
				if (blacklistSet.has(reduced)) {
					return reduced;
				}
				
				
				const verbBase = reduced.replace(/(ing|ed|s|er|es)$/, '');
				if (blacklistSet.has(verbBase)) {
					return verbBase;
				}
				
				partialDedup = reduced;
			}
		}
		
		
		if (blacklistSet.has(partialDedup)) {
			return partialDedup;
		}
		
		
		
		for (const profanity of blacklistSet) {
			if (profanity.length <= 2) continue; 
			
			if (withoutRepeats.includes(profanity)) {
				
				if (this.isInDictionary(withoutRepeats) || this.isInDictionary(lowerWord)) {
					return null;
				}
				
				
				
				if (withoutRepeats.startsWith(profanity)) {
					const suffix = withoutRepeats.substring(profanity.length);
					if (suffix.length >= 2 && this.isInDictionary(suffix)) {
						return null;
					}
				}
				
				if (withoutRepeats.endsWith(profanity)) {
					const prefix = withoutRepeats.substring(0, withoutRepeats.length - profanity.length);
					if (prefix.length >= 2 && this.isInDictionary(prefix)) {
						return null;
					}
				}
				
				
				return profanity;
			}
		}
		
		return null;
	},

	

	checkRepeatedCharacters: function(word) {
		if (!word || word.length < 4) return null;
		
		
		const verbEndingRegex = /(ing|ed|s|er|es)$/i;
		const possibleBase = word.toLowerCase().replace(verbEndingRegex, '');
		if (blacklistSet.has(possibleBase)) {
			return possibleBase; 
		}
		
		
		const lowerWord = word.toLowerCase();
		
		
		if (lowerWord.match(/a+s+s+/i) && !this.isInDictionary(lowerWord)) {
			
			if (lowerWord.match(/^(cl|gr|br|p)ass/) || 
				lowerWord.match(/ass(ign|ist|ess|ume|et|emble|ociat|imil|ert)/) ||
				lowerWord.match(/\b(b|cl|gl|m)ass\b/)) {
				
			} else {
				return "ass";
			}
		}
		
		for (const profanity of blacklistSet) {
			if (profanity.length >= 3 && lowerWord.indexOf(profanity) !== -1) {
				
				if (profanity === "ass") continue;
				
				
				if (this.isInDictionary(lowerWord) && 
					
					lowerWord !== profanity) {
					continue;
				}
				
				return profanity;
			}
		}
		
		
		const result = this.handleRepeatedChars(word);
		if (result) return result;
		
		const withoutRepeats = lowerWord.replace(/(.)\1+/g, '$1');
		
		if (withoutRepeats !== lowerWord) {
			
			if (blacklistSet.has(withoutRepeats)) {
				
				
				if (this.isInDictionary(withoutRepeats) || 
					this.isInDictionary(lowerWord)) {
					return null;
				}
				
				return withoutRepeats;
			}
			
			
			const verbBase = withoutRepeats.replace(verbEndingRegex, '');
			if (blacklistSet.has(verbBase)) {
				return verbBase;
			}
			
			
			for (const profanity of blacklistSet) {
				if (profanity.length >= 4) {
					if (this.sequenceMatches(withoutRepeats, profanity, 0.7)) {
						
						if (this.isInDictionary(withoutRepeats) || 
							this.isInDictionary(lowerWord)) {
							return null;
						}
						return profanity;
					}
				}
			}
		}
		
		return null;
	},

	

	processCharInsertions: function(word) {
		
		const separators = [
			'.', '-', '+', ' ', '_', '*', '|', '<', '>', '/', '\\', '(', ')', '[', 
			']', '{', '}', '~', '`', '!', '@', '#', '$', '%', '^', '&', '=', ':', 
			';', '\'', '\"', '?', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
		];
		
		for (const sep of separators) {
			
			const stripped = word.split(sep).join('');
			if (stripped !== word) {
				
				if (this.isInDictionary(stripped)) {
					return null;
				}
				
				if (blacklistSet.has(stripped.toLowerCase())) {
					return stripped;
				}
			}
		}
		
		
		const fullyStripped = word.replace(/[^a-zA-Z0-9]/g, '');
		if (fullyStripped !== word) {
			
			if (this.isInDictionary(fullyStripped)) {
				return null;
			}
			
			if (blacklistSet.has(fullyStripped.toLowerCase())) {
				return fullyStripped;
			}
		}
		
		return null;
	},

	

	processWord: function(word, originalText) {
		if (!word || word.length <= 2) return null;
		
		
		if (hardWhitelist.has(word.toLowerCase())) {
			return null;
		}
		
		
		
		if (this.isInDictionary(word.toLowerCase())) {
			return null;
		}

		
		const lowerWord = word.toLowerCase().trim();
		
		
		if (blacklistSet.has(lowerWord)) {
			return lowerWord;
		}
		
		
		const charInsertion = this.processCharInsertions(word);
		if (charInsertion) {
			return charInsertion;
		}
		
		
		const verbForm = this.checkVerbForms(word);
		if (verbForm) {
			return verbForm;
		}
		
		
		const complexLeet = this.checkComplexLeetspeak(word);
		if (complexLeet) {
			return complexLeet;
		}
		
		
		if (this.containsProfanityButIsLegitimate(word)) {
			return null;
		}
		
		
		if (this.checkLeetPatterns(word)) {
			return lowerWord;
		}
		
		
		const normalized = this.normalizeText(lowerWord);
		if (normalized !== lowerWord && blacklistSet.has(normalized)) {
			return normalized;
		}
		
		
		const withoutSpecialChars = normalized.replace(/[^a-z0-9]/gi, '');
		if (withoutSpecialChars !== normalized) {
			
			if (this.isInDictionary(withoutSpecialChars)) {
				return null;
			}
			
			if (blacklistSet.has(withoutSpecialChars)) {
				return withoutSpecialChars;
			}
		}
		
		
		const withoutRepeats = withoutSpecialChars.replace(/(.)\1+/g, '$1');
		if (withoutRepeats !== withoutSpecialChars) {
			
			if (this.isInDictionary(withoutRepeats)) {
				return null;
			}
			
			if (blacklistSet.has(withoutRepeats)) {
				return withoutRepeats;
			}
		}
		
		
		if (this.checkLeetPatterns(normalized) || 
			this.checkLeetPatterns(withoutSpecialChars) || 
			this.checkLeetPatterns(withoutRepeats)) {
			return lowerWord;
		}
		
		
		const repeatedCheck = this.checkRepeatedCharacters(word);
		if (repeatedCheck) {
			return repeatedCheck;
		}
		
		
		
		
		
		const removedStars = lowerWord.replace(/\*/g, '');
		if (removedStars.length >= 2 && blacklistSet.has(removedStars)) {
			return removedStars;
		}
		
		
		const firstLast = lowerWord.replace(/^(.).*?(.)$/, '$1$2');
		const firstLastTwo = lowerWord.replace(/^(..).*?(..)$/, '$1$2');
		if ((firstLast === 'fk' || firstLast === 'st') && 
			!this.isInDictionary(lowerWord)) {
			return lowerWord;
		}
		
		if ((firstLastTwo === 'fuk' || firstLastTwo === 'fck' || 
			firstLastTwo === 'shit') && !this.isInDictionary(lowerWord)) {
			return lowerWord;
		}
		
		
		if (/a[\W_]*s[\W_]*s/i.test(lowerWord) && 
			!this.isInDictionary(lowerWord) &&
			this.isStandaloneProfanity('ass', originalText)) {
			return "ass";
		}
		
		
		if (/c[\W_]*u[\W_]*n[\W_]*t/i.test(lowerWord) && 
			!this.isInDictionary(lowerWord) &&
			this.isStandaloneProfanity('cunt', originalText)) {
			return "cunt";
		}
		
		return null;
	},

	

	sequenceMatches: function(str, target, matchThreshold = 0.8) {
		if (!str || !target) return false;
		
		
		str = str.toLowerCase();
		target = target.toLowerCase();
		
		
		const len1 = str.length;
		const len2 = target.length;
		let i = 0, j = 0, matches = 0;
		
		while (i < len1 && j < len2) {
			if (str[i] === target[j]) {
				matches++;
				i++;
				j++;
			} else if (i < len1 - 1 && str[i+1] === target[j]) {
				i++; 
			} else {
				j++; 
			}
		}
		
		
		return matches / len2 >= matchThreshold;
	}
};
