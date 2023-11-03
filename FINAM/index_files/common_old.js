// --- Common ---
// TODO: заменить все $z на jQuery.$

function $z(el) {
  return (typeof(el) == 'string' ? document.getElementById(el) : el);
}

function $_(id, container, tag) {
  if (typeof(id) != 'string') return id;
  if (!container) return document.getElementById(id); 
  var list = container.getElementsByTagName(tag ? tag.toUpperCase() : '*');
  for (var i = 0, l = list.length; i < l; i++) {
    var el = list[i];
    if (el.id == id) return el;
  }
  return null;
}

function getAbsPos(el) {
	return $(el).offset()
}

function getAbsTop(el) {
  var top = 0;
  while (el && el != document.body) {
    top += el.offsetTop;
    el = el.offsetParent;
  }
  return top;
}


function isChildOf(el, parent) {
  while (el != null) {
    if (el == parent) return true;
    el = el.parentNode;
  } 
  return false;
}


function findSubChild(element, tag, className) {
	if (typeof(tag) == 'string') {
		tag = [tag];
	}
	for (var j = 0; j < tag.length; j++) {
		var list = element.getElementsByTagName(tag[j].toUpperCase());
		if (className == null) return (list.length > 0 ? list[0] : null);
		for (var i = 0, l = list.length; i < l; i++) {
			var el = list[i];
			if (el.className == className) return el;
		}
	}
	return null;
}

function findParentNode(el, tag, className) {
  if (el == null) return null;
  if (tag) tag = tag.toUpperCase();
  while (true) {
    el = el.parentNode;
    if (el == null) return null;
    if ((!tag || tag == '*' || el.tagName == tag)
     && (className == null || el.className == className)) return el;
  }
}

function trim(s) { return s.replace(/^\s+/, '').replace(/\s+$/, '') }

var
  userAgent = navigator.userAgent,
  isKHTML = (userAgent.indexOf('KHTML') >= 0),
  isOpera = (userAgent.indexOf('Opera') >= 0),
  isIE = (!isOpera && userAgent.indexOf('MSIE') >= 0),
  isIE50 = (isIE && /MSIE 5\.0/.test(userAgent) && navigator.platform == 'Win32'),
  isMozilla = (!isKHTML && !isOpera &&  userAgent.indexOf('Gecko') >= 0);

function setupEvent(el, eventType, handler, capture) {
  if (el.attachEvent) el.attachEvent('on'+eventType, handler)
  else if (el.addEventListener) el.addEventListener(eventType, handler, capture);
}

function removeEvent(el, eventType, handler, capture) {
  if (el.detachEvent) el.detachEvent('on'+eventType, handler)
  else if (el.removeEventListener) el.removeEventListener(eventType, handler, capture);
}

function cancelEvent(event) {
  event.returnValue = false;
  if (event.preventDefault) event.preventDefault();
  event.cancelBubble = true;
  if (event.stopPropagation) event.stopPropagation();
}

function isLeftButtonEvent(event) {
	if (event.which == null) {
		return (event.button < 2);
	} else {
		return (event.which < 2);
	}
	return false;
}

var
  mouseMoveListeners = [],
  mouseAbsPosX = 0,
  mouseAbsPosY = 0;

function addMouseMoveListener(handler, object) {
  var i, o;
  for (i = 0; i < mouseMoveListeners.length; i++) {
    o = mouseMoveListeners[i];
    if (o.method == handler && o.instance == object) return false;
  }
  if (mouseMoveListeners.length == 0)
    setupEvent(document, 'mousemove', mouseMoveEventHandler);
  mouseMoveListeners.push({method: handler, instance: object});
  return true;
}

function removeMouseMoveListener(handler, object) {
  var i, o;
  for (i = 0; i < mouseMoveListeners.length; i++) {
    o = mouseMoveListeners[i];
    if (o.method == handler && o.instance == object) {
      mouseMoveListeners.splice(i, 1);
      if (mouseMoveListeners.length == 0)
        removeEvent(document, 'mousemove', mouseMoveEventHandler);
      return;
    }
  }
}

function mouseMoveEventHandler(event) {
  if (document.body == null || document.body == undefined) return;
  mouseAbsPosX = event.clientX + document.body.scrollLeft;
  mouseAbsPosY = event.clientY + document.body.scrollTop;
  var i, o;
  for (i = 0; i < mouseMoveListeners.length; i++) {
    o = mouseMoveListeners[i];
    if (o.method) o.method.call(o.instance || window, event);
  }
}


var
  activeMouseOverElement;

function mouseOverElement(event, el, func) {
  var el = $z(el);
  var target = (event.target || event.toElement);
  while (target && target != el) target = target.parentNode;
  if (target && target != activeMouseOverElement) {
    activeMouseOverElement = target;
    if (func) func(target);
  }
}

function mouseOutElement(event, el, func) {
  var el = $z(el);
  var target = (event.relatedTarget || event.toElement);
  while (target && target != el) target = target.parentNode;
  if (target != activeMouseOverElement && activeMouseOverElement != null) {
    if (func) func(activeMouseOverElement);
    activeMouseOverElement = null;
  }
}



function isNumber(prm) {
  return (typeof(prm.valueOf()) == 'number');
}

function isString(prm) {
  return (typeof(prm.valueOf()) == 'string');
}

function isFunction(prm) {
  return (typeof(prm.valueOf()) == 'function');
}

function isArray(prm) {
  return (typeof(prm.valueOf()) == 'array' || (typeof(prm) == 'object' && 'join' in prm));
}


/*
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(item, first) {
    for (var i = first || 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  }
}

Array.prototype.addItem = function(item) {
  var i = this.indexOf(item);
  if (i < 0) {
    i = this.length;
    this.push(item);
  }
  return i;
}

Array.prototype.removeItem = function(item) {
  var i = this.indexOf(item);
  if (i >= 0) this.removeItemByIndex(i);
  return i;
}

Array.prototype.removeItemByIndex = function(i) {
  if (this.splice) {
    this.splice(i, 1);
  } else {
    var l = this.length;
    for (var j = i+1; j < l; j++) this[j-1] = this[j];
    this.length = l-1;
  }
}
*/


// warnings
function warn(s) {
  alert(s);
}


// element info
function elInfo(el) {
  if (el == null) return 'null';
  if (typeof(el) == 'string') return "'"+el+"'";
  if (typeof(el) == 'number' || typeof(el) == 'boolean') return el;
  return (el.nodeName || el) + (el.id ? '#'+el.id : '') + (el.className ? '.'+el.className : '');
}


// Iterator  1.0  15.05.2008

// Iterator constructor, напрямую не вызывается
function Iterator(interval) {
  this.interval = interval;
  this.items = [];
}

// Массив итераторов
Iterator.iterators = {};

// интервал по умолчанию - 25 кадров в секунду
Iterator.defInterval = 40;


// Iterator.startIterate(obj[, interval[, method]]) - метод класса
//----------------------------------------------------------------
// Создает (при необходимости) итератор для данного интервала,
// запускает итерации метода obj.method()
//
// Вызов:
//  var iterator = Iterator.startIterate(obj[, interval[, method]])
//   obj - объект (может участвовать в нескольких итерациях)
//   interval - интервал между итерациями в миллисекундах
//   method - метод, вызываемый при итерациях,
//            если не указан, будет вызываться obj.onIterate()
// Возвращает ссылку на итератор
//
Iterator.startIterate = function(obj, interval, method) {
  if (!interval) interval = Iterator.defInterval;
  var it = Iterator.iterators[interval];
  if (!it) {
    it = Iterator.iterators[interval] = new Iterator(interval);
  }
  it.addObj(obj, method);
  return it;
}

