import * as core from '../lib/core-2021.1.4.js';
import * as data from '../lib/data-2021.1.4.js';
import * as util from '../lib/util-2021.1.4.js';
import * as visual from '../lib/visual-2021.1.4.js';


class TaskPresenter {
    /**
     * 
     * @param {string} name - Name of the task
     * @param {Array} instructionsText - Instructions for the task 
     * @param {TaskView} view - Object that draw task on the screen
     * @param {UserInputProcessor} userInputProcessor - Object that collect participant's input
     */
    constructor({ name, instructionsText, view }) {
        if (this.constructor === TaskPresenter) {
            throw new Error("Abstract classes can't be instantiated.");
        }

        if (name === undefined && typeof name === "string") { throw new Error("name attribute must be given to super() and be a string"); }
        this.name = name;

        if (instructionsText === undefined) { throw new Error("instructionText attribute must be given to super()"); }
        if (!Array.isArray(instructionsText)) { throw new Error("instructionText attribute must be Array with string(s)"); }
        if (!instructionsText.every(singleInstruction => singleInstruction instanceof Instruction)) { throw new Error("all instructionText must be of class Instruction"); }
        this.instructions = instructionsText;

        if (view === undefined) { throw new Error("view attribute must be given to super()"); }
        if (!(view instanceof TaskView)) { throw new Error("view attribute must be subclass of TaskView"); }
        this._view = view;

        this._trial_finished = false;
        this._solutionAttemptsKeeper = new SolutionAttemptsKeeper();
    }

    get isStarted() {
        return this._view._isStarted;
    }

    get startTime() {
        return this._view.startTime;
    }

    start() {
        this._view.start();
    }

    stop() {
        if (!this._solutionAttemptsKeeper.wasCalled()) {
            throw new Error("After EACH trial SolutionAttemptsKeeper must be called at least to save attempt data.");
        }

        this._solutionAttemptsKeeper.clear();
        this._view.stop();
    }

    addUnfinishedTrialData(userInputProcessor) {
        if (this._trial_finished) {
            return;
        }
        // throw new Error(`Method 'addUnfinishedTrialData(userInputProcessor)' must be implemented in ${this.name} class.`);
    }

    getTrialData() {
        return this._solutionAttemptsKeeper.getAttempts();
    }

    setAutoDraw(toShow) {
        this._view.setAutoDraw(toShow);
    }

    getTaskConditions() {
        throw new Error(`Method 'getTaskConditions()' must be implemented in ${this.name} class.`);
    }

    nextStimulus() {
        throw new Error(`Method 'nextStimulus()' must be implemented in ${this.name} class.`);
    }

    checkInput(inputProcessor) {
        throw new Error(`Method 'checkInput(inputProcessor)' must be implemented in ${this.name} class.`);
    }

    isTrialFinished(userInputProcessor) {
        throw new Error(`Method 'isTrialFinished(userInputProcessor)' must be implemented in ${this.name} class.`);
    }

    isTaskFinished() {
        throw new Error(`Method 'isTaskFinished()' must be implemented in ${this.name} class.`);
    }
}


class TaskView {
    constructor({ startTime }) {
        this._isStarted = false;
        this.startTime = startTime === undefined ? 0 : startTime;

    }

    start() {
        this._isStarted = true;
        this.setAutoDraw(true);
    }

    stop() {
        this._isStarted = false;
        this.setAutoDraw(false);
    }

    setAutoDraw(toShow) {
        throw new Error(`Method 'setAutoDraw(toShow)' must be implemented in ${this.name} class.`);
    }
}


class SolutionAttemptsKeeper {
    constructor() {
        this._attempts = [];
    }

    saveAttempt(attemptData) {
        this._attempts.push(attemptData);
    }

    getAttempts() {
        return this._attempts;
    }

    clear() {
        this._attempts = [];
    }

    wasCalled() {
        return this._attempts.length > 0;
    }
}


class UserInputProcessor {
    constructor({ inputType, additionalTrialData }) {
        if (this.constructor === UserInputProcessor) {
            throw new Error("Abstract classes can't be instantiated.");
        }

        if (typeof inputType !== "string") { throw new Error("inputType attribute must be given to super() and be a string"); }
        this.inputType = inputType;

        if (!(additionalTrialData instanceof AdditionalTrialData)) {
            throw new Error("additionalTrialData attribute must be given to super() and be a instance of AdditionalTrialData");
        }
        this._additionalTrialData = additionalTrialData;

        this._isInitilized = false;
    }

    initilize(taskConditions) {
        throw new Error(`Method 'initilize(taskConditions)' must be implemented in ${this.inputType}.`);
    }

