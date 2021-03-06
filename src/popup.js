/* global document $ chrome ClipboardJS */
const debug = false;
const gaAccount = 'UA-88380525-1';
const version = '0.3.0';

const host = chrome;
const storage = host.storage.local;

/*eslint-disable */
var _gaq = _gaq || [];
_gaq.push(['_setAccount', gaAccount]);
_gaq.push(['_trackPageview']);
(function() {
  var ga = document.createElement('script');
  ga.type = 'text/javascript';
  ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(ga, s);
})();
/* eslint-enable */

function logger(data) {
  if (debug) document.getElementById('textarea-log').value = data;
}

function analytics(data) {
  const versionData = data;
  if (gaAccount) {
    versionData[2] = `${version} ${data[2]}`;
    _gaq.push(versionData);
    logger(gaAccount && versionData);
  }
}

const clipboard = new ClipboardJS('#copy');

const copyStatus = (className) => {
  $('#copy').addClass(className);
  setTimeout(() => { $('#copy').removeClass(className); }, 3000);
};

clipboard.on('success', (e) => {
  copyStatus('copy-ok');
  analytics(['_trackEvent', 'copy', 'ok']);

  e.clearSelection();
});

clipboard.on('error', (e) => {
  copyStatus('copy-fail');
  analytics(['_trackEvent', 'copy', 'nok']);
  /* eslint-disable no-console */
  console.error('Action:', e.action);
  console.error('Trigger:', e.trigger);
  /* eslint-enable no-console */
});

function display(message) {
  if (message && message.message) {
    const field = document.querySelector('#textarea-script');
    field.value = message.message || '';
  }
}

function show(array, visible) {
  array.forEach((id) => {
    const element = document.getElementById(id);
    visible ? element.classList.remove('hidden') : element.classList.add('hidden');
  });
}

function enable(array, isEnabled) {
  array.forEach((id) => {
    const element = document.getElementById(id);
    isEnabled ? element.classList.remove('disabled') : element.classList.add('disabled');
  });
}

function toggle(e) {
  logger(e.target.id);
  if (e.target.id === 'record') {
    show(['stop', 'pause'], true);
    show(['record', 'resume'], false);
    enable(['settings-panel'], false);

    $('#sortable').sortable('disable');
  } else if (e.target.id === 'pause') {
    show(['resume', 'stop'], true);
    show(['record', 'pause'], false);
    enable(['settings-panel'], false);

    $('#sortable').sortable('disable');
  } else if (e.target.id === 'resume') {
    show(['pause', 'stop'], true);
    show(['record', 'resume'], false);
    enable(['settings-panel'], false);

    $('#sortable').sortable('disable');
  } else if ((e.target.id === 'stop') ) {
    show(['record'], true);
    show(['resume', 'stop', 'pause'], false);
    enable(['settings-panel'], true);

    $('#sortable').sortable('enable');
  } else if (e.target.id === 'settings') {
    analytics(['_trackEvent', 'settings', '??????']);
    document.getElementById('settings-panel').classList.toggle('hidden');
  }

  if ((e.canSave === false) || (e.target.id === 'record')) {
    document.getElementById('save').disabled = true;
  } else if ((e.canSave === true) || (e.target.id === 'stop')) {
    document.getElementById('save').disabled = false;
  }
  if (e.demo) { document.getElementById('demo').checked = e.demo; }
  if (e.reAction) { document.getElementById('reAction').checked = e.reAction;}
  if (e.reScroll) { document.getElementById('reScroll').checked = e.reScroll;}
  if (e.reActionTimes) { document.getElementById('reActionTimes').value = e.reActionTimes; }
  if (e.reScrollTimes) { document.getElementById('reScrollTimes').value = e.reScrollTimes; }
  if (typeof e.userName !== "undefined") { document.getElementById('userName').value = e.userName; }
  if (typeof e.password !== "undefined") { document.getElementById('password').value = e.password; }
  if (typeof e.projectName !== "undefined") { document.getElementById('projectName').value = e.projectName; }
}

function busy(e) {
  if ((e.isBusy === true) || (e.isBusy === false)) {
    ['record', 'stop', 'save', 'save', 'resume'].forEach((id) => {
      document.getElementById(id).disabled = e.isBusy;
    });
  }
}

function operation(e) {
  toggle(e);
  const locators = $('#sortable').sortable('toArray', { attribute: 'id' });
  host.runtime.sendMessage({ operation: e.target.id, locators }, display);

  analytics(['_trackEvent', e.target.id, '^-^']);
}

