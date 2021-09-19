import { util, visual } from "../lib/psychojs-2021.2.2.js";

import { TaskPresenter, TaskView, Instruction } from "./general.js";

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

function SchulteTableInstructionGenerator(squaresNumbersColor) {
    if (squaresNumbersColor.length === 1) {
        const instructions = [new Instruction(instructionForOnlyBlackTable)];
        return instructions;
    }

    if (squaresNumbersColor.length === 2) {
        const instructions = [
            new Instruction(firstInstructionForBlackAndRedTable),
            new Instruction(secondInstructionForBlackAndRedTable),
            new Instruction(thirdInstructionForBlackAndRedTable),
        ];
        return instructions;
    }

    throw new Error(`${squaresNumbersColor} tableType is not supported`);
}

class OneColorSchulteProgress {
    constructor(squaresNumber, color, reverse = false) {
        this._color = color;
        this._reverse = reverse;

        const squares = squaresNumber[`${this._color}Squares`];
        this._maxSquares = squares + 1;
        this._currentStep = 1;

        this._currentNumber = !this._reverse ? 1 : squares;
    }

    _updateNumber() {
        this._currentNumber += !this._reverse ? 1 : -1;
    }

    checkAnswer({ answerNumber, answerColor }) {
        if (answerColor !== this._color) {
            return false;
        }

        if (answerNumber === this._currentNumber) {
            this._currentStep += 1;
            this._updateNumber();
            return true;
        }

        return false;
    }

    whatIsNextRightChoice() {
        return { number: this._currentNumber, color: this._color };
    }

    isTableFinished() {
        return this._currentStep === this._maxSquares;
    }
}

class TwoColorSchulteProgress {
    constructor(squaresNumber, colors) {
        this._checkers = [
            new OneColorSchulteProgress(squaresNumber, colors[0]),
            new OneColorSchulteProgress(squaresNumber, colors[1], true),
        ];

        this._currentChecker = this._checkers[0];
        this._currentCheckerIdx = 0;
    }

    checkAnswer({ answerNumber, answerColor }) {
        const isCorrect = this._currentChecker.checkAnswer({
            answerNumber,
            answerColor,
        });

        if (isCorrect) {
            this._currentCheckerIdx = (this._currentCheckerIdx + 1) % 2;
            this._currentChecker = this._checkers[this._currentCheckerIdx];
        }

        return isCorrect;
    }

    whatIsNextRightChoice() {
        return this._currentChecker.whatIsNextRightChoice();
    }

    isTableFinished() {
        return this._checkers.every((checker) => checker.isTableFinished());
    }
}

class SchulteProgress {
    constructor({ type, squaresNumber }) {
        this._tablesProgressCheckers = [];
        this._tablesDone = 0;
        this._progress = null;

        const singleColorTables = type.length === 1;
        const doubleColorTables = type.length === 2;
        if (singleColorTables) {
            const color = type[0];
            this._createCheckersForSingleColoredTable(color, squaresNumber);
        } else if (doubleColorTables) {
            const colors = type;
            this._createCheckersForDoubleColoredTable(colors, squaresNumber);
        } else {
            throw new Error(
                `Schulte Table must be ["black"] or ["black", "red"], was ${type}`
            );
        }
    }

    _createCheckersForSingleColoredTable(color, squaresNumber) {
        for (let tableNumber = 0; tableNumber < 5; tableNumber++) {
            const progressChecker = new OneColorSchulteProgress(
                squaresNumber,
                color
            );
            this._tablesProgressCheckers.push(progressChecker);
        }
    }

    _createCheckersForDoubleColoredTable(colors, squaresNumber) {
        const firstProgressChecker = new OneColorSchulteProgress(
            squaresNumber,
            colors[0],
            false
        );
        const secondProgressChecker = new OneColorSchulteProgress(
            squaresNumber,
            colors[1],
            true
        );

        const thirdProgressChecker = new TwoColorSchulteProgress(
            squaresNumber,
            colors
        );

        this._tablesProgressCheckers.push(
            firstProgressChecker,
            secondProgressChecker,
            thirdProgressChecker
        );
    }

    isCorrectAnswer({ answerNumber, answerColor }) {
        return this._progress.checkAnswer({ answerNumber, answerColor });
    }

    whatIsNextRightChoice() {
        return this._progress.whatIsNextRightChoice();
    }

    isTableFinished() {
        return this._progress.isTableFinished();
    }

    nextTable() {
        this._progress = this._tablesProgressCheckers[this._tablesDone];
        this._tablesDone += 1;
    }
}

class SchulteSquareModel {
    constructor({ number, numberColor }) {
        this.number = number;
        this.numberColor = numberColor;
        this.wasChosen = false;
    }
}

class SchulteSquarePresenter {
    constructor({
        window,
        sideSize,
        squareNumber,
        squareNumberColor,
        position,
    }) {
        this._model = new SchulteSquareModel({
            number: squareNumber,
            numberColor: squareNumberColor,
        });

        this._view = new SchulteSquareView({
            window,
            sideSize,
            squareNumber,
            squareNumberColor,
            position,
        });
    }