// Iterator class
Iterator.prototype = {

// private method - добавляет пару (obj, method) в итератор
  addObj: function(obj, method) {
    if (!method) method = obj.onIterate;
    this.items.push({obj: obj, method: method});
    if (!this.intervalId) {
      var iterator = this;
      this.intervalId = setInterval(function(){iterator.iterate()}, this.interval);
    }
  },

// iterator.stopIterate(obj, reason[, method])
//----------------------------------------------------------------
// Останавливает итерации метода obj.method()
// Если method не задан, останавливает первые попавшиеся итерации для объекта obj
// reason - причина остановки, передается в метод obj.onEndIterate()
  stopIterate: function(obj, reason, method) {
    var items = this.items;
    for (var i = 0, l = items.length; i < l; i++) {
      var item = items[i];
      if (item.obj == obj && (method == null || item.method == method)) {
        this.removeObjByIdx(i, reason);
        return;
      }
    }
  },

// iterator.removeObjByIdx(idx, reason)
//----------------------------------------------------------------
// Останавливает итерации обекта с индексом idx.
// reason - причина остановки.
// Вызывает cобытие obj.onEndIterate(reason, method)
//
  removeObjByIdx: function(idx, reason) {
    var items = this.items;
    var item = items[idx];
    if (item) {
			items.splice(idx, 1);
      var obj = item.obj;
      if (obj.onEndIterate) obj.onEndIterate(reason, item.method);
    }
  },

// private method - вызывается через равыне интервалы,
// вызывает методы итерации объектов: obj.method(iterator, idx)
  iterate: function() {
    var items = this.items;
    for (var i = items.length-1; i >= 0; i--) {
      var item = items[i];
      item.method.call(item.obj, this, i);
    }
    if (items.length == 0 && this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

}



// Animator  1.0  15.05.2008

// Equation class - функции ускорения/замедления хода анимации
Equation = {
  
// линейная - равномерный ход анимации
  linear: function(t) {
    return t
  },

// квадратичная - ускорение
  quadroIn: function(t) {
    return t*t;
  },
// замедление
  quadroOut: function(t) {
    return Math.sqrt(t);
  },
// ускорение, сменяющееся замедлением
  quadroInOut: function(t) {
    if (t < 1/2)
      return 2*t*t;
    else
      return (Math.sqrt(2*t - 1) + 1)/2;
  },

// кубическая
  cubicIn: function(t) {
    return t*t*t;
  },

  cubicOut: function(t) {
    return Math.pow(t, 1/3);
  },

  cubicInOut: function(t) {
    if (t < 1/2)
      return 2*t*t;
    else
      return (Math.pow(2*t - 1, 1/3) + 1)/2;
  },

// 4-й cтепени
  quartIn: function(t) {
    return t*t*t*t;
  },

  quartOut: function(t) {
    return Math.sqrt(Math.sqrt(t));
  },

  quartInOut: function(t) {
    if (t < 1/2)
      return 8*t*t*t*t;
    else
      return (Math.sqrt(Math.sqrt(2*t - 1)) + 1)/2;
  },

// экспоненциальная
  expIn: function(t) {
    return (t <= 0 ? 0 : Math.pow(2, 10*(t - 1)));
  },

  expOut: function(t) {
    return (t >= 1 ? 1 : (-Math.pow(2, -10*t) + 1));
  },

  expInOut: function(t) {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    if (t < 1/2)
      return Math.pow(2, 10*(2*t - 1))/2;
    else
      return (2 - Math.pow(2, -10*(2*t - 1)))/2;
  },

// ещё экспонента
  expIn2: function(t) {
    var n = 3;  // 1 - оч. плавно, 5 - круто
    var v = (Math.exp(t*n)-1)/(Math.exp(n)-1);
    return v;
  },

  expOut2: function(t) {
    return (1 - Equation.expIn2(1 - t));
  },

  expInOut2: function(t) {
    if (t < 1/2)
      return Equation.expIn2(2*t)/2
    else
      return (Equation.expOut2(2*t - 1) + 1)/2;
  },

// cинусоида             
  sineIn: function(t) {
    return Math.sin((t-1)*Math.PI/2) + 1;
  },

  sineOut: function(t) {
    return Math.sin(t*Math.PI/2);
  },

  sineInOut: function(t) {
    return (Math.sin((t-1/2)*Math.PI)+1)/2;
  },

// дуга окружности
  circIn: function(t) {
    return 1 - Math.sqrt(1 - t*t);
  },

  circOut: function(t) {
    return Math.sqrt(t*(2 - t));
  },

  circInOut: function(t) {
    if (t < 1/2)
      return (1 - Math.sqrt(1 - 4*t*t))/2;
    else
      return (Math.sqrt((2*t - 1)*(3 - 2*t))+1)/2;
  }

}








// Параметры по умолчанию для анимаций
AnimationDefaults = {
    interval: 40          // интервал между итерациями (мс)
//  defTime: 500,         // либо defTime - длительность анимации (мс)
//  defSteps: 12,         // либо defSteps - количество шагов
//  equ: Equation.linear  // функция хода анимации
}

// Animation constructor - создание объекта-анимации
//----------------------------------------------------------------
// Вызов:
//  new Animation({параметр: значение, ...});
//
// Параметры:
//  obj - анимируемый элемент.
//  id - идентифицирует тип изменения, например id: 'height' - изменение высоты элемента.
//      Создание ещё одной анимации с теми же параметрами obj и id прерывает предыдущую анимацию
//  interval - интервал между итерациями в миллисекундах.
//  time - длительность анимации в миллисекундах, определяет режим работы анимации по времени.
//  steps - количество шагов анимации, определяет режим работы анимации по количеству шагов.
//      Если не задан ни time ни steps, режим определяется по AnimationDefaults.defTime или defSteps
//  styleProperty - имя cвойства стиля obj, которое надо менять.
//      Например 'left' для изменения obj.style.left
//  startValue - начальное значение свойства, например 0
//  finalValue - конечное значение свойства, например 42 (изменение от 0 до 42)
//  round - если не false, то перед присваиванием значение округляется.
//      Если true, то округление производится функцией Math.round
//      Может быть ссылкой на функцию округления, например round: Math.ceil
//  units - единицы, прибавляемые к значению, например 'px'
//  t - начальное значение параметра хода анимации из отрезка [0, 1],
//      0 - начало (по умолчанию), 1/2 - cередина, 1 - конец
//  fast - анимация не запускается, сразу вызывается функция завершения
//  onCustomIterate - cобытие, вызывающееся при каждой итерации после расчета t, equT и value,
//      но перед присвоением значения свойству. Формат вызова: obj.onCustomIterate(idx)
//      где idx - индекс данного Animation-объекта для вызова iterator.removeObjByIdx(idx, reason)
//  onEndAnimation - событие, сигнализирующее о завершении анимации.
//      Формат вызова: obj.onEndAnimation(reason)
//
// Возвращает ссылку на объект-анимацию. Сохранять ссылку необязательно,
// т.к. она автоматически добавляется в массив Animations
//
function Animation(params) {
//скопировать параметры в this
  expandObj(this, params);
  expandObj(this, AnimationDefaults);
  this.state = 'init';

//найти предыдущую анимацию и прервать её
  var prevAni = Animations.findObj(this.obj, this.id);
  if (prevAni) {
    prevAni.finalize('aborted');
  }

//добавить анимацию в массив Animations
  Animations.push(this);

//проверка на досрочное завершение
  if (this.fast || this.time == 0 || this.steps == 0 || (this.startValue == this.finalValue && this.startValue != null)) {
    this.callFinalize();
    return;
  }

//определяем режим (time | steps)
  this.mode = ('time' in this) ? 'time' :
              ('steps' in this) ? 'steps' :
              (this.defTime != null) ? 'time' :
              (this.defSteps != null) ? 'steps' : 'time';

//расcчитать начальное время или текущий шаг
//<--  проверка time или steps == null
  if (this.mode == 'steps') {
    if (!('steps' in this)) this.steps = this.defSteps || 0;
    this.curStep = (this.t ? Math.round(this.steps*this.t) : 0);
  } else {
    if (this.time == null) this.time = this.defTime || 0;
    this.startTime = new Date().getTime() - (this.t ? this.time*this.t : 0);
  }

//инициaлизация остальных параметров
  if (this.t == null) this.t = 0;
  this.equT = (this.equ ? this.equ(this.t) : this.t);
  if (this.units == null) this.units = '';
  if (this.round) {
    if (typeof(this.round) == 'boolean') this.round = Math.round
  }

//запустить итератор
  this.state = 'processing';
  this.iterator = Iterator.startIterate(this, this.interval);
}


// Animation class
Animation.prototype = {

// event - вызывается итератором, тут и происходит анимация
  onIterate: function(iterator, idx) {
    if (this.state != 'processing') return;

//  вычислить t
    if (this.mode == 'steps') {
//    вычислить t по номеру шага
      this.t = (++this.curStep)/this.steps;
    } else {
//    вычислить t по времени
//    if (this.startTime) {
      this.t = (new Date().getTime() - this.startTime)/this.time;
//    } else {
//      this.startTime = new Date().getTime() - this.time*this.t;
//    }
    }
    if (this.t > 1) this.t = 1;

//  пропустить t через equation-функцию
    this.equT = (this.equ ? this.equ(this.t) : this.t);

//  вычислить value на основе startValue и finalValue
    if (this.startValue != null && this.finalValue != null) {
      this.value = this.startValue + (this.finalValue - this.startValue)*this.equT;
      if (this.round) this.value = this.round(this.value);
    }

//  вызвать внешний обработчик события
    if (this.onCustomIterate) this.onCustomIterate(idx);

//  изменить свойство
    if (this.obj && this.obj.style && this.styleProperty && this.value != null) {
      this.obj.style[this.styleProperty] = this.value + this.units;
    }

//  если закончили, завершить анимацию
    if (this.t >= 1) this.callFinalize();
  },

// animation.callFinalize(reason)
//----------------------------------------------------------------
// Завершает анимацию, вызывает finalize() через мгновенье.
// Используется, когда надо, чтоб событие onEndAnimation вызвалось через минимальную паузу,
// а не внутри этого метода.
//   reason - причина завершения анимации для учета в onEndAnimation
//      значения '' или 'finished' - обычное завершение анимации,
//      'aborted' - анимация прервана другой анимацией
//
  callFinalize: function(reason) {
    this.state = 'finishing';
    var animation = this;
    setTimeout(function(){animation.finalize(reason)}, 0);
  },

// Завершает анимацию, вызывает onEndAnimation
  finalize: function(reason) {
    if (this.state != 'finished') {
      this.state = 'finished';
      if (!reason) reason = 'finished';
      if (this.iterator) {
        this.iterator.stopIterate(this, reason);
        this.iterator = null;
      } else {
//      в fast-режиме итератор не создается
        this.onEndIterate(reason);
      }
    }
  },

// event, вызывается при завершении итераций.
// this == intance of Animation
  onEndIterate: function(reason) {
    for (var i = 0, l = Animations.length; i < l; i++) {
      if (Animations[i] === this) {
				Animations.splice(i, 1);
				break;
			}
    }
    if (this.onEndAnimation) this.onEndAnimation(reason);
  }

}


// Массив активных анимаций
Animations = [];

Animations.indexOfObj = function(obj, id) {
  for (var i = 0, l = this.length; i < l; i++) {
    var a = this[i];
    if (a.obj == obj && a.id == id) return i;
  }
  return -1;
}

Animations.findObj = function(obj, id) {
  var idx = this.indexOfObj(obj, id);
  return (idx >= 0 ? this[idx] : null);
}

Animations.removeObj = function(obj, id) {
  var idx = this.indexOfObj(obj, id);
  if (idx >= 0) this.splice(idx, 1);
}










//-- zoom ----------------------------------------------

// Параметры по умолчанию для zoom
zoomDefaults = {
//interval: 40,   // интервал между итерациями (мс)
  defTime: 500,   // длительность zoom-а (мс)
//defSteps: 25,   // количество шагов
                  // либо defTime, либо defSteps обязателен
//action: 'auto', // действие: развернуть, свернуть, авто (если элемент виден - свернуть, если скрыт - развернуть)
                  // '+' == 'show' | '-' == 'hide' | '' == 'auto'
  overflow: 'hidden,', // вначале zoom-а overflow: 'hidden', вконце overflow: ''
  dir: 'v'        // направление zoom-а (v - вертикальный, h - горизонтальный), обязательный
//equ: Equation.expInOut // функция хода анимации
}

// zoom - разворачивание/сворачивание элемента
//----------------------------------------------------------------
// Вызов:
//  zoom(el, <параметры...>, <параметры...>, ...);
//
//  el - элемент или его id
//  Остальные параметры передаются в хэшах: {параметр: значение, параметр: значение, ...}
//  Таких хэшей может быть несколько или не быть совсем.
//
// Параметры:
//  interval - интервал между итерациями в миллисекундах.
//  time - длительность zoom-а в миллисекундах, определяет режим работы zoom-а по времени.
//  steps - количество шагов zoom-а, определяет режим работы zoom-а по количеству шагов.
//    Если не задан ни time ни steps, режим определяется по zoomDefaults.defTime или defSteps
//  dir - направление zoom-а: 'v' - вертикальное (по умолчанию), 'h' - горизонтальное.
//  action - действие (развернуть, свернуть, авто):
//    '+', 'show' - развернуть;  '-', 'hide' - cвернуть;
//    '', 'auto' - если элемент виден - свернуть, если скрыт - развернуть.
//  overflow - указывает как менять свойство overflow элемента, 'keep' - не менять.
//  fast - zoom за один шаг, без анимации.
//  onZoomIterate - cобытие, вызывающееся при каждой итерации, см. Animation.onCustomIterate
//  afterZoom - событие, сигнализирующее о завершении zoom-а.
//    Формат вызова: obj.afterZoom(reason)
//    где reason - причина окончания zoom-а:
//      'finished' - zoom завершился нормально,
//      'aborted' - zoom был прерван другим zoom-ом.
//
function zoom(el, param1, param2/*...*/) {
  el = $z(el);
  var params = {
    obj: el,
    units: 'px',
    round: true,
    onEndAnimation: zoom.onEndZoom
  }

//копируем параметры из param1, param2, ...
  for (var i = arguments.length-1; i > 0; i--) {
    var arg = arguments[i];
    if (typeof(arg) == 'string') {
      if (arg == '+' || arg == '-') arg = {action: arg}
      else {
        warn('Invalid zoom('+elInfo(el)+') argument: "'+arg+'"');
        continue;
      }
    } else if (typeof(arg) == 'number') {
      warn('Invalid zoom('+elInfo(el)+') argument: '+arg);
      continue;
    }
    expandObj(params, arg);
  }
  expandObj(params, zoomDefaults);

//определяем направление зума (v | h)
  params.dir = (params.dir != '' && ('horizontal').indexOf(params.dir) == 0 ? 'h' : 'v');
  var property = params.id = params.styleProperty = (params.dir == 'h' ? 'width' : 'height');

//выясняем, есть ли активная анимация
  var prevAni = Animations.findObj(el, property);

//определяем действие (show | hide)
  var show = 
    (!params.action || params.action == 'auto' ?
      (prevAni ?
        prevAni.action == 'hide' : (property == 'width' ? el.offsetWidth : el.offsetHeight) == 0)
    :
      (params.action != '-' && params.action != 'hide'));
  var action = params.action = (show ? 'show' : 'hide');

  if (params.onZoomIterate) params.onCustomIterate = params.onZoomIterate;

//устанавливаем overflow
  if (params.overflow != null && params.overflow != 'keep') {
    setStylePropFor(el, 'overflow', params.overflow);
    params.overflowSet = true;
  }
  if (params.overflowX != null && params.overflowX != 'keep' && el.style.overflowX != null) {
    setStylePropFor(el, 'overflowX', params.overflowX);
    params.overflowXSet = true;
  }
  if (params.overflowY != null && params.overflowY != 'keep' && el.style.overflowY != null) {
    setStylePropFor(el, 'overflowY', params.overflowY);
    params.overflowYSet = true;
  }
  
  if (prevAni) {
    var sameAction = (prevAni.action == action);
    params.startValue = prevAni[(sameAction ? 'startValue' : 'finalValue')];
    params.finalValue = prevAni[(sameAction ? 'finalValue' : 'startValue')];
    params.t = (sameAction ? prevAni.t : 1 - prevAni.t);
  } else {
    params.startValue = (property == 'width' ? el.offsetWidth : el.offsetHeight) || 1;
    params.finalValue = (show ? zoom.getMaxValue(el, property) : 1);
  }

//запускаем анимацию
  new Animation(params);
}

// privat - возвращает высоту или ширину блока в развернутом состоянии
zoom.getMaxValue = function(el, property) {
  var offsetProp = (property == 'width' ? 'offsetWidth' : 'offsetHeight');
  var curValue = el[offsetProp];
  if (curValue == 0) {
    el.style.display = 'block';
    el.style.visibility = 'visible';
  }
  el.style[property] = '';
  var maxValue = el[offsetProp];
  el.style[property] = (curValue || 1)+'px';
  var h = el[offsetProp];  // to prevent show full block in ff
  return maxValue;
}

// event, вызывается при завершении итераций.
// this == intance of Animation
zoom.onEndZoom = function(reason) {
  if (this.overflowSet) {
    this.overflowSet = false;
    unsetStylePropFor(this.obj, 'overflow');
  }
  if (this.overflowXSet) {
    this.overflowXSet = false;
    unsetStylePropFor(this.obj, 'overflowX');
  }
  if (this.overflowYSet) {
    this.overflowYSet = false;
    unsetStylePropFor(this.obj, 'overflowY');
  }
  if (!reason || reason == 'finished') {
    this.obj.style[this.styleProperty] = '';
    if (this.action == 'hide') this.obj.style.display = 'none';
  }
  if (this.afterZoom) this.afterZoom(reason);
}







//-- fade ----------------------------------------------

// Параметры по умолчанию для fade-а
fadeDefaults = {
//interval: 40,   // интервал между итерациями (мс)
//defTime: 160,   // длительность fade-а (мс)
  defSteps: 4     // количество шагов fade-а
}

// fade - появление/скрытие элемента
//----------------------------------------------------------------
// Вызов:
//  fade(el, <параметры...>, <параметры...>, ...);
//
//  el - элемент или его id
//  Остальные параметры передаются в хэшах: {параметр: значение, параметр: значение, ...}
//  Таких хэшей может быть несколько или не быть совсем.
//
// Параметры:
//  interval - интервал между итерациями в миллисекундах.
//  time - длительность fade-а в миллисекундах, определяет режим работы fade-а по времени.
//  steps - количество шагов fade-а, определяет режим работы fade-а по количеству шагов.
//    Если не задан ни time ни steps, режим определяется по fadeDefaults.defTime или defSteps
//  action - двействие (показать, скрыть, авто):
//    '+', 'show' - показать;  '-', 'hide' - скрыть;
//    '', 'auto' - если элемент виден - скрыть, если скрыт - показать.
//  fast - fade за один шаг, без анимации.
//  onFadeIterate - cобытие, вызывающееся при каждой итерации, см. Animation.onCustomIterate
//  afterFade - событие, сигнализирующее о завершении fade-а.
//    Формат вызова: obj.afterFade(reason)
//    где reason - причина окончания fade-а:
//      'finished' - fade завершился нормально,
//      'aborted' - fade был прерван другим fade-ом.
//
function fade(el, param1, param2/*...*/) {
  el = $z(el);
  var params = {
    obj: el,
    id: 'opacity',
    onCustomIterate: fade.onIterate,
    onEndAnimation: fade.onEndFade
  }

//копируем параметры из param1, param2, ...
  for (var i = arguments.length-1; i > 0; i--) {
    var arg = arguments[i];
    if (typeof(arg) == 'string') {
      if (arg == '+' || arg == '-') arg = {action: arg}
      else {
        warn('Invalid fade('+elInfo(el)+') argument: "'+arg+'"');
        continue;
      }
    } else if (typeof(arg) == 'number') {
      warn('Invalid fade('+elInfo(el)+') argument: '+arg);
      continue;
    }
    expandObj(params, arg);
  }
  expandObj(params, fadeDefaults);

//выясняем, есть ли активная анимация
  var prevAni = Animations.findObj(el, 'opacity');

//определяем действие (show | hide)
  var show = 
    (!params.action || params.action == 'auto' ?
      (prevAni ? prevAni.action == 'hide' : el.offsetHeight == 0)
    :
      (params.action != '-' && params.action != 'hide'));
  var action = params.action = (show ? 'show' : 'hide');

  if (prevAni) {
    var sameAction = (prevAni.action == action);
    params.startValue = prevAni[(sameAction ? 'startValue' : 'finalValue')];
    params.finalValue = prevAni[(sameAction ? 'finalValue' : 'startValue')];
    params.t = (sameAction ? prevAni.t : 1 - prevAni.t);
  } else {
    params.startValue = (el.offsetHeight == 0 ? 0 : 1);
    params.finalValue = (show ? 1 : 0);
  }

  params.fadeProperty = ('opacity' in el.style ? 'opacity' : 
                        ('filter' in el.style ? 'filter' : null));

//если нет свойства прозрачности, то быстро закончить (без итераций)
  if (!params.fadeProperty) params.fast = true;

//запускаем анимацию
  new Animation(params);
}


fade.onIterate = function() {
  if (this.action == 'show' && !this.visibilitySet) {
    if (this.obj.offsetHeight == 0) this.obj.style.display = 'block';
    this.obj.style.visibility = 'visible';
    this.visibilitySet = true;
  }
  var value = this.startValue + (this.finalValue - this.startValue)*this.equT;
  this.obj.style[this.fadeProperty] = 
    (this.fadeProperty == 'filter' ? 'alpha(opacity='+Math.round(value*100)+')' : value);
  if (this.onFadeIterate) this.onFadeIterate();
}

fade.onEndFade = function(reason) {
  if (!reason || reason == 'finished') {
    if (this.fadeProperty) this.obj.style[this.fadeProperty] = '';
    if (this.action == 'hide') {
      this.obj.style.display = 'none';
    } else if (!this.visibilitySet) {
      this.obj.style.display = 'block';
      this.obj.style.visibility = 'visible';
    }
  }
  if (this.afterFade) this.afterFade(reason);
}







// Animation common - копирует недостающие свойства из sour в dest
function expandObj(dest, sour) {
  for (var i in sour) {
    if (!(i in dest)) dest[i] = sour[i];
  }
}

// массив активных блокировок свойств объектов
var stylePropEls = [];

// setStylePropFor(el, property, values) - установка свойства cтиля элемента
//---------------------------------------------------------------------------
// Свойство property для el.style устанавливается в значение первого (set-) параметра values
// и блокируется от изменений последующих вызовов setStylePropFor()
// до соответствующего количества вызова unsetStylePropFor()
//   el - cсылка на элемент
//   property - имя свойства
//   values - строка со значениями, разделёнными запятой.
//     Первое (set-) значение устанавливается при первом вызове setStylePropFor(),
//     последующие вызовы с теми же значениями el и property не меняют свойства,
//     а лишь увеличивают внутренний счетчик. Вызов unsetStylePropFor() уменьшает этот счетчик,
//     и при достижении 0 cвойство устанавливается во второе (unset-) значение параметра values.
//     Пример: values = 'hidden,' - set-значение: 'hidden, unset-значение: ''
//       values = 'visible' - set-значение и unset-значение: 'visible'
//
function setStylePropFor(el, property, values) {
	for (var i = 0, l = stylePropEls.length; i < l; i++) {
		var rec = stylePropEls[i];
		if (rec.el == el && rec.property == property) {
			rec.count++;
			return;
		}
	}
	values = values.toString().split(',');
	stylePropEls.push({el: el, property: property, values: values});
	el.style[property] = values[0];
}

function unsetStylePropFor(el, property) {
  for (var i = 0, l = stylePropEls.length; i < l; i++) {
    var rec = stylePropEls[i];
    if (rec.el == el && rec.property == property) {
      if ((--rec.count) == 0) {
        stylePropEls.splice(i, 1);
        el.style[property] = rec.values[(rec.values.length > 0 ? 1 : 0)];
      }
      return;
    }
  }
}




function callEventHandler(method, object) {
  if (method == null)     return false;
  if (!object) object = window;
  if (isFunction(method)) return method.call(object);
  if (isArray(method))    return method[0].apply(object, method.slice(1));
  if (isString(method))   return eval(method);
  return false;
}

//-- body events handler --

var bodyEventHandlers = {};

function setupBodyEvent(eventType, handler) {
  eventType = 'on'+eventType;
  var info = bodyEventHandlers[eventType];
  if (!info) {
    bodyEventHandlers[eventType] = {defHandler: document.body.getAttribute(eventType), handlers: [handler]};
    document.body.setAttribute(eventType, (isIE ? bodyEventWrapper : 'bodyEventWrapper(event)'));
  } else {
    info.handlers.push(handler);
  }
}

function bodyEventWrapper(event) {
  if (!event) event = window.event;
  var info = bodyEventHandlers['on'+event.type];
  for (var i = 0, l = info.handlers.length; i < l; i++) {
    callEventHandler(info.handlers[i]);
  }
  if (info.defHandler) callEventHandler(info.defHandler);
}



function initZoom(zoomEl, toggleEl){
//warn('initZoom: Old zoom call!');
  var zEl = $z(zoomEl);
  if (zEl == null) throw 'initZoom('+zoomEl+'): element not found';
  zEl.afterZoom = function() {
    var isOpen = (zEl.offsetHeight > 0);
    if (toggleEl.tagName == 'IMG') {
      toggleEl.src = 'i/'+(isOpen ? 'close' : 'open')+'.gif';
    } else { 
      toggleEl.innerHTML = (isOpen ? 'Закрыть' : 'Ответить');
    }
  }
  zoom(zEl);
  return false
}



var DEF_DISPLAY_MODE = 'blank';   // 'visible' / 'block' / 'blank' / false

function hasAlpha(el) {
  if (!('alphaMode' in el))
    el.alphaMode = ('opacity' in el.style ? 'opacity' : 
                     ('filter' in el.style ? 'filter' : false));
  return el.alphaMode;
}

function getAlpha(el) {
  return ('alphaValue' in el ? el.alphaValue : 1);
}

function setAlpha(el, value) {
  if (el.alphaValue != value) {
    if (value < 0.01) value = 0;
    else if (value > 0.99) value = 1;
    el.alphaValue = value;
    if (!('alphaMode' in el)) hasAlpha(el);
    if (el.alphaMode == 'opacity')
      el.style.opacity = el.alphaValue;
    else if (el.alphaMode == 'filter') 
      el.style.filter = 'alpha(opacity='+Math.round(el.alphaValue*100)+')';
  }
}

function setVisible(el, value, displayMode) {
  if (displayMode != undefined) el.displayMode = displayMode;
  else if ('displayMode' in el) displayMode = el.displayMode;
  else displayMode = DEF_DISPLAY_MODE;
  if (displayMode != false) {
    if (displayMode == 'visible') el.style.visibility = (value ? 'visible' : 'hidden');
    else el.style.display = (value ? (displayMode == 'blank' ? '' : displayMode) : 'none');
  }
}

//-- Hint --

var
  HintContainerId = 'hint_container';

function Hint(type, defContent, w, h) {
  this.hintContainer = document.createElement('DIV');
  this.hintContainer.className = 'hint';
  this.type = type || 'text';
  this.defContent = defContent;
  this.width = w;
  this.height = h;
  this.zIndex = 2000;
  this.inContainer = false;
  this.visible = false;
  this.fastShow = true;
  this.show = Hint_show;
  this.hide = Hint_hide;
  this.updatePos = Hint_updatePos;
  if (mouseMoveListeners.length == 0) addMouseMoveListener(null);  // add null handler to know mouse pos
}

function Hint_show(content, w, h) {
  if (content == null) content = this.defContent;
  if (w == null) w = this.width;
  if (h == null) h = this.height;
  var hintCont = this.hintContainer;

  hintCont.innerHTML = 
   '<table border="0" cellspacing="0" cellpadding="0"><tr><td>'+
     (this.type == 'image' ?
       '<img src="'+content+'"'+(w ? ' width="'+w+'"' : '')+(h ? ' height="'+h+'"' : '')+'>' :
       '<b></b><div>'+content+'</div><b></b>') +
   '</td></tr></table>';
  if (w) hintCont.style.width = w;
  if (h) hintCint.style.height = h;

  if (this.visible) return;
  hintCont.hintObject = this;
  if (!this.mouseHandlerAdded) {
    addMouseMoveListener(Hint_updatePos, this);
    this.mouseHandlerAdded = true;
  }

  if (!this.inContainer) {
    (document.getElementById(HintContainerId) || document.body).appendChild(hintCont);
    this.inContainer = true;
  }
  if (this.zIndex) hintCont.style.zIndex = this.zIndex;
  if (this.width) hintCont.style.width = this.width;
  if (this.fastShow) 
    setVisible(hintCont, true)
  else
    fade(hintCont, '+');
  this.visible = true;
  var t = hintCont.getElementsByTagName('TABLE')[0];
  this.hintWidth = t.offsetWidth;
  this.hintHeight = t.offsetHeight;
  this.updatePos();
}

function Hint_hide(how) {
  if (!this.visible) return;
  this.visible = false;
  var hintCont = this.hintContainer;
  if (how == 'fast' || this.fastShow) {
    setVisible(hintCont, false);
    if (this.mouseHandlerAdded) {
      removeMouseMoveListener(Hint_updatePos, this);
      this.mouseHandlerAdded = false;
    }
    hintCont.hintObject = null;
  } else {
    if (this.mouseHandlerAdded) hintCont.afterFade = Hint_afterFadeOut;
    fade(hintCont, '-');
  }
}

function Hint_afterFadeOut() {
  this.afterFade = null;
  var obj = this.hintObject;
  this.hintObject = null;
  obj.mouseHandlerAdded = false;
  removeMouseMoveListener(Hint_updatePos, obj);
}

function Hint_updatePos() {
  var body = document.body;
  var d = (body.clientWidth + body.scrollLeft) - this.hintWidth;
  var x = Math.min(mouseAbsPosX, d);
  var y = mouseAbsPosY + 20;
  var h = this.hintHeight;
  var ch = body.clientHeight + body.scrollTop;
  //alert(body.clientHeight + ' ' + body.scrollTop + ' = ' + ch);
  y = mouseAbsPosY;
  //if (y + h >= ch) y = Math.min(mouseAbsPosY, ch) - h;
  with (this.hintContainer.style) {
    left = x;
    top  = y;
  }
}

var
  hint = new Hint('text');

function hintHide() {
  hint.hide();
}

//-- Preload images --

var
  preloadedImgs = [];

function preloadImg(src, path) {
  if (path == null) path = '';
  if (isArray(src)) {
    var res = [];
    for (var i = 0, l = src.length; i < l; i++) {
      var img = new Image();
      img.src = path + src[i];
      preloadedImgs.push(img);
      res.push(img.src);
    }
    return res;
  }
  var img = new Image();
  img.src = path + src;
  preloadedImgs.push(img);
  return img.src;
}


//-- loadData / submitData --

function loadData(url, id, onCopyContent, resend, showIndicator) {
  sendRequest(id, onCopyContent, url, null, resend, showIndicator);
}

function submitData(form, id, event, onCopyContent, resend, showIndicator) {
  sendRequest(id, onCopyContent, form, event, resend, showIndicator);
}

var
  dataRequest = null,
  dataRequestResendDef = true;

function sendRequest(id, onCopyContent, urlForm, event, resend, showIndicator) {
  if (!dataRequest) {
    dataRequest = new RemoteFileLoader('dataRequest');
    dataRequest.onCopyContent = dataRequest_onCopyContent;
    dataRequest.onCopyContentEvents = {};
    dataRequest.requestDlgs = {};
    dataRequest.showIndicator = {};
    dataRequest.showRequestIndicator = true;
    dataRequest.onRequestIndicator = dataRequest_onRequestIndicator;
  }
  if (id in dataRequest.onCopyContentEvents) {
    if (resend != null ? resend : dataRequestResendDef) {
      dataRequest.cancel(id);
    } else {
      if (event) cancelEvent(event);
      return false;
    }
  }
  dataRequest.onCopyContentEvents[id] = onCopyContent;
  dataRequest.showIndicator[id] = showIndicator;
  if (event) {
   var dlg = dataRequest.requestDlgs[id] = (window.getWindowByElement ? getWindowByElement(urlForm) : null);
   if (dlg) dlg.dataRequestActive = true;
    dataRequest.submitInto(urlForm, id, event);
  } else {
    dataRequest.loadInto(urlForm, id);
  }
  return true;
}

function dataRequest_onCopyContent(doc, text, id) {
  if (!(id in dataRequest.onCopyContentEvents)) return false;
  var callback = dataRequest.onCopyContentEvents[id];
  delete dataRequest.onCopyContentEvents[id];
  if (id in dataRequest.requestDlgs) {
    var dlg = dataRequest.requestDlgs[id];
    delete dataRequest.requestDlgs[id];
    if (dlg) dlg.dataRequestActive = false;
  }
  return (callback ? callback(doc, text, id) : false);
}

function dataRequest_onRequestIndicator(uri, id, action) {
  return (dataRequest.showIndicator[id] != false);
}

function cancelDataRequest(id) {
  if (dataRequest && (id in dataRequest.onCopyContentEvents)) {
    delete dataRequest.onCopyContentEvents[id]
    dataRequest.cancel(id);
  }
}


//-- Favorites --

function addPageBookmark(title, url) {
  title = title || document.title; 
  url = url || location.href;
  if (window.sidebar) { // Firefox
    window.sidebar.addPanel(title, url, '');
  } else if (window.external) { // IE
    window.external.AddFavorite(url, title);
  } else if (window.opera) { // Opera
    var el = document.createElement('A');
    el.setAttribute('href', url);
    el.setAttribute('title', title);
    el.setAttribute('rel', 'sidebar');
    el.click();
  } else {
    alert('Ваш браузер не поддерживает автоматическое добавление в избранное. Добавьте ссылку вручную через меню.')
    return false;
  }
  return true;
}

/**
 * SWFObject v1.5: Flash Player detection and embed - http://blog.deconcept.com/swfobject/
 *
 * SWFObject is (c) 2007 Geoff Stearns and is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 */
if(typeof deconcept=="undefined"){var deconcept=new Object();}if(typeof deconcept.util=="undefined"){deconcept.util=new Object();}if(typeof deconcept.SWFObjectUtil=="undefined"){deconcept.SWFObjectUtil=new Object();}deconcept.SWFObject=function(_1,id,w,h,_5,c,_7,_8,_9,_a){if(!document.getElementById){return;}this.DETECT_KEY=_a?_a:"detectflash";this.skipDetect=deconcept.util.getRequestParameter(this.DETECT_KEY);this.params=new Object();this.variables=new Object();this.attributes=new Array();if(_1){this.setAttribute("swf",_1);}if(id){this.setAttribute("id",id);}if(w){this.setAttribute("width",w);}if(h){this.setAttribute("height",h);}if(_5){this.setAttribute("version",new deconcept.PlayerVersion(_5.toString().split(".")));}this.installedVer=deconcept.SWFObjectUtil.getPlayerVersion();if(!window.opera&&document.all&&this.installedVer.major>7){deconcept.SWFObject.doPrepUnload=true;}if(c){this.addParam("bgcolor",c);}var q=_7?_7:"high";this.addParam("quality",q);this.setAttribute("useExpressInstall",false);this.setAttribute("doExpressInstall",false);var _c=(_8)?_8:window.location;this.setAttribute("xiRedirectUrl",_c);this.setAttribute("redirectUrl","");if(_9){this.setAttribute("redirectUrl",_9);}};deconcept.SWFObject.prototype={useExpressInstall:function(_d){this.xiSWFPath=!_d?"expressinstall.swf":_d;this.setAttribute("useExpressInstall",true);},setAttribute:function(_e,_f){this.attributes[_e]=_f;},getAttribute:function(_10){return this.attributes[_10];},addParam:function(_11,_12){this.params[_11]=_12;},getParams:function(){return this.params;},addVariable:function(_13,_14){this.variables[_13]=_14;},getVariable:function(_15){return this.variables[_15];},getVariables:function(){return this.variables;},getVariablePairs:function(){var _16=new Array();var key;var _18=this.getVariables();for(key in _18){_16[_16.length]=key+"="+_18[key];}return _16;},getSWFHTML:function(){var _19="";if(navigator.plugins&&navigator.mimeTypes&&navigator.mimeTypes.length){if(this.getAttribute("doExpressInstall")){this.addVariable("MMplayerType","PlugIn");this.setAttribute("swf",this.xiSWFPath);}_19="<embed type=\"application/x-shockwave-flash\" src=\""+this.getAttribute("swf")+"\" width=\""+this.getAttribute("width")+"\" height=\""+this.getAttribute("height")+"\" style=\""+this.getAttribute("style")+"\"";_19+=" id=\""+this.getAttribute("id")+"\" name=\""+this.getAttribute("id")+"\" ";var _1a=this.getParams();for(var key in _1a){_19+=[key]+"=\""+_1a[key]+"\" ";}var _1c=this.getVariablePairs().join("&");if(_1c.length>0){_19+="flashvars=\""+_1c+"\"";}_19+="/>";}else{if(this.getAttribute("doExpressInstall")){this.addVariable("MMplayerType","ActiveX");this.setAttribute("swf",this.xiSWFPath);}_19="<object id=\""+this.getAttribute("id")+"\" classid=\"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000\" width=\""+this.getAttribute("width")+"\" height=\""+this.getAttribute("height")+"\" style=\""+this.getAttribute("style")+"\">";_19+="<param name=\"movie\" value=\""+this.getAttribute("swf")+"\" />";var _1d=this.getParams();for(var key in _1d){_19+="<param name=\""+key+"\" value=\""+_1d[key]+"\" />";}var _1f=this.getVariablePairs().join("&");if(_1f.length>0){_19+="<param name=\"flashvars\" value=\""+_1f+"\" />";}_19+="</object>";}return _19;},write:function(_20){if(this.getAttribute("useExpressInstall")){var _21=new deconcept.PlayerVersion([6,0,65]);if(this.installedVer.versionIsValid(_21)&&!this.installedVer.versionIsValid(this.getAttribute("version"))){this.setAttribute("doExpressInstall",true);this.addVariable("MMredirectURL",escape(this.getAttribute("xiRedirectUrl")));document.title=document.title.slice(0,47)+" - Flash Player Installation";this.addVariable("MMdoctitle",document.title);}}if(this.skipDetect||this.getAttribute("doExpressInstall")||this.installedVer.versionIsValid(this.getAttribute("version"))){var n=(typeof _20=="string")?document.getElementById(_20):_20;n.innerHTML=this.getSWFHTML();return true;}else{if(this.getAttribute("redirectUrl")!=""){document.location.replace(this.getAttribute("redirectUrl"));}}return false;}};deconcept.SWFObjectUtil.getPlayerVersion=function(){var _23=new deconcept.PlayerVersion([0,0,0]);if(navigator.plugins&&navigator.mimeTypes.length){var x=navigator.plugins["Shockwave Flash"];if(x&&x.description){_23=new deconcept.PlayerVersion(x.description.replace(/([a-zA-Z]|\s)+/,"").replace(/(\s+r|\s+b[0-9]+)/,".").split("."));}}else{if(navigator.userAgent&&navigator.userAgent.indexOf("Windows CE")>=0){var axo=1;var _26=3;while(axo){try{_26++;axo=new ActiveXObject("ShockwaveFlash.ShockwaveFlash."+_26);_23=new deconcept.PlayerVersion([_26,0,0]);}catch(e){axo=null;}}}else{try{var axo=new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");}catch(e){try{var axo=new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");_23=new deconcept.PlayerVersion([6,0,21]);axo.AllowScriptAccess="always";}catch(e){if(_23.major==6){return _23;}}try{axo=new ActiveXObject("ShockwaveFlash.ShockwaveFlash");}catch(e){}}if(axo!=null){_23=new deconcept.PlayerVersion(axo.GetVariable("$version").split(" ")[1].split(","));}}}return _23;};deconcept.PlayerVersion=function(_29){this.major=_29[0]!=null?parseInt(_29[0]):0;this.minor=_29[1]!=null?parseInt(_29[1]):0;this.rev=_29[2]!=null?parseInt(_29[2]):0;};deconcept.PlayerVersion.prototype.versionIsValid=function(fv){if(this.major<fv.major){return false;}if(this.major>fv.major){return true;}if(this.minor<fv.minor){return false;}if(this.minor>fv.minor){return true;}if(this.rev<fv.rev){return false;}return true;};deconcept.util={getRequestParameter:function(_2b){var q=document.location.search||document.location.hash;if(_2b==null){return q;}if(q){var _2d=q.substring(1).split("&");for(var i=0;i<_2d.length;i++){if(_2d[i].substring(0,_2d[i].indexOf("="))==_2b){return _2d[i].substring((_2d[i].indexOf("=")+1));}}}return "";}};deconcept.SWFObjectUtil.cleanupSWFs=function(){var _2f=document.getElementsByTagName("OBJECT");for(var i=_2f.length-1;i>=0;i--){_2f[i].style.display="none";for(var x in _2f[i]){if(typeof _2f[i][x]=="function"){_2f[i][x]=function(){};}}}};if(deconcept.SWFObject.doPrepUnload){if(!deconcept.unloadSet){deconcept.SWFObjectUtil.prepUnload=function(){__flash_unloadHandler=function(){};__flash_savedUnloadHandler=function(){};window.attachEvent("onunload",deconcept.SWFObjectUtil.cleanupSWFs);};window.attachEvent("onbeforeunload",deconcept.SWFObjectUtil.prepUnload);deconcept.unloadSet=true;}}if(!document.getElementById&&document.all){document.getElementById=function(id){return document.all[id];};}var getQueryParamValue=deconcept.util.getRequestParameter;var FlashObject=deconcept.SWFObject;var SWFObject=deconcept.SWFObject;

