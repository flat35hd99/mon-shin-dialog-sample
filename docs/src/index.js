require('formdata-polyfill');
import {nameToQuestionaireJP} from './nameToQuestionaireJP.js'
import {nameToQuestionaireEN} from './nameToQuestionaireEN.js'

//------------------------------------------------------------------------------------------
// DOM の 使用可否等を切り替えて、その結果を Console に出力する関数群
//-----------------------------------------------------------------------------------------
const DEBUG_MODE = true;  //デバッグ完了後に false に変更
function toggleDomDisabled(manupulateDom, toggle, outputResult=false) {
  toggleDomAttribute(manupulateDom, toggle, 'disabled', outputResult);
}
function toggleDomChecked(manupulateDom, toggle, outputResult=false) {
  toggleDomAttribute(manupulateDom, toggle, 'checked', outputResult);
}
function toggleDomVisible(manupulateDom, toggle, outputResult=false) {
  toggleDomAttribute(manupulateDom, toggle, 'visible', outputResult);
}
function toggleDomAttribute(manupulateDom, toggle, attribute, outputResult=false) {
  if (attribute == 'disabled') {
    manupulateDom.disabled = toggle;
  } else if (attribute == 'checked') {
    manupulateDom.checked = toggle;
  } else if (attribute == 'visible') {
    manupulateDom.style.visibility = toggle;
  }
  if (outputResult) {
    outputResultToConsole(manupulateDom, attribute);
  }
} 
function outputResultToConsole(manupulateDom, attribute) {
  switch(attribute) {
    case 'disabled':
      console.log(manupulateDom.id + '.' + attribute + '=' + manupulateDom.disabled);
      break;
    case 'checked':
      console.log(manupulateDom.id + '.' + attribute + '=' + manupulateDom.checked);
      break;
    case 'visible':
      console.log(manupulateDom.id + '.' + attribute + '=' + manupulateDom.style.visibility);
      break;
    }  
}


//------------------------------------------------------------------------------------------
// DOM の Name 属性と投稿文に使う質問文を結びつけた Map を返す
//-----------------------------------------------------------------------------------------
function linkNameToQuestionaire() {
  let nameToQuestionaire = new Map();
  // let postLogAlertText = '';
  if (document.documentElement.lang == 'ja') {
    nameToQuestionaireJP.forEach((value, key) => {
      nameToQuestionaire.set(key, value);
    });
    nameToQuestionaire.set('postWriteToolLogAlert', '\n*※ファームウェア書き込み時のログを別途投稿します*')
    nameToQuestionaire.set('postBuildLogAlert', '\n*※ファームウェアビルド時のログを別途投稿します*')
  } else if (document.documentElement.lang == 'en') {
    nameToQuestionaireEN.forEach((value, key) => {
      nameToQuestionaire.set(key, value);
    });
    nameToQuestionaire.set('postWriteToolLogAlert', '\n*※I will post firmware writing tool log separetely.*')
    nameToQuestionaire.set('postBuildLogAlert', '\n*※I will post firmware build log separetely.*')
  }
  return nameToQuestionaire;
}

//------------------------------------------------------------------------------------------
// clipboard.js
//-----------------------------------------------------------------------------------------
function setupClipboardJS() {
  // Tooltip 
  $('#copyBtn').tooltip({
    trigger: 'click',
    placement: 'bottom'
  }); 
  function setTooltip(message) {
    $('#copyBtn').tooltip('hide')
      .attr('data-original-title', message)
      .tooltip('show');
  } 
  function hideTooltip() {
    setTimeout(() => {
      $('#copyBtn').tooltip('hide');
    }, 1000);
  }

  // Clipboard 
  let clipboard = new ClipboardJS('#copyBtn');
  clipboard.on('success', (e) => {
    setTooltip('Copied!');
    hideTooltip();
  }); 
  clipboard.on('error', (e) => {
    setTooltip('Failed!');
    hideTooltip();
  }); 
}