    stop() {
        throw new Error(`Method 'stop()' must be implemented in ${this.inputType}.`);
    }

    isSendInput() {
        throw new Error(`Method 'isSendInput()' must be implemented in ${this.inputType}.`);
    }

    getInput() {
        throw new Error(`Method 'getInput()' must be implemented in ${this.inputType}.`);
    }

    getData() {
        throw new Error(`Method 'getData()' must be implemented in ${this.inputType}.`);
    }

    showInputError() {
        throw new Error(`Method 'showInputError()' must be implemented in ${this.inputType}.`);
    }

    clearInput() {
        throw new Error(`Method 'clearInput()' must be implemented in ${this.inputType}.`);
    }

    get isInitilized() {
        return this._isInitilized;
    }
}


class SingleMouseClick extends UserInputProcessor {
    constructor(additionalTrialData) {
        super({ inputType: "Mouse", additionalTrialData });
        this._isPressed = false;
        this._timePressed = null;
    }

    get timePressed() {
        return this._timePressed;
    }

    getButtonPress(mouse, button) {
        let clickInfo = mouse.getPressed(true);
        return {
            isPressed: clickInfo[0][button],
            timePressed: clickInfo[1][button],
        };
    }

    isSingleClick(mouse, button) {
        let click = this.getButtonPress(mouse, button);

        if (click.isPressed && !this._isPressed) {
            mouse.clickReset([0]);
            this._isPressed = true;
            this._timePressed = click.timePressed;
            return true;
        }

        if (!click.isPressed) {
            this._isPressed = false;
            this._timePressed = null;
        }

        return false;

    }
}

class SingleSymbolKeyboard extends UserInputProcessor {
    constructor({ psychoJS, additionalTrialData }) {
        super({ inputType: "Keyboard", additionalTrialData });
        this._keyList = null;
        this._isPressed = false;
        this._keyName = null;
        this._rt = null;

        this._keyboard = new core.Keyboard({ psychoJS: psychoJS, clock: new util.Clock(), waitForStart: true });
        this._psychoJS = psychoJS;
    }

    get rt() {
        return this._rt;
    }

    get keyName() {
        return this._keyName;
    }

    get isPressed() {
        return this._isPressed;
    }

    initilize(taskConditions) {
        this._keyList = taskConditions.keysToWatch;
        this._isInitilized = true;
        this._psychoJS.window.callOnFlip(() => this._keyboard.clock.reset());  // t === 0 on next screen flip
        this._psychoJS.window.callOnFlip(() => this._keyboard.start()); // start on screen flip
        this._psychoJS.window.callOnFlip(() => this._keyboard.clearEvents()); // remove all previous events
    }

    isSendInput() {
        let pressedKey = this._keyboard.getKeys({ keyList: this._keyList, waitRelease: false });

        if (pressedKey.length > 0) {
            this._keyName = pressedKey[0].name;
            this._rt = pressedKey[0].rt;
            this._isPressed = true;
        }

        return this._isPressed;
    }

    getData() {
        const inputData = {
            keyName: this._keyName,
            rt: this._rt,
        };

        return inputData;
    }

    stop() {
        this._keyboard.stop();
        this._keyList = null;
        this._isInitilized = false;
        this._isPressed = false;
        this._keyName = null;
        this._rt = null;
    }
}


class WordInputProcessor extends UserInputProcessor {
    constructor({ window, additionalTrialData }) {
        super({ inputType: "WordInputProcessor", additionalTrialData });
        this._inputWindow = new visual.TextBox({
            win: window,
            name: 'textbox',
            text: '',
            font: 'Open Sans',
            pos: [0, -200],
            letterHeight: 70,
            size: [400, 150],
            units: 'pix',
            color: 'black',
            colorSpace: 'rgb',
            fillColor: 'lightgrey',
            borderColor: undefined,
            bold: true,
            italic: false,
            opacity: undefined,
            padding: undefined,
            editable: true,
            multiline: true,
            anchor: 'center',
            depth: 0.0,
            autofocus: true,
        });

        this._errorMessage = new visual.TextStim({
            win: window,
            color: "red",
        });

        this._currentLength = 0;
        this._maxLength = null;
    }

    initilize(taskConditions) {
        this._clearInput();

        if (typeof taskConditions.maxInputLength === "undefined") {
            throw new Error("MaxInputLength must be defined.");
        }

        this._maxLength = taskConditions.maxInputLength;
        this._inputWindow.setAutoDraw(true);
        this._isInitilized = true;
        this._inputWindow.refresh();
    }

