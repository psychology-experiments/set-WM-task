import * as visual from '../lib/visual-2021.1.4.js';
import * as util from '../lib/util-2021.1.4.js';

import { TaskPresenter, TaskView, Instruction, cartesian, choices } from "./general.js";


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
Если готов, нажми СТРЕЛКУ ВПРАВО`;


const secondPartInstruction = `
Сейчас на экране будут показаны слова, окрашенные в различные цвета. 
Но в этот раз необходимо определять написанное СЛОВО.
Если написан КРАСНЫЙ цвет, нажми «1»
Если написан ЖЕЛТЫЙ цвет, нажми «2»
Если написан ЗЕЛЕНЫЙ цвет, нажми «3»
Если написан СИНИЙ цвет, нажми «4»
Постарайся выполнять задание как можно быстрее и точнее!
Если готов, нажми СТРЕЛКУ ВПРАВО`;


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
        return correctProperty === keyMeaning ? 1 : 0;
    }
}

class StroopTestPresenter extends TaskPresenter {
    constructor({ window, startTime }) {
        const instructions = [
            new Instruction(firstPartInstruction),
            new Instruction(secondPartInstruction)
        ];
        const view = new StroopTestView({ window, startTime });
        super({ name: "StroopTest", instructionsText: instructions, view: view });

        this._part = "color";
        this._currentStimuli = null;

        this._answerCheckers = {
            color: new AnswerChecker({ wordPropertyToCheck: "color" }),
            text: new AnswerChecker({ wordPropertyToCheck: "text" }),
        };

        this._words = this._createWords();

        this._stimuli = {
            color: this._generateStimiliSet(),
            text: this._generateStimiliSet(),
        };

        this._view.createStimuli({ window: window, stimuliInfo: this._getStimuliInfo() });
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

    _generateStimiliSet() {
        let congruentSet = choices(this._words.congruent, 10);
        let inCongruentSet = choices(this._words.incongruent, 50);
        let wordsSet = congruentSet.concat(inCongruentSet);
        return util.shuffle(wordsSet);
    }

    * _getStimuliInfo() {
        for (let wordType of Object.values(this._words)) {
            for (let wordInfo of wordType) {
                yield wordInfo;
            }
        }
    }

    getTaskConditions() {
        return { keysToWatch: ["1", "2", "3", "4"] };
    }

    _checkAnswer({ buttonPressedName }) {
        return this._answerCheckers[this._part].isCorrect({
            wordName: this._currentStimuli.name,
            buttonPressedName: buttonPressedName,
        });
    }

    checkInput(userInputProcessor) {
        const inputData = userInputProcessor.getData();
        const isCorrectAnswer = this._checkAnswer({ buttonPressedName: inputData.keyName });

        let attemptData = {
            task: this.name,
            word: this._currentStimuli.text,
            color: this._currentStimuli.color,
            part: this._part,
            isCorrect: isCorrectAnswer,
            solved: 1,
        };
        attemptData = Object.assign(attemptData, inputData);

        this._solutionAttemptsKeeper.saveAttempt(attemptData);
        this._trial_finished = true;
    }


    nextStimulus() {
        if (this._stimuli[this._part].length === 0) {
            // throw Error("Stroop test was called to many times (more than 60).");
            this._part = "text";
        }

        if (this._stimuli[this._part].length === 60) {
            this._view.showHint(true);
        }

        this._currentStimuli = this._stimuli[this._part].pop();
        this._view.setStroopWord(this._currentStimuli.name);
        this._trial_finished = false;
    }

    stop() {
        super.stop();
        
        if (this._stimuli[this._part].length === 0) {
            this._view.showHint(false);
        }
    }

    isTrialFinished() {
        return this._trial_finished;
    }

    addUnfinishedTrialData(userInputProcessor) {
        // StroopTest can not be UNfinished thus nothing shold be done here
        return;
    }

    isTaskFinished() {
        return this._stimuli.color.length === 0 && this._stimuli.text.length === 0;
    }
}

class StroopTestView extends TaskView {
    constructor({ window, startTime }) {
        super({ startTime });

        this._currentStimulus = null;
        this._words = {};

        const hintLetterSize = 50;

        this._stroopHint = new visual.TextStim({
            win: window,
            text: this._generateHintText(),
            color: "black",
            height: hintLetterSize,
            pos: [0, window.size[1] * 0.5 - hintLetterSize * 2],
            autoDraw: false,
            bold: true,
            wrapWidth: window.size[0] * 0.8,
        });
    }

    _generateHintText() {
        // const colors = ["красный", "жёлтый", "зелёный", "синий"];
        const spaceSeparator = "\t".repeat(13);
        const hintText = `красный жёлтый зелёный синий\n1${spaceSeparator}2${spaceSeparator}3${spaceSeparator}4`;
        return hintText;
    }

    createStimuli({ window, stimuliInfo }) {
        for (let stimulusInfo of stimuliInfo) {
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

    setStroopWord(stroopWordName) {
        this._currentStimulus = this._words[stroopWordName];
    }

    showHint(toShow) {
        this._stroopHint.setAutoDraw(toShow);
    }

    setAutoDraw(toShow) {
        this._currentStimulus.setAutoDraw(toShow);
    }
}



export { StroopTestPresenter as StroopTest };