//------------------------------------------------------------------------------------------
// 選択したマイコンに応じてテキストボックスなどの使用可否を切り替える
//-----------------------------------------------------------------------------------------
function microcontrollerNameLinked(e) {
  const microcontrollerNameLinked = document.getElementById("microcontrollerNameInput");
  const bleMicroProWebConfigurator = document.getElementById("bleMicroProWebConfigurator");
  const promicroOnlyYes = document.getElementById("promicroOnlyYes");
  const promicroOnlyNo = document.getElementById("promicroOnlyNo");
  const noUseConthrough = document.getElementById("noUseConthrough");
  switch (e.target.id) {
    case "blemicropro": 
      toggleDomDisabled(microcontrollerNameLinked, true, DEBUG_MODE);
      toggleDomDisabled(bleMicroProWebConfigurator, false, DEBUG_MODE);
      toggleDomChecked(noUseConthrough, false, DEBUG_MODE);
      toggleDomDisabled(promicroOnlyYes, false, DEBUG_MODE);
      toggleDomDisabled(promicroOnlyNo, false, DEBUG_MODE); 
      break;
    case "atmega328":
    case "atmega32u4":
      toggleDomDisabled(microcontrollerNameLinked, true, DEBUG_MODE);
      toggleDomDisabled(bleMicroProWebConfigurator, true, DEBUG_MODE);
      toggleDomChecked(bleMicroProWebConfigurator, false, DEBUG_MODE);
      toggleDomChecked(noUseConthrough, true, DEBUG_MODE);
      toggleDomDisabled(promicroOnlyYes, true, DEBUG_MODE); 
      toggleDomDisabled(promicroOnlyNo, true, DEBUG_MODE); 
      break;
    case "othersMicrocontroller":
    case "microcontrollerNameInput":
      toggleDomDisabled(microcontrollerNameLinked, false, DEBUG_MODE);
      toggleDomDisabled(bleMicroProWebConfigurator, true, DEBUG_MODE);
      toggleDomChecked(bleMicroProWebConfigurator, false, DEBUG_MODE);
      toggleDomChecked(noUseConthrough, true, DEBUG_MODE);
      toggleDomDisabled(promicroOnlyYes, true, DEBUG_MODE); 
      toggleDomDisabled(promicroOnlyNo, true, DEBUG_MODE); 
      break;
    default:
      // ProMicro と Elite-C は連動させる項目が無いので、初期状態に戻す。
      toggleDomDisabled(microcontrollerNameLinked, true, DEBUG_MODE);
      toggleDomDisabled(bleMicroProWebConfigurator, true, DEBUG_MODE);
      toggleDomChecked(bleMicroProWebConfigurator, false, DEBUG_MODE);
      toggleDomChecked(noUseConthrough, false, DEBUG_MODE);
      toggleDomDisabled(promicroOnlyYes, false, DEBUG_MODE); 
      toggleDomDisabled(promicroOnlyNo, false, DEBUG_MODE); 
      break;
  }
}

//------------------------------------------------------------------------------------------
// 選択したOSに応じてテキストボックスの使用可否を切り替える
//-----------------------------------------------------------------------------------------
function linkOsNameAndTextbox(e) {
  // Checkboxに応じて使用可否を切り替えるTextboxは、並列関係にあるので、
  // 一旦親要素を取得して、その親要素に含まれるDOM要素として取得している。
  const parentFormGroupDiv = e.target.closest('.form-group')
  const inputList = parentFormGroupDiv.querySelectorAll('.form-control')
  for (const input of inputList) {
    // 使用可能にする必要があるテキストボックスの`name`には、選択したOSの名前を含めている。
    if (input.name.includes(e.target.id)) {
      toggleDomDisabled(input, false, DEBUG_MODE);
    } else {
      toggleDomDisabled(input, true, DEBUG_MODE);
      input.value = "";
    }
  }
}

//------------------------------------------------------------------------------------------
// 現在起きている問題に合わせてテキストエリアの使用可否を切り替える
//-----------------------------------------------------------------------------------------
function linkProblemAndTextbox(e) {
  if (e.target.id === 'noInput') {
    toggleDomDisabled(document.getElementById('noInputTextarea'), !e.target.checked, DEBUG_MODE);
  }
  if (e.target.id === 'notExpect') {
    toggleDomDisabled(document.getElementById('notExpectTextarea'), !e.target.checked, DEBUG_MODE);
  }
  if (e.target.id === 'notActionOneHand') {
    toggleDomDisabled(document.getElementById('notActionOneHandTextarea'), !e.target.checked, DEBUG_MODE);
  }
  if (e.target.id === 'ledOff') {
    toggleDomDisabled(document.getElementById('ledOffTextarea'), !e.target.checked, DEBUG_MODE);
  }
  if (e.target.id === 'otherProblem') {
    toggleDomDisabled(document.getElementById('otherProblemTextarea'), !e.target.checked, DEBUG_MODE);
  }
}

