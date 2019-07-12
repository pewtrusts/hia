/* global process PUBLICPATH */
//utils
import Papa from 'papaparse';
import * as d3 from 'd3-collection';
import _ from 'lodash';
import { stateModule as S } from 'stateful-dead';
import PS from 'pubsub-setter';

//import { publishWindowResize } from '@Utils';

//data 
import fields from './data/metadata.json';
import stateAbbreviations from './data/state-abbreviations.json';
import abbreviations from './data/abbreviations.json';

//views
import MenuView from './views/menu-view/';
import SectionView from './views/section-view/';
import DetailsView from './views/details-view/';
import MaskView from './views/mask-view/';
//import FiftyStateView from './views/fifty-state/';

// app prototype
import PCTApp from '@App';

//static content
//import sections from './partials/sections.html';
//import footer from './partials/footer.html';

//publishWindowResize(S);

// some of the data has multiple values in a field. some of these need to be separated out so they can be
// visualized separately. identify those fields here

const yearBuckets = [2020,2017,2013,2009];

const model = {
    fields,
    stateAbbreviations,
    abbreviations,
    nestBy: {}
};
function addIDs(data){
    data.forEach(function(d,i){
        d.id = i;
    });
}
function cleanHeaderRow(match){
    var headers = match.split(',');
    return headers.map(function(each){
        return each.replace('/Geographic Scope', '').replace('/', ' or ').replace('HIA ', '').replace('-', ' ').doCamelCase();
    }).join(',');
}

function getRuntimeData() {
    return new Promise((resolveWrapper, rejectWrapper) => {
        Papa.parse('https://www.pewtrusts.org/api/hipmapapi/getdownload?resourceTypes=HIA%20reports&sortBy=relevance&sortOrder=asc&loadAllPages=true&pageId={d9dc47f1-2c76-444a-b4e3-b60d29bb3237}', {
            beforeFirstChunk: function(chunk){
                var newChunk = chunk.replace(/.*/, function(match){
                    return cleanHeaderRow(match);
                });
                return newChunk;
            },
            complete: function(results){
                addIDs(results.data);
                resolveWrapper(results.data);
            },
            download: true,
            error: function(error, file){
                rejectWrapper({error,file});
            },
            header: true,
            skipEmptyLines: true,
            transform: function(value, headerName){
                let match = model.fields.find(s => s.key === headerName);
                if ( match && match.splitToArray ){
                    value = value.replace(/([a-z]),([A-Z])/g, '$1|$2');
                    return value.split('|');
                }
                return value;
            }
        });
    });
}

function addDateBuckets(data){
    
    data.forEach(d => {
        if ( isNaN(parseInt(d.publicationDate)) ) {
            let str = d.publicationDate.toLowerCase();
            d.dateBucket = [str.charAt(0).toUpperCase() + str.slice(1)];
        } else {
            yearBuckets.forEach((threshold, i) => {
                if ( parseInt(d.publicationDate) < threshold ){
                    d.dateBucket = i === yearBuckets.length - 1 ? ['Prior to ' + threshold] : [`${yearBuckets[i + 1]}–${yearBuckets[i] - 1}`];
                }
            });
        }
    });
    return data;
}

export default class HIA extends PCTApp {
    prerender() {
        getRuntimeData.call(this).then((v) => {
            model.data = addDateBuckets(v);
            /* set data-hash attribute on container on prerender. later on init the hash will be compared against the data fetched at runtime to see
               if it is the same or not. if note the same, views will have to be rerendered. */
            this.model = model;
            this.el.setAttribute('data-data-hash', JSON.stringify(v).hashCode()); // hashCode is helper function from utils, imported and IIFE'd in index.js
            this.nestData();
            this.pushViews();
            console.log(model);
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
        var publicPath = '';
        if ( process.env.NODE_ENV === 'production' ){ // production build needs to know the public path of assets
                                                                                 // for dev and preview, assets are a child of root; for build they
                                                                                 // are in some distant path on sitecore
            publicPath = PUBLICPATH;
        }
        this.worker = new Worker(publicPath + 'worker.js');
        this.views.length = 0;
        
        super.init();
        this.bodyEventListenerBind = this.bodyEventListenerHandler.bind(this);
        PS.setSubs([
            ['selectPrimaryGroup', this.bodyEventListenerBind],
           // ['selectHIA', this.bodyEventListenerBind]
        ]);
        getRuntimeData.call(this).then((v) => {
            model.data = addDateBuckets(v);
            this.model = model;
            if ( this.el.dataset.dataHash != JSON.stringify(v).hashCode() ){
                this.el.setAttribute('data-data-mismatch', true);
                this.model.isMismatched = true;
            }
            this.nestData();

            this.pushViews();
            this.views.forEach(view => {
               
               view.init(this);
            });
        });
        
    }
    pushViews(){
        this.views.push(
            this.createComponent(MenuView, 'div#menu-view'),
            this.createComponent(SectionView, 'div#section-view'),
            this.createComponent(DetailsView, 'div#details-view'),
            this.createComponent(MaskView, 'div#mask-view')
        );
    }
    nestData(){
        var fieldsThatNeedToBeArrays =  this.model.fields.filter(s => s.splitToArray === true).map(each => each.key);
        var otherFieldsToBeVisualized = this.model.fields.filter(s => s.splitToArray !== true).map(each => each.key);
        function nestData(field, entries){
            return d3.nest().key(d => d[field]).entries(entries).sort((a,b) => { // this sort function is sorting primary dimensions only
                let match = this.model.fields.find(f => f.key === field);
                if ( match.order ){
                    return  a.key === '' ? 1 : b.key === '' ? -1 : match.order.indexOf(a.key) - match.order.indexOf(b.key);
                } else {
                   return a.key === '' ? 1 : b.key === '' ? -1 : a.values.length >= b.values.length ? -1 : 1;
                }
            });
        }
        
        otherFieldsToBeVisualized.forEach(field => {
            this.model.nestBy[field] = nestData.call(this, field, this.model.data);
        });
        fieldsThatNeedToBeArrays.forEach(field => {
            var array = [];
            this.model.data.forEach(d => {
                d[field].forEach(value => {
                    var _d = _.cloneDeep(d);
                    _d[field] = value;
                    array.push(_d);
                });
            });
            this.model.nestBy[field] = nestData.call(this, field, array);
        });
    }
    cleanKey(key) {
        
        if ( key === undefined ){
            return 'null';
        }
        key = typeof key === 'string' ? key : key[0];
        if ( key === '' ){
            return 'none';
        }
        key = key.toLowerCase().replace(/['"”’“‘,.!?;()&:/]/g, '').doCamelCase();
        
        return key;
    }
    bodyEventListenerHandler(msg,data){
        var handler = this.bodyClickClear;
            if ( data !== null ){
                document.body.addEventListener('click', handler);
            } else {
                document.body.removeEventListener('click', handler);
            }
    }
    bodyClickClear(){
        if ( !document.body.UIControlIsOpen && !S.getState('showAllDetails') ){
            
            S.setState('selectPrimaryGroup', null);
        }
    }
}