//-- Lipka, 18.02.08---------------------------------------------------------------

function png(id, src_png, src_gif, sizingMethod){  
	var td = document.getElementById(id);
	var image = td.getElementsByTagName('IMG')[0];
	if (isIE50) image.src = src_gif;
	else if (!isIE) image.src = src_png;
	else image.runtimeStyle.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' +  src_png + '",sizingMethod="'+(sizingMethod || 'image')+'")';
	return 1;
}


function doUpdateColumns() {
  if (window.updateRightColumn && window.updateBottomColumn) {
    updateRightColumn();
    updateBottomColumn();
  } else setTimeout(doUpdateColumns, 250);
}

function doUpdateRightColumn() {
  if (window.updateRightColumn) updateRightColumn();
  else setTimeout(doUpdateRightColumn, 250);
}

//-- Comments block --

function formComment(id, toggle) {
  var r = $z('response'+id);
  if (!r.isFilled) {
    r.innerHTML = $z('form_comment').innerHTML;
    var subj = $_('subj', r, 'INPUT');
    subj.id = 'subj'+id;
    subj.style.display = 'none';
    subj.value = '';
    var body = $_('body', r, 'TEXTAREA');
    body.id = 'body'+id;
    var s = $z('msg'+id).innerHTML.replace(/<(.|\s)+?>/g, '').substr(0, 200);
    if (s.length == 200) s = s.replace(/\S+$/, '');
    body.value = '[cit]'+trim(s)+'[/cit]';
    var name = $_('name', r, 'INPUT');
    name.id = 'name'+id;
    name.value = $z('name').value;
    initInputPlaceholder(name, 'Ваше имя', '', 'empty');
    var submit = $_('submit', r, 'INPUT');
    submit.id = 'submit'+id;
    var form = submit.form;
    form.commentId = id;
    r.isFilled = true;
  }
  initZoom($z('response'+id), toggle);
  return false
}