//------------------------------------------------------------------------------------------
// ファームウェア書き込みツールとビルド時のログも投稿するよう指示するメッセージを表示する
//-----------------------------------------------------------------------------------------
function displayPostLogAlert(e) {
  const postWriteToolLogAlert = document.getElementById('postWriteToolLogAlert');
  const postBuildLogAlert = document.getElementById('postBuildLogAlert');
  if (e.target.id == 'writeErrorQmk') {
    if (e.target.checked) {
      toggleDomVisible(postWriteToolLogAlert, 'visible', true);
    } else {
      toggleDomVisible(postWriteToolLogAlert, 'hidden', true);
    }
  } else if (e.target.id == 'buildErrorQmk') {
    if (e.target.checked) {
      toggleDomVisible(postBuildLogAlert, 'visible', true);
    } else {
      toggleDomVisible(postBuildLogAlert, 'hidden', true);
    }
  }
}

//------------------------------------------------------------------------------------------
// 左右分割型のキーボードの時だけ、左右分離型の質問を回答可能にする。
// target.checked = false になるのは、一度チェックしてから解除した時だけ。
//-----------------------------------------------------------------------------------------
function splitKeyboardLinked(e) {
  const notActionOneHand = document.getElementById("notActionOneHand");
  const notActionOneHandTextarea = document.getElementById("notActionOneHandTextarea");
  if (e.target.id == "split") {
    if (e.target.checked) {
      toggleDomDisabled(notActionOneHand, false, DEBUG_MODE);
    } else {
      toggleDomDisabled(notActionOneHand, true, DEBUG_MODE);
      toggleDomChecked(notActionOneHand, false, DEBUG_MODE);
      toggleDomDisabled(notActionOneHandTextarea, true, DEBUG_MODE);
      document.getElementById("notActionOneHandTextarea").value = "";
    }
  } 
}

//------------------------------------------------------------------------------------------
// 配線方法毎の補足情報の表示・非表示切り替え機能
//-----------------------------------------------------------------------------------------
function wiringMethodLinked(e) {
  const spanList = e.target.closest('.form-group').getElementsByTagName('span');
  for (const span of spanList) {
    // 表示させる補足情報は、選択したラジオボタンと同じ`data-wiringindex`を持つ`span`タグ。
    if (span.dataset.wiringindex === e.target.dataset.wiringindex) {
      span.classList.remove('invisible');
    } else {
      if (!(span.classList.contains('invisible'))) {
        span.classList.add('invisible');
      }
    }
  }
}

