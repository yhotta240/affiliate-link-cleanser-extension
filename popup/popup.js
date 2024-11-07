// 初期化処理
let isEnabled = false; // ツールの有効状態を示すフラグ（初期値はfalse）
const enabledElement = document.getElementById('enabled');
const panelButton  = document.getElementById('panelButton');
const messagePanel = document.getElementById('messagePanel');
const messageDiv = document.getElementById('message'); 


// チェックボックス（トグルボタン）の状態が変更されたとき，ツールの有効/無効状態を更新
enabledElement.addEventListener('change', (event) => {
  isEnabled = event.target.checked;

  chrome.storage.local.set({ isEnabled: isEnabled }, () => {
    messageOutput(dateTime(), isEnabled ? 'Affiliate Link Cleanserは有効になっています' : 'Affiliate Link Cleanserは無効になっています');
  });
});


// 保存された設定（'settings'と'isEnabled'）を読み込む
chrome.storage.local.get('isEnabled', (data) => {
  if (enabledElement) {
    isEnabled = data.isEnabled || false;
    enabledElement.checked = isEnabled; 
  }
  messageOutput(dateTime(), isEnabled ? 'Affiliate Link Cleanserは有効になっています' : 'Affiliate Link Cleanserは無効になっています');
});


// DOMの読み込み完了を監視し，完了後に実行
document.addEventListener('DOMContentLoaded', function () {

  panelButton.addEventListener('click', function () {
    const panelHeight = '170px';

    if (messagePanel.style.height === panelHeight) {
      messagePanel.style.height = '0';
      panelButton.textContent   = 'メッセージパネルを開く';
    } else {
      messagePanel.style.height = panelHeight;
      panelButton.textContent   = 'メッセージパネルを閉じる';
    }
  });

  // 情報タブ: 
  const storeLink = document.getElementById('store_link');
  if (storeLink) clickURL(storeLink);
  const manifestData = chrome.runtime.getManifest();
  document.getElementById('extension-id').textContent = `${chrome.runtime.id}`;
  document.getElementById('extension-name').textContent = `${manifestData.name}`;
  document.getElementById('extension-version').textContent = `${manifestData.version}`;
  document.getElementById('extension-description').textContent = `${manifestData.description}`;
  chrome.permissions.getAll((result) => {
    let siteAccess;
    if (result.origins.length > 0) {
      if (result.origins.includes("<all_urls>")) {
        siteAccess = "すべてのサイト";
      } else {
        siteAccess = result.origins.join("<br>");
      }
    } else {
      siteAccess = "クリックされた場合のみ";
    }
    document.getElementById('site-access').innerHTML = siteAccess;
  });
  chrome.extension.isAllowedIncognitoAccess((isAllowedAccess) => {
    document.getElementById('incognito-enabled').textContent = `${isAllowedAccess ? '有効' : '無効'}`;
  });
  const githubLink = document.getElementById('github-link');
  if (githubLink) clickURL(githubLink);

});


// 設定をストレージに保存する関数
function saveSettings(datetime, message) {

  chrome.storage.local.set({ settings: settings }, () => {
    messageOutput(datetime, message);
  });
}


function clickURL(link) {
  const url = link.href ? link.href : link;

  if (link instanceof HTMLElement) {
    link.addEventListener('click', (event) => {
      event.preventDefault(); 
      chrome.tabs.create({ url });
    });
  }
}


function messageOutput(datetime, message) {
  messageDiv.innerHTML += '<p class="m-0">' + datetime + ' ' + message + '</p>';
}
document.getElementById('messageClearButton').addEventListener('click', () => {
  messageDiv.innerHTML = '<p class="m-0">' + '' + '</p>'; 
});


// 現在の時間を取得する
function dateTime() {
  const now = new Date();

  // 各部分の値を取得し2桁に整形
  const year = now.getFullYear();                                    // 年
  const month = String(now.getMonth() + 1).padStart(2, '0');         // 月（0始まりのため+1）
  const day = String(now.getDate()).padStart(2, '0');                // 日
  const hours = String(now.getHours()).padStart(2, '0');             // 時
  const minutes = String(now.getMinutes()).padStart(2, '0');         // 分

  // フォーマットした日時を文字列で返す
  const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}`;
  return formattedDateTime;
}