function chkSubmitCommentForm(form, event) {
  var id = form.commentId || '';
  var body = $z('body'+id);
  if (trim(body.value) == '') {
    alert('Вы не ввели сообщение.');
    body.focus();
    cancelEvent(event);
    return;
  }
  var name = $z('name'+id);
  if (trim(name.value) == '' || name.className == 'empty') {
    alert('Вы не ввели имя.');
    name.focus();
    cancelEvent(event);
    return;
  }
  var subj = $z('subj'+id);
  if (trim(subj.value) == '' || subj.className == 'empty') subj.value = '';
  $z('submit'+id).disabled = true;
}

function toggle(suffix, current) {
  var itm = $z('toggle_'+suffix).getElementsByTagName('TD');
  var td = findParentNode(current, 'TD');
  var n = -1;
  for (var i = 0, l = itm.length; i < l; i++) { 
    itm[i].className = '';
    $z('box_'+suffix+i).style.display = 'none';
    $z('frm_'+suffix+i).style.display = 'none';
    if (itm[i] == td) n = i
  }
  td.className = 'current';
  $z('box_'+suffix+n).style.display = '';
  $z('frm_'+suffix+n).style.display = '';
  return false
}

//-- Glavred block --

function initGlavredForm() {
  var forms = document.body.getElementsByTagName('FORM');
  for (var i = forms.length-1; i >= 0; i--) {
    var form = forms[i];
    if (form.className != 'glavred_form' || form.glavredBylTut) continue;
    form.messageInput = findSubChild(form, 'TEXTAREA');
    var inps = form.getElementsByTagName('INPUT');
    for (var j = 0, l = inps.length; j < l; j++) {
      var inp = inps[j];
      if (inp.name == 'name') {
        initInputPlaceholder(inp, 'Ваше имя', '', 'empty');
        form.nameInput = inp;
      } else if (inp.type == 'submit') {
        form.submitBtn = inp;
      }
    }
    setupEvent(form, 'submit', GlavredForm_onSubmit);
    form.glavredBylTut = true;
  }
}

