import { util, visual } from "../lib/psychojs-2021.2.2.js";

import { TaskPresenter, TaskView, Instruction } from "./general.js";
import * as general from "./general.js";

const instructionPathName = "LuchinsInstruction";

const instructionReminderText = `
Используемое математическое выражение должно быть максимально приближено 
к реальному решению задачи. Например, если самый большой сосуд вмещает 37 
литров, то действие "37+17" будет неверно, поскольку столько воды налить некуда. 
Кроме того, математическое выражение, которое ты записываешь в ответе должно 
содержать только знаки “+” и “–”. 
Между цифрами и математическими знаками не нужно ставить “пробел”.
Для ввода ответа нажми “ENTER”`;

class LuchinsPresenter extends TaskPresenter {
    constructor({ window, screenSizeAdapter, startTime }) {
        const instructions = [new Instruction(null, instructionPathName)];
        const view = new LuchinsView({ window, screenSizeAdapter, startTime });
        super({ name: "Luchins", instructionsText: instructions, view: view });

        this._taskIdx = 0;
        this._taskPossibleSolutions = null;
        this._taskNumber = `Luchins${this._taskIdx + 1}`;
        this._tasksSolutions = [
            ["37-21-3-3", "37-3-21-3", "37-3-3-21"],
            ["37-24-2-2", "37-2-24-2", "37-2-2-24"],
            ["39-22-2-2", "39-2-22-2", "39-2-2-22"],
            ["38-25-2-2", "38-2-25-2", "38-2-2-25"],
            ["29-14-2-2", "29-2-14-2", "29-2-2-14"],
            ["27-12-3-3", "27-3-12-3", "27-3-3-12", "12-3"],
            ["30-12-3", "30-3-12", "12+3", "3+12"],
            [
                "28-12-2-2-2",
                "28-2-12-2-2",
                "28-2-2-12-2",
                "28-2-2-2-12",
                "12-2",
            ],
            ["12-5"],
            ["30-13-4-4", "30-4-13-4", "30-4-4-13", "13-4"],
        ];

        const feedbackMessages = [
            new general.FeedbackMessage({
                name: "incorrectAnswer",
                messageText: "Ответ неверный",
                textColor: "#ed2939",
                showTime: 2000,
            }),
        ];
        const positionsForFeedback = [[0, -0.15]].map((pos) =>
            screenSizeAdapter.rescalePosition(pos)
        );
        this._feedbackMessager = new general.FeedbackMessageDispatcher({
            window: window,
            textHeight: screenSizeAdapter.rescaleTextSize(0.05),
            messages: feedbackMessages,
            availiablePositions: positionsForFeedback,
        });
    }

    getTaskConditions() {
        const conditions = {
            maxInputLength: 20,
            isExactLength: false,
        };
        return conditions;
    }

    nextStimulus() {
        this._taskPossibleSolutions = this._tasksSolutions[this._taskIdx];
        this._view.setLuchinsTask(this._taskNumber);
        this._taskIdx += 1;
        this._taskNumber = `Luchins${this._taskIdx + 1}`;
        this._trialFinished = false;
    }

    _checkAnswer(participantAnswer) {
        return this._taskPossibleSolutions.some(
            (solution) => solution === participantAnswer
        );
    }

    checkInput(userInputProcessor) {
        const inputData = userInputProcessor.getData();
        const participantAnswer = inputData.participantAnswer;
        const isCorrectAnswer = this._checkAnswer(participantAnswer);

        let attemptData = {
            task: this.name,
            taskNumber: this._taskNumber,
            rightAnswer: this._taskPossibleSolutions.join(" или "),
            participantAnswer: participantAnswer,
            isCorrect: isCorrectAnswer ? 1 : 0,
            solved: isCorrectAnswer ? 1 : 0,
        };

        attemptData = Object.assign(attemptData, inputData);

        this._solutionAttemptsKeeper.saveAttempt(attemptData);
        userInputProcessor.clearInput();
        this._trialFinished = isCorrectAnswer;

        if (!isCorrectAnswer) {
            this._feedbackMessager.showMessage("incorrectAnswer");
        } else {
            this._feedbackMessager.stopAllMessages();
        }
    }

    isTrialFinished() {
        return this._trialFinished;
    }

    isTaskFinished() {
        return this._taskIdx === 10;
    }
}

class LuchinsView extends TaskView {
    constructor({ window, screenSizeAdapter, startTime }) {
        super({ startTime });

        this._task = new visual.ImageStim({
            win: window,
            pos: screenSizeAdapter.rescalePosition([0, 0]),
            size: screenSizeAdapter.rescaleElementSize([0.6, 0.6]),
        });

        this._instructionReminder = new visual.TextStim({
            win: window,
            text: instructionReminderText,
            color: "black",
            pos: screenSizeAdapter.rescalePosition([0, 0.34]),
            height: screenSizeAdapter.rescaleTextSize(0.03),
            wrapWidth: screenSizeAdapter.rescaleWrapWidth(0.9),
            autoDraw: false,
            bold: true,
        });
    }

    setLuchinsTask(taskName) {
        this._task.setImage(taskName);
    }

    setAutoDraw(toShow) {
        this._task.setAutoDraw(toShow);
        this._instructionReminder.setAutoDraw(toShow);
    }
}

export { LuchinsPresenter as Luchins };