//------------------------------------------------------------------------------------------
// キーボード名入力ボックスのオートコンプリート用のデータ登録
//-----------------------------------------------------------------------------------------
function generateKeyboardList() {
  const domKeyboardList = document.getElementById("keyboardList");
  fetch('https://api.qmk.fm/v1/keyboards')
  .then(response => {
    if (!response.ok) {
      throw new Error('Response not success.');
    }
      return response.text();
  }) 
  .then(data => {
    const keyboardList = data.split(',');
    return keyboardList;
  })
  .then(keyboardList => {
    for (let keyboard of keyboardList) {
      const option = document.createElement('option');  
      option.value = keyboard.replace(/\"/g, '');
      domKeyboardList.appendChild(option);
    };
  })
  .catch(error => console.error('There has been a problem with your fetch operation:', error));
}

//------------------------------------------------------------------------------------------
// フォームに入力されたデータから投稿文を生成する
//-----------------------------------------------------------------------------------------
function generatePostText(nameToQuestionaire) {
  const form = document.getElementById("questionForm");
  const form_data = new FormData(form); 
  const postsText = document.getElementById("postsText");
  const ex = /\n\n$/gi;
  let userText = '';

  postsText.value = '';

  for (let key of form_data.keys()) {
    if (nameToQuestionaire.has(key)) {
      if (key === 'writeErrorQmk') {
        userText = '__**' + nameToQuestionaire.get(key) + '**__\n' +  form_data.get(key) + nameToQuestionaire.get('postWriteToolLogAlert');
        postsText.value += userText + "\n\n";
      } else if (key === 'buildErrorQmk') {
        userText = '__**' + nameToQuestionaire.get(key) + '**__\n' +  form_data.get(key) + nameToQuestionaire.get('postBuildLogAlert');
        postsText.value += userText + "\n\n";
      } else {
        userText = '__**' + nameToQuestionaire.get(key) + '**__\n' +  form_data.get(key);
        postsText.value += userText + "\n\n";
      }
    }
  }
  postsText.value = postsText.value.replace(ex, ''); 
  fixedTextBoxHeight(postsText);
  checkDiscordLimit(postsText);
}

//------------------------------------------------------------------------------------------
// 投稿文の行数に合わせてテキストボックスの高さを調整
//------------------------------------------------------------------------------------------
function fixedTextBoxHeight(postsText) {
  if (postsText.scrollHeight > postsText.clientHeight) {
    postsText.style.height = postsText.scrollHeight + "px";
  }
}

//------------------------------------------------------------------------------------------
// Discord の投稿欄の制限（文字数＋行数が2002になると貼付け不可）対策
//-----------------------------------------------------------------------------------------
function checkDiscordLimit(postsText) {
  const character = postsText.value.length;
  const lineBreak = (postsText.value.match(/\n/g)||[]).length;
  const alertTextDiscord = document.getElementById('alertTextDiscord');
  const announceLabel = document.getElementById('announceLabel');
  const replace = document.getElementById('replaceDom');
  const copyBtn = document.getElementById('copyBtn');

  document.getElementById('characterAndLines').innerText = character + lineBreak;

  if (character + lineBreak > 2001) {
    if (!(alertTextDiscord === null)) {
      return;
    } else {
      const p = document.createElement('p');
      const span = document.createElement('span');
      span.classList.add('bg-warning', 'm-1', 'p-1');
      if (document.documentElement.lang == 'ja') {
        span.textContent = 'Discord の投稿欄の制限は「文字数＋行数 ≦ 2001」です。';
      } else if(document.documentElement.lang == 'en') {
        span.textContent = 'Limitation of Discord  is "character + line ≦ 2001".';
      }
      p.id = 'alertTextDiscord';
      p.appendChild(span);
      replace.appendChild(p);
      copyBtn.disabled = true;
      copyBtn.classList.remove('btn-primary');
      copyBtn.classList.add('btn-secondary');
    }
    announceLabel.style.textDecoration = 'line-through';
  } else {
    if (!(alertTextDiscord === null)) {
      replace.removeChild(alertTextDiscord);
    }
    announceLabel.style.textDecoration = 'none';
    copyBtn.disabled = false;
    copyBtn.classList.remove('btn-secondary');
    copyBtn.classList.add('btn-primary');
  }
}


//------------------------------------------------------------------------------------------
// 初期化処理
//------------------------------------------------------------------------------------------
(() => {
  //------------------------------------------------------------------------------------------
  // 投稿文フォームの前処理
  //----------------------------------------------------------------------------------------- 
  document.getElementById('postWriteToolLogAlert').style.visibility = 'hidden';
  document.getElementById('postBuildLogAlert').style.visibility = 'hidden';
  document.getElementById("resetBtn").addEventListener("click", (e) => document.forms["form"].reset()); 
  generateKeyboardList();
  const nameToQuestionaire = linkNameToQuestionaire();
  setupClipboardJS();

  //------------------------------------------------------------------------------------------
  // "input" イベントに投稿文をリアルタイムで作成する処理などを割り当て
  //-----------------------------------------------------------------------------------------
  document.getElementById("questionForm").addEventListener("input", (e) => { 

    //------------------------------------------------------------------------------------------
    // 入力内容に応じてラジオボックスなどの使用可否を切り替える
    //-----------------------------------------------------------------------------------------
    switch (e.target.name) {
      case "microcontroller":
        microcontrollerNameLinked(e);
        break;
      case "osName":
        linkOsNameAndTextbox(e);
        break;
      case "keyboardForm":
        splitKeyboardLinked(e);
        break;
      case "wiring":
  			wiringMethodLinked(e);
        break;
      case "writeErrorQmk":
        displayPostLogAlert(e);
        break;
      case "buildErrorQmk":
        displayPostLogAlert(e);
        break;
      default:
        break;
    }
    linkProblemAndTextbox(e);

    //------------------------------------------------------------------------------------------
    // 投稿文を作成
    //-----------------------------------------------------------------------------------------
    generatePostText(nameToQuestionaire);

  }); 
})();
