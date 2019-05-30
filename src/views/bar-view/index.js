import Element from '@UI/element';
import s from './styles.scss';
import Bar from '@Project/components/bar';
import { Axis } from '@Project/components/bar';
//import { stateModule as S } from 'stateful-dead';
//import { GTMPush } from '@Utils';

export default class BarView extends Element {
    prerender(){
        //container
        var barView = super.prerender();
        this.bars = [];
        this.labels = [];
        this.barContainers = [];
        this.pushBars(this.data.primary);
        this.addChildren([
            ...this.bars,
            this.createComponent(Axis, `div.axis-${this.data.primary}`, {
                renderToSelector: `.js-bar-view-${this.data.primary}`,
                data: {
                    styles: s,
                    primary: this.data.primary
                }
            })
        ]);
        if ( this.prerendered && !this.rerender) {
            return barView; // if prerendered and no need to render (no data mismatch)
        }
        barView.classList.add(s.barView, `js-bar-view-${this.data.primary}`);

        //title
        barView.appendChild(this.returnTitle(this.data.primary));
        return barView;
    }
    returnTitle(primary){
        var title = document.createElement('h2');
        title.textContent = this.model.fields.find(d => d.key === primary).text;
        title.classList.add('section-title');
        return title;
    }
    pushBars(primary){
        this.model.nestBy[primary].forEach(d => {
            this.bars.push(this.createComponent(Bar, `div.bar-${this.app.cleanKey(d.key)}`, {data: {d,primary}, renderToSelector: `.js-bar-view-${primary}`, primary}))
        });
    }
    init(){
       
    }
}