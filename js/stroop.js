import * as visual from '../lib/visual-2021.1.4.js';
import * as util from '../lib/util-2021.1.4.js';

import { cartesian, choice } from "./general.js";


const ALLOWED_SYMBOLS = {
    R: { word: "красный", color: "red" },
    G: { word: "зелёный", color: "green" },
    B: { word: "синий", color: "blue" },
    Y: { word: "жёлтый", color: "yellow" },
};

class StroopWord {
    constructor([wordSymbol, colorSymbol]) {
        this.text = ALLOWED_SYMBOLS[wordSymbol].word;
        this.color = ALLOWED_SYMBOLS[colorSymbol].color;

        this.congurent = wordSymbol === colorSymbol;

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

class StroopTestPresenter {
    constructor() {
        this._currentProbeIdx = null;
        this._congruentStimulusProbability = 1 / 7;

        this._congruentWords = [];
        this._incongruentWords = [];
        this.createWords();
    }

    createWords() {
        const symbols = Object.keys(ALLOWED_SYMBOLS);
        for (let wordInfo of cartesian(symbols, symbols)) {
            const word = new StroopWord(wordInfo);

            if (word.congurent) {
                this._congruentWords.push(word);
            } else {
                this._incongruentWords.push(word);
            }
        }
        this._addIdxInfo();
    }

    _addIdxInfo() {
        this._incongruentWords = this._incongruentWords.map((word, index) => [index, word]);
        const addIdx = this._incongruentWords.length;
        this._congruentWords = this._congruentWords.map((word, index) => [index + addIdx, word]);
    }

    * getStimuliInfo() {
        for (let [_, wordInfo] of this._incongruentWords) {
            yield wordInfo;
        }
        for (let [_, wordInfo] of this._congruentWords) {
            yield wordInfo;
        }
    }

    nextStimulus() {
        const currentStimulus = this._isIncongruent() ? choice(this._incongruentWords) : choice(this._congruentWords);
        this._currentProbeIdx = currentStimulus[0];
        return this._currentProbeIdx;
    }

    _isIncongruent() {
        return Math.random() >= this._congruentStimulusProbability;
    }
}

class StroopTestView {
    constructor({ window, stimuliFP }) {
        this._presenter = new StroopTestPresenter();

        this._currentStimulus = null;
        this._words = [];
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
            this._words.push(wordStimulus);
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

    draw() {
        this._currentStimulus.draw();
    }
}


export { StroopTestView as StroopTest };