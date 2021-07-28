import * as core from '../lib/core-2021.1.4.js';
import * as data from '../lib/data-2021.1.4.js';
import * as util from '../lib/util-2021.1.4.js';


class SingleMouseClick {
    constructor() {
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

class Keyboard {
    constructor({ psychoJS }) {
        this._isInitialized = false;
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

    get isInitilized() {
        return this._isInitialized;
    }

    get isPressed() {
        return this._isPressed;
    }

    initilize() {
        this._isInitialized = true;
        this._psychoJS.window.callOnFlip(() => this._keyboard.clock.reset());  // t == 0 on next screen flip
        this._psychoJS.window.callOnFlip(() => this._keyboard.start()); // start on screen flip
        this._psychoJS.window.callOnFlip(() => this._keyboard.clearEvents()); // remove all previous events
    }

    getKeys({ KeyList }) {
        let pressedKey = this._keyboard.getKeys({ keyList: KeyList, waitRelease: false });

        if (pressedKey.length > 0) {
            this._keyName = pressedKey[0].name;
            this._rt = pressedKey[0].rt;
            this._isPressed = true;
        }

    }

    stop() {
        this._keyboard.stop();
        this._isInitialized = false;
        this._isPressed = false;
        this._keyName = null;
        this._rt = null;
    }


}


class Task {
    constructor() {
        if (this.constructor === Task) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }
}


class ExperimentOrgaizer {
    constructor({
        psychoJS,
        experimentScheduler,
        parts,
        routines,
        tasksAtTheBeginning,
        isInDevelopment,
        showOnly,
    }) {
        this._psychoJS = psychoJS;
        this._experimentScheduler = experimentScheduler;
        this._parts = parts;
        this._routines = routines;
        this._tasksAtTheBeginning = tasksAtTheBeginning;

        this.isInDevelopment = isInDevelopment;
        this._showOnly = showOnly;
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

    _generateLoopBegin(loopScheduler, taskRoutines, routineSettings) {
        // set up handler to look after randomisation of conditions etc
        let trials = new data.TrialHandler({
            psychoJS: this._psychoJS,
            nReps: sum(routineSettings.nLoops),
            method: data.TrialHandler.Method.RANDOM,
            originPath: undefined,
            trialList: undefined,
            seed: undefined,
            name: 'testTrials',
        });

        this._psychoJS.experiment.addLoop(trials); // add the loop to the experiment

        for (const thisTrial of trials) {

            const snapshot = trials.getSnapshot();
            for (const routine of taskRoutines.routines) {
                loopScheduler.add(routine(snapshot, routineSettings.task));
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
        this._experimentScheduler.add(this._generateLoopBegin, trialsLoopScheduler, this._routines, routineSettings);
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
    ExperimentOrgaizer,
    Keyboard,
    SingleMouseClick,
    Task,
    choice,
    choices,
    cartesian
};