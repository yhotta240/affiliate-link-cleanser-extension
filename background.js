// 初期化
let context = 'all';
let title = "Affiliate Link Cleanser";
let isEnabled = false;


// 拡張機能がインストールされたときに実行される処理
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ isEnabled: isEnabled });
  chrome.contextMenus.create({
    title: `${title}${isEnabled ? ': 無効にする' : ': 有効にする'}`,
    contexts: [context], 
    id: "affiliateLinkCleanser" 
  });
});


// ストレージの値が変更されたときに実行される処理
chrome.storage.onChanged.addListener((changes) => {
  if (changes.isEnabled) {
    isEnabled = changes.isEnabled.newValue;
  }
  updateContextMenu(); 
});


// コンテキストメニューの項目がクリックされたときに実行される処理
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "affiliateLinkCleanser") {
    isEnabled = !isEnabled;
    chrome.storage.local.set({ isEnabled: isEnabled });

    updateContextMenu(); 
  }
});


// メッセージを受信したときに実行される処理
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.keyEnabled) {
    isEnabled = !isEnabled;
    chrome.storage.local.set({ isEnabled: isEnabled });

    updateContextMenu();
  }
});


// タブが更新されたときに実行される処理
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete') {
    chrome.storage.local.get('isEnabled', (data) => {
      isEnabled = data.isEnabled !== undefined ? data.isEnabled : isEnabled;

      updateContextMenu();
    });
  }
});


// コンテキストメニューを更新する関数
function updateContextMenu() {
  chrome.contextMenus.remove("affiliateLinkCleanser", () => {
    if (!chrome.runtime.lastError) {
      chrome.contextMenus.create({
        title: `${title}${isEnabled ? ': 無効にする' : ': 有効にする'}`,
        contexts: [context], 
        id: "affiliateLinkCleanser" 
      });
    }
  });
}

