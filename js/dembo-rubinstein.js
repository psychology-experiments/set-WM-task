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
    constructor({ scaleDescription, leftEnd, rightEnd }) {
        this.scaleDescription = scaleDescription;
        this.leftEnd = leftEnd;
        this.rightEnd = rightEnd;
    }
}

const prebuildScales = [
    new SingleScale({
        scaleDescription: "Во время подготовки к олимпиаде я:",
        leftEnd: "действую по указанию других",
        rightEnd: "самостоятельно",
    }),
    new SingleScale({
        scaleDescription: "Когда я решаю задачи, я:",
        leftEnd: "рассеянный",
        rightEnd: "сосредоточенный",
    }),
    new SingleScale({
        scaleDescription: "Обычно мое решение:",
        leftEnd: "шаблонное",
        rightEnd: "креативное",
    }),
    new SingleScale({
        scaleDescription: "Мои знания о математике:",
        leftEnd: "поверхностные",
        rightEnd: "глубокие",
    }),
    new SingleScale({
        scaleDescription: "В момент решения задачи я:",
        leftEnd: "неуверенный",
        rightEnd: "уверенный",
    }),
    new SingleScale({
        scaleDescription: "Во время участия в олимпиаде я:",
        leftEnd: "встревоженный",
        rightEnd: "спокойный",
    }),
];

class ScaleGenerationPart {
    constructor({ taskView }) {
        this._scales = [];
        this._currentScaleInfo = null;
        this._taskView = taskView;

        this._stopGeneration = false;
        this._scaleFilled = false;
        this._generationButtonsStatusCanBePressed = false;
    }

    _isFirstTrial() {
        return this._scales.length === 0;
    }

    _isStopGeneration() {
        return this._taskView.isButtonPressed("stopGeneration");
    }

    _stopGeneration() {}

    _updateGenerateMoreButtonStatus() {
        const toDeactivate =
            this._scaleFilled && !this._generationButtonsStatusCanBePressed;

        const toActivate =
            !this._scaleFilled && this._generationButtonsStatusCanBePressed;

        if (toDeactivate) {
            this._taskView.activateButton("generateMore");
            this._generationButtonsStatusCanBePressed = true;
        } else if (toActivate) {
            this._taskView.deactivateButton("generateMore");
            this._generationButtonsStatusCanBePressed = false;
        }
    }

    _checkScaleInfo(info) {
        for (let scalePart in info) {
            if (info[scalePart].length === 0) {
                this._scaleFilled = false;
                return;
            }
        }
        this._scaleFilled = true;
    }

    _addScale() {
        const scale = new SingleScale({
            scaleDescription: this._currentScaleInfo.scaleDescription,
            leftEnd: this._currentScaleInfo.leftEnd,
            rightEnd: this._currentScaleInfo.rightEnd,
        });
        this._scales.push(scale);
    }

    getCurrentScale() {
        if (this._isStopGeneration()) {
            this._stopGeneration = true;

            if (!this._scaleFilled) {
                return null;
            }
        }

        const info = this._taskView.getEmptyScaleInfo();
        this._checkScaleInfo(info);
        this._updateGenerateMoreButtonStatus();

        if (this.isTrialFinished()) {
            this._currentScaleInfo = info;
            this._addScale();
            return info;
        } else {
            return null;
        }
    }

    setNextScale() {
        if (this._isFirstTrial()) {
            this._taskView.activateButton("stopGeneration");
        }

        this._taskView.setEmptyScale();
        this._scaleFilled = false;
        this._currentScaleInfo = null;
        this._updateGenerateMoreButtonStatus();
    }

    isCheckRating() {
        return false;
    }

    _isMoveToGenerateNext() {
        return (
            this._generationButtonsStatusCanBePressed &&
            this._taskView.isButtonPressed("generateMore")
        );
    }

    isToSkipInstruction() {
        return this._scales.length === 0;
    }

    isTrialFinished() {
        return this._isMoveToGenerateNext() || this._stopGeneration;
    }

    isPartFinished() {
        return this._stopGeneration;
    }

    getGeneratedScales() {
        return this._scales.slice();
    }
}

class ScaleEvaluationPart {
    constructor({ scales, taskView }) {
        if (scales === undefined) {
            scales = [];
        }

        this._scales = util.shuffle(Array.from(scales));
        this._currentScale = null;
        this._taskView = taskView;

        this._trialFinished = false;
    }

