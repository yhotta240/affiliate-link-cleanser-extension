// 初期化
let context = 'all';
let title = "Affiliate Link Cleanser";
let isEnabled = false;


// 拡張機能がインストールされたときに実行される処理
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ isEnabled: isEnabled });
});


// ストレージの値が変更されたときに実行される処理
chrome.storage.onChanged.addListener((changes) => {
  if (changes.isEnabled) {
    isEnabled = changes.isEnabled.newValue;
  }
});


// タブが更新されたときに実行される処理
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete') {
    chrome.storage.local.get('isEnabled', (data) => {
      isEnabled = data.isEnabled !== undefined ? data.isEnabled : isEnabled;
    });
  }
});