    stop() {
        this._clearInput();
        this._inputWindow.setAutoDraw(false);
        this._isInitilized = false;
    }

    _getCurrentInput() {
        return this._inputWindow.text;
    }

    _setCurrentInput(text) {
        this._inputWindow.text = text.toLowerCase();
    }

    _clearInput() {
        this._inputWindow.setText();
        this._currentLength = 0;
        this._maxLength = null;
    }

    clearInput() {
        this._inputWindow.setText();
        this._currentLength = 0;
    }

    _getLastCharacter(text) {
        return text.slice(text.length - 1);
    }

    _removeLastCharacter(text) {
        return text.slice(0, -1);
    }

    _formatDataInput() {
        const formattedInput = this._getCurrentInput().replace("\n", "");
        this._setCurrentInput(formattedInput);
    }

    _isProhibitedCharacter(character) {
        return !character.match(/[а-яА-я]/g);
    }

    _removeProhibitedCharacters() {
        const currentAnswer = this._getCurrentInput();
        const inputLength = currentAnswer.length;

        if (this._currentLength === inputLength) {
            return;
        }

        if (inputLength > this._maxLength) {
            this._setCurrentInput(this._removeLastCharacter(currentAnswer));
            return;
        }

        this._currentLength = inputLength;
        const lastCharacter = this._getLastCharacter(currentAnswer);

        this._setCurrentInput(
            !this._isProhibitedCharacter(lastCharacter) ?
                currentAnswer :
                this._removeLastCharacter(currentAnswer)
        );
    }

    isSendInput() {
        const currentAnswer = this._getCurrentInput();
        if (currentAnswer.length - 1 === this._maxLength && currentAnswer.includes("\n")) {
            return true;
        }

        this._removeProhibitedCharacters();
        return false;
    }

    getData() {
        this._formatDataInput();
        const inputData = {
            participantAnswer: this._getCurrentInput(),
        };
        return this._additionalTrialData.addData(inputData);
    }
}


class Instruction {
    constructor(text) {
        this.text = text.trim().replace(/\n/g, " ");
    }

    toString() {
        return this.text;
    }
}


class InstructionGenerator {
    constructor({ showInstruction, when, instructionRoutine, instructionsText, loopScheduler }) {
        this._showInstruction = showInstruction;
        this._when = when;
        this._instructionsText = instructionsText;
        this._instructionRoutine = instructionRoutine;
        this._loopScheduler = loopScheduler;

        this._instructions_qty = instructionsText.length;
        this._instructionIdx = 0;

        if (this._instructions_qty !== this._when.length) {
            throw new Error("Quantity of instructions and loops are different");
        }
    }

    generateInstruction(nTrial) {
        if (!this._showInstruction) {
            return;
        }

        if (this._instructions_qty === 0) {
            return;
        }

        if (nTrial === this._when[this._instructionIdx] || nTrial === 0) {
            this._loopScheduler.add(this._instructionRoutine(this._instructionsText[this._instructionIdx]));
            this._instructions_qty -= 1;
            this._instructionIdx += 1;
        }
    }


}


class ExperimentOrganizer {
    constructor({
        psychoJS,
        experimentScheduler,
        parts,
        routines,
        tasksAtTheBeginning,
        isInDevelopment,
        showOnly,
        showInstructions,
    }) {
        this._psychoJS = psychoJS;
        this._experimentScheduler = experimentScheduler;
        this._parts = parts;
        this._routines = routines;
        this._tasksAtTheBeginning = tasksAtTheBeginning;

        this.isInDevelopment = isInDevelopment;
        this._showOnly = showOnly;
        this._showInstructions = showInstructions;
    }

    _isToShowDelopment(settings) {
        return settings.isForExperiment || this.isInDevelopment;
    }

    _isShowOnlyOneTask(taskName) {
        return this._showOnly === null || taskName === this._showOnly;
    }

    _isLoopedRoutine(nLoops) {
        return sum(nLoops) > 0;
    }

