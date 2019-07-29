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
        this.dropdownData = this.setDropdownData(initialPrimary);
        this.name = 'WaffleView';
        //async. dropdown will be appended to  renderToSleector node
        //only after `this` (waffle view) is read. this is handled in
        // the createComponent method and Element 
        this.dropdown = this.createComponent(ThisDropdown, 'div#dropdown', {
            renderToSelector: '.js-dropdown-inner',
            data: {
                label: 'Select secondary dimension',
                data: this.dropdownData.data,
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



        //dropdown and legend container
        var topContainer = document.createElement('div');
        topContainer.classList.add(s.topContainer);
        topContainer.id = 'top-container';


        //dropdown container
        topContainer.appendChild(this.returnDropdownWrapper(initialPrimary));


        //waffle container
        var waffleContainer = document.createElement('div');
        waffleContainer.classList.add(s.waffleContainer);
        waffleContainer.classList.add('js-waffle-container');

        //legend container
        var legendContainer = document.createElement('div');
        legendContainer.classList.add('js-legend-container', s.legendContainer);
        topContainer.appendChild(legendContainer);

         //showLegendButton 
        var btn = document.createElement('button');
        btn.textContent = 'Show legend';
        btn.classList.add('js-show-legend-button', s.showLegendButton);
        legendContainer.appendChild(btn);



        view.appendChild(topContainer);

        view.appendChild(waffleContainer);
       

        return view;
    }
    returnDropdownWrapper(){
         //note
        var legendNote = document.createElement('p');
        legendNote.classList.add(s.legendNote, 'js-legend-note');
        legendNote.innerHTML = '<strong>Note:</strong> HIAs may be included in multiple dimension categories. For example, an HIA could be included in two sectors or organization types. Select a category from the legend to see all HIAs that belong.'
        
        

        var dropdownWrapper = document.createElement('div');
        dropdownWrapper.classList.add(s.dropdownWrapper, s.hide, 'js-dropdown-wrapper');
        var dropdownInner = document.createElement('div'),
            dropdownOuter = document.createElement('div'),
            dropdownLabel = document.createElement('label');

        this.children[0].el.querySelector('.js-input-div').id = `label-dropdown-${this.dropdownData.type}-value`;
        this.children[0].el.setAttribute('aria-labelledby', `label-dropdown-${this.dropdownData.type} label-dropdown-${this.dropdownData.type}-value`);
        /* TO DO */
        this.children[0].el.querySelector('ul').setAttribute('aria-controls', 'TODODODODO');
        dropdownOuter.classList.add(s.dropdownOuter);
        dropdownLabel.innerText = this.dropdownData.label;
        dropdownLabel.setAttribute('id', 'label-dropdown-' + this.dropdownData.type);
        dropdownInner.classList.add('js-dropdown-inner', s.dropdownInner);
        //dropdownInner.appendChild(dropdown.el);
        dropdownOuter.appendChild(dropdownLabel);
        dropdownOuter.appendChild(dropdownInner);
        dropdownWrapper.appendChild(dropdownOuter);
        dropdownWrapper.appendChild(legendNote);

        return dropdownWrapper;
    }
    setDropdownData(primaryDimension) {
        return {
            label: "Secondary dimension:",
            data: this.model.fields.find(f => f.key === primaryDimension).secondaryDimensions.map((d, i) => {
                var match = this.model.fields.find(f_ => f_.key === d);
                return {
                    field: match.key,
                    label: match.heading,
                    isDefaultSelection: i === 0 ? true : false
                }
            }),
            type: 'selectSecondaryDimension'
        };
    }
    init() {
        this.showLegendButton = document.querySelector('.js-show-legend-button');

        PS.setSubs([
            ['view', this.update.bind(this)],
            ['legendIsMobile', this.toggleShowLegendButton.bind(this)]
        ]);

        this.showLegendButton.addEventListener('click', function(){
            this.isActive = !this.isActive;
            if ( this.isActive ) {
                this.classList.add(s.isActive);
            } else {
                this.classList.remove(s.isActive);
            }
            document.getElementById('top-container').classList.toggle('is-on-top');
            this.textContent = this.isActive ? 'Hide legend' : 'Show legend';
        });
        /* to do*/

        //subscribe to secondary dimension , drilldown, details
    }
    toggleShowLegendButton(msg,data){
        if ( data ){
            this.showLegendButton.classList.add(s.isVisible);
        } else {
            this.showLegendButton.classList.remove(s.isVisible);

        }
    }
    update(msg,data){

        //dropdown
        this.dropdownData = this.setDropdownData(data);
        document.querySelector('.' + s.dropdownWrapper).innerHTML = this.returnDropdownWrapper(data).innerHTML;
        this.dropdown = this.createComponent(ThisDropdown, 'div#dropdown', {
            renderToSelector: '.js-dropdown-inner',
            data: {
                label: 'Select secondary dimension',
                data: this.dropdownData.data,
                type: 'selectSecondaryDimension'
            }
        });
        this.dropdown.init();
    }
    
}