function GlavredForm_onSubmit(event) {
  var form = (event.srcElement || event.target);
  var messageInput = form.messageInput;
  if (trim(messageInput.value) == '') {
    alert('Вы не ввели сообщение.');
    messageInput.focus();
    cancelEvent(event);
    return;
  }
  var nameInput = form.nameInput;
  if (trim(nameInput.value) == '' || nameInput.className == 'empty') {
    alert('Вы не ввели имя.');
    nameInput.focus();
    cancelEvent(event);
    return;
  }
  form.submitBtn.disabled = true;
}

//-- More photos --

var 
  photoBlock,
  previewsBlock,
  containerBlock,
  moveIntervalId;

function showMorePhotos() {
  if (photoBlock) return;
  photoBlock = $z('photo_block');
  previewsBlock = $z('previews');
  containerBlock = photoBlock.parentNode;
  containerBlock.style.width = containerBlock.offsetWidth+'px';
  containerBlock.style.height = containerBlock.offsetHeight+'px';
  containerBlock.style.overflow = 'hidden';
  photoBlock.style.width = photoBlock.offsetWidth+'px';
  photoBlock.style.position = 'relative';
  photoBlock.curPos = 0;
  photoBlock.endPos = -(photoBlock.offsetWidth + getAbsPos(photoBlock).left);
  photoBlock.incVal = 2;
  moveIntervalId = setInterval(movingBlockIterator, 50);
  setTimeout(movingBlockIterator, 0);
}

