import * as util from '../lib/util-2021.1.4.js';


class SingleClick {
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


class ExperimentOrgaizer {
    constructor({ scheduler, parts }) {
        this._scheduler = scheduler;
        this._parts = parts;
    }

    generateExperimentSequence() {
        for (let [part, settings] of Object.entries(this._parts)) {
            this._scheduler.add(settings.routine());
        }
    }
}

function choice(seq) {
    // Choose a random element from a non-empty sequence.
    let length = seq.length;

    if (length === 0) {
        throw Error('Cannot choose from an empty sequence');
    }

    let i = Math.floor(Math.random() * length);
    return seq[i];
}

function cartesian(...arrays) {
    return arrays.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));
}


export {
    ExperimentOrgaizer,
    SingleClick,
    choice,
    cartesian
};