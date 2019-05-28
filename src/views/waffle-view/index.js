import Element from '@UI/element';
import s from './styles.scss';
import ThisDropdown from '@Project/components/dropdown';
import Waffle from '@Project/components/waffle';
import Legend from '@Project/components/legend';
import PS from 'pubsub-setter';
//import { stateModule as S } from 'stateful-dead';
//import { GTMPush } from '@Utils';

const initialPrimary = 'stateOrTerritory';

export default class WaffleView extends Element {

    prerender() {
        //container
        var view = super.prerender();
        var dropdownData = {
            label: "Secondary dimension:",
            data: this.model.fields.find(f => f.key === initialPrimary).secondaryDimensions.map((d,i) => {
                var match = this.model.fields.find(f_ => f_.key === d);
                return {
                    field: match.key,
                    label: match.heading,
                    isDefaultSelection: i === 0 ? true : false
                }
            }),
            type: 'selectSecondaryDimension'
        };
        this.name = 'WaffleView';
        //async. dropdown will be appended to  renderToSleector node
        //only after `this` (waffle view) is read. this is handled in
        // the createComponent method and Element 
        this.dropdown = this.createComponent(ThisDropdown, 'div#dropdown', {
                renderToSelector: '.js-dropdown-inner',
                data: {
                    label: 'Select secondary dimension',
                    data: dropdownData.data,
                    type: 'selectSecondaryDimension'
                }
            });
        this.addChildren([
            this.dropdown,
            this.createComponent(Waffle, 'div#waffle', {
                renderToSelector: '.js-waffle-container',
                data: {
                    primary: initialPrimary,
                }
            }),
            this.createComponent(Legend, 'div#legend', {
                renderToSelector: '.js-legend-container',
                data: {
                    primary: initialPrimary,
                }
            })
        ]);
        if (this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        view.classList.add(s.waffleView);
        

        // heading
        var instruct = this.model.fields.find(d => d.key === initialPrimary).instruct;
        var heading = document.createElement('h2');
        heading.textContent = instruct;
        heading.classList.add(s.instructHeading, 'js-instruct-heading');
        view.appendChild(heading);

        //dropdown container
        var dropdownWrapper = document.createElement('div');
        dropdownWrapper.classList.add(s.dropdownWrapper, s.hide);
        var dropdownInner = document.createElement('div'),
            dropdownOuter = document.createElement('div'),
            dropdownLabel = document.createElement('label');
            
        this.children[0].el.querySelector('.js-input-div').id = `label-dropdown-${dropdownData.type}-value`;
        this.children[0].el.setAttribute('aria-labelledby', `label-dropdown-${dropdownData.type} label-dropdown-${dropdownData.type}-value`);
/* TO DO */  this.children[0].el.querySelector('ul').setAttribute('aria-controls', 'TODODODODO' );
        dropdownOuter.classList.add(s.dropdownOuter);
        dropdownLabel.innerText = dropdownData.label;
        dropdownLabel.setAttribute('id', 'label-dropdown-' + dropdownData.type);
        dropdownInner.classList.add('js-dropdown-inner', s.dropdownInner);
        //dropdownInner.appendChild(dropdown.el);
        dropdownOuter.appendChild(dropdownLabel);
        dropdownOuter.appendChild(dropdownInner);
        dropdownWrapper.appendChild(dropdownOuter);
        view.appendChild(dropdownWrapper);


        //waffle container
        var waffleContainer = document.createElement('div');
        waffleContainer.classList.add('js-waffle-container');

        //legend container
        var legendContainer = document.createElement('div');
        legendContainer.classList.add('js-legend-container');
        waffleContainer.appendChild(legendContainer);

        view.appendChild(waffleContainer);

        return view;
    }
    init() {
        console.log('init waffle-view');
        PS.setSubs([
            ['selectPrimaryGroup', this.toggleHeading.bind(this)],
            ['selectPrimaryGroup', this.toggleDropdown.bind(this)],
            ['selectPrimaryGroup', this.scrollIfNecessary.bind(this)]
        ]);
        /* to do*/

        //subscribe to secondary dimension , drilldown, details
    }
    scrollIfNecessary(msg){
        var split = msg.split('.');
        if ( split.length > 1 && split[1] === 'map' ){
            this.scrollPageIfNecessary();
        }
    }
    scrollPageIfNecessary(){
        var nodeShowingDetails = document.querySelector('.js-show-details');
        var rect = nodeShowingDetails.getBoundingClientRect();
        var to = rect.top - 105;
       
        if ( rect.top > window.innerHeight - 100 ){
            this.smoothScroll('#pew-app', to).then(this.scrollWaffleIfNecessary());
        } else {
            this.scrollWaffleIfNecessary();
        }
    }
    scrollWaffleIfNecessary(){
        var nodeShowingDetails = document.querySelector('.js-show-details');
        console.log(nodeShowingDetails);
        var to = nodeShowingDetails.offsetTop - document.querySelector('.js-waffle-container-inner').offsetTop;
        this.smoothScroll('.js-waffle-container-inner', to);
        
    }
    smoothScroll(selector, to, duration = 200){ // HT: https://stackoverflow.com/a/45325140
        
        Math.easeInOutQuad = function (t, b, c, d) {
            t /= d/2;
            if (t < 1) return c/2*t*t + b;
            t--;
            return -c/2 * (t*(t-2) - 1) + b;
        };
        return new Promise(resolve => {
            var element = document.querySelector(selector),
                start = element.scrollTop,
                difference = to - start,
                currentTime = 0,
                increment = 20;

            var animateScroll = function(){        
                currentTime += increment;
                var val = Math.easeInOutQuad(currentTime, start, difference, duration);
                element.scrollTop = val;
                if(currentTime < duration) {
                    setTimeout(animateScroll, increment);
                } else {
                    setTimeout(() => {
                        resolve(true);
                    }, increment);
                }
            };
            animateScroll();
        });
       

        //t = current time
        //b = start value
        //c = change in value
        //d = duration
        

    }
    toggleHeading(msg, data) {
        var heading = document.querySelector('.' + s.instructHeading);
        if (data) {
            heading.classList.add(s.hide);
        } else {
            heading.classList.remove(s.hide);
        }
    }
    toggleDropdown(msg, data) {
        var dropdown = document.querySelector('.' + s.dropdownWrapper);
        if (data) { 
            dropdown.classList.remove(s.hide);
        } else {
            dropdown.classList.add(s.hide);
        }
    }
    clickHandler() {
        /* to do */

    }
}