import s from './styles.scss';
import Element from '@UI/element';



export default class Bar extends Element {

    prerender() {
        var div = super.prerender();
        if (this.prerendered && !this.rerender) {
            return div;
        }
        div.classList.add(s.barContainer);
        console.log(this);

        //label
        var label = document.createElement('p');
        label.classList.add(s.label, 'js-bar-label');
        var span = document.createElement('span');
        span.textContent = this.data.d.key || 'Not specified';
        label.appendChild(span);
        this.parent.labels.push(label);

        //innerWrapper
        var innerWrapper = document.createElement('div');
        innerWrapper.classList.add(s.innerWrapper, 'js-innerWrapper', 'js-innerWrapper-' + this.data.primary);
        innerWrapper.dataset.tippyContent = `<strong>${this.data.d.values.length} HIA${this.data.d.values.length > 1 ? 's' : ''}</strong><br />Click for details`;
        innerWrapper.dataset.key = this.data.d.key;


        //bar 
        var bar = document.createElement('div');
        bar.classList.add(s.bar);
        bar.style.transform = `scaleX(${this.linearScale()})`;

        //placeholder
        var placeholder = document.createElement('div');
        placeholder.classList.add(s.placeholder);

        innerWrapper.appendChild(bar);

        div.appendChild(label);
        div.appendChild(innerWrapper);
        div.appendChild(placeholder);

        return div;
    }
    linearScale() {
        var max = Math.max(...this.model.nestBy[this.data.primary].map(d => d.values.length));
        var scale = this.data.d.values.length / max;
        return scale;
    }
    init() {
       
    }
    update() {
        /*
         window.requestAnimationFrame(() => {
             this.el.style.transform = `translateX(${this.parent.name === 'FiftyStateView' ? this.placeZero(this.data.field) * 100 + '%' : 0}) scaleX(${this.linearScale(this.data.d, this.data.field)})`;
         });       */
    }


}

export class Axis extends Element {

    prerender() {

        var div = super.prerender();
        if (this.prerendered && !this.rerender) {
            return div;
        }
        div.classList.add(s.barContainer, s.axisContainer);
        console.log(this);

        //label
        var label = document.createElement('p');
        label.classList.add(s.label);

        //innerWrapper
        var innerWrapper = document.createElement('div');
        innerWrapper.classList.add(s.innerWrapper);


        //bar 
        var bar = document.createElement('div');
        bar.classList.add(s.bar, s.axisLine)

        //placeholder
        var placeholder = document.createElement('div');
        placeholder.classList.add(s.placeholder);

        //min marker 
        var minMarker = document.createElement('div');
        minMarker.classList.add(s.minMarker);
        minMarker.textContent = '0'; //min marker 

        var maxMarker = document.createElement('div');
        maxMarker.classList.add(s.maxMarker);
        maxMarker.textContent = this.returnMax();

        innerWrapper.appendChild(bar);
        innerWrapper.appendChild(minMarker);
        innerWrapper.appendChild(maxMarker);

        div.appendChild(label);
        div.appendChild(innerWrapper);
        div.appendChild(placeholder);



        return div;
    }
    returnMax() {
        var max = Math.max(...this.model.nestBy[this.data.primary].map(d => d.values.length));
        return max;
    }
    update() {
        /*
         window.requestAnimationFrame(() => {
             this.el.style.transform = `translateX(${this.parent.name === 'FiftyStateView' ? this.placeZero(this.data.field) * 100 + '%' : 0}) scaleX(${this.linearScale(this.data.d, this.data.field)})`;
         });       */
    }


}