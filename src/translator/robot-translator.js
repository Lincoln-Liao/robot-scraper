const map = {
  url: { keyword: 'Open Browser' },
  text: { keyword: 'Input Text', value: 'y' },
  file: { keyword: 'Choose File', value: 'y' },
  button: { keyword: 'Click Button' },
  a: { keyword: 'Click Link' },
  select: { keyword: 'Select From List By Value', value: 'y' },
  // radio:  { keyword: 'Select Radio Button', value: 'y' },
  demo: { keyword: 'Sleep    ${SLEEP}' },
  verify: { keyword: 'Wait Until Page Contains Element' },
  default: { keyword: 'Click Element' },
  source: { keyword: '${myHtml} =    Get Source' },
  focus: { keyword: 'Set Focus To Element' },
  windowSize: { keyword: 'Set Window Size   ${3400}   ${600}' },
};

const translator = {
  generateOutput(list, length, demo, verify, reAction, reActionTimes) {
    const events = this._generateEvents(list, length, demo, verify, reAction, reActionTimes);

    return events.join('\n');
  },

  generateFile(list, length, demo, verify, reAction, reActionTimes) {
    let events = this._generateEvents(list, length, demo, verify, reAction, reActionTimes);

    events = events.reduce((a, b) => `${a}    ${b}\n`, '');

    return '*** Settings ***'
      + `\nDocumentation     A test suite with a single test for ${list[0].title}`
      + "\n...               Created by hats' Robotcorder"
      + '\nLibrary           Selenium2Library    timeout=10'
      + '\nLibrary           OperatingSystem'
      + '\nLibrary           String'
      + '\n\n*** Variables ***'
      + '\n${BROWSER}    chrome'
      + '\n${SLEEP}    15'
      + '\n${CHROMEDRIVER_PATH}    /usr/bin/chromedriver'
      + '\n\n*** Test Cases ***'
      + `\n${list[0].title} test`
      + '\n    ${chrome_options}=    Evaluate    sys.modules[\'selenium.webdriver\'].ChromeOptions()  sys, selenium.webdriver'
      + '\n    Call Method    ${chrome_options}    add_argument    test-type'
      + '\n    Call Method    ${chrome_options}    add_argument    --disable-extensions'
      + '\n    Call Method    ${chrome_options}    add_argument    --headless'
      + '\n    Call Method    ${chrome_options}    add_argument    --disable-gpu'
      + '\n    Call Method    ${chrome_options}    add_argument    --no-sandbox'
      + `\n${events}`
      + '\n    Close Browser';
  },

  generateUrl(list) {
    let url = '';
    let url_tmp = '';
    for (let i = 0; i < list.length ; i++) {
      url_tmp = this._generateUrl(list[i]);
      if(url_tmp){
        url = url_tmp;
      }
    }
    return url;
  },

  _generateUrl(attr){
    let url = '';
    if(attr.type === 'url'){
      url = `${attr.path}`;
    }
    return url;
  },

  _generateFocus(attr){
    const type = map[attr.type] || map.default;
    let path = '';
    if(attr.type !== 'url'){
      path += map.focus.keyword;

      path += `    ${attr.path}`;
      path += attr.value && type.value ? `    ${attr.value}` : '';
    }

    return path;
  },

  _generatePath(attr) {
    const type = map[attr.type] || map.default;
    let path = type.keyword;

    path += attr.type === 'url' ? `    ${attr.path}    \${BROWSER}    options=\${chrome_options}    executable_path=\${CHROMEDRIVER_PATH}` : `    ${attr.path}`;
    path += attr.value && type.value ? `    ${attr.value}` : '';

    return path;
  },

  _generateWindowSize(attr) {
    let path = attr.type === 'url' ? map.windowSize.keyword : '';
    return path;
  },

  _generateDemo(demo) {
    return demo ? map.demo.keyword : '';
  },

  _generateVerify(attr) {
    return attr.path ? `${map.verify.keyword}    ${attr.path}` : '';
  },

  _generateSource() {
    return map.source.keyword;
  },

  _generateCreatFile(page) {
    return 'Create File  ' + page.toString().padStart(4, '0') + '.html  ${myHtml}';
  },

  _generateEvents(list, length, demo, verify, reAction, reActionTimes) {
    let event = null;
    const events = [];
    for (let i = 0; i < list.length && i < length; i++) {
      if(reAction && i === list.length-1){
        for(let r = 1; r <= reActionTimes ; r++){
          //Get Source
          event = this._generateSource();
          event && events.push(event);
          //Sleep
          event = this._generateDemo(demo);
          event && events.push(event);
          //Create File
          event = this._generateCreatFile(r);
          event && events.push(event);
          //Sleep
          event = this._generateDemo(demo);
          event && events.push(event);
          //focus
          event = this._generateFocus(list[i]);
          event && events.push(event);
          //Sleep
          event = this._generateDemo(demo);
          event && events.push(event);
          //click next page
          event = this._generatePath(list[i]);
          event && events.push(event);
          //Sleep
          event = this._generateDemo(demo);
          event && events.push(event);
        }
        //Get Source
        event = this._generateSource();
        event && events.push(event);
        //Sleep
        event = this._generateDemo(demo);
        event && events.push(event);
        //Create File
        event = this._generateCreatFile(parseInt(reActionTimes)+1);
        event && events.push(event);
        //Sleep
        event = this._generateDemo(demo);
        event && events.push(event);
      }else {
        if (i > 0) {
          event = this._generateVerify(list[i]);
          event && events.push(event);
        }
        event = this._generateFocus(list[i]);
        event && events.push(event);
        event = this._generateDemo(demo);
        event && events.push(event);
        event = this._generatePath(list[i]);
        event && events.push(event);
        event = this._generateWindowSize(list[i]);
        event && events.push(event);
        event = this._generateDemo(demo);
        event && events.push(event);
        if(i === list.length-1){
          //Get Source
          event = this._generateSource();
          event && events.push(event);
          //Sleep
          event = this._generateDemo(demo);
          event && events.push(event);
          //Create File
          event = this._generateCreatFile(1);
          event && events.push(event);
          //Sleep
          event = this._generateDemo(demo);
          event && events.push(event);
        }
      }
    }
    return events;
  }
};

if (typeof exports !== 'undefined') exports.translator = translator;