function movingBlockIterator() {
  if (photoBlock.curPos != photoBlock.endPos) {
    photoBlock.incVal *= 2;
    photoBlock.curPos -= photoBlock.incVal;
    if (photoBlock.curPos < photoBlock.endPos) photoBlock.curPos = photoBlock.endPos;
    photoBlock.style.left = photoBlock.curPos+'px';
  } else if (previewsBlock.curPos == null) {
    previewsBlock.style.display = 'block';
    previewsBlock.style.width = previewsBlock.offsetWidth+'px';
    previewsBlock.style.position = 'relative';
    previewsBlock.style.left = (-previewsBlock.offsetWidth)+'px';
    previewsBlock.curPos = -previewsBlock.offsetWidth;
    previewsBlock.endPos = 0;
  } else if (previewsBlock.curPos != previewsBlock.endPos) {
    previewsBlock.curPos = Math.round(previewsBlock.curPos + previewsBlock.endPos)/2;
    if (Math.abs(previewsBlock.curPos - previewsBlock.endPos) <= 1) previewsBlock.curPos = previewsBlock.endPos;
    previewsBlock.style.left = previewsBlock.curPos+'px';
  } else if (containerBlock.curPos == null) {
    containerBlock.curPos = containerBlock.offsetHeight;
    containerBlock.endPos = previewsBlock.offsetHeight;
  } else if (containerBlock.curPos != containerBlock.endPos) {
    containerBlock.curPos = Math.round(containerBlock.curPos + containerBlock.endPos)/2;
    if (Math.abs(containerBlock.curPos - containerBlock.endPos) <= 1) containerBlock.curPos = containerBlock.endPos;
    containerBlock.style.height = containerBlock.curPos;
  } else {
    clearInterval(moveIntervalId);
    moveIntervalId = null;
    photoBlock.style.display = 'none';
    previewsBlock.style.width = '';
    previewsBlock.style.position = '';
    previewsBlock.style.left = '';
    containerBlock.style.width = '';
    containerBlock.style.height = '';
    containerBlock.style.overflow = '';
  }
}




