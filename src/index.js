/* global process */
/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "StringHelpers|FadeInText" }]*/ //allow StringHelpers to be iported (defined) and not being explicitly called
																			// without triggering eslint error
import { StringHelpers, FadeInText } from '@Utils'; // string helpers is an IIFE
import HIA from './hia.js';
import './css/styles.scss';
import './css/modal-styles.scss';


const selector = '#pew-app';
const App = new HIA(selector, { // extends PCTApp-js. PCTApp-js's constructor method is called, p1 contaiuner, p2 options
	needsRouter: false
});
console.log(process.env.PUBLICPATH);
if ( process.env.NODE_ENV === 'development' || window.IS_PRERENDERING ){ // process development means using WebPack dev server. window is prerendering means in
	
    App.prerender();
} else {
    App.init();
}