    setNumber(number, color) {
        this._view.setNumber(number, color);
        this._model.number = number;
        this._model.numberColor = color;
    }

    getInfo() {
        const squareInfo = {
            number: this._model.number,
            color: this._model.numberColor,
            wasChosen: this._model.wasChosen,
        };
        return squareInfo;
    }

    contains(mouse) {
        return this._view.contains(mouse);
    }

    showCorrectness(isCorrectChoice) {
        if (isCorrectChoice) {
            this._model.wasChosen = true;
        }
        this._view.showCorrectness(isCorrectChoice);
    }

    setAutoDraw(toShow) {
        this._view.setAutoDraw(toShow);
    }
}

class SchulteSquareView {
    constructor({
        window,
        sideSize,
        squareNumber,
        position,
        squareNumberColor,
    }) {
        this._originalBackgroundSquareColor = "#FFFFFF";
        this._square = this._create_square({
            window,
            sideSize,
            position,
            number: squareNumber,
        });
        this._number = this._create_number({
            window,
            sideSize,
            position,
            number: squareNumber,
            color: squareNumberColor,
        });
    }

    _create_square({ window, sideSize, position, number }) {
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

    _create_number({ window, sideSize, position, number, color }) {
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

    setNumber(number, color) {
        this._number.text = number;
        this._number.color = new util.Color(color);
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
            this._originalBackgroundSquareColor
        );
    }

    showCorrectness(isCorrectChoice) {
        if (isCorrectChoice) {
            let lightGreen = "#90FF90";
            this._startChange(lightGreen, 100);
        } else {
            let lightRed = "#FF9090";
            this._startChange(lightRed, 300);
        }
    }

    setAutoDraw(toShow) {
        this._square.setAutoDraw(toShow);
        this._number.setAutoDraw(toShow);
    }
}

class SquaresGenerator {
    constructor({
        window,
        screenSizeAdapter,
        sideSize,
        squaresNumber,
        numberColor,
    }) {
        this.squaresNumber = squaresNumber;
        this._window = window;
        this._sideSize = screenSizeAdapter.rescaleElementLength(sideSize);
        this._numberColors = numberColor;
        this._squaresInRow = Math.pow(this.squaresNumber, 0.5);
        this._squares = [];
    }

    _generatePositionsIndex() {
        const squaresInRow = this._squaresInRow;
        return Array.from(Array(squaresInRow).keys()).map(
            (value) => value - Math.floor(squaresInRow / 2)
        );
    }

    _generateNumbersOrder(quantity, numberColor) {
        const numbersInfo = Array.from(Array(quantity).keys()).map((value) => [
            value + 1,
            numberColor,
        ]);
        return numbersInfo;
    }

    _generateRandomizedNumbersOrderIterator() {
        let numbersOrder;
        if (this._numberColors.length === 1) {
            const squaresQuantity = Math.pow(this._squaresInRow, 2);
            const color = this._numberColors[0];
            numbersOrder = this._generateNumbersOrder(squaresQuantity, color);
        } else if (this._numberColors.length === 2) {
            const [color1, color2] = this._numberColors;
            const color1NumbersOrder = this._generateNumbersOrder(25, color1);
            const color2NumbersOrder = this._generateNumbersOrder(24, color2);
            numbersOrder = color1NumbersOrder.concat(color2NumbersOrder);
        } else {
            throw new Error(
                `Implemented only SchulteTable with 1 or 2 colors.
                Was asked to generate ${this._numberColors.length}`
            );
        }
        const randomizedNumbersOrder = util.shuffle(numbersOrder);
        const numbersIterator = randomizedNumbersOrder[Symbol.iterator]();
        return numbersIterator;
    }

    _generateRow(x, positionsIndex, numbers) {
        for (let yIndex of positionsIndex) {
            let [number, color] = numbers.next().value;
            let y = yIndex * this._sideSize;
            let square = new SchulteSquarePresenter({
                window: this._window,
                sideSize: this._sideSize,
                squareNumber: number,
                squareNumberColor: color,
                position: [x, y],
            });
            this._squares.push(square);
        }
    }

    _generateSquares(positionsIndex) {
        const randomizedNumbersOrder =
            this._generateRandomizedNumbersOrderIterator();
        for (let xIndex of positionsIndex) {
            let x = xIndex * this._sideSize;
            this._generateRow(x, positionsIndex, randomizedNumbersOrder);
        }
    }

    generateSquares() {
        const positionsIndex = this._generatePositionsIndex();
        this._generateSquares(positionsIndex);
    }

    updateSquaresForNextTrial() {
        const randomzedNumbersOrder =
            this._generateRandomizedNumbersOrderIterator();
        for (let square of this._squares) {
            let [number, color] = randomzedNumbersOrder.next().value;
            square.setNumber(number, color);
        }
    }

