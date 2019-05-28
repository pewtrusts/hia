import s from './styles.scss';
import { Dropdown } from '@UI/inputs/inputs.js';
import { stateModule as S } from 'stateful-dead';
//import { GTMPush } from '@Utils';

export default class ThisDropdown extends Dropdown {
    constructor(selector, options){
        var _data = [];
        var dropdownType = options.data.type;
        options.data.data.forEach(d => {
                _data.push({
                    value: d.field,
                    name: d.label,
                    selected: d.isDefaultSelection ? true : false
                });
        });
        options.data = _data.sort(function ascending(a, b) {
          return a.name < b.name ? -1 : a.name > b.name ? 1 : a.name >= b.name ? 0 : NaN;
        });
        super(...arguments);

        this.dropdownType = dropdownType;
    }
    prerender(){
        //container
        var dropdown = super.prerender();
        if ( this.prerendered && !this.rerender) {
            return dropdown; // if prerendered and no need to render (no data mismatch)
        }
        dropdown.classList.add(s.dropdown);
        return dropdown;
    }
    onChange(){
        S.setState(this.dropdownType, this.selectedOption.dataset.value);
    }
    init(){
        super.init();
    }
    
}