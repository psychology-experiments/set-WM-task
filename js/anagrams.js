import { util, visual } from "../lib/psychojs-2021.2.2.js";

import { TaskPresenter, TaskView, Instruction } from "./general.js";

const instruction = `
Сейчас тебе будет предложено решить несколько анаграмм. 
Анаграмма – это слово, в котором перепутана последовательность букв и необходимо понять, 
какое слово было изначально. Для этого надо использовать все предложенный буквы и 
попытаться их расставить в нужном порядке. 
В данном случае все слова являются нарицательными существительными в единственном числе, именительном падеже. 
Например, из букв "РЖОЛЕ" можно составить слово "ЖЕРЛО"
После того, как ты найдешь ответ, введи его в соответствующий блок внизу экрана и нажми «ENTER», 
чтобы подтвердить выбор. Если ты не знаешь ответ, то просто подожди, через 1 минуту анаграмма заменится на новую.
Помни, что возможен только один правильный вариант. 
Если готов, нажми СТРЕЛКУ ВПРАВО`;

const anagrams = [
    ["тонус", "отусн"],
    ["хомяк", "мкохя"],
    ["моряк", "кмяро"],
    ["ребус", "есурб"],
    ["номер", "мроне"],
    ["бедро", "оребд"],
    ["бекон", "бноке"],
    ["ветка", "тавке"],
    ["школа", "кшало"],
    ["дупло", "лдопу"],
];

class SingleAnagram {
    constructor({ answer, anagram }) {
        if (answer.length !== anagram.length) {
            throw new Error(
                `Anagram length (${anagram}) must be equal answer length (${answer})`
            );
        }

        this.answer = answer;
        this.anagram = anagram;
    }
}

class AnagramsPresenter extends TaskPresenter {
    constructor({ window, screenSizeAdapter, startTime }) {
        const instructions = [new Instruction(instruction)];
        const view = new AnagramsView({ window, screenSizeAdapter, startTime });
        super({ name: "Anagrams", instructionsText: instructions, view: view });

        this._currentStimulus = null;
        this._anagrams = this._createAnagrams();

        this._countdownSolveClock = new util.CountdownTimer();
    }

    _createAnagrams() {
        const anagramsArray = [];
        for (let [answer, anagram] of anagrams) {
            anagramsArray.push(new SingleAnagram({ answer, anagram }));
        }
        return util.shuffle(Array.from(anagramsArray));
    }

    getTaskConditions() {
        const conditions = {
            maxInputLength: this._currentStimulus.anagram.length,
        };
        return conditions;
    }

    checkInput(userInputProcessor) {
        const inputData = userInputProcessor.getData();
        const participantAnswer = inputData.participantAnswer;
        const isCorrectAnswer =
            participantAnswer === this._currentStimulus.answer;

        let attemptData = {
            task: this.name,
            anagram: this._currentStimulus.anagram,
            rightAnswer: this._currentStimulus.answer,
            participantAnswer: participantAnswer,
            isCorrect: isCorrectAnswer ? 1 : 0,
            solved: isCorrectAnswer ? 1 : 0,
        };

        attemptData = Object.assign(attemptData, inputData);

        this._solutionAttemptsKeeper.saveAttempt(attemptData);
        userInputProcessor.clearInput();
        this._trialFinished = isCorrectAnswer;
    }

    addUnfinishedTrialData(userInputProcessor) {
        if (this._trialFinished) {
            return;
        }

        const inputData = userInputProcessor.getData();

        let attemptData = {
            task: this.name,
            anagram: this._currentStimulus.anagram,
            rightAnswer: this._currentStimulus.answer,
            solved: 0,
        };
        attemptData = Object.assign(attemptData, inputData);

        this._solutionAttemptsKeeper.saveAttempt(attemptData);
    }

    start() {
        super.start();
        this._countdownSolveClock.reset(60);
    }

    nextStimulus() {
        this._trialFinished = false;
        this._currentStimulus = this._anagrams.pop();
        this._view.setAnagram(this._currentStimulus.anagram);
    }

    isTrialFinished() {
        // Solution time is over
        if (this._countdownSolveClock.getTime() < 0 && this.isStarted) {
            return true;
        }

        return this._trialFinished;
    }

    isTaskFinished() {
        return this._anagrams.length === 0;
    }
}

class AnagramsView extends TaskView {
    constructor({ window, screenSizeAdapter, startTime }) {
        super({ startTime });

        this._anagramStimulus = new visual.TextStim({
            win: window,
            text: "",
            color: "black",
            pos: screenSizeAdapter.rescalePosition([0, 0.2]),
            height: screenSizeAdapter.rescaleTextSize(0.15),
            autoDraw: false,
            bold: true,
        });
    }

    setAnagram(anagramText) {
        this._anagramStimulus.text = anagramText;
    }

    setAutoDraw(toShow) {
        this._anagramStimulus.setAutoDraw(toShow);
    }
}

export { AnagramsPresenter as Anagrams };
