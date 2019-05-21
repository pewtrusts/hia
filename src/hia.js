/* global process */
//utils
import Papa from 'papaparse';
import * as d3 from 'd3-collection';
import _ from 'lodash';
//import { stateModule as S } from 'stateful-dead';

//import { publishWindowResize } from '@Utils';

//data 
import sections from './data/sections.json';
import stateAbbreviations from './data/state-abbreviations.json';

//views
import MenuView from './views/menu-view/';
import SectionView from './views/section-view/';
//import FiftyStateView from './views/fifty-state/';

// app prototype
import PCTApp from '@App';

//static content
//import sections from './partials/sections.html';
//import footer from './partials/footer.html';

//publishWindowResize(S);

// some of the data has multiple values in a field. some of these need to be separated out so they can be
// visualized separately. identify those fields here
const fieldsThatNeedToBeArrays = ['decisionMakingLevels','driversOfHealth','organizationTypes','sectors'];
const otherFieldsToBeVisualized = ['stateOrTerritory']
const model = {
    sections,
    stateAbbreviations,
    nestBy: {}
};

function cleanHeaderRow(match){
    var headers = match.split(',');
    return headers.map(function(each){
        return each.replace('/Geographic Scope', '').replace('/', ' or ').replace('HIA ', '').replace('-', ' ').doCamelCase();
    }).join(',');
}

function getRuntimeData() {
    return new Promise((resolveWrapper, rejectWrapper) => {
        Papa.parse('http://www.pewtrusts.org/api/hipmapapi/getdownload?resourceTypes=HIA%20reports&sortBy=relevance&sortOrder=asc&loadAllPages=true&pageId={d9dc47f1-2c76-444a-b4e3-b60d29bb3237}', {
            beforeFirstChunk: function(chunk){
                var newChunk = chunk.replace(/.*/, function(match){
                    return cleanHeaderRow(match);
                });
                return newChunk;
            },
            complete: function(results){
                resolveWrapper(results.data);
            },
            download: true,
            error: function(error, file){
                rejectWrapper({error,file});
            },
            header: true,
            skipEmptyLines: true,
            transform: function(value, headerName){
                if (fieldsThatNeedToBeArrays.indexOf(headerName) !== -1){
                    return value.split(',');
                }
                return value;
            }
        });
    });
}

export default class HIA extends PCTApp {
    prerender() {
        getRuntimeData.call(this).then((v) => { 
            model.data = v;
            /* set data-hash attribute on container on prerender. later on init the hash will be compared against the data fetched at runtime to see
               if it is the same or not. if note the same, views will have to be rerendered. */
            this.model = model;
            this.el.setAttribute('data-data-hash', JSON.stringify(v).hashCode()); // hashCode is helper function from utils, imported and IIFE'd in index.js
            this.nestData();
            this.pushViews();
            Promise.all(this.views.map(view => view.isReady)).then(() => {
                if ( process.env.NODE_ENV === 'development' ){
                    this.init();
                } else { //App.prerender is call only if env = development or window isPrerendering so here window is prerendering
                    document.dispatchEvent(new Event('all-views-ready'));
                }
            });
        });
    }
    init() {
        console.log('init App!');
        this.views.length = 0;
        console.log(this.views);
        super.init();

        getRuntimeData.call(this).then((v) => {
            model.data = v;
            this.model = model;
            if ( this.el.dataset.dataHash != JSON.stringify(v).hashCode() ){
                this.el.setAttribute('data-data-mismatch', true);
                this.model.isMismatched = true;
            }
            this.nestData();

            this.pushViews();
            this.views.forEach(view => {
               console.log('about to init:', view);
               view.init(this);
            });
        });
        console.log(model);
    }
    pushViews(){
        this.views.push(
            this.createComponent(MenuView, 'div#menu-view'),
            this.createComponent(SectionView, 'div#section-view')
        );
    }
    nestData(){
        function nestData(field, entries){
            return d3.nest().key(d => d[field]).entries(entries).sort((a,b) => a.values.length >= b.values.length ? -1 : 1);
        }
        console.log(this.model.data);
        otherFieldsToBeVisualized.forEach(field => {
            this.model.nestBy[field] = nestData(field, this.model.data);
        });
        fieldsThatNeedToBeArrays.forEach(field => {
            var array = [];
            this.model.data.forEach(d => {
                console.log(d);
                d[field].forEach(value => {
                    var _d = _.cloneDeep(d);
                    _d[field] = value;
                    array.push(_d);
                });
            });
            this.model.nestBy[field] = nestData(field, array);
        });
    }
    cleanKey(key) {
        console.log(key);
        if ( key === undefined ){
            return 'null';
        }
        key = typeof key === 'string' ? key : key[0];
        if ( key === '' ){
            return 'none';
        }
        key = key.toLowerCase().replace('-','').doCamelCase();
        console.log(key);
        return key;
    }
}