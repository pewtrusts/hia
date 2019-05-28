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
            ['selectPrimaryGroup', this.toggleDropdown.bind(this)]
        ]);
        /* to do*/

        //subscribe to secondary dimension , drilldown, details
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