    addScales(scales) {
        for (let scale of scales) {
            this._scales.push(scale);
        }
        this._scales = util.shuffle(Array.from(this._scales));
    }

    setNextScale() {
        if (this.isPartFinished()) {
            this._trialFinished = true;
            return;
        }

        this._trialFinished = false;
        this._currentScale = this._scales.pop();

        const scaleDescription = this._currentScale.scaleDescription;
        const scaleEnds = {
            leftEnd: this._currentScale.leftEnd,
            rightEnd: this._currentScale.rightEnd,
        };
        this._taskView.setFilledScale(scaleDescription, scaleEnds);
    }

    getCurrentScale() {
        const description = this._currentScale.scaleDescription;
        const leftEnd = this._currentScale.leftEnd;
        const rightEnd = this._currentScale.rightEnd;
        const scaleInfo = {
            scaleDescription: description,
            leftEnd: leftEnd,
            rightEnd: rightEnd,
        };

        this._trialFinished = true;
        return scaleInfo;
    }

    isCheckRating() {
        return true;
    }

    isToSkipInstruction() {
        return false;
    }

    isTrialFinished() {
        return this._trialFinished;
    }

    isPartFinished() {
        return this._scales.length === 0;
    }
}

class DemboRubinsteinPresenter extends TaskPresenter {
    constructor({ window, screenSizeAdapter }) {
        const view = new DemboRubinsteinView({ window, screenSizeAdapter });
        super({
            name: "DemboRubinstein",
            instructionsText: instructions,
            view: view,
        });

        this._scalesSets = {
            prebuild: new ScaleEvaluationPart({
                scales: prebuildScales,
                taskView: view,
            }),
            participantGeneratesScales: new ScaleGenerationPart({
                taskView: view,
            }),
            participantsScalesCurrentRatings: new ScaleEvaluationPart({
                taskView: view,
            }),
            participantIdealRatings: new ScaleEvaluationPart({
                scales: prebuildScales,
                taskView: view,
            }),
        };

        this._partName = "prebuild";
        this._partScales = this._scalesSets[this._partName];

        this._trialFinished = false;
    }

    getTaskConditions() {
        const taskCondtions = {
            checkRating: this._partScales.isCheckRating(),
        };
        return taskCondtions;
    }

    _participantStoppedScaleGeneration() {
        return false;
    }

    _nextPart() {
        const parts = Object.keys(this._scalesSets);
        const nextPartNameIndex = parts.indexOf(this._partName) + 1;
        this._partName = parts[nextPartNameIndex];

        this._partScales = this._scalesSets[this._partName];

        if (this._partName !== "participantGeneratesScales") {
            const generatedScales =
                this._scalesSets.participantGeneratesScales.getGeneratedScales();

            this._partScales.addScales(generatedScales);
        }
    }

    nextStimulus() {
        if (this._isAllPartsFinished()) {
            return;
        }

        this._trialFinished = false;

        if (this._partScales.isPartFinished()) {
            this._nextPart();
        }

        this._partScales.setNextScale();
    }

    checkInput(inputProcessor) {
        const inputData = inputProcessor.getData();

        const scaleInfo = this._partScales.getCurrentScale();

        if (scaleInfo === null) {
            if (this._partScales.isPartFinished()) {
                this._solutionAttemptsKeeper.skipAttempt();
            }
            return;
        }

        const { scaleDescription, leftEnd, rightEnd } = scaleInfo;

        let attemptData = {
            task: this.name,
            part: this._partName,
            scaleDescription: scaleDescription,
            scaleLeftEnd: leftEnd,
            scaleRightEnd: rightEnd,
            solved: 1,
        };

        attemptData = Object.assign(attemptData, inputData);
        this._solutionAttemptsKeeper.saveAttempt(attemptData);

        this._trialFinished = true;
    }

    addUnfinishedTrialData(userInputProcessor) {
        if (this._trialFinished) {
            return;
        }
    }

    isToSkipInstruction() {
        return this._partScales.isToSkipInstruction();
    }

    _isAllPartsFinished() {
        return this._scalesSets.participantIdealRatings.isPartFinished();
    }

    isTrialFinished() {
        return this._partScales.isTrialFinished();
    }

    isTaskFinished() {
        // FINISH TASK FOR EVERY PART
        return this._partScales.isPartFinished();
    }
}

