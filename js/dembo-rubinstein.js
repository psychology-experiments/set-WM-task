import { util, visual } from "../lib/psychojs-2021.2.2.js";

import { TaskPresenter, TaskView, Instruction } from "./general.js";

const firstInstruction = `
Участие в олимпиадах требует определенного развития способностей и характера. 
Уровень их развития можно условно изобразить горизонтальной линией, где левая 
часть означает самое низкое развитие, а правая – наивысшее. Мы бы хотели узнать, 
насколько развиты предложенные характеристики у тебя. Используя курсор, отметь, 
как ты оцениваешь развитие характеристики у себя В ДАННЫЙ МОМЕНТ ВРЕМЕНИ. 
Если ты готов начать, нажми СТРЕЛКУ ВПРАВО`;

const secondInstruction = `
Может быть мы забыли какие-то качества, которые важны для решения математических задач? 
Если это так, то после нажатия СТРЕЛКИ ВПРАВО, укажи название характеристики (вверху), 
её низкий уровень развития (слева) и высокий уровень развития (справа). Пожалуйста, 
нажми СТРЕЛКУ ВПРАВО, если инструкция понятна, и ты готов начать выполнять задание`;

const thirdInstruction = `
Оцени развитие своих способностей по тем качествам, которые ты только что указал. 
Используя курсор, отметь, как ты оцениваешь развитие характеристики у себя в 
данный момент времени. Помни, что левая часть означает самое низкое развитие, а 
правая – наивысшее. 
Если ты готов начать, нажми СТРЕЛКУ ВПРАВО`;

const fourthInstruction = `
Теперь оцени, какой уровень развития тебе необходим, если ты хочешь победить на математической 
олимпиаде. Используя курсор, отметь, необходимый уровень развития. Помни, что левая часть 
означает самое низкое развитие, а правая – наивысшее. 
Если ты готов начать, нажми СТРЕЛКУ ВПРАВО`;

const instructions = [
    firstInstruction,
    secondInstruction,
    thirdInstruction,
    fourthInstruction,
].map((instruction) => new Instruction(instruction));

class SingleScale {
    constructor({ scaleDescrition, leftEnd, rightEnd }) {
        this.scaleDescrition = scaleDescrition;
        this.leftEnd = leftEnd;
        this.rightEnd = rightEnd;
    }
}

const prebuildScales = [
    new SingleScale({
        scaleDescrition: "Во время подготовки к олимпиаде я:",
        leftEnd: "действую по указанию других",
        rightEnd: "самостоятельно",
    }),
    new SingleScale({
        scaleDescrition: "Когда я решаю задачи, я:",
        leftEnd: "рассеянный",
        rightEnd: "сосредоточенный",
    }),
    new SingleScale({
        scaleDescrition: "Обычно мое решение:",
        leftEnd: "шаблонное",
        rightEnd: "креативное",
    }),
    new SingleScale({
        scaleDescrition: "Мои знания о математике:",
        leftEnd: "поверхностные",
        rightEnd: "глубокие",
    }),
    new SingleScale({
        scaleDescrition: "В момент решения задачи я:",
        leftEnd: "неуверенный",
        rightEnd: "уверенный",
    }),
    new SingleScale({
        scaleDescrition: "Во время участия в олимпиаде я:",
        leftEnd: "встревоженный",
        rightEnd: "спокойный",
    }),
];

class DemboRubinsteinPresenter extends TaskPresenter {
    constructor({ window, screenSizeAdapter }) {
        const view = new DemboRubinsteinView({ window, screenSizeAdapter });
        super({
            name: "DemboRubinstein",
            instructionsText: instructions,
            view: view,
        });

        this._parts = ["prebuild", "participantGeneratesScales"];
        this._part_idx = 0;
        this._scalesSets = {
            prebuild: Array.from(prebuildScales),
            participantGeneratesScales: [],
        };
        this._currentScale = null;
        this._trial_finished = false;
    }

    getTaskConditions() {
        // no information needed for InputProcessor
        return;
    }

    nextStimulus() {
        const part = this._parts[this._part_idx];
        this._currentScale = this._scalesSets[part].pop();

        const scaleDescription = this._currentScale.scaleDescrition;
        const scaleEnds = {
            leftEnd: this._currentScale.leftEnd,
            rightEnd: this._currentScale.rightEnd,
        };
        this._view.setScale(scaleDescription, scaleEnds);
        this._trial_finished = false;
    }

    checkInput(inputProcessor) {
        const inputData = inputProcessor.getData();

        const scaleDescription = this._currentScale.scaleDescrition;
        const leftEnd = this._currentScale.leftEnd;
        const rightEnd = this._currentScale.rightEnd;
        const part = this._parts[this._part_idx];

        let attemptData = {
            task: this.name,
            part: part,
            scaleDescription: scaleDescription,
            scaleLeftEnd: leftEnd,
            scaleRightEnd: rightEnd,
            solved: 1,
        };

        attemptData = Object.assign(attemptData, inputData);

        this._solutionAttemptsKeeper.saveAttempt(attemptData);

        this._trial_finished = true;
    }

    addUnfinishedTrialData(userInputProcessor) {
        if (this._trial_finished) {
            return;
        }
    }

    isTrialFinished() {
        return this._trial_finished;
    }

    isTaskFinished() {
        return this._scalesSets.prebuild.length === 0;
    }
}

class FilledScaleView {
    constructor({ window, textSize, textPosition, textWidth }) {
        console.log(textWidth);
        this._scaleDescription = new visual.TextStim({
            win: window,
            color: new util.Color("black"),
            height: textSize.description,
            pos: textPosition.description,
            text: "",
            wrapWidth: textWidth.description,
        });

        this._leftEnd = new visual.TextStim({
            win: window,
            color: new util.Color("black"),
            height: textSize.leftEnd,
            pos: textPosition.leftEnd,
            text: "",
            wrapWidth: textWidth.leftEnd,
        });

        this._rightEnd = new visual.TextStim({
            win: window,
            color: new util.Color("black"),
            height: textSize.rightEnd,
            pos: textPosition.rightEnd,
            text: "",
            wrapWidth: textWidth.rightEnd,
        });
    }

    setScale(scaleDescription, scaleEnds) {
        this._scaleDescription.text = scaleDescription;
        this._leftEnd.text = scaleEnds.leftEnd;
        this._rightEnd.text = scaleEnds.rightEnd;
    }

    setAutoDraw(toShow) {
        this._scaleDescription.setAutoDraw(toShow);
        this._leftEnd.setAutoDraw(toShow);
        this._rightEnd.setAutoDraw(toShow);
    }
}

class EmptyScaleView {
    constructor({ window, textSize, fieldPosition, fieldSize }) {
        this._scaleDescription = new visual.TextBox({
            win: window,
            text: "[Напишите название качества]",
            font: "Open Sans",
            pos: fieldPosition.description,
            letterHeight: textSize.description,
            size: fieldSize.description,
            color: "black",
            colorSpace: "rgb",
            fillColor: undefined,
            borderColor: "black",
            bold: true,
            italic: false,
            editable: true,
            multiline: true,
            anchor: "center",
            depth: 0.0,
            autofocus: false,
        });

        this._leftEnd = new visual.TextBox({
            win: window,
            name: "scaleDescription",
            text: "[Напишите название низкого уровня]",
            font: "Open Sans",
            pos: fieldPosition.leftEnd,
            letterHeight: textSize.leftEnd,
            size: fieldSize.leftEnd,
            color: "black",
            colorSpace: "rgb",
            fillColor: undefined,
            borderColor: "black",
            bold: true,
            italic: false,
            editable: true,
            multiline: true,
            anchor: "center",
            depth: 0.0,
            autofocus: false,
        });

        this._rightEnd = new visual.TextBox({
            win: window,
            name: "scaleDescription",
            text: "[Напишите название высокого уровня]",
            font: "Open Sans",
            pos: fieldPosition.rightEnd,
            letterHeight: textSize.rightEnd,
            size: fieldSize.rightEnd,
            color: "black",
            colorSpace: "rgb",
            fillColor: undefined,
            borderColor: "black",
            bold: true,
            italic: false,
            editable: true,
            multiline: true,
            anchor: "center",
            depth: 0.0,
            autofocus: false,
        });
    }

    setScale() {
        this._scaleDescription.reset();
        this._leftEnd.reset();
        this._rightEnd.reset();
    }

    setAutoDraw(toShow) {
        this._scaleDescription.setAutoDraw(toShow);
        this._leftEnd.setAutoDraw(toShow);
        this._rightEnd.setAutoDraw(toShow);
    }
}

class DemboRubinsteinView extends TaskView {
    constructor({ window, screenSizeAdapter }) {
        super({});
        this._currentScale = null;

        const fieldSize = {
            description: screenSizeAdapter.rescaleElementSize([0.425, 0.1]),
            leftEnd: screenSizeAdapter.rescaleElementSize([0.3, 0.15]),
            rightEnd: screenSizeAdapter.rescaleElementSize([0.3, 0.15]),
        };

        const textSize = {
            description: screenSizeAdapter.rescaleTextSize(0.05),
            leftEnd: screenSizeAdapter.rescaleTextSize(0.05),
            rightEnd: screenSizeAdapter.rescaleTextSize(0.05),
        };

        const fieldPosition = {
            description: screenSizeAdapter.rescalePosition([0, 0.2]),
            leftEnd: screenSizeAdapter.rescalePosition([-0.25, -0.05]),
            rightEnd: screenSizeAdapter.rescalePosition([0.25, -0.05]),
        };

        const textPosition = {
            description: screenSizeAdapter.rescalePosition([0, 0.2]),
            leftEnd: screenSizeAdapter.rescalePosition([-0.25, 0]),
            rightEnd: screenSizeAdapter.rescalePosition([0.25, 0]),
        };

        const textWidth = {
            description: screenSizeAdapter.rescaleWrapWidth(0.5),
            leftEnd: screenSizeAdapter.rescaleWrapWidth(0.25),
            rightEnd: screenSizeAdapter.rescaleWrapWidth(0.25),
        };

        this._filledScale = new FilledScaleView({
            window: window,
            textSize: textSize,
            textPosition: textPosition,
            textWidth: textWidth,
        });
        this._emptyScale = new EmptyScaleView({
            window: window,
            textSize: textSize,
            fieldPosition: fieldPosition,
            fieldSize: fieldSize,
        });
    }

    _isFilledScale(scaleDescription, scaleEnds) {
        return scaleDescription !== null && scaleEnds !== null;
    }

    setScale(scaleDescription, scaleEnds) {
        if (this._isFilledScale(scaleDescription, scaleEnds)) {
            this._filledScale.setScale(scaleDescription, scaleEnds);
            this._currentScale = this._filledScale;
        } else {
            this._emptyScale.setScale();
            this._currentScale = this._emptyScale;
        }
    }

    _setEmptyEnds() {}

    setAutoDraw(toShow) {
        this._currentScale.setAutoDraw(toShow);
    }
}

export { DemboRubinsteinPresenter as DemboRubinstein };
