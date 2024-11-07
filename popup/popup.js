// 初期化処理
let isEnabled = false; // ツールの有効状態を示すフラグ（初期値はfalse）
const enabledElement = document.getElementById('enabled'); // チェックボックス（トグルボタン）要素を取得
const panelButton  = document.getElementById('panelButton');
const messagePanel = document.getElementById('messagePanel');
const messageDiv = document.getElementById('message'); // メッセージ表示用のdiv要素を取得


// チェックボックス（トグルボタン）の状態が変更されたとき，ツールの有効/無効状態を更新
enabledElement.addEventListener('change', (event) => {
  isEnabled = event.target.checked; // チェックボックス（トグルボタン）の選択状態を取得

  // 現在の有効/無効状態をストレージに保存
  chrome.storage.local.set({ isEnabled: isEnabled }, () => {
    // 有効/無効状態に応じてメッセージを出力
    messageOutput(dateTime(), isEnabled ? 'Affiliate Link Cleanserは有効になっています' : 'Affiliate Link Cleanserは無効になっています');
  });
});


// 保存された設定（'settings'と'isEnabled'）を読み込む
chrome.storage.local.get(['settings', 'isEnabled'], (data) => {
  if (enabledElement) {
    isEnabled = data.isEnabled || false; // 'isEnabled'が未設定の場合はデフォルトでfalseを使用
    enabledElement.checked = isEnabled; // チェックボックス（トグルボタン）の状態を'isEnabled'の値に設定
  }
  // 有効/無効状態に応じてメッセージを出力
  messageOutput(dateTime(), isEnabled ? 'Affiliate Link Cleanserは有効になっています' : 'Affiliate Link Cleanserは無効になっています');
});


// DOMの読み込み完了を監視し，完了後に実行
document.addEventListener('DOMContentLoaded', function () {

  // メッセージパネルの表示・非表示を切り替える
  panelButton.addEventListener('click', function () {
    // メッセージパネルの高さを指定（必要に応じて調整可能）
    const panelHeight = '170px';

    if (messagePanel.style.height === panelHeight) {
      // パネルが開いている場合は閉じる
      messagePanel.style.height = '0';
      panelButton.textContent   = 'メッセージパネルを開く';
    } else {
      // パネルが閉じている場合は開く
      messagePanel.style.height = panelHeight;
      panelButton.textContent   = 'メッセージパネルを閉じる';
    }
  });

  // 情報タブ: 
  // ストアリンクのクリックイベントを設定
  const storeLink = document.getElementById('store_link');
  if (storeLink) clickURL(storeLink);
  // manifest.jsonから拡張機能の情報を取得
  const manifestData = chrome.runtime.getManifest();
  // 各情報をHTML要素に反映
  document.getElementById('extension-id').textContent = `${chrome.runtime.id}`;
  document.getElementById('extension-name').textContent = `${manifestData.name}`;
  document.getElementById('extension-version').textContent = `${manifestData.version}`;
  document.getElementById('extension-description').textContent = `${manifestData.description}`;
  // シークレットモードでのアクセス権を確認し，結果を表示
  chrome.extension.isAllowedIncognitoAccess((isAllowedAccess) => {
    document.getElementById('incognito-enabled').textContent = `${isAllowedAccess ? '有効' : '無効'}`;
  });
  // GitHubリンクのクリックイベントを設定
  const githubLink = document.getElementById('github-link');
  if (githubLink) clickURL(githubLink);

});


// 設定をストレージに保存する関数
function saveSettings(datetime, message, value) {
  const settings = {
    blurValue: value, // ぼかしの設定値
  };

  // ストレージに設定を保存し，保存完了後にメッセージを出力
  chrome.storage.local.set({ settings: settings }, () => {
    messageOutput(datetime, message); // 保存時の日時とメッセージを出力
  });
}


// popup.html内のリンクを新しいタブで開けるように設定する関数
// linkにはgetElementByIdで取得した要素またはURL文字列を渡す
function clickURL(link) {
  const url = link.href ? link.href : link; // linkが要素ならhref属性からURLを取得，URL文字列ならそのまま使用

  // linkがHTML要素の場合のみクリックイベントを設定
  if (link instanceof HTMLElement) {
    link.addEventListener('click', (event) => {
      event.preventDefault(); // デフォルトのリンク遷移を防止
      chrome.tabs.create({ url }); // 新しいタブでURLを開く
    });
  }
}


// メッセージを指定した日時とともに出力する関数
function messageOutput(datetime, message) {
  messageDiv.innerHTML += '<p class="m-0">' + datetime + ' ' + message + '</p>'; // <p> タグで囲んでメッセージを新しい行に追加
}
// メッセージをクリアする処理
document.getElementById('messageClearButton').addEventListener('click', () => {
  messageDiv.innerHTML = '<p class="m-0">' + '' + '</p>'; // メッセージ表示エリアを空にする
});


// 現在の時間を取得する
// "年-月-日 時:分" の形式で返す（例：2024-11-02 10:52）
function dateTime() {
  const now = new Date();// 現在の日付と時刻を取得

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


