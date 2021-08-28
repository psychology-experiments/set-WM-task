import { util, visual } from "../lib/psychojs-2021.2.2.js";

import { TaskPresenter, TaskView, Instruction } from "./general.js";

const instructionPathName = "LuchinsInstruction";

class LuchinsPresenter extends TaskPresenter {
    constructor({ window, screenSizeAdapter, startTime }) {
        const instructions = [new Instruction(null, instructionPathName)];
        const view = new LuchinsView({ window, screenSizeAdapter, startTime });
        super({ name: "Luchins", instructionsText: instructions, view: view });

        this._task = null;
        this._tasks = [];
    }

    getTaskConditions() {
        throw new Error(
            `Method 'getTaskConditions()' must be implemented in ${this.name} class.`
        );
    }

    nextStimulus() {
        throw new Error(
            `Method 'nextStimulus()' must be implemented in ${this.name} class.`
        );
    }

    checkInput(userInputProcessor) {
        throw new Error(
            `Method 'checkInput(userInputProcessor)' must be implemented in ${this.name} class.`
        );
    }

    isToSkipInstruction() {
        return false;
    }

    isTrialFinished() {
        throw new Error(
            `Method 'isTrialFinished()' must be implemented in ${this.name} class.`
        );
    }

    isTaskFinished() {
        throw new Error(
            `Method 'isTaskFinished()' must be implemented in ${this.name} class.`
        );
    }
}

class LuchinsView extends TaskView {
    constructor({ window, screenSizeAdapter, startTime }) {
        super({ startTime });

        this._image = new visual.ImageStim({
            win: window,
            pos: screenSizeAdapter.rescalePosition([0, 0.2]),
            size: screenSizeAdapter.rescaleElementSize([1, 1]),
        });
    }

    setLuchinsTask(taskFP) {
        this._task.setImage(taskFP);
    }

    setAutoDraw(toShow) {
        this._task.setAutoDraw(toShow);
    }
}

export { LuchinsPresenter as Luchins };
