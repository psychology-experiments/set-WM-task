import { util, visual } from "../lib/psychojs-2021.2.2.js";

import { TaskPresenter, TaskView, Instruction } from "./general.js";

import { SingleMouseClick } from "./general.js";

const instructionForOnlyBlackTable = `
Сейчас тебе будет предложена таблица 5*5 с цифрами от 1 до 25. 
Необходимо найти все числа, начиная с 1 и заканчивая 25. Делать 
это нужно как можно быстрее, не пропуская ни одного числа. Когда 
найдешь необходимую ячейку с числом, щелкни на нее курсором мыши 
и переходи к следующему числу. Если ты готов, нажми СТРЕЛКУ ВПРАВО`;

const firstInstructionForBlackAndRedTable = `
Теперь мы немного усложним задачу! Размер таблицы будет 7*7 с цифрами 
от 1 до 25 черного цвета и от 1 до 24 красного цвета. Тебе необходимо 
выбирать только черные цифры в возрастающем порядке: 1 черное, 2 
черное и т.д. Постарайся делать задание, как можно быстрее. Когда 
найдешь необходимую ячейку с числом, щелкни на нее курсором мыши 
и переходи к следующему числу. Если ты готов, нажми СТРЕЛКУ ВПРАВО`;

const secondInstructionForBlackAndRedTable = `
Теперь тебе необходимо выбирать только красные цифры, но в убывающем 
порядке: сначала 24 красное, затем 23 красное -> 22 красное и т.д.
 Постарайся делать задание, как можно быстрее. Когда найдешь 
 необходимую ячейку с числом, щелкни на нее курсором мыши и 
 переходи к следующему числу. Если ты готов, нажми СТРЕЛКУ ВПРАВО`;

const thirdInstructionForBlackAndRedTable = `
Осталась последняя таблица! В ней числа от 1 до 25 черного цвета и от 
1 до 24 красного цвета. Тебе необходимо выбирать черные цифры в 
возрастающем порядке, а красные – в убывающем, при чем указывать их 
нужно поочередно: сначала 1 черное, затем 24 красное, 2 черное -> 23
 красное -> 3 черное -> 22 красное и т.д. Постарайся делать задание, 
 как можно быстрее. Когда найдешь необходимую ячейку с числом, щелкни 
 на нее курсором мыши и переходи к следующему числу. Если ты готов, 
 нажми СТРЕЛКУ ВПРАВО`;

class OneColorSchulteProgress {
    constructor() {
        this._currentStep = 1;
    }

    checkAnswer({ answer }) {
        if (answer === this._currentStep) {
            this._currentStep += 1;
            return true;
        }

        return false;
    }
}

class TwoColorSchulteProgress {}

class SchulteProgress {
    constructor({ type }) {
        if (type === "black") {
            this._progress = new OneColorSchulteProgress();
        } else if (type === "red") {
            this._progress = new TwoColorSchulteProgress();
        } else {
            throw new Error(
                `Schulte Table must be "black" or "red", was ${type}`
            );
        }
    }

    isCorrectAnswer({ answer }) {
        return this._progress.checkAnswer({ answer });
    }
}

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
    }

    getModelProperties() {
        return {
            number: this._model.number,
            color: this._model.color,
        };
    }

    isCorrectChoice(progressChecker) {
        return progressChecker.isCorrectAnswer({ answer: this._model.number });
    }
}

class SchulteSquareView {
    constructor({
        window,
        sideSize,
        squareNumber,
        position,
        squareNumberColor = "black",
    }) {
        this._presenter = new SchulteSquarePresenter({
            number: squareNumber,
            numberColor: squareNumberColor,
        });
        const { color, number } = this._presenter.getModelProperties();

        this._originalSquareColor = "#FFFFFF";
        this._square = this._create_square(window, sideSize, position, number);
        this._number = this._create_number(
            window,
            sideSize,
            position,
            number,
            color
        );
    }

    _create_square(window, sideSize, position, number) {
        return new visual.Rect({
            name: `square ${number}`,
            win: window,
            lineWidth: 3.0,
            lineColor: new util.Color("black"),
            fillColor: new util.Color("white"),
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
            font: "Arial",
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
        return this._square.contains(mouse);
    }

    _changeColor(color) {
        this._square.fillColor = new util.Color(color);
        this._number._needUpdate = true;
    }

    _startChange(color, time) {
        this._changeColor(color);
        setTimeout(
            (color) => this._changeColor(color),
            time,
            this._originalSquareColor
        );
    }

    showCorrectness(progressChecker) {
        if (this._presenter.isCorrectChoice(progressChecker)) {
            let lightGreen = "#90FF90";
            this._startChange(lightGreen, 100);
        } else {
            let lightRed = "#FF9090";
            this._startChange(lightRed, 300);
        }
    }

    draw() {
        this._square.draw();
        this._number.draw();
    }

    setAutoDraw(isToAutoDraw) {
        this._square.setAutoDraw(isToAutoDraw);
        this._number.setAutoDraw(isToAutoDraw);
    }
}

class SchulteTable {
    constructor({ window, side, squaresNumber, numberColor = "black" }) {
        this.status = undefined;
        this.squaresNumber = squaresNumber;

        // this._singleClick = new SingleMouseClick();
        this._progress = new SchulteProgress({ type: numberColor });
        this._squares = [];
        this._generateSquares(window, side, numberColor);
    }

    _generateSquares(window, side, numberColor) {
        let squaresInRow = Math.pow(this.squaresNumber, 0.5);
        let positionsIndex = Array.from(Array(squaresInRow).keys()).map(
            function (value) {
                return value - Math.floor(squaresInRow / 2);
            }
        );

        let randomised_numbers = util.shuffle(
            Array.from(Array(this.squaresNumber).keys()).map(
                (value) => value + 1
            )
        );

        let randomisedIndex = 0;
        for (let xIndex of positionsIndex) {
            let x = xIndex * side;
            for (let yIndex of positionsIndex) {
                let y = yIndex * side;
                let square = new SchulteSquareView({
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
                console.error(
                    square.getNumber(),
                    this._singleClick.timePressed
                );
                square.showCorrectness(this._progress);
            }
        }
    }

    draw() {
        this._squares.forEach((singleSquare) => singleSquare.draw());
    }

    setAutoDraw(isToAutoDraw) {
        this._squares.forEach((square) => square.setAutoDraw(isToAutoDraw));
    }
}

export { SchulteTable };
