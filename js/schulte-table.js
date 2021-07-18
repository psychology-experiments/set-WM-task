import * as visual from '../lib/visual-2021.1.4.js';
import * as util from '../lib/util-2021.1.4.js';

import { SingleClick } from "./general.js"


class SchulteSquareModel {
    constructor({ number, numberColor }) {
        this.number = number;
        this.color = numberColor;
        this._wasChosen = false;
    }
}

class SchulteSquarePresenter {
    constructor({ number, numberColor }) {
        this._model = new SchulteSquareModel({ number, numberColor });
        this.number = number;
    }

    getModelProperties() {
        return {
            number: this._model.number,
            color: this._model.color,
        };
    }

    isCorrectChoice() {

    }

}

class SchulteSquareView {
    constructor({ window, sideSize, squareNumber, position, squareNumberColor = "black" }) {
        this._presenter = new SchulteSquarePresenter({ number: squareNumber, numberColor: squareNumberColor });
        const { color, number } = this._presenter.getModelProperties();

        this._originalSquareColor = "#FFFFFF";
        this._square = this._create_square(window, sideSize, position, number);
        this._number = this._create_number(window, sideSize, position, number, color);
    }

    _create_square(window, sideSize, position, number) {
        return new visual.Rect({
            name: `square ${number}`,
            win: window,
            lineWidth: 3.0,
            lineColor: new util.Color('black'),
            fillColor: new util.Color('white'),
            opacity: 1.0,
            width: sideSize,
            height: sideSize,
            pos: position,
            ori: 0.0,
            interpolate: true,
            size: 1,
        });
    }

    _create_number(window, sideSize, position, number, color) {
        return new visual.TextStim({
            win: window,
            name: `${color} number ${number}`,
            text: `${number}`,
            alignHoriz: "center",
            alignVert: "center",
            font: 'Arial',
            pos: position,
            height: sideSize * 0.7,
            color: color,
            opacity: 1,
        });
    }

    getNumber() {
        return this._presenter.number;
    }

    contains(mouse) {
        // console.error(mouse);
        return this._square.contains(mouse);
    }

    _changeColor(square, number, color) {
        square.fillColor = new util.Color(color);
        number._needUpdate = true;
    }

    _startChange(color) {
        this._changeColor(this._square, this._number, color);
        setTimeout(this._changeColor, 300, this._square, this._number, this._originalSquareColor);
    }

    showCorrectness() {
        this._startChange("#FF9090");
        this._startChange("#90FF90");
    }

    draw() {
        this._square.draw();
        this._number.draw();
    }

    setAutoDraw(isToAutoDraw) {
        this._square.draw(isToAutoDraw);
        this._number.draw(isToAutoDraw);
    }
}


class SchulteTable {
    constructor({ window, side, squaresNumber, numberColor = "black" }) {
        this.status = undefined;
        this.squaresNumber = squaresNumber;

        this._singleClick = new SingleClick();
        this._squares = [];
        this._generateSquares(window, side, numberColor);
    }

    _generateSquares(window, side, numberColor) {
        let squaresInRow = Math.pow(this.squaresNumber, 0.5);
        let positionsIndex = Array.from(Array(squaresInRow).keys()).map(function (value) {
            return value - Math.floor(squaresInRow / 2);
        });

        let randomised_numbers = util.shuffle(Array.from(Array(this.squaresNumber).keys()).map((value) => value + 1));

        let randomisedIndex = 0;
        for (let xIndex of positionsIndex) {
            let x = xIndex * side;
            for (let yIndex of positionsIndex) {
                let y = yIndex * side;
                let square = new SchulteSquareView(
                    {
                        window: window,
                        sideSize: side,
                        squareNumber: randomised_numbers[randomisedIndex],
                        position: [x, y],
                        squareNumberColor: numberColor,
                    });
                this._squares.push(square);
                randomisedIndex += 1;
            }
        }

    }

    getClick(mouse) {
        if (!this._singleClick.isSingleClick(mouse, 0)) {
            return;
        }

        for (let square of this._squares) {
            if (mouse.isPressedIn(square)) {
                console.error(square.getNumber(), this._singleClick.timePressed);
                square.showCorrectness();
            }
        }
    }

    draw() {
        this._squares.forEach(singleSquare => singleSquare.draw());
    }

    setAutoDraw(isToAutoDraw) {
        this._squares.forEach(square => square.setAutoDraw(isToAutoDraw));
    }
}

export { SchulteTable };