function settings(e) {
  if(e.target.id == 'reAction'){
    if(e.target.checked){
      document.getElementById('reScroll').checked = false;
    }
  }
  if(e.target.id == 'reScroll'){
    if(e.target.checked){
      document.getElementById('reAction').checked = false;
    }
  }
  const reAction = document.getElementById('reAction').checked;
  const reScroll = document.getElementById('reScroll').checked;
  const locators = $('#sortable').sortable('toArray', { attribute: 'id' });
  const demo = document.getElementById('demo').checked;
  const verify = true;
  const reActionTimes = document.getElementById('reActionTimes').value;
  const reScrollTimes = document.getElementById('reScrollTimes').value;
  const userName = document.getElementById('userName').value;
  const password = document.getElementById('password').value;
  const projectName = document.getElementById('projectName').value;
  host.runtime.sendMessage({
    operation: 'settings', locators, demo, verify, reAction, reScroll, reActionTimes, reScrollTimes, userName, password, projectName
  });
  analytics(['_trackEvent', 'setting', e.target.id]);
}

function loadLanguage(){
  analytics(['_trackEvent', 'setting', chrome.i18n.getUILanguage()]);
  document.getElementById('record').innerHTML = chrome.i18n.getMessage('record');
  document.getElementById('resume').innerHTML = chrome.i18n.getMessage('resume');
  document.getElementById('stop').innerHTML = chrome.i18n.getMessage('stop');
  document.getElementById('pause').innerHTML = chrome.i18n.getMessage('pause');
  document.getElementById('save').innerHTML = chrome.i18n.getMessage('upload');
  document.getElementById('ETLSystemAccount').innerHTML = chrome.i18n.getMessage('ETLSystemAccount');
  document.getElementById('ETLSystemPassword').innerHTML = chrome.i18n.getMessage('ETLSystemPassword');
  document.getElementById('ProjectNameMessage').innerHTML = chrome.i18n.getMessage('ProjectNameMessage');
  document.getElementById('reActionMessage').innerHTML = chrome.i18n.getMessage('reActionMessage');
  document.getElementById('times').innerHTML = chrome.i18n.getMessage('times');
  document.getElementById('reScrollMessage').innerHTML = chrome.i18n.getMessage('reScrollMessage');
  document.getElementById('times2').innerHTML = chrome.i18n.getMessage('times2');
}


document.addEventListener('DOMContentLoaded', () => {
  storage.get({
    message: 'Record',
    operation: 'stop',
    canSave: false,
    isBusy: false,
    demo: true,
    verify: true,
    reAction: false,
    reScroll: false,
    reActionTimes:1,
    reScrollTimes:1,
    userName:'',
    password:'',
    projectName:'',
    locators: []
  }, (state) => {
    display({ message: state.message });
    toggle({
      target: { id: state.operation },
      canSave: state.canSave,
      isBusy: state.isBusy,
      demo: state.demo,
      verify: true,
      reAction: state.reAction,
      reScroll: state.reScroll,
      reActionTimes: state.reActionTimes,
      reScrollTimes: state.reScrollTimes,
      userName: state.userName,
      password: state.password,
      projectName: state.projectName
    });
    setTimeout(() => {
      const sortable = document.getElementById('sortable');
      state.locators.forEach((locator) => {
        const li = document.createElement('li');
        li.appendChild(document.createTextNode(locator));
        li.setAttribute('id', locator);
        li.setAttribute('class', 'ui-state-default');
        sortable.appendChild(li);
      });
    }, 200);
  });

  debug ? document.getElementById('textarea-log').classList.remove('hidden') : 0;

  ['record', 'resume', 'stop', 'pause', 'save'].forEach((id) => {
    document.getElementById(id).addEventListener('click', operation);
  });

  ['demo','reAction','reScroll','reActionTimes','reScrollTimes','userName','password','projectName'].forEach((id) => {
    document.getElementById(id).addEventListener('change', settings);
  });

  document.getElementById('settings').addEventListener('click', toggle);

  $('#sortable').sortable({ update: settings });
  $('#sortable').disableSelection();
}, false);

host.storage.onChanged.addListener((changes, _) => {
  for (const key in changes) {
    if (key === 'isBusy') busy({ isBusy: changes.isBusy.newValue });
    if (key === 'message') display({ message: changes.message.newValue });
  }
});

window.addEventListener('load', loadLanguage);
