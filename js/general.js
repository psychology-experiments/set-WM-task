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


class ExperimentOrgaizer {
    constructor({ scheduler, parts, tasksAtTheBeginning, isDeveloped, showOnly, }) {
        this._scheduler = scheduler;
        this._parts = parts;
        this._tasksAtTheBeginning = tasksAtTheBeginning;

        this.isDeveloped = isDeveloped;
        this._showOnly = showOnly;
    }

    _isToShowDelopment(settings) {
        return settings.isForExperiment || this.isDeveloped;

    }

    generateExperimentSequence() {
        if (this._showOnly !== null) {
            this._scheduler.add(this._parts[this._showOnly].routine());
            return;
        }

        let routines = Object.entries(this._parts)
            .filter(([_, settings]) => this._isToShowDelopment(settings));

        for (let [part, settings] of routines) {
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

function choices(seq, k=1) {
    return new Array(k).fill(null).map(() => choice(seq));
}


function cartesian(...arrays) {
    return arrays.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));
}


export {
    ExperimentOrgaizer,
    SingleMouseClick,
    choice,
    choices,
    cartesian
};