import s from './styles.scss';
import Element from '@UI/element';

 export default class Bar extends Element {
    
    prerender(){
        var div = super.prerender();
        if ( this.prerendered && !this.rerender) {
            return div;
        }
        div.classList.add(s.barContainer);
        console.log(this);

        //label
        var label = document.createElement('p');
        label.classList.add(s.label, 'js-bar-label');
        label.textContent = this.data.d.key;
        this.parent.labels.push(label);

        //innerWrapper
        var innerWrapper = document.createElement('div');
        innerWrapper.classList.add(s.innerWrapper);


            //bar 
        var bar = document.createElement('div');
        bar.classList.add(s.bar)
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
    linearScale(){
        var max = Math.max(...this.model.nestBy[this.data.primary].map(d => d.values.length));
        var scale = this.data.d.values.length / max;
        return scale;
    }
    update(){
       /*
        window.requestAnimationFrame(() => {
            this.el.style.transform = `translateX(${this.parent.name === 'FiftyStateView' ? this.placeZero(this.data.field) * 100 + '%' : 0}) scaleX(${this.linearScale(this.data.d, this.data.field)})`;
        });       */
    }


}