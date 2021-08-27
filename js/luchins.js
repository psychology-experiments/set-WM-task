import { util, visual } from "../lib/psychojs-2021.2.2.js";

import { TaskPresenter, TaskView, Instruction } from "./general.js";

const instruction = ``;

class LuchinsPresenter extends TaskPresenter {
    constructor({ window, screenSizeAdapter, startTime }) {
        const instructions = [new Instruction(instruction)];
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

        this._task = new visual.TextStim({
            win: window,
            text: "",
            color: "black",
            pos: screenSizeAdapter.rescalePosition([0, 0.2]),
            height: screenSizeAdapter.rescaleTextSize(0.15),
            autoDraw: false,
            bold: true,
        });
    }

    setLuchinsTask(task) {
        this._task.text = task;
    }

    setAutoDraw(toShow) {
        this._task.setAutoDraw(toShow);
    }
}

export { LuchinsPresenter as Luchins };
