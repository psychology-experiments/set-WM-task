import { util, visual } from "../lib/psychojs-2021.2.2.js";

import { TaskPresenter, TaskView, Instruction } from "./general.js";

const instruction = `
Сейчас тебе будут предъявляться числа, которые нужно запомнить. 
После показа всех чисел появится одна из инструкций:
(1) «Напиши запомненные числа» - необходимо указать числа в том же порядке, 
в котором они были представлены. Например, тебе показали числа «1 2 3», 
необходимо написать их в той же последовательности: «1 2 3»
(2) «Напиши запомненные числа в обратном порядке» - необходимо указать числа 
в обратном порядке. Например, тебе показали числа «1 2 3», необходимо написать 
их последовательность наоборот: «3 2 1»`;

class DigitSpanView {
    constructor({ window }) {
        this.dummy = new visual.TextStim({
            win: window,
            color: new util.Color("black"),
            height: 100,
            text: 'Здесь должны были быть задания Digit span, но они пока не готовы.\nНажмите "q", чтобы посмотреть что из задач готово',
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

export { DigitSpanView as DigitSpan };
