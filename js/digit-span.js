import { util, visual } from "../lib/psychojs-2021.2.2.js";

import { TaskPresenter, TaskView, Instruction } from "./general.js";

const instruction = `
Сейчас тебе будут предъявляться числа, которые нужно запомнить. 
После показа всех чисел появится одна из инструкций:
(1) «Напиши запомненные числа» - необходимо указать числа в том же порядке, 
в котором они были представлены. Например, тебе показали числа «1 2 3», 
необходимо написать их в той же последовательности: «1 2 3»
(2) «Напиши запомненные числа в обратном порядке» - необходимо указать числа 
в обратном порядке. Например, тебе показали числа «1 2 3», необходимо написать 
их последовательность наоборот: «3 2 1»
Цифры нужно напечатать на клавиатуре компьютера. 
Периодически сложность задания будет увеличиваться, и 
тебе будет необходимо запоминать все больше цифр. 
Если ты готов, нажми СТРЕЛКУ ВПРАВО`;

class DigitSpanPresenter extends TaskPresenter {
    constructor({
        window,
        screenSizeAdapter,
        startTime,
        digitPresentationTime,
        maskTime,
    }) {
        const instructions = [new Instruction(instruction)];

        const view = new DigitSpanView({
            window,
            screenSizeAdapter,
            startTime,
            digitPresentationTime,
            maskTime,
        });
        super({
            name: "DigitSpan",
            instructionsText: instructions,
            view: view,
        });

        this._currentDigits = null;
        this._difficulty = 3;
        this._errors = 0;

        this._digitPresentationTime = digitPresentationTime;
        this._maskTime = maskTime;
    }

    getTaskConditions() {
        const time =
            (this._digitPresentationTime + this._maskTime) * this._difficulty -
            this._maskTime;

        const taskConditions = {
            maxInputLength: this._difficulty,
            inputAllowedStartTime: time,
        };
        return taskConditions;
    }

    _generateDigit() {
        return Math.floor(Math.random() * 10);
    }

    _generateDigits() {
        this._currentDigits = Array.from(
            Array(this._difficulty),
            this._generateDigit
        );
    }

    nextStimulus() {
        this._trialFinished = false;
        this._generateDigits();
        this._view.setDigits(this._currentDigits.map(String));
    }

    _extractDigits(answer) {
        const answerDigits = answer
            .split(" ")
            .map((digitString) => Number(digitString));
        return answerDigits;
    }

    _checkAnswer(answer) {
        const isCorrect = answer.every((v, i) => v === this._currentDigits[i]);
        return isCorrect;
    }

    _formatDigitsToSave(digits) {
        return digits.join(" ");
    }

    checkInput(userInputProcessor) {
        const inputData = userInputProcessor.getData();
        const participantAnswer = this._extractDigits(
            inputData.participantAnswer
        );
        const isCorrectAnswer = this._checkAnswer(participantAnswer);

        if (isCorrectAnswer) {
            this._errors = 0;
            this._difficulty += 1;
        } else {
            this._errors += 1;
        }

        let attemptData = {
            task: this.name,
            part: this._difficulty,
            rightDigits: this._formatDigitsToSave(this._currentDigits),
            isCorrect: isCorrectAnswer ? 1 : 0,
            solved: isCorrectAnswer ? 1 : 0,
        };

        attemptData = Object.assign(attemptData, inputData);

        this._solutionAttemptsKeeper.saveAttempt(attemptData);
        userInputProcessor.clearInput();
        this._trialFinished = true;
    }

    isTrialFinished() {
        return this._trialFinished;
    }

    isTaskFinished() {
        return this._errors === 3;
    }
}

class DigitSpanView extends TaskView {
    constructor({
        window,
        screenSizeAdapter,
        startTime,
        digitPresentationTime,
        maskTime,
    }) {
        super({ startTime });

        this._digitsToShow = null;
        this._digit = new visual.TextStim({
            win: window,
            text: "",
            color: "black",
            pos: screenSizeAdapter.rescalePosition([0, 0.2]),
            height: screenSizeAdapter.rescaleTextSize(0.15),
            autoDraw: false,
            bold: true,
        });
        this._digitPresentationTime = digitPresentationTime;
        this._maskTime = maskTime;
    }

    start() {
        super.start();
        this._scheduleDigitPresentation();
    }

    setDigits(digits) {
        this._digitsToShow = digits;
    }

    _scheduleDigitPresentation() {
        let startTime = 0;
        for (let digit of this._digitsToShow) {
            this._setDigit(digit, startTime);
            startTime += this._digitPresentationTime;
            this._setMask(startTime);
            startTime += this._maskTime;
        }
    }

    _setDigit(digit, startTime) {
        setTimeout(() => {
            this._digit.text = digit;
        }, startTime);
    }

    _setMask(startTime) {
        setTimeout(() => {
            this._digit.text = "";
        }, startTime);
    }

    setAutoDraw(toShow) {
        this._digit.setAutoDraw(toShow);
    }
}

export { DigitSpanPresenter as DigitSpan };
