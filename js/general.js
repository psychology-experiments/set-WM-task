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

export { SingleClick };