import * as visual from "../lib/visual-2021.1.4.js";
import * as util from "../lib/util-2021.1.4.js";

import { TaskPresenter, TaskView, Instruction } from "./general.js";

const firstInstruction = `
Участие в олимпиадах требует определенного развития способностей и характера. 
Уровень их развития можно условно изобразить горизонтальной линией, где левая 
часть означает самое низкое развитие, а правая – наивысшее. Мы бы хотели узнать, 
насколько развиты предложенные характеристики у тебя. Используя курсор, отметь, 
как ты оцениваешь развитие характеристики у себя В ДАННЫЙ МОМЕНТ ВРЕМЕНИ. 
Если ты готов начать, нажми СТРЕЛКУ ВПРАВО`;

const secondInstruction = `
Может быть мы забыли какие-то качества, которые важны для решения математических задач? 
Если это так, то после нажатия СТРЕЛКИ ВПРАВО, укажи название характеристики (вверху), 
её низкий уровень развития (слева) и высокий уровень развития (справа). Пожалуйста, 
нажми СТРЕЛКУ ВПРАВО, если инструкция понятна, и ты готов начать выполнять задание`;

const thirdInstruction = `
Оцени развитие своих способностей по тем качествам, которые ты только что указал. 
Используя курсор, отметь, как ты оцениваешь развитие характеристики у себя в 
данный момент времени. Помни, что левая часть означает самое низкое развитие, а 
правая – наивысшее. 
Если ты готов начать, нажми СТРЕЛКУ ВПРАВО`;

const fourthInstruction = `
Теперь оцени, какой уровень развития тебе необходим, если ты хочешь победить на математической 
олимпиаде. Используя курсор, отметь, необходимый уровень развития. Помни, что левая часть 
означает самое низкое развитие, а правая – наивысшее. 
Если ты готов начать, нажми СТРЕЛКУ ВПРАВО`;

const instructions = [
    firstInstruction,
    secondInstruction,
    thirdInstruction,
    fourthInstruction,
].map((instruction) => new Instruction(instruction));

class SingleScale {
    constructor({ scaleDescrition, leftEnd, rightEnd }) {
        this._scaleDescrition = scaleDescrition;
        this._leftEnd = leftEnd;
        this._rightEnd = rightEnd;
    }
}

const prebuildScales = [
    new SingleScale({
        scaleDescrition: "Во время подготовки к олимпиаде я:",
        leftEnd: "действую по указанию других",
        rightEnd: "самостоятельно",
    }),
    new SingleScale({
        scaleDescrition: "Когда я решаю задачи, я:",
        leftEnd: "рассеянный",
        rightEnd: "сосредоточенный",
    }),
    new SingleScale({
        scaleDescrition: "Обычно мое решение:",
        leftEnd: "шаблонное",
        rightEnd: "креативное",
    }),
    new SingleScale({
        scaleDescrition: "Мои знания о математике:",
        leftEnd: "поверхностные",
        rightEnd: "глубокие",
    }),
    new SingleScale({
        scaleDescrition: "В момент решения задачи я:",
        leftEnd: "неуверенный",
        rightEnd: "уверенный",
    }),
    new SingleScale({
        scaleDescrition: "Во время участия в олимпиаде я:",
        leftEnd: "встревоженный",
        rightEnd: "спокойный",
    }),
];

class DemboRubinsteinPresenter extends TaskPresenter {
    constructor({ window }) {
        const view = new DemboRubinsteinView({ window });
        super({
            name: "DemboRubinstein",
            instructionsText: instructions,
            view: view,
        });
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

    checkInput(inputProcessor) {
        throw new Error(
            `Method 'checkInput(inputProcessor)' must be implemented in ${this.name} class.`
        );
    }

    isTrialFinished(userInputProcessor) {
        throw new Error(
            `Method 'isTrialFinished(userInputProcessor)' must be implemented in ${this.name} class.`
        );
    }

    isTaskFinished() {
        throw new Error(
            `Method 'isTaskFinished()' must be implemented in ${this.name} class.`
        );
    }
}

class DemboRubinsteinView extends TaskView {
    constructor({ window }) {
        super({});
        this.dummy = new visual.TextStim({
            win: window,
            color: new util.Color("black"),
            height: 100,
            text: 'Здесь должны были быть задания Дембо-Рубинштейн, но они пока не готовы.\nНажмите "q", чтобы посмотреть что из задач готово',
            wrapWidth: window.size[0] * 0.8,
        });
    }

    stop() {
        this.dummy.setAutoDraw(false);
    }

    draw() {
        this.dummy.draw();
    }
}

export { DemboRubinsteinPresenter as DemboRubinstein };
