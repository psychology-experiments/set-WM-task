import * as visual from '../lib/visual-2021.1.4.js';
import * as util from '../lib/util-2021.1.4.js';

import { Task, cartesian, choices } from "./general.js";


const ALLOWED_SYMBOLS = {
    R: { word: "красный", color: "red" },
    G: { word: "зелёный", color: "green" },
    B: { word: "синий", color: "blue" },
    Y: { word: "жёлтый", color: "yellow" },
};


const KEYS_TO_ANSWERS = {
    1: "R",
    2: "Y",
    3: "G",
    4: "B",
};


const firstPartInstruction = `
Сейчас на экране будут показаны слова, окрашенные в различные цвета. 
Тебе необходимо определять ЦВЕТ, которым написано слово.
Если слово окрашено в КРАСНЫЙ цвет, нажми «1»
Если слово окрашено в ЖЕЛТЫЙ цвет, нажми «2»
Если слово окрашено в ЗЕЛЕНЫЙ цвет, нажми «3»
Если слово окрашено в СИНИЙ цвет, нажми «4»
Постарайся выполнять задание как можно быстрее и точнее!
Если готов, нажми СТРЕЛКУ ВПРАВО`.trim();


const secondPartInstruction = `
Сейчас на экране будут показаны слова, окрашенные в различные цвета. 
Но в этот раз необходимо определять написанное СЛОВО.
Если написан КРАСНЫЙ цвет, нажми «1»
Если написан ЖЕЛТЫЙ цвет, нажми «2»
Если написан ЗЕЛЕНЫЙ цвет, нажми «3»
Если написан СИНИЙ цвет, нажми «4»
Постарайся выполнять задание как можно быстрее и точнее!
Если готов, нажми СТРЕЛКУ ВПРАВО`.trim();


class StroopWord {
    constructor([wordSymbol, colorSymbol]) {
        this.name = wordSymbol + colorSymbol;
        this.text = ALLOWED_SYMBOLS[wordSymbol].word;
        this.color = ALLOWED_SYMBOLS[colorSymbol].color;

        this.congurence = wordSymbol === colorSymbol ? "congruent" : "incongruent";

        if (this.text === undefined || this.color === undefined) {
            const supportedSymbols = Object.keys(ALLOWED_SYMBOLS);
            throw Error(
                `Was used unsupported symbol 
                for text "${wordSymbol}" or 
                color "${colorSymbol}"\n
                Supported symbols: ${supportedSymbols}`
            );
        }
    }
}

class AnswerChecker {
    constructor({ wordPropertyToCheck }) {
        let wordProperties = { text: 0, color: 1 };

        if (!(wordPropertyToCheck in wordProperties)) {
            throw Error(`Only possible to use ${Object.keys(wordProperties)} but was given ${wordPropertyToCheck}`);
        }

        this._property = wordProperties[wordPropertyToCheck];
    }

    isCorrect({ wordName, buttonPressedName }) {
        let correctProperty = wordName[this._property];
        let keyMeaning = KEYS_TO_ANSWERS[buttonPressedName];
        console.log(wordName, correctProperty, keyMeaning, correctProperty === keyMeaning);
        // alert(`
        // В ${this._property + 1} части теста Струппа\n
        // Слово было ${ALLOWED_SYMBOLS[wordName[0]].word}\n
        // Его цвет был ${ALLOWED_SYMBOLS[wordName[1]].color}\n
        // Нажата была клавиша ${buttonPressedName} (${JSON.stringify(KEYS_TO_ANSWERS, null, 8)})\n
        // Что является ${correctProperty === keyMeaning} ответом`);
        return correctProperty === keyMeaning;
    }
}

class StroopTestControler {
    constructor() {
        this._part = "color";
        this._currentStimuli = null;
        this._answerCheckers = {
            color: new AnswerChecker({ wordPropertyToCheck: "color" }),
            text: new AnswerChecker({ wordPropertyToCheck: "text" }),
        };
        this._words = this._createWords();
        this._stimuli = {
            color: this._generateStimili(),
            text: this._generateStimili(),
        };
    }

    _createWords() {
        const symbols = Object.keys(ALLOWED_SYMBOLS);
        let words = { "congruent": [], "incongruent": [] };
        for (let wordInfo of cartesian(symbols, symbols)) {
            const word = new StroopWord(wordInfo);
            words[word.congurence].push(word);
        }
        return words;
    }

    _generateStimili() {
        let congruentSet = choices(this._words.congruent, 10);
        let inCongruentSet = choices(this._words.incongruent, 50);
        let wordsSet = congruentSet.concat(inCongruentSet);
        return util.shuffle(wordsSet);
    }

    * getStimuliInfo() {
        for (let wordType of Object.values(this._words)) {
            for (let wordInfo of wordType) {
                yield wordInfo;
            }
        }
    }

    checkAnswer({ buttonPressedName }) {
        return this._answerCheckers[this._part].isCorrect({
            wordName: this._currentStimuli.name,
            buttonPressedName: buttonPressedName,
        });
    }

    nextStimulus() {
        if (this._stimuli[this._part].length === 0) {
            // throw Error("Stroop test was called to many times (more than 60).");
            console.log("CHANGE");
            this._part = "part2";
        }
        this._currentStimuli = this._stimuli[this._part].pop();
        return this._currentStimuli.name;
    }
}

class StroopTestView {
    constructor({ window, startTime }) {
        this.name = "StroopTest";
        this._presenter = new StroopTestControler();

        this._currentStimulus = null;
        this.startTime = startTime;
        this.isStarted = false;
        this.instructions = [firstPartInstruction, secondPartInstruction];
        this._words = {};
        this.createStimuli({ window });
    }

    createStimuli({ window }) {
        for (let stimulusInfo of this._presenter.getStimuliInfo()) {
            const wordStimulus = new visual.TextStim({
                win: window,
                text: stimulusInfo.text,
                color: stimulusInfo.color,
                height: 100,
                autoDraw: false,
                bold: true,
            });
            this._words[stimulusInfo.name] = wordStimulus;
        }
    }

    nextStimulus() {
        let stimulusIdx = this._presenter.nextStimulus();
        this._currentStimulus = this._words[stimulusIdx];
    }

    checkAnswer({ buttonPressedName }) {
        return this._presenter.checkAnswer({ buttonPressedName });
    }

    getData() {
        
    }

    start() {
        this.isStarted = true;
        this.setAutoDraw(true);
    }

    stop() {
        this.isStarted = false;
        this._currentStimulus.setAutoDraw(false);
    }

    setAutoDraw(toShow) {
        this._currentStimulus.setAutoDraw(toShow);
    }
}


export { StroopTestView as StroopTest };