/* highlight table row*/

var currentRow = null;

function mouseOverRow(event) {
  var el = (event.target || event.toElement);
  while (el) {
    if (el.tagName == 'TR') break;
    el = el.parentNode;
  }

  if (el != currentRow) {
    if (currentRow) currentRow.id = '';
    if (el) el.id = 'current';
    currentRow = el;
  }
}


//-- Input Placeholder --

function initInputPlaceholder(input, emptyText, filledClass, emptyClass, pwdBkg) {
	return;
	if (input == null) return;
  input.inputPlaceholderInfo = {emptyText: emptyText, filledClass: filledClass, emptyClass: emptyClass};  
  if(pwdBkg != null) input.inputPlaceholderInfo.pwdBkg = pwdBkg;
  setupEvent(input, 'focus', InputPlaceholder_onFocus);
  setupEvent(input, 'blur', InputPlaceholder_onBlur);
  var value = trim(input.value);
  if (value == '' || value == emptyText) {
    input.className = emptyClass;
    if(pwdBkg != null) input.style.backgroundImage = 'url(' + pwdBkg + ')';
    if (value == '') input.value = emptyText;
  } else {
    input.className = filledClass;
    if(pwdBkg != null) input.style.backgroundImage = 'none';
  }
	input.inputPlaceholderInfo = {emptyText: emptyText, filledClass: filledClass, emptyClass: emptyClass};
	if(pwdBkg != null) input.inputPlaceholderInfo.pwdBkg = pwdBkg;
	setupEvent(input, 'focus', InputPlaceholder_onFocus);
	setupEvent(input, 'blur', InputPlaceholder_onBlur);
	var value = trim(input.value || '');
	if (value == '' || value == emptyText) {
		input.className = emptyClass;
		if(pwdBkg != null) input.style.backgroundImage = 'url(' + pwdBkg + ')';
		if (value == '') input.value = emptyText;
	} else {
		input.className = filledClass;
		if(pwdBkg != null) input.style.backgroundImage = 'none';
	}
}

function InputPlaceholder_onFocus(event) {
	return;
  var input = (event.srcElement || event.target);
  var info = input.inputPlaceholderInfo;
  if (input.className == info.emptyClass) {
    input.className = info.filledClass;
    input.value = '';
    if(info.pwdBkg != null) input.style.backgroundImage = 'none';
  }                                     
}

function InputPlaceholder_onBlur(event) {
	return;
  var input = (event.srcElement || event.target);
  var info = input.inputPlaceholderInfo;
  if (trim(input.value) == '') {
    input.className = info.emptyClass;
    input.value = info.emptyText;
    if(info.pwdBkg != null) input.style.backgroundImage = 'url(' + info.pwdBkg + ')';
  }
}


function getCookieValue(name) {
  name = name.toLowerCase();
  var cookies = document.cookie.split(';');
  for (var i = 0, l = cookies.length; i < l; i++) {
    if (cookies[i].match(/^\s?(.*?)\=(.*)/)) {
      var n = RegExp.$1.toLowerCase();
      if (n == name) return RegExp.$2;
    }
  }
  return null;
}

function setCookieValue(name, value) {
  var d = new Date();
  d.setFullYear(d.getFullYear()+10);
  var s = name+'='+value + '; path=/; domain=.' + location.hostname + '; expires='+d.toUTCString();
  document.cookie = s;
}


var curBodyPadding;

function bodyResized() {
  var body = document.body;
  var w = body.clientWidth;
  // на случай всяких микро промо-форм
  var p = (w <= 240 ? 'em0' : (w < 1000 ? 'em2' : (w < 1200 ? 'em3' : 'em5')));
  if (p != curBodyPadding) {
    body.className = p;
    curBodyPadding = p;
  }
}

var
	mainMenu,
	mainMenuIfrm,
	mainMenuBtn,
	mainMenuOpened = false;


function initMainMenu() {
	mainMenu = $z('main_menu');
	mainMenuIfrm = $z('main_menu_iframe');
	mainMenuBtn = $z('menu_analitica');
	if (mainMenuIfrm) {
		if (!isIE) {
			mainMenuIfrm.style.display = 'none';
			mainMenuIfrm = null;
		}
	}
}

function zoomMainMenu() {
	setMainMenuState(!mainMenuOpened);
}

function setMainMenuState(state) {
	if (state == mainMenuOpened) return;
	mainMenuOpened = state;
	var act = (mainMenuOpened ? '+' : '-');
	if (mainMenuIfrm) {
		if (!mainMenu.afterZoom) {
			mainMenu.afterZoom = function() {
				var h = mainMenu.offsetHeight;
				if (h > 0) {
					mainMenuIfrm.style.display = '';
				} else {
					mainMenuIfrm.style.display = 'none';
				}
			}
		}
		zoom(mainMenuIfrm, act);
	}
	zoom(mainMenu, act);
}



function panelOver(el, txt_hint, w_hint) {
//  /\/i\/ico\/panel\/light\/(.+)/.test(el.src);
//  el.src = '/i/ico/panel/' + RegExp.$1;
  if (w_hint) hint.show(txt_hint, w_hint); else hint.show(txt_hint);
}

function panelOut(el) {
//  /\/i\/ico\/panel\/(.+)/.test(el.src);
//  el.src = '/i/ico/panel/light/' + RegExp.$1;
  hint.hide()
}


function showAlert(cookieName) {
  if (getCookieValue(cookieName) == '0') return true;
  var text = $z('alert').innerHTML;
  $z('alert').innerHTML = '';
  var wn = showWindow('w', 'Внимание!', text, 340, 320, 'center');
  $z('alert_btn').focus();
  return true
}

function clickAlertBtn(cookieName, event) {
  if ($z('alert_ck').checked) { setCookieValue(cookieName, 0) }
  Window_closeBtnClick(event);
}


var ul_num = 14;
var ul_max_height;

// TODO: убрать вызов функции
function showUnitedLent() {
	return;
  var u = $z('ul' + ul_num);
  u.style.visibility = 'hidden';
  u.style.display = '';

  if (u.offsetTop + u.offsetHeight <= ul_max_height) {
    u.style.visibility = 'visible';
    ul_num++;
    setTimeout(showUnitedLent, 50);
  } else {
    u.style.display = 'none';
    $z('ul'+(ul_num-1)).className = 'last-in-lent';
  }
}

//-- city time --

var 
  serverDateTime,
  serverYear,
  serverTime,
  localTime;

function setCityTime(timeStr) {
  serverDateTime = new Date(timeStr);
  serverYear = serverDateTime.getFullYear();
  serverTime = serverDateTime.getTime();
  localTime = (new Date()).getTime();
  initDaylightInfo();
//setInterval(updateCityTime, 1000);
  updateCityTime();
}

var 
  daylightInfo = {
    TKO: {bias: +9},
    MSK: {bias: +4},
    LON: {bias: +0, begins: {sunday: 5, month: 3, hour: 1}, ends: {sunday: 5, month: 10, hour: 2}},
    NYC: {bias: -5, begins: {sunday: 2, month: 3, hour: 2}, ends: {sunday: 1, month: 11, hour: 2}}
  };

function initDaylightInfo() {
  for (var city in daylightInfo) {
    var info = daylightInfo[city];
    if (info.begins) {
      info.beginDate = getDaylightAdjustMoment(info, info.begins);
      info.endDate = getDaylightAdjustMoment(info, info.ends);
    }
  }
}

function getDaylightAdjustMoment(info, moment) {
  var day = getDaylightAdjustDay(moment);
  var inc = (moment == info.begins ? 0 : 1);
  var utc = Date.UTC(serverYear, moment.month-1, day, moment.hour, 0) - (info.bias + inc)*60*60*1000;
  return utc;
}

function getDaylightAdjustDay(moment) {
  var curYear = serverYear;
  var curMonth = moment.month-1;
  if (moment.sunday <= 4) {
    var date = new Date(curYear, curMonth, 1);
    var dow = date.getDay() || 7;
    var day = moment.sunday*7 + 1 - dow;
  } else {
    var date = new Date(curYear, curMonth+1, 0);
    var dow = date.getDay();
    var day = date.getDate() - dow;
  }
  return day;
}

var
  cityDateContainer = '?',
  cityTimeContainer = '?';

function updateCityTime() {
  var utcTime = serverTime; // + (new Date()).getTime() - localTime;
  var bias = getCurrentBias(utcTime);
  var cityTime = new Date(utcTime + bias*60*60*1000);
  if (cityDateContainer == '?') cityDateContainer = document.getElementById('city_date');
  if (cityDateContainer) {
    var date = twoDigs(cityTime.getUTCDate())+'.'+twoDigs(cityTime.getUTCMonth()+1)+'.'+cityTime.getUTCFullYear();
    if (date != cityDateContainer.innerHTML) cityDateContainer.innerHTML = date;
  }
  if (cityTimeContainer == '?') cityTimeContainer = document.getElementById('city_time');
  if (cityTimeContainer) {
    var time = cityTime.getUTCHours()+':'+twoDigs(cityTime.getUTCMinutes()); //+':'+twoDigs(cityTime.getUTCSeconds())+' '+(bias >= 0 ? '+' : '')+bias+':00';
    if (time != cityTimeContainer.innerHTML) cityTimeContainer.innerHTML = time;
  }
}

var curTimeCity = 'MSK';

function getCurrentBias(utcTime) {
  var info = daylightInfo[curTimeCity];
  var bias = info.bias;
  if (info.beginDate && info.beginDate <= utcTime && utcTime < info.endDate) bias += 1;
  return bias;
}

function twoDigs(n) {
  return (n < 10 ? '0'+n : n);
}

function switchCityTimeTo(value) {
  if (value == 'GMT') value = 'LON';
  if (value != curTimeCity) {
    curTimeCity = value;
    updateCityTime();
  }
}

var cityTimeBtn;

function switchCityTimeToOld(btn) {
  if (!cityTimeBtn) {
    for (var i = 0, cells = btn.parentNode.cells, l = cells.length; i < l; i++) {
      var cell = cells[i];
      if (cell.className != '') {
        cityTimeBtn = cell;
        break;
      }
    }
  }
  if (cityTimeBtn == btn) return;
  cityTimeBtn.className = '';
  btn.className = 'bgdarkmore white';
  cityTimeBtn = btn;
  curTimeCity = btn.innerHTML;
  if (curTimeCity == 'GMT') curTimeCity = 'LON';
  updateCityTime();
}

//-- bookmarks/favorites --

function addPageBookmark(title, url) {
  title = title || document.title; 
  url = url || location.href;
  try {
    if (window.sidebar) { // Firefox
      window.sidebar.addPanel(title, url, '');
      return true;
    } else if (window.external) { // IE
      window.external.AddFavorite(url, title);
      return true;
    } else if (window.opera) { // Opera
      var el = document.createElement('A');
      el.setAttribute('href', url);
      el.setAttribute('title', title);
      el.setAttribute('rel', 'sidebar');
      el.click();
      return true;
    }
  } catch(e) {}
  return false;
}


  
  // TODO: вычислить, где ещё toggleTab и уничтожить
  function toggleTab(el) {
    var d = $z('tab-toggle');
    if (d) {
      d = d.getElementsByTagName('DIV');       
      var t = [];
      var j=0;
      for(var i=0, l=d.length; i<l; i++) if(d[i].className == 'tab-item') {t[j] = d[i]; j++ }
      for(var i=0, l=t.length; i<l; i++) {
       if(el != t[i] && t[i].offsetHeight) zoom(t[i], '-');
      } 
      zoom(el, '+')
    }
  }
  


/* controls */

if (!Finam) {var Finam = {};}

Finam.Controls = {};

Finam.Controls.Calendar = {
	check: function(elm) {
		var frm = elm.form;
		if (frm != null && elm.name.indexOf('__') != -1) {
			var name = elm.name.substr(0, elm.name.indexOf('__'));
			var day = parseInt(frm.elements[name + '__day'].value, 10);
			var month = parseInt(frm.elements[name + '__month'].value, 10) + 1;
			var year = parseInt(frm.elements[name + '__year'].value, 10);
			year = isNaN(year) ? (new Date()).getYear() : Math.abs(year);
			if (year < 1900) {
				year = (new Date()).getYear();
			}
			var isLeapYear = (year % 4 == 0) && ((year % 100 != 0) || (year % 400 == 0));
			var months = [31, 28 + (isLeapYear ? 1 : 0), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
			day = isNaN(day) ? 1 : (day < 0 ? 1 : (day > months[month - 1] ? months[month - 1] : Math.abs(day)));
			frm.elements[name + '__day'].value = day;
			frm.elements[name + '__year'].value = year;
			frm.elements[name].value = year + '-' + (month < 10 ? '0' : '') + month + '-' + (day < 10 ? '0' : '') + day;
		}
	},
	select: function(elm) {
		//TODO: свой выбор даты
		var name = elm.href.substring(elm.href.indexOf('#') + 1, elm.href.length);
		var frm = null;
		while (elm.parentNode != null) {
			elm = elm.parentNode;
			if (elm.tagName == 'FORM') {
				frm = elm;
				break;
			}
		}
		if (frm != null) {
			var width = 171;
			var height = 169;
			if (screen) {
				var x = Math.floor((screen.width - width )/ 2);
				var y = Math.floor((screen.height - height) / 2)
			} else {
				var x = 0;
				var y = 0;
			}
			var e = frm.elements;
			e[name + '__day'].id = frm.name + '__' + name + '__day';
			e[name + '__month'].id = frm.name + '__' + name + '__month';
			e[name + '__year'].id = frm.name + '__' + name + '__year';
			Finam.Controls.Calendar.setDate = function(day, month, year) {
				e[name + '__day'].value = day;
				e[name + '__month'].selectedIndex = month - 1;
				e[name + '__year'].value = year;
				e[name].value = year + '-' + (month < 10 ? '0' : '') + month + '-' + (day < 10 ? '0' : '') + day;
			}
			var url = '/Calendar.asp?f=Finam.Controls.Calendar.setDate&day=' + parseInt(e[name + '__day'].value) + '&month=' + (parseInt(e[name + '__month'].value) + 1) + '&year=' + parseInt(e[name + '__year'].value) + '&l=1';
			//if (window.showModelessDialog != undefined) {
			//	var win = window.showModelessDialog(url, 'Calendar', 'scroll:0;unadorned:0;center:1;edge:0;status:0;help:0;resizable:0;dialogWidth:' + width + 'px;dialogHeight:' + height + 'px');
			//} else {
				var win = window.open(url, 'Calendar', 'resizable=0,left=' + x + 'px,top=' + y + 'px,width=' + width + 'px,height=' + height + 'px,scrollbars=0');
			//}
			win.focus();
		}
	}
};

/* UI */
if (Finam.Menu == undefined) { Finam.Menu = {}; }

Finam.Menu.Utils = {
	closeFunctions: [],
	init: function() {
		var self = this;
		setupEvent(document, 'keydown', function(event) {
			self.closeMenuFunctionsOnEsc(event);
		});
		setupEvent(document, 'mousedown', function(event) {
			self.closeMenuFunctionsOnClick(event);
		});
	},
	registerCloseFunction: function(func) {
		this.closeFunctions[this.closeFunctions.length] = func;
	},
	closeMenuFunctionsOnEsc: function(event) {
		if (event.keyCode == 27) {
			var el = document; //(event.target || event.srcElement);
			for (var i = 0; i < this.closeFunctions.length; i++) {
				this.closeFunctions[i](el);
			}
		}
	},
	closeMenuFunctionsOnClick :function(event) {
		if (isLeftButtonEvent(event)) {
			var el = (event.target || event.srcElement);
			for (var i = 0; i < this.closeFunctions.length; i++) {
				this.closeFunctions[i](el);
			}
		}
	}
}
Finam.Menu.Utils.init();

Finam.Menu.Utils.registerCloseFunction(function(el) {
	el = el || document;
	while (el && el != mainMenu && el != mainMenuBtn) {
		el = el.parentNode;
	}
	if (el != mainMenu && el != mainMenuBtn) {
		setMainMenuState(false);
	}
});


Finam.Menu.ButtonBar = {
	selected: null,
	init: function() {
		var self = this;
		Finam.Menu.Utils.registerCloseFunction(function(el) {
			el = el || document;
			if (el && el.className != 'arrow' && el.className != 'hidden-menu-cont') {
				while (el && el.parentNode && el.className != 'arrow' && el.className != 'hidden-menu-cont') {
					el = el.parentNode;
				}
			}
			if (self.selected != null && el.className != 'arrow' && el.className != 'hidden-menu-cont') {
				self.hide(self.selected);
				self.selected = null;
			}
		});
	},
	show: function(name) {
		if (name != this.selected) {
			if (this.selected != null) {
				this.hide(this.selected);
			}
			zoom(name + '-hide-menu');
			this.selected = name;
		} else {
			this.hide(this.selected);
			this.selected = null;
		}
	},
	hide: function(name) {
		zoom(name +'-hide-menu', '-');
	}
};
Finam.Menu.ButtonBar.init();
