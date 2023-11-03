//-- Select emulation --

function $l(el) {
  return (typeof(el) == 'string' ? document.getElementById(el) : el);
}

function initSelect(selId, selOptionsId, params) {
  var sel = $l(selId);
  var opt = $l(selOptionsId);
  sel.optionsElement = opt;
  opt.selectElement = sel;
  var selValue = sel.getAttribute('value');
  var divs = opt.getElementsByTagName('DIV');
  var opts = [];
  var selIdx = -1;
  for (var i = 0, l = divs.length; i < l; i++) {
    var div = divs[i];
    if (div.className == 'option') continue;
    div.optionIndex = opts.length;
    if (selValue && selIdx < 0 && div.getAttribute('value') == selValue) {
      div.className = 'selected';
      selIdx = div.optionIndex;
    }
    opts.push(div);
  }
  sel.options = opts;
  sel.selectedIndex = selIdx;
  sel.selectHighlited = false;
  sel.selectText = findSubChild(sel, 'U');
  sel.selectLink = findSubChild(sel, 'SPAN');
  sel.selectButton = findSubChild(sel, 'IMG', 'select_btn');
  if (!sel.eventsInited) {
    setupEvent(sel, 'mouseover', selectMouseOver);
    setupEvent(sel, 'mouseout',  selectMouseOut);
    setupEvent(sel, 'mousedown', selectMouseDown);
    sel.eventsInited = true;
  }
  if (params) {
    for (var name in params) sel[name] = params[name];
  }
}

function getSelectByChild(el) {
  while (el) {
    if (el.tagName == 'DIV' && el.className == 'select') return el;
    el = el.parentNode;
  }
  return null;
}

function getSelectOptionInnerDiv(el) {
  while (el && (el.tagName != 'DIV' || el.className.indexOf('option') < 0)) el = el.parentNode;
  if (el) {
    var els = el.getElementsByTagName('DIV');
    el = (els.length > 0 ? els[0] : null);
  }
  return el;
}

var
  highlightedSelect;
  
function selectMouseOver(event) {
  var el = (event.target || event.toElement);
  var sel = getSelectByChild(el);
  if (sel && sel != highlightedSelect && (el == sel.selectText || (sel.selectLink && el == sel.selectLink) || el == sel.selectButton)) {
    highlightedSelect = sel;
    if (sel.activeImgName) {
      sel.passiveImgName = sel.selectButton.src;
      sel.selectButton.src = sel.activeImgName;
    } else {
      setAlpha(sel.selectText, 0.5);
//    if (sel.selectLink) setAlpha(sel.selectLink, 0.5);
      setAlpha(sel.selectButton, 0.5);
    }
  }
}

function selectMouseOut(event) {
  var el = (event.relatedTarget || event.toElement);
  var sel = getSelectByChild(el);
  if (highlightedSelect && sel != highlightedSelect) {
    if (highlightedSelect.passiveImgName) {
      highlightedSelect.selectButton.src = highlightedSelect.passiveImgName;
    } else {
      setAlpha(highlightedSelect.selectText, 1);
//    if (highlightedSelect.selectLink) setAlpha(highlightedSelect.selectLink, 1);
      setAlpha(highlightedSelect.selectButton, 1);
    }
    highlightedSelect = null;
  }
}

var
  openedSelectOptions;

function selectMouseDown(event) {
  if (!isLeftButtonEvent(event)) return;
  var el = (event.target || event.srcElement);
  var sel = getSelectByChild(el);
  if (sel.optionsElement == openedSelectOptions) {
    selectCloseOptions();
  } else if (isChildOf(el, sel.selectText) || (sel.selectLink && el == sel.selectLink) || el == sel.selectButton) {
    selectOpenOptions(sel);
  }
  cancelEvent(event, true);
  return false;
}

function selectOptionsWheelScroll(event) {
  var el = openedSelectOptions;
  var delta = (event.type == 'DOMMouseScroll' ? event.detail*20 : Math.round(-event.wheelDelta/2));
  var st = Math.max(0, Math.min(el.scrollHeight - el.clientHeight, el.scrollTop + delta));
  if (st != el.scrollTop) el.scrollTop = st;
  cancelEvent(event, true);
  return false;
}

function selectOptionsBlur(event) {
  selectCloseOptions();
}

var
  selectZoomSteps = 4;