    _generateLoopBegin(loopScheduler, taskRoutines, routineSettings, showInstructions) {
        // set up handler to look after randomisation of conditions etc
        let trials = new data.TrialHandler({
            psychoJS: this._psychoJS,
            nReps: sum(routineSettings.nLoops),
            method: data.TrialHandler.Method.RANDOM,
            originPath: undefined,
            trialList: undefined,
            seed: undefined,
            name: [routineSettings.task.name + "Trials"],
        });

        let instructionGenerator = new InstructionGenerator({
            showInstruction: showInstructions,
            when: routineSettings.nLoops,
            instructionRoutine: taskRoutines.instruction,
            instructionsText: routineSettings.task.instructions,
            loopScheduler: loopScheduler,
        });

        this._psychoJS.experiment.addLoop(trials); // add the loop to the experiment

        for (const thisTrial of trials) {

            const snapshot = trials.getSnapshot();
            instructionGenerator.generateInstruction(snapshot.thisN);
            for (const routine of taskRoutines.routines) {
                loopScheduler.add(routine(snapshot, routineSettings.task, routineSettings.userInputProcessor));
            }
            loopScheduler.add(taskRoutines.loop(loopScheduler, snapshot));
        }
        return util.Scheduler.Event.NEXT;
    }

    _generateLoopEnd() {
        // this._psychoJS.experiment.removeLoop(trials);
        return util.Scheduler.Event.NEXT;
    }

    _generateSingleRoutine(routineSettings) {
        this._experimentScheduler.add(routineSettings.task());
    }

    _generateLoopedRoutine(routineSettings) {
        const trialsLoopScheduler = new util.Scheduler(this._psychoJS);
        this._experimentScheduler.add(this._generateLoopBegin, trialsLoopScheduler, this._routines, routineSettings, this._showInstructions);
        this._experimentScheduler.add(trialsLoopScheduler);
        this._experimentScheduler.add(this._generateLoopEnd);
    }

    generateExperimentSequence() {
        if (this._parts === null) {
            throw new Error("Experiment Parts are not defined");
        }

        let routines = Object.entries(this._parts)
            .filter(([part, settings]) => this._isShowOnlyOneTask(part) && this._isToShowDelopment(settings));


        for (let [part, settings] of routines) {
            if (this._isLoopedRoutine(settings.nLoops)) {
                this._generateLoopedRoutine(settings);
            } else {
                this._generateSingleRoutine(settings);
            }
        }
    }
}


class DataSaver {
    constructor({ psychoJS }) {
        this._saveEngine = psychoJS.experiment;
    }

    _formatToAttempts(data) {
        return Object.entries(data).map((value, key) => [Number(key) + 1, value[1]]);
    }

    _formatAttemptToColumValueData(data) {
        return Object.entries(data);
    }

    _saveAttempt(attemptData) {
        const formattedAttemptData = this._formatAttemptToColumValueData(attemptData);
        for (let [columnName, columnValue] of formattedAttemptData) {
            this._saveEngine.addData(columnName, columnValue);
        }
    }

    saveData({ taskData }) {
        for (let [attemptNumber, attemptData] of this._formatToAttempts(taskData)) {
            this._saveEngine.addData("attempt", attemptNumber);
            this._saveAttempt(attemptData);
            this._saveEngine.nextEntry();
        }
    }
}


class AdditionalTrialData {
    constructor(data) {
        this._data = Object.entries(data);
    }

    _checkNoDataOverwritten(trialData, additioanlData) {
        const overwrittenData = [];
        for (let additionalKey of Object.keys(additioanlData)) {
            if (additionalKey in trialData) {
                overwrittenData.push(additionalKey);
            }
        }

        if (overwrittenData.length > 0) {
            throw new Error(`Additional data overwrites this trial data ${overwrittenData}`);
        }

    }

    _generateAdditionalData() {
        const additionalData = {};

        for (let [additionalKey, additionalDataGetter] of this._data) {
            additionalData[additionalKey] = additionalDataGetter();
        }
        return additionalData;
    }

    addData(trialData) {
        // TODO: time data is added after routine is ended. Let's try to make it nearer to actual time point (generate in main for example)
        const additionalData = this._generateAdditionalData();
        this._checkNoDataOverwritten(trialData, additionalData);

        return Object.assign(trialData, additionalData);
    }
}


function choice(seq) {
    // Choose a random element from a non-empty sequence.
    let length = seq.length;

    if (length === 0) {
        throw new Error('Cannot choose from an empty sequence');
    }

    let i = Math.floor(Math.random() * length);
    return seq[i];
}

function choices(seq, k = 1) {
    return new Array(k).fill(null).map(() => choice(seq));
}


function cartesian(...arrays) {
    return arrays.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));
}

function sum(array) {
    return array.reduce((total, current) => total + current, 0);
}


export {
    AdditionalTrialData,
    ExperimentOrganizer,
    DataSaver,
    Instruction,
    SingleSymbolKeyboard,
    SolutionAttemptsKeeper,
    WordInputProcessor,
    SingleMouseClick,
    TaskPresenter,
    TaskView,
    choice,
    choices,
    cartesian
};