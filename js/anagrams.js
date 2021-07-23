import * as visual from '../lib/visual-2021.1.4.js';
import * as util from '../lib/util-2021.1.4.js';

class AnagramsView {
    constructor({ winnow }) {
        this.dummy = new visual.TextStim({
            win: winnow,
            color: new util.Color("black"),
            height: 100,
            text: 'Здесь должны были быть анаграммы, но они пока не готовы.\nНажмите "q", чтобы посмотреть что из задач готово',
            wrapWidth: winnow.size[0] * 0.8,
        });
    }

    draw() {
        this.dummy.draw();
    }
}

export {AnagramsView as Anagrams};