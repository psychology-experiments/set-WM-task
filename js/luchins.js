import { util, visual } from "../lib/psychojs-2021.2.2.js";

class LuchinsView {
    constructor({ window }) {
        this.dummy = new visual.TextStim({
            win: window,
            color: new util.Color("black"),
            height: 100,
            text: 'Здесь должны были быть задания Лачинсов, но они пока не готовы.\nНажмите "q", чтобы посмотреть что из задач готово',
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

export { LuchinsView as Luchins };