    getSquares() {
        return this._squares.slice();
    }
}

class SchulteTablePresenter extends TaskPresenter {
    constructor({
        window,
        screenSizeAdapter,
        startTime,
        sideSize,
        squaresNumber,
        squareNumberColor,
        nTables,
    }) {
        const instructions =
            SchulteTableInstructionGenerator(squareNumberColor);
        const view = new SchulteTableView({
            window,
            screenSizeAdapter,
            startTime,
            sideSize,
            squaresNumber,
            squareNumberColor,
        });

        super({
            name: `${squareNumberColor}SchulteTable`,
            instructionsText: instructions,
            view: view,
        });

        const qtySquares = {};
        if (squareNumberColor.length === 1) {
            qtySquares.blackSquares = squaresNumber;
        } else {
            qtySquares.blackSquares = 25;
            qtySquares.redSquares = 24;
        }

        this._progress = new SchulteProgress({
            type: squareNumberColor,
            squaresNumber: qtySquares,
        });

        this._currentTableCount = 0;
        this._nTables = nTables;
    }

    getTaskConditions() {
        return;
    }

    nextStimulus() {
        this._currentTableCount += 1;
        const tableCountInfo = [this._currentTableCount, this._nTables];
        this._view.setTable(tableCountInfo);
        this._progress.nextTable();
        this._trialFinished = false;
    }

    _isCorrectChoice(squareInfo) {
        const { number: answerNumber, color: answerColor } = squareInfo;
        return this._progress.isCorrectAnswer({
            answerNumber,
            answerColor,
        });
    }

    _getClickedSquare(mouse) {
        for (let square of this._view.getSquares()) {
            if (mouse.isPressedIn(square)) {
                return square;
            }
        }
        return null;
    }

    _formatSquareInfo(squareInfo) {
        const { number, color } = squareInfo;
        return `${number} ${color}`;
    }

    _getSquaresInfoToSave(
        isCorrectAnswer,
        clickedSquareInfo,
        nextCorrectSquareInfo
    ) {
        const squaresInfo = [];
        const chosenSquareInfo = this._formatSquareInfo(clickedSquareInfo);
        squaresInfo.push(chosenSquareInfo);

        if (isCorrectAnswer) {
            squaresInfo.push(chosenSquareInfo);
        } else {
            const correctSquareInfo = this._formatSquareInfo(
                nextCorrectSquareInfo
            );
            squaresInfo.push(correctSquareInfo);
        }

        return squaresInfo;
    }

    checkInput(userInputProcessor) {
        const inputData = userInputProcessor.getData();
        const mouse = inputData.mouse;
        const clickedSquare = this._getClickedSquare(mouse);

        if (clickedSquare === null) {
            return;
        }
        userInputProcessor.clearInput();

        const clickedSquareInfo = clickedSquare.getInfo();
        const isCorrectAnswer = this._isCorrectChoice(clickedSquareInfo);
        clickedSquare.showCorrectness(isCorrectAnswer);

        const nextCorrectSquareInfo = this._progress.whatIsNextRightChoice();
        const [chosenSquareInfo, correctSquareInfo] =
            this._getSquaresInfoToSave(
                isCorrectAnswer,
                clickedSquareInfo,
                nextCorrectSquareInfo
            );

        this._trialFinished = this._progress.isTableFinished();
        let attemptData = {
            task: this.name,
            part: `Table ${this._currentTableCount}`,
            chosenSquare: chosenSquareInfo,
            correctSquare: correctSquareInfo,
            isCorrect: isCorrectAnswer ? 1 : 0,
            solved: this._trialFinished ? 1 : 0,
        };

        attemptData = Object.assign(attemptData, inputData);
        this._solutionAttemptsKeeper.saveAttempt(attemptData);
    }

    isToSkipInstruction() {
        return false;
    }

    isTrialFinished() {
        return this._trialFinished;
    }

    isTaskFinished() {
        return this._currentTableCount === this._nTables;
    }
}

class SchulteTableView extends TaskView {
    constructor({
        window,
        screenSizeAdapter,
        startTime,
        sideSize,
        squaresNumber,
        squareNumberColor,
    }) {
        super({ startTime });
        this._squaresGenerator = new SquaresGenerator({
            window,
            screenSizeAdapter,
            sideSize,
            squaresNumber,
            numberColor: squareNumberColor,
        });

        this._squaresGenerator.generateSquares();
        this._squares = this._squaresGenerator.getSquares();

        this._tableCounter = new visual.TextStim({
            win: window,
            text: "",
            color: "black",
            height: screenSizeAdapter.rescaleTextSize(0.05),
            pos: screenSizeAdapter.rescalePosition([0, 0.425]),
            autoDraw: false,
            bold: true,
            wrapWidth: screenSizeAdapter.rescaleWrapWidth(0.8),
        });
    }

    _setCount(tableCountInfo) {
        const [tableCount, nTables] = tableCountInfo;
        this._tableCounter.text = `Таблица ${tableCount} из ${nTables}`;
    }

    getSquares() {
        return this._squares.slice();
    }

    setTable(tableCountInfo) {
        this._squaresGenerator.updateSquaresForNextTrial();
        this._squares = this._squaresGenerator.getSquares();
        this._setCount(tableCountInfo);
    }

    setAutoDraw(toShow) {
        this._squares.forEach((square) => square.setAutoDraw(toShow));
        this._tableCounter.setAutoDraw(toShow);
    }
}

export { SchulteTablePresenter as SchulteTable };
