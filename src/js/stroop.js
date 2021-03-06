import { util, visual } from "../lib/psychojs-2021.2.2.js";

import {
    TaskPresenter,
    TaskView,
    Instruction,
    cartesian,
    choices,
} from "./general.js";

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
Если слово окрашено в красный цвет, нажми «1»
Если слово окрашено в жёлтый цвет, нажми «2»
Если слово окрашено в зелёный цвет, нажми «3»
Если слово окрашено в синий цвет, нажми «4»
Постарайся выполнять задание как можно быстрее и точнее!
Если готов, нажми СТРЕЛКУ ВПРАВО`;

const secondPartInstruction = `
Сейчас на экране будут показаны слова, окрашенные в различные цвета. 
Но в этот раз необходимо определять написанное СЛОВО.
Если написан красный цвет, нажми «1»
Если написан жёлтый цвет, нажми «2»
Если написан зелёный цвет, нажми «3»
Если написан синий цвет, нажми «4»
Постарайся выполнять задание как можно быстрее и точнее!
Если готов, нажми СТРЕЛКУ ВПРАВО`;

class StroopWord {
    constructor([wordSymbol, colorSymbol]) {
        this.name = wordSymbol + colorSymbol;
        this.text = ALLOWED_SYMBOLS[wordSymbol].word;
        this.color = ALLOWED_SYMBOLS[colorSymbol].color;

        this.congurence =
            wordSymbol === colorSymbol ? "congruent" : "incongruent";

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
            throw Error(
                `Only possible to use ${Object.keys(
                    wordProperties
                )} but was given ${wordPropertyToCheck}`
            );
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
    constructor({ window, screenSizeAdapter, startTime }) {
        const instructions = [
            new Instruction(firstPartInstruction),
            new Instruction(secondPartInstruction),
        ];
        const view = new StroopTestView({
            window,
            screenSizeAdapter,
            startTime,
        });
        super({
            name: "StroopTest",
            instructionsText: instructions,
            view: view,
        });

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

        this._view.createStimuli({
            window: window,
            screenSizeAdapter: screenSizeAdapter,
            stimuliInfo: this._getStimuliInfo(),
        });
    }

    _createWords() {
        const symbols = Object.keys(ALLOWED_SYMBOLS);
        let words = { congruent: [], incongruent: [] };
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
        return util.shuffle(Array.from(wordsSet));
    }

    *_getStimuliInfo() {
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
        const isCorrectAnswer = this._checkAnswer({
            buttonPressedName: inputData.keyName,
        });

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
        this._trialFinished = true;
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
        this._trialFinished = false;
    }

    stop() {
        super.stop();

        if (this._stimuli[this._part].length === 0) {
            this._view.showHint(false);
        }
    }

    skipTask() {
        super.skipTask();
        this._view.showHint(false);
    }

    isTrialFinished() {
        return this._trialFinished;
    }

    addUnfinishedTrialData(userInputProcessor) {
        // StroopTest can not be UNfinished thus nothing shold be done here
        return;
    }

    isTaskFinished() {
        return (
            this._stimuli.color.length === 0 && this._stimuli.text.length === 0
        );
    }
}

class StroopTestView extends TaskView {
    constructor({ window, screenSizeAdapter, startTime }) {
        super({ startTime });

        this._currentStimulus = null;
        this._words = {};

        this._stroopHint = new visual.ImageStim({
            win: window,
            image: "stroopHint.png",
            pos: screenSizeAdapter.rescalePosition([0, 0.3]),
            size: screenSizeAdapter.rescaleElementSize([0.18, 0.1]),
        });
    }

    createStimuli({ window, screenSizeAdapter, stimuliInfo }) {
        for (let stimulusInfo of stimuliInfo) {
            const wordStimulus = new visual.TextStim({
                win: window,
                text: stimulusInfo.text,
                color: stimulusInfo.color,
                height: screenSizeAdapter.rescaleTextSize(0.1),
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
