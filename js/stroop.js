import * as visual from '../lib/visual-2021.1.4.js';
import * as util from '../lib/util-2021.1.4.js';

import { cartesian, choices } from "./general.js";


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
        console.log(correctProperty, keyMeaning);
        return correctProperty === keyMeaning;
    }
}

class StroopTestPresenter {
    constructor({ propertyToCheck }) {
        this._currentStimuli = null;
        this._answerChecker = new AnswerChecker({ wordPropertyToCheck: propertyToCheck });
        this._words = this._createWords();
        this._stimuli = this._generateStimili();
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
        return this._answerChecker.isCorrect({
            wordName: this._currentStimuli.name,
            buttonPressedName: buttonPressedName,
        });
    }

    nextStimulus() {
        if (this._stimuli.length === 0) {
            throw Error("Stroop test was called to many times (more than 60).");
        }
        this._currentStimuli = this._stimuli.pop();
        return this._currentStimuli.name;
    }
}

class StroopTestView {
    constructor({ window }) {
        this._presenter = new StroopTestPresenter({ propertyToCheck: "text" });

        this._currentStimulus = null;
        this._words = {};
        this.createStimuli({ window });
        this.nextStimulus();
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

        // for some reason PsychoJS do not remove stimulus from screen without that line
        if (this._currentStimulus) {
            this._currentStimulus.setAutoDraw(false);
        }

        this._currentStimulus = this._words[stimulusIdx];
    }

    checkAnswer({ buttonPressedName }) {
        return this._presenter.checkAnswer({ buttonPressedName });
    }

    stop() {
        this._currentStimulus.setAutoDraw(false);
    }

    draw() {
        this._currentStimulus.draw();
    }
}


export { StroopTestView as StroopTest };