function selectOpenOptions(sel) {
  var opt = sel.optionsElement;
  if (opt == openedSelectOptions) return;
  if (openedSelectOptions) selectCloseOptions();
  openedSelectOptions = opt;
  var selOpt = (sel.selectedIndex >= 0 ? sel.options[sel.selectedIndex] : null);
  if (selOpt != sel.selectedOption) {
    if (sel.selectedOption) sel.selectedOption.className = '';
    if (selOpt) selOpt.className = 'selected';
    sel.selectedOption = selOpt;
  }
  zoom(opt, '+', {steps: selectZoomSteps, overflow: 'keep', afterZoom: selectOptionAfterZoomIn});
  setupEvent(opt, 'mouseover', selectOptionMouseOver);
  setupEvent(opt, 'mousewheel', selectOptionsWheelScroll);
  if (isMozilla) setupEvent(opt, 'DOMMouseScroll', selectOptionsWheelScroll);
  setupEvent(opt, 'blur', selectOptionsBlur);
  setupEvent(document.body, 'mousedown', selectMouseDownInDocument);
  setupEvent(document.body, 'keydown', selectKeyDownInDocument);
  if (opt.focus) opt.focus();
}

function selectOptionAfterZoomIn() {
//if (this.action == 'show') {
//  this.obj.style.overflow = 'auto';
//  this.obj.style.overflowX = 'hidden';
//  this.obj.style.overflowY = 'scroll';
//}
}

function selectCloseOptions() {
  var opt = openedSelectOptions;
  if (!opt) return;
  openedSelectOptions = null;
  var sel = opt.selectElement;
//if (sel.selectedOption) {
//  sel.selectedOption.className = 'option';
//  sel.selectedOption = null;
//}
//opt.style.display = 'none';
  zoom(opt, '-', {steps: selectZoomSteps, overflow: 'keep'});
  removeEvent(document.body, 'mousedown', selectMouseDownInDocument);
  removeEvent(document.body, 'keydown', selectKeyDownInDocument);
  removeEvent(opt, 'mouseover', selectOptionMouseOver);
  removeEvent(opt, 'mousewheel', selectOptionsWheelScroll);
  if (isMozilla) removeEvent(opt, 'DOMMouseScroll', selectOptionsWheelScroll);
  removeEvent(opt, 'blur', selectOptionsBlur);
}

function selectFindOptionIdx(sel, el) {
  if (el) { 
    var opts = sel.options;
    for (var i = 0, l = opts.length; i < l; i++) {
      if (opts[i] == el) return i;
    }
  }
  return -1;
}

function selectOptionMouseOver(event) {
  var el = (event.target || event.toElement);
  if (el == openedSelectOptions) return;
  var sel = openedSelectOptions.selectElement;
  if (el == sel.selectedOption) return;
  el = getSelectOptionInnerDiv(el);
  if (el && selectFindOptionIdx(sel, el) >= 0) {
    if (sel.selectedOption) sel.selectedOption.className = '';
    el.className = 'selected';
    sel.selectedOption = el;
  }
}

function selectMouseDownInDocument(event) {
  if (openedSelectOptions) {
    var el = (event.target || event.srcElement);
    if (el == openedSelectOptions) return;
    if (el) {
      var sel = openedSelectOptions.selectElement;
      el = getSelectOptionInnerDiv(el);
      var i = selectFindOptionIdx(sel, el);
      var value = (el ? el.getAttribute('value') : null);
      if (i >= 0 && sel.selectedIndex != i && (!sel.onSelIndexChange || sel.onSelIndexChange(i, value))) {
        selectSetSelectedIndex(sel, i);
      }
    }
    selectCloseOptions();
    cancelEvent(event, true);
  }
}

function selectSetSelectedIndex(sel, idx) {
  var opt = sel.options[idx];
  if (opt) {
    sel.selectedIndex = idx;
    sel.value = opt.getAttribute('value');
    if (sel.selectText) sel.selectText.innerHTML = opt.innerHTML;
    opt.className = 'option selected';
  } else {
    sel.selectedIndex = -1;
    sel.value = null;
    if (sel.selectText) sel.selectText.innerHTML = '';
  }
  if (sel.selectedOption != opt) {
    if (sel.selectedOption) sel.selectedOption.className = 'option';
    sel.selectedOption = opt;
  }
}

function selectKeyDownInDocument(event) {
  if (event.keyCode == 27) selectCloseOptions();
}
