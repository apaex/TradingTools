var offfy = ( function ( o, f ){
o = o || {};
o.fun = function(){
if( !!f && !!f.data ){
for (var i = 0; i < f.data.length; i++) {
o.tool.object.get( "offfy."+f.data[i][0], function( request ){ console.log('offfy: unknown method') } )( f.data[i][1] );
delete( f.data[i] );
}
}
};
o.ver = o.ver || {
product : 1,
build : 57
};
o.params = o.params || {
lang : 'ru',
http : false,
token : '',
domain : ''
};
o.user = o.user || {};
o.var = o.var || {};
o.local = o.local || { script : {} };
o.init = o.init || function(request){
for (let key in request.params) {
offfy.params[key] = request.params[key];
}
offfy.user = request.user;
if( !offfy.user.uid ){
var uid = offfy.tool.cookie.get("offfyUserId");
var uid_parts = (uid || "").split('-');
if( !uid || ( (uid_parts[0]||"").length != 13 ) ){
uid = offfy.tool.generateUid();
offfy.var.newUid = true;
}
offfy.user.uid = uid;
}
let ss = JSON.parse( sessionStorage.getItem("offfy") || null );
if( !!ss && !!ss.ver && ss.ver.product == offfy.ver.product && ss.ver.build == offfy.ver.build ){
offfy.hint.event.observer.window = ss;
}
var element = document.createElement("link");
element.setAttribute("rel", "stylesheet");
element.setAttribute("type", "text/css");
element.setAttribute("href", "https://hint.offfy.com/domain/"+offfy.params.domain+"/hint.css?46");
document.getElementsByTagName("head")[0].appendChild(element);
return offfy;
};
o.$ = function (selector) {
return new offfy.$.prototype.init(selector);
};
o.$.prototype.init = function (selector) {
var array = [];
if (array.__proto__) {
array.__proto__ = offfy.$.prototype;
} else {
for (var param in offfy.$.prototype) {
array[param] = offfy.$.prototype[param];
};
};
if (typeof selector === 'string') {
var Elements = document.querySelectorAll(selector);
} else if (selector.nodeType) {
array[0] = selector;
return array;
} else if ( Object.prototype.toString.call(selector) === '[object Array]' && selector[0].nodeType) {
for (let i = 0; i < selector.length; i++) {
array[i] = selector[i];
}
return array;
} else if ({}.toString.call(selector) === '[object NodeList]') {
offfy.$.merge(array, selector);
return array;
}
return offfy.$.merge(array, Elements);
};
o.$.merge = function (first, second) {
var len = !!second ? +second.length : 0,
j = 0,
i = first.length;
for (; j < len; j++) {
first[i++] = second[j];
}
first.length = i;
return first;
};
o.$.prototype.html = function ( html ) {
for (let i = 0; i < this.length; i++) {
offfy.tool.html(this[i],html);
}
return this;
};
o.$.prototype.style = function( request ) {
for (let i = 0; i < this.length; i++) {
for( let name in request ){
this[i].style[ name ] = request[name];
}
}
return this;
};
o.$.prototype.addClass = function (classes) {
let elements = this;
for (let i = 0; i < elements.length; i++) {
classes.split(" ").forEach(function(value, index) {
elements[i].classList.add(value);
});
}
return elements;
};
o.$.prototype.removeClass = function (classes) {
let elements = this;
for (let i = 0; i < elements.length; i++) {
classes.split(" ").forEach(function(value, index) {
elements[i].classList.remove(value);
});
}
return elements;
};
o.$.prototype.toggleClass = function (classes) {
let elements = this;
for (let i = 0; i < elements.length; i++) {
classes.split(" ").forEach(function(value, index) {
elements[i].classList.toggle(value);
});
}
return elements;
};
o.$.prototype.prevAll = function (classes) {
let elements = this;
let result = [];
let elem = elements[0].previousElementSibling;
while (elem) {
result.push(elem);
elem = elem.previousElementSibling;
}
return result;
};
o.$.prototype.nextAll = function (classes) {
let elements = this;
let result = [];
let elem = elements[0].nextElementSibling;
while (elem) {
result.push(elem);
elem = elem.nextElementSibling;
}
return result;
};
o.$.prototype.transition = function( request ){
for( let i = 0; i < this.length; i++ ){
let elem = this[i];
elem.offfy = elem.offfy || {};
for( let name in request.property ){
elem.style[name] = request.property[name];
}
elem.style.transitionProperty = Object.keys(request.property).join(",");
if(!!request.duration){
elem.style.transitionDuration = ( typeof(request.duration) == 'function' ? request.duration( elem, i ) : request.duration )+"ms";
}
if(!!request.delay){
elem.style.transitionDelay = ( typeof(request.delay) == 'function' ? request.delay( elem, i ) : request.delay )+'ms';
}
if(!!request.ease){
elem.style.transitionTimingFunction = ( typeof(request.ease) == 'function' ? request.ease( elem, i ) : request.ease );
}
if(!!request.end){ 
elem.offfy.transitionend = function(event){ 
elem.removeEventListener('transitionend', elem.offfy.transitionend );
request.end( event, elem );
}
elem.addEventListener('transitionend', elem.offfy.transitionend );
}
}
return this;
}
o.tool = o.tool || {};
o.tool.object_to_form_data = function(obj, prefix) {
var str = [],
p;
for (p in obj) {
if (obj.hasOwnProperty(p)) {
var k = prefix ? prefix + "[" + p + "]" : p,
v = obj[p];
if ((v !== null && typeof(v) === "object" && Object.keys(v).length > 0) || typeof(v) != "object") {
str.push((v !== null && typeof(v) === "object") ? o.tool.object_to_form_data(v, k) : encodeURIComponent(k) + "=" + encodeURIComponent(v) );
}
}
}
return str.join("&");
};
o.tool.object = {
get: function (path, value_default, obj) {
let props = path.split(".");
obj = obj || window;
for (let i = 0; i < props.length - 1; i++) {
if (typeof (obj[props[i]]) == "undefined") {
return undefined;
}
obj = obj[props[i]];
}
return obj[props[props.length - 1]] || value_default;
},
set: function (path, value) {
let props = path.split(".");
let obj = window;
for (let i = 0; i < props.length - 1; i++) {
if (typeof (obj[props[i]]) == "undefined") {
obj[props[i]] = {};
}
obj = obj[props[i]];
}
obj[props[props.length - 1]] = value;
}
};
o.tool.generateUid = function(){
function a4() {
return ("0000"+offfy.ver.product+offfy.ver.build).substr(-4);
}
function b4() {
return ( 65536 + (window.screen.width || 1000) + (window.screen.height || 1000) + ( document.documentElement.clientHeight || 1000) + (document.documentElement.clientWidth || 1000) + Math.abs( ( new Date().getTimezoneOffset() || 1000 )) ).toString(16).substr(-4);
}
function c4(e) {
for (var t = "", i = 0; i < e; i++)
t += (65536 * (1 + Math.random()) | 0).toString(16).substring(1);
return t
}
function d4(){
var cryptoObj = window.crypto || window.msCrypto;
return Math.floor((1 + (cryptoObj.getRandomValues(new Uint32Array(1))[0] / 0x100000000)) * 0x10000).toString(16).substring(1);
}
var ms = Date.now();
return [ms, "-", a4(), "-", b4(), c4(1), d4()].join("");
};
o.tool.date = function(){
var date = new Date();
return date.getFullYear()+''+('0'+(date.getMonth()+1)).substr(-2)+''+('0'+date.getDate()).substr(-2)+' '+('0'+date.getHours()).substr(-2)+':'+('0'+date.getMinutes()).substr(-2)+':'+('0'+date.getSeconds()).substr(-2)+''+date.getTimezoneOffset();
};
o.tool.cookie = {
get : function(e) {
for (var t = e + "=", i = document.cookie.split(";"), r = 0; r < i.length; r++) {
for (var a = i[r]; " " == a.charAt(0); )
a = a.substring(1);
if (0 == a.indexOf(t))
return a.substring(t.length, a.length);
}
return "";
},
set: function(e, t, i) {
var r = new Date;
r.setTime(r.getTime() + i * 24 * 60 * 60 * 1000);
var site = window.location.hostname.split('.');
var a = "domain="+(site[ site.length-2 ]+"."+site[ site.length-1 ])+";expires=" + r.toUTCString();
document.cookie = e + "=" + t + ";" + a + ";path=/";
}
};
o.tool.device_size = function(){
if(window.innerWidth < 768){
return 'xs';
} else if(window.innerWidth < 992) {
return 'sm';
} else if(window.innerWidth < 1200) {
return 'md';
} else {
return 'lg';
}
};
o.tool.browser = function(){
var sBrowser, sUsrAg = navigator.userAgent;
if (sUsrAg.indexOf("Firefox") > -1) {
sBrowser = "MF"; } else if (sUsrAg.indexOf("SamsungBrowser") > -1) {
sBrowser = "SI"; } else if (sUsrAg.indexOf("Opera") > -1 || sUsrAg.indexOf("OPR") > -1) {
sBrowser = "Op"; } else if (sUsrAg.indexOf("Trident") > -1) {
sBrowser = "ME"; } else if (sUsrAg.indexOf("Edge") > -1) {
sBrowser = "ME"; } else if (sUsrAg.indexOf("Chrome") > -1) {
sBrowser = "GC"; } else if (sUsrAg.indexOf("Safari") > -1) {
sBrowser = "AS"; } else {
sBrowser = "u"; }
return sBrowser;
};
o.tool.os = function(){
var userAgent = window.navigator.userAgent,
platform = window.navigator.platform,
macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
iosPlatforms = ['iPhone', 'iPad', 'iPod'],
os = 'unknown';
if (macosPlatforms.indexOf(platform) !== -1) {
os = 'macos';
} else if (iosPlatforms.indexOf(platform) !== -1) {
os = 'ios';
} else if (windowsPlatforms.indexOf(platform) !== -1) {
os = 'windows';
} else if (/Android/.test(userAgent)) {
os = 'android';
} else if (!os && /Linux/.test(platform)) {
os = 'linux';
}
return os;
};
o.tool.timezone_offset = function(){
let offset = new Date().getTimezoneOffset();
let o = Math.abs(offset);
return (offset < 0 ? "+" : "-") + ("00" + Math.floor(o / 60)).slice(-2) + ":" + ("00" + (o % 60)).slice(-2);
};
o.tool.utm = function(){
let utms = {};
let filter = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'int_source', 'int_medium', 'int_campaign', 'int_content', 'from'];
let params = window.location.search.substring(1).split("&");
for (let i = 0; i < params.length; i++) {
let param = params[i].split("=");
if( filter.indexOf( param[0] ) != -1 ){
utms[ param[0] ] = typeof( param[1] ) == "undefined" ? "" : param[1];
}
}
return utms;
};
o.tool.isVisible = function( elem ){
let w = {};
let e = {};
let a = {};
w.l = 0;
w.t = 0;
w.w = document.documentElement.clientWidth;
w.h = document.documentElement.clientHeight;
let coords = elem.getBoundingClientRect();
e.l = coords['left'];
e.t = coords['top'];
e.w = coords['width'];
e.h = coords['height'];
a.h = ( Math.min( w.h, e.t + e.h ) - Math.max( w.t, e.t ) );
a.h = a.h < 0 ? 0 : ( a.h >= w.h ? 1 : ( a.h / Math.min(w.h, e.h) ) );
a.w = ( Math.min( w.w, e.l + e.w ) - Math.max( w.l, e.l ) );
a.w = a.w < 0 ? 0 : ( a.w >= w.w ? 1 : ( a.w / Math.min(w.w, e.w) ) );
let area = Math.round(100*( ( Math.min( a.h*e.h , w.h ) * Math.min( a.w*e.w , w.w ) ) / ( w.h*w.w ) ));
return { visible : ( (a.h*a.w) > 0.9 || ( a.h*w.h > 150 && a.w*w.w > 300 ) ) };
};
o.tool.behavior = function( event ){
offfy.hint.event.observer.window.behavior = ( function ( b, e ){ 
if( !e ){
b.life = Math.round(( Date.now() - b.started )/1000);
b.show += Math.round( offfy.hint.event.observer.time.timer.active / 1000 );
}else{
if( e.type == 'scroll' ){
b.scroll += Math.round( 100 * Math.abs( ( offfy.hint.event.observer.temp.pageYOffset - window.pageYOffset ) / window.innerHeight ) );
offfy.hint.event.observer.temp.pageYOffset = window.pageYOffset;
}
if( e.type == 'pointermove' ){
b.pointermove += Math.round( 100*( Math.abs(e.movementX/window.innerWidth) + Math.abs(e.movementY/window.innerHeight) ) );
}
if( e.type == 'keydown' ){
b.keydown += 1;
}
if( e.type == 'pointerdown' ){
b.pointerdown += 1;
}
}
return b;
}( offfy.hint.event.observer.window.behavior, event ));
};
o.tool.context = {
rich : function( request ){
request = request || {};
request.ver = offfy.ver;
request.user = offfy.user;
request.domain = offfy.params.domain;
request.date = offfy.tool.date();
request.url = location.href;
let referrer = ( document.referrer.indexOf( location.hostname.split('.').slice(-2).join('.') ) >= 0 ? "" : document.referrer.split('?')[0] );
if(!!referrer){
request.referrer = referrer;
}
request.utm = offfy.tool.utm();
let date = new Date();
request.device = {
width : ( parseInt( window.screen.width ) == window.screen.width ? window.screen.width : 0 ),
height : ( parseInt( window.screen.height ) == window.screen.height ? window.screen.height : 0 ),
size: offfy.tool.device_size(),
browser : offfy.tool.browser(),
os : offfy.tool.os(),
timezone : { offset : offfy.tool.timezone_offset() },
ts : date.getTime(),
tzo : date.getTimezoneOffset()
};
let items = location.search.substr(1).split("&");
for (let index = 0; index < items.length; index++) {
let tmp = items[index].split("=");
if (tmp[0] === 'utm_offfy_source'){
request.inspired = {type:decodeURIComponent(tmp[1]).split('.')[0], 'id':decodeURIComponent(tmp[1]).split('.')[1]};
}
}
let offfyAccount = offfy.tool.cookie.get('offfyAccount');
if( !!offfyAccount ){
request.offfyAccount = offfyAccount;
}
return request;
}
};
o.tool.html = function( elem, html, append = false ){
offfy.local.script = offfy.local.script || {};
if(!append) elem.innerHTML = '';
elem.insertAdjacentHTML('beforeend', html);
for( let script of elem.querySelectorAll('script') ){ 
if( !script.dataset.active ){
const id = script.dataset.id;
let n = document.createElement('script');
if( script.hasAttribute('src') ) n.src = script.src;
if( script.hasAttribute('charset') ) n.charset = script.charset;
if( !!script.innerHTML ) n.innerHTML = script.innerHTML;
n.setAttribute('data-active', '1');
if( !!id ){
offfy.local.script[ id ] = true;
n.setAttribute('data-id', id);
}
script.replaceWith( n );
}
}
for( let p in offfy.local.script )
if( !document.querySelector(`[data-id="${p}"]`) ){
window[p] = null;
delete offfy.local.script[p];
}
};
o.plugin = function (request, success_cb) {
request.context = offfy.tool.context.rich();
let xhr = new XMLHttpRequest();
xhr.open('POST', 'https://hint.offfy.com/external/plugin/');
xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
xhr.responseType = 'json';
if(request.content == 'json'){
request.params = JSON.stringify(request.params);
}
xhr.send( o.tool.object_to_form_data(request) );
if( !!success_cb ){ xhr.onload = function() { success_cb(xhr.response); } }
};
o.hint = {
ver : {
product : 4,
build : 2
},
event : {
observer : {
events : [],
memory : { distributors : {}, element : {} },
window : {
ver : o.ver,
behavior : { 
started : Date.now(),
life : 0,
show : 0,
scroll : 0,
pointerdown : 0, 
pointermove : 0, 
keydown : 0
}
}, 
temp : {
pageYOffset : window.pageYOffset
},
fire : true,
time : { timer : { current: 5000, max : 5000, interval : 1000, active : 1000 } },
start : function(request){
let observe = function(){
if( offfy.hint.event.observer.fire ){
offfy.hint.event.observer.time.timer.active = offfy.hint.event.observer.time.timer.interval;
offfy.tool.behavior();
offfy.hint.event.observer.collect();
offfy.hint.event.observer.time.timer.active = 0;
}
offfy.hint.event.observer.fire = false;
offfy.hint.event.observer.time.timer.current += offfy.hint.event.observer.time.timer.interval;
if( offfy.hint.event.observer.urgent || ( ( offfy.hint.event.observer.events.length > 0 || offfy.hint.event.observer.memory.distributors.length > 0) && offfy.hint.event.observer.time.timer.current >= offfy.hint.event.observer.time.timer.max ) ){
offfy.hint.event.batch({ events : offfy.hint.event.observer.events });
offfy.hint.event.observer.events = [];
offfy.hint.event.observer.time.timer.current = 0;
offfy.hint.event.observer.urgent = false;
}
}
let listen = ['scroll', 'pointerdown', 'pointermove', 'keydown'];
for (let i = 0; i < listen.length; i++) {
window.addEventListener(listen[i], function(e) {
offfy.tool.behavior(e);
offfy.hint.event.observer.fire = true;
if( offfy.hint.event.observer.urgent ){
observe();
}
});
}
offfy.hint.event.observer.timer = setInterval(observe, offfy.hint.event.observer.time.timer.interval);
},
collect : function(){
let elems = document.querySelectorAll("[data-offfy-distributor]");
offfy.hint.event.observer.memory.distributors = {};
for (let i = 0; i < elems.length; i++) {
let elem = elems[i];
let request = {name : "show", my : { s : 0 }, object : { id : elem.getAttribute('data-offfy-distributor'), init : elem.getAttribute('data-offfy-distributor-init') } };
request.my.s = offfy.hint.event.observer.time.timer.active/1000 + parseInt( ( elem.getAttribute( 'data-offfy-distributor-show' ) || "0" ) );
elem.setAttribute( 'data-offfy-distributor-show', request.my.s );
let id = elem.getAttribute( 'data-offfy-distributor' );
offfy.hint.event.observer.memory.distributors[ id ] = request;
}
elems = document.querySelectorAll("[data-offfy-observer]");
for (let i = 0; i < elems.length; i++) {
let elem = elems[i];
let space = offfy.tool.isVisible( elem );
if ( space.visible ) {
let request = JSON.parse( elem.getAttribute( 'data-offfy-observer' ) );
if (typeof(request.context) == "undefined") {request.context = {};}
if (typeof(request.my) == "undefined") {request.my = {};}
let portrait = elem.getAttribute( 'data-offfy-portrait' );
if( portrait ){
request.portrait = portrait;
}
request.context.url = location.href;
request.name = "show";
request.my.s = offfy.hint.event.observer.time.timer.active/1000;
if( request.my.s > 0 ){
offfy.hint.event.observer.events.push( request );
}
}
}
}
},
one : function(request, success_cb){
offfy.hint.event.observer.events.push( request );
offfy.hint.event.batch({ events : offfy.hint.event.observer.events }, success_cb);
offfy.hint.event.observer.events = [];
},
batch : function(request, then_cb){
request.context = offfy.tool.context.rich(request.context);
request.memory = offfy.hint.event.observer.memory;
request.window = offfy.hint.event.observer.window;
let xhr = new XMLHttpRequest();
xhr.open('POST', 'https://hint.offfy.com/org/event/');
xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
xhr.withCredentials = true;
xhr.responseType = 'json';
xhr.send(o.tool.object_to_form_data(request));
xhr.onload = function() {
if( !!offfy.var.newUid ){
if( !!xhr.response && !!xhr.response.uid ){
offfy.user.uid = xhr.response.uid;
}
offfy.var.newUid = false;
offfy.tool.cookie.set("offfyUserId", offfy.user.uid, 3650);
}
if (typeof(then_cb) == "function") {
then_cb(xhr.response);
}
if( !!xhr.response && !!xhr.response.element && typeof(xhr.response.element) == 'object' ){
offfy.hint.element.add( xhr.response );
}
if( !!xhr.response && !!xhr.response.distributors && typeof(xhr.response.distributors) == 'object' ){
let distributors = xhr.response.distributors;
for( let key in distributors ){
let distributor = distributors[key];
let elems = document.querySelectorAll('offfy[data-offfy-distributor="'+distributor.id+'"]');
if( elems.length == 0 && distributor.container.mode == "create" ){
let node = document.querySelector( distributor.container.selector );
if( !!node ){
node.insertAdjacentHTML( distributor.container.where, '<offfy data-offfy-distributor="'+distributor.id+'">'+distributor.html+'</offfy>' );
}
elems = document.querySelectorAll('offfy[data-offfy-distributor="'+distributor.id+'"]');
}
for (let i = 0; i < elems.length; i++) {
if( !!distributor.status && distributor.status == 'remove' ){
elems[i].remove();
}else{
o.tool.html( elems[i], distributor.html );
if( !elems[i].getAttribute('data-offfy-distributor-init') ){
elems[i].setAttribute('data-offfy-distributor-init', 1)
}
}
}
}
}
}
sessionStorage.setItem("offfy", JSON.stringify( offfy.hint.event.observer.window ) );
}
},
element : {
list : {},
listener : {
init : function(){
offfy.hint.element.listener.mutationObserver = new MutationObserver(function(mutations) {
let addedCount = 0;
mutations.forEach(function(mutation) {
if( mutation.addedNodes.length > 0 ){
addedCount++;
}
});
!!addedCount && offfy.hint.element.markup();
});
offfy.hint.element.listener.mutationObserver.observe(document.documentElement, {
characterData: false,
childList: true,
subtree: true,
characterDataOldValue: false
});
}
},
add : function( request ){
if( !Object.keys( offfy.hint.element.list ).length ){
offfy.hint.element.listener.init();
}
for( let id in request.element ){
let selectors = [];
for (let i = 0; i < request.element[id].property.selector.length; i++) {
selectors.push( request.element[id].property.selector[i] + ":not([data-offfy-element])" );
}
request.element[id]['selectors-not'] = selectors.join(",");
offfy.hint.element.list[ id ] = request.element[id];
}
offfy.hint.event.observer.memory.element = Object.keys(offfy.hint.element.list);
offfy.hint.element.markup();
},
markup : function(){
for( let id in offfy.hint.element.list ){
let element = offfy.hint.element.list[id];
let elems = document.querySelectorAll( element['selectors-not'] );
for (let i = 0; i < elems.length; i++) {
elems[i].setAttribute('data-offfy-element', id );
for (let j = 0; j < element.property.listener.length; j++) {
elems[i].addEventListener(element.property.listener[j], function(event){
let v;
if(!!element.property.send.get){
v = { 'event' : event, 'value' : element.property.send.value };
for (let k = 0; k < element.property.send.get.length; k++) {
let g = element.property.send.get[k];
v = !!g['arg'] ? v[g['name']](...g['arg']) : offfy.tool.object.get( g['name'], null, v );
}
}else{
v = element.property.send.value;
}
let event_data = {
type : element.property.send.type || '',
name : v,
object : { ontology : 'element', id : id }
};
if( !!event.target.closest('[data-offfy-observer]') ){
let observer = JSON.parse( event.target.closest('[data-offfy-observer]').getAttribute('data-offfy-observer') );
if( !!observer && !!observer.object && !!observer.object.instance ){
event_data.object.instance = observer.object.instance;
}
}
if(!!v) offfy.hint.event.one(event_data);
});
}
}
}
},
set : function( request ){
}
},
url : {
open : function(request){
window.open(request['url'], '_blank');
},
products : function(request, success_cb, error_cb){
let xhr = new XMLHttpRequest();
xhr.open('GET', 'https://hint.offfy.com/external/url2products/');
xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
xhr.responseType = 'json';
xhr.send(o.tool.object_to_form_data({
domain:offfy.params.domain,
url:request.url
}));
xhr.onload = function() {
success_cb(xhr.response);
}
}
},
storage : {
set: function(request, success_cb, error_cb){
let data2send = {
record : [],
context : offfy.tool.context.rich()
};
if (typeof(request['key']) != "undefined") {
data2send.record.push(request);
} else {
data2send.record = request;
}
let xhr = new XMLHttpRequest();
xhr.open('POST', 'https://hint.offfy.com/external/storage_set/');
xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
xhr.responseType = 'json';
xhr.send(o.tool.object_to_form_data(data2send));
xhr.onload = function() {
if(!!success_cb){
success_cb(xhr.response);
}
}
},
get: function(request, success_cb, error_cb){
request.context = offfy.tool.context.rich();
let xhr = new XMLHttpRequest();
xhr.open('POST', 'https://hint.offfy.com/external/storage_get/');
xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
xhr.responseType = 'json';
xhr.send(o.tool.object_to_form_data(request));
xhr.onload = function() {
if(!!success_cb){
success_cb(xhr.response);
}
}
}
}
};
o.game = {
elem : null,
init : function( request ){
},
html : function( name, html ){
let elem = offfy.game.elem.querySelector('[data-name='+name+']');
if(!!elem){ o.tool.html( elem, html ); }
return offfy.game;
},
show : function( name ){
var o = $( offfy.game.elem ).find('[data-name='+name+']');
var animation = typeof( o.data('animation') ) != 'undefined' && typeof( o.data('animation').show ) != 'undefined' ? o.data('animation') : {"show":{"type":"show", "duration":0} };
offfy.game.animate( o, 'show', animation );
return offfy.game;
},
hide : function( name ){
var o = $( offfy.game.elem ).find('[data-name='+name+']');
var animation = typeof( o.data('animation') ) != 'undefined' && typeof( o.data('animation').hide ) != 'undefined' ? o.data('animation') : {"hide":{"type":"hide", "duration":0} };
offfy.game.animate( o, 'hide', animation );
return offfy.game;
},
toggle : function( name ){
var o = $( offfy.game.elem ).find('[data-name='+name+']');
if(o.is(":visible")){
this.hide( name );
}else{
this.show( name );
}
return this;
},
addClass : function( name, classes ){
let elems = offfy.game.elem.querySelectorAll('[data-name='+name+']');
if(!!elems){
Array.prototype.forEach.call(elems, function(el, i){
el.classList.add.apply( el.classList, classes.split(' '));
});
}
return this;
},
removeClass : function( name, classes ){
let elems = offfy.game.elem.querySelectorAll('[data-name='+name+']');
if(!!elems){
Array.prototype.forEach.call(elems, function(el, i){
el.classList.remove.apply( el.classList, classes.split(' '));
});
}
return this;
},
toggleClass : function( name, classes ){
$( offfy.game.elem ).find('[data-name='+name+']').toggleClass(classes);
return this;
},
animate : function( object, action, request ){
el = this;
var types_2arg = new Array('show', 'hide', 'fadeIn', 'fadeOut', 'slideUp', 'slideDown');
start_inside = function(){
$('#'+el.id).find('[data-animation]').each(function(i, k){
var animation = $(k).data('animation'),
name = object.data('name');
for( key in animation ){
if( ( typeof(animation[key]['on']) == 'string' && name+"."+action == animation[key]['on'] ) || ( typeof(animation[key]['on']) == 'object' && animation[key]['on'].indexOf( name+"."+action ) != -1 ) ){
el.animate( $(k), key, animation );
}
}
});
}
var delay = request[action].delay || 0;
if( types_2arg.indexOf( request[action].type ) != -1 ){
object.delay( delay )[ request[action].type ]( request[action].duration, start_inside );
}
if( request[action].type == 'fadeTo' ){
object.delay( delay )[ request[action].type ]( request[action].duration, request[action].opacity, start_inside );
}
if( request[action].type == 'moveLeft' ){
object.delay( delay ).animate( {"margin-left" : -600}, request[action].duration, request[action].opacity, start_inside );
}
}
};
return o;
}( window['offfy'], window['offfyfun'] ));
( function ( finam_object_old, finfin ){
if(!!window.finfin && !!finfin.ui ){
finfin.ui.form.united = {
open: function(request){
let container = null;
if (!request.container){
document.getElementById('finfin-ui-popup').classList.remove('hide');
container = document.getElementById('finfin-ui-popup-content');
} else {
container = typeOf(request.container) == 'string' ? document.querySelector(request.container) : request.container;
}
container.classList.add('finfin-loading');
finfin.plugin(
{
"plugin": "constructor",
"method": "item",
"template": "form/united",
"response": "mixTeleport",
"params": request
},
function(response){
container.classList.remove('finfin-loading');
$(container).html(response.html);
}
)
}
}
}
if(!!window.finfin && !!finfin.ui && !!finfin.ui.form && !!finfin.ui.form.lead){
finfin.ui.form.lead.open = function (request) {
$("#finfin-ui-popup").removeClass("hide");
finfin.ui.tool.waiting({ container: "#finfin-ui-popup-content" });
if (false && !!request.express && !!finfin.user.id) {
finfin.plugin(
{
site: request.site,
plugin: "constructor",
method: "item",
response: "data",
params: {
id: request.id
}
},
function (response) {
let form = JSON.parse(response.data.source).forms[request.formName];
$.ajax({
url: (request.site ?? '') + '/api/constructor/' + request.id + '/' + request.formName + '/lead/',
type: 'POST',
success: function () {
$('#finfin-ui-popup-content').html(form.success.message);
let callback = new Function(form.success.code);
callback();
}
});
}
);
}
else {
let params = {}
// TODO: Избавиться от вызова через name и убрать этот if
if (!!request.page) {
params = {
root: request.page.root,
name: request.page.name,
//key: $(request.elem).closest("[data-constructorPage]").attr("data-constructorpagekey"),
teleport: {
site: request.site,
container: "#finfin-ui-popup-content",
id: request.id,
info: (request.info != null ? request.info : null),
root: request.page.root,
name: request.page.name,
close: "true",
title: "true",
class: (typeof (request.class) != "undefined" ? request.class : "")
}
};
}
else {
params = {
id: request.id,
teleport: {
site: request.site,
formName: request.formName,
info: (request.info != null ? request.info : null),
close: (!!request.close ? request.close : "true"),
title: (!!request.title ? request.title : "false"),
class: (!!request.class ? request.class : ""),
container: "#finfin-ui-popup-content"
}
};
}
if (!!request.page && !!request.page.agency) {
params.agency = request.page.agency;
}
finfin.plugin({
site: request.site,
plugin: "constructor",
method: "item",
template: "form",
response: "mixTeleport",
params: params
});
}
return false;
}
}
let params = {
user : {
params : {}
},
params : {
domain : "finam",
token : "w453n434nm598",
firebase : {"config":{"apiKey":"AIzaSyD6HFiZ2fI95s8O0gGP6Tei8jHT_tdhcrk","authDomain":"lipka-test-finam-ru.firebaseapp.com","projectId":"lipka-test-finam-ru","storageBucket":"lipka-test-finam-ru.appspot.com","messagingSenderId":"306457203106","appId":"1:306457203106:web:dd7b95827df8d9b5f922fb"},"vapidKey":"BHHpq2bwqR1uoFpiiou2JxlufQDkcXEQOLeXSfKU0yhJZXkR9EpUrxmeXsuiMpA01tEQYYWNUSUdRWJptSXIJcs"} }
};
if( !!finam_object_old && !!finam_object_old.currentUserInfo ){
let user_old = finam_object_old.currentUserInfo;
params.user.auth = {
id : user_old.id,
isclient : (user_old.client ? 1 : 0),
agent : (user_old.agent ? 1 : 0)
};
}
if( !!finfin && !!finfin.user && !!finfin.user.id ){
params.user.auth = {
id : finfin.user.id,
isclient : (finfin.user.client ? 1 : 0),
agent : (finfin.user.agent ? 1 : 0)
};
}
let segmentsUserId = offfy.tool.cookie.get("segmentsUserId");
if( segmentsUserId ){
params.user.params.segmentsUserId = segmentsUserId;
}
if( !!window.wtUserMetrics ){
wtUserMetrics(function(userMetrics){
userMetrics.getBuid().then(function(buid){
offfy.user.params.wtbuid = buid;
params.user.params.wtbuid = buid;
});
});
}
if( !!window['ga'] && !!window['ga'].getAll){
params.user.params.gaclientid = ga.getAll()[0].get('clientId');
}
!!window['ym'] && ym(10279138,'getClientID', function(clientID) { params.user.params.ymclientid = clientID; });
let edoxhash = offfy.tool.cookie.get("edoxhash");
if( typeof(params.user.auth) != 'undefined' && typeof(edoxhash) != 'undefined' ){
params.user.auth.edoxhash = edoxhash;
}
const blocks = offfy.tool.cookie.get("blocks");
if( !!blocks ){
params.user.cookie = {blocks:blocks};
}
offfy.init(params);
!offfy.tool.cookie.get("offfyuid") || offfy.tool.cookie.set("offfyuid", "-", -365);
!offfy.tool.cookie.get("offfy_uid") || offfy.tool.cookie.set("offfy_uid", "-", -365);
!offfy.tool.cookie.get("offfyid") || offfy.tool.cookie.set("offfyid", "-", -365);
let path = location.pathname.split("/");
if( [ 'quote', 'landings' ].indexOf( path[1] ) ){
let observer = { "object" : { "ontology" : "page" } };
let container = null;
if( path[1] == 'quote' && document.querySelector('[data-offfy-observer]') == null ){
container = document.querySelector('.finam-store-page');
let offfy_local_quote_raddar_scan = function(){
if( typeof( raddar_recommend_id ) != 'undefined' ){
observer.object.instance = {
name : "quote-"+raddar_recommend_id,
properties : { plugin : "quote", id : raddar_recommend_id },
portrait : { quote : [ raddar_recommend_id ] }
};
container.setAttribute( 'data-offfy-observer', JSON.stringify( observer ) );
}else{
setTimeout( offfy_local_quote_raddar_scan, 2000);
}
};
offfy_local_quote_raddar_scan();
}
if( path[1] == 'landings' ){
let og_image = document.querySelector('meta[property="og:image"]');
if( !!og_image && !!og_image.getAttribute('content') ){
let og_image_name = og_image.getAttribute('content').split('/')[5];
if( !!og_image_name && og_image_name.substring(0, 7) == 'landing' ){
let og_image_code = parseInt(og_image_name.substring(7));
observer.object.instance = {
properties : { plugin : "constructor", id : og_image_code }
};
}
}
}
if( container == null ){
container = document.querySelector('body');
}
container.setAttribute( 'data-offfy-observer', JSON.stringify( observer ) );
}
offfy.fun();
offfy.hint.event.observer.urgent = true;
offfy.hint.event.observer.collect();
offfy.hint.event.observer.start();
}( window["Finam"], window["finfin"] ));
offfy.local.publication = {
item : function(request){
if(!!request.type && request.type == 'solo'){
offfy.local.publication.item_solo(request);
}else{
offfy.local.publication.item_other(request);
}
},
item_solo : function(request){
},
item_other : function(request){
$( request.container ).append("<div data-name='wrapper'></div>");
let observer_str = document.querySelector(request.container).getAttribute('data-offfy-observer');
if( !!observer_str ){
let observer = JSON.parse(observer_str);
if( !!observer.object && !!observer.object.instance && !!observer.object.instance.portrait && !!observer.object.instance.portrait.section && observer.object.instance.portrait.section.indexOf('16') != -1 ){
$( document.querySelector( request.container+' > div:nth-last-of-type(2)') ).before("<offfy><div style='min-height: 70px; max-width: 420px; padding-bottom: 30px;' data-name='analytic-poll'></div></offfy>");
$( document.querySelector( request.container+' > div:nth-last-of-type(1)') ).before("<offfy><div style='min-height: 100px;' data-name='analytic-agent'></div></offfy>");
offfy.plugin(
{
plugin: 'brick',
method: 'item',
params: {
id : '62f6503c9c0cee6cc203cd72'
}
},
function (response) {
$( request.container + ' div[data-name="analytic-poll"]' ).html( response.html );
}
);
offfy.plugin(
{
plugin: 'agent',
method: 'item',
template:'agent',
params: {
id : '3c0ce7eaa31630720106dc40',
format : 'block'
}
},
function (response) {
$( request.container + ' div[data-name="analytic-agent"]' ).html( response.html );
}
);
}else{
}
}
offfy.plugin(
{
plugin: 'selection',
method: 'make',
params: {
selection: {
"module": "process",
"name": "waterfall",
"use": {
},
"list": [
{ 
module: 'indicator', 
name: 'agent', 
filter : {
ontology : 'agent',
format : 'block',
},
set : 'record'
},
{
"name": "shuffle", "module": "array"
},
{
"get": "record",
"set": "record",
"name": "slice",
"length": "1",
"module": "array",
"offset": "0"
},
{ 
'module': 'indicator', 
'name': 'agent_render', 
"get": "record",
'template': 'agent', 
'pack': [
{ 'format': 'block', 'source' : 'finamru_publication_bottom', 'count': 1 }
] 
}
]
}
}
},
function (response) {
$( request.container + '>div[data-name="wrapper"]' ).html(response.pack[0].html);
}
);
let right_col = document.getElementById('infinity-ui-right-content');
if( !!right_col && !document.getElementById('infinity-ui-right-content-offfy') ){
$( right_col ).append("<offfy><div id='infinity-ui-right-content-offfy' style='min-height: 80vh; position: sticky; top: 49px;'></div></offfy>");
}
if( !!right_col ){
offfy.plugin(
{
plugin: 'selection',
method: 'make',
params: {
selection: {
"module": "process",
"name": "waterfall",
"use": {
/*"summary.product": true*/
},
"list": [
{ 
module: 'indicator', 
name: 'agent', 
filter : {
ontology : 'agent',
format : 'highrise',
},
set : 'record'
},
{ "module": 'array', 'name': 'shuffle' },
{ "module": "array", "name": "slice", "offset": 0, "length" : 1 },
{ 
'module': 'indicator', 
'name': 'agent_render', 
"get": "record",
'template': 'agent', 
'pack': [
{ 'format': 'highrise', 'source' : 'finamru_col_right', 'count': 1 }
] 
}
]
}
}
},
function (response) {
$( '#infinity-ui-right-content-offfy' ).html(response.pack[0].html);
}
);
}
},
list : function(request){
}
}