class FilledScaleView {
    constructor({ window, textSize, textPosition, textWidth }) {
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
        this._fillerTexts = {
            scaleDescription: "[Напишите название качества]",
            leftEnd: "[Напишите название низкого уровня]",
            rightEnd: "[Напишите название высокого уровня]",
        };

        const scaleDescription = new visual.TextBox({
            win: window,
            text: this._fillerTexts.scaleDescription,
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

        const leftEnd = new visual.TextBox({
            win: window,
            text: this._fillerTexts.leftEnd,
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

        const rightEnd = new visual.TextBox({
            win: window,
            text: this._fillerTexts.rightEnd,
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

        this._scales = {
            scaleDescription: scaleDescription,
            leftEnd: leftEnd,
            rightEnd: rightEnd,
        };
    }

    _isFilled(part) {
        return this._scales[part].getText() !== this._fillerTexts[part];
    }

    getScaleInfo() {
        const scaleInfo = {
            scaleDescription: "",
            leftEnd: "",
            rightEnd: "",
        };

        for (let scalePart in this._scales) {
            if (this._isFilled(scalePart)) {
                scaleInfo[scalePart] = this._scales[scalePart].getText();
            }
        }

        return scaleInfo;
    }

    setScale() {
        for (let scalePart of Object.values(this._scales)) {
            scalePart.clear();
            scalePart.refresh();
        }
    }

    setAutoDraw(toShow) {
        for (let scalePart of Object.values(this._scales)) {
            scalePart.setAutoDraw(toShow);
        }
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
            description: screenSizeAdapter.rescaleTextSize(0.03),
            leftEnd: screenSizeAdapter.rescaleTextSize(0.03),
            rightEnd: screenSizeAdapter.rescaleTextSize(0.03),
        };

        const fieldPosition = {
            description: screenSizeAdapter.rescalePosition([0, 0.2]),
            leftEnd: screenSizeAdapter.rescalePosition([-0.25, -0.07]),
            rightEnd: screenSizeAdapter.rescalePosition([0.25, -0.07]),
        };

        const textPosition = {
            description: screenSizeAdapter.rescalePosition([0, 0.2]),
            leftEnd: screenSizeAdapter.rescalePosition([-0.25, -0.03]),
            rightEnd: screenSizeAdapter.rescalePosition([0.25, -0.03]),
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

        this._inactiveButtonColor = new util.Color("#999999");
        this._activeButtonColor = new util.Color("#4CBB17");
        const wantGenerateMoreScalesButton = new visual.ButtonStim({
            win: window,
            text: "Указать ещё одно качество",
            pos: screenSizeAdapter.rescalePosition([-0.2, -0.35]),
            letterHeight: screenSizeAdapter.rescaleTextSize(0.03),
            size: screenSizeAdapter.rescaleElementSize([0.26, 0.1]),
            fillColor: this._inactiveButtonColor,
        });

        const stopScalesGenerationButton = new visual.ButtonStim({
            win: window,
            text: "Больше важных качеств нет",
            pos: screenSizeAdapter.rescalePosition([0.2, -0.35]),
            letterHeight: screenSizeAdapter.rescaleTextSize(0.03),
            size: screenSizeAdapter.rescaleElementSize([0.27, 0.1]),
            fillColor: this._inactiveButtonColor,
        });

        this._buttons = {
            generateMore: wantGenerateMoreScalesButton,
            stopGeneration: stopScalesGenerationButton,
        };
    }

    setFilledScale(scaleDescription, scaleEnds) {
        this._filledScale.setScale(scaleDescription, scaleEnds);
        this._currentScale = this._filledScale;
    }

    setEmptyScale() {
        this._emptyScale.setScale();
        this._currentScale = this._emptyScale;
        this.deactivateButton("generateMore");
    }

    getEmptyScaleInfo() {
        return this._emptyScale.getScaleInfo();
    }

    deactivateAllButtons() {
        for (let buttonName of Object.keys(this._buttons)) {
            this.deactivateButton(buttonName);
        }
    }

    isButtonPressed(buttonName) {
        return this._buttons[buttonName].isClicked;
    }

    deactivateButton(buttonName) {
        this._buttons[buttonName].fillColor = this._inactiveButtonColor;
    }

    activateButton(buttonName) {
        this._buttons[buttonName].fillColor = this._activeButtonColor;
    }

    setAutoDraw(toShow) {
        this._currentScale.setAutoDraw(toShow);

        if (this._currentScale instanceof EmptyScaleView) {
            this._buttons.generateMore.setAutoDraw(toShow);
            this._buttons.stopGeneration.setAutoDraw(toShow);
        }
    }
}

export { DemboRubinsteinPresenter as DemboRubinstein };
