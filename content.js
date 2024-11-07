let isEnabled = false;
// タイムラインの変化を監視
const observer = new MutationObserver(() => {
  getTweetTexts();
});
// Sampleツールの有効/無効を処理する関数
const handleSampleTool = (isEnabled) => {
  if (isEnabled) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    observer.disconnect();
  }
};


// 最初の読み込みまたはリロード後に実行する処理
chrome.storage.local.get(['settings', 'isEnabled'], (data) => {
  isEnabled = data.isEnabled !== undefined ? data.isEnabled : isEnabled;
  handleSampleTool(isEnabled);
});


// ストレージの値が変更されたときに実行される処理
chrome.storage.onChanged.addListener((changes) => {
  isEnabled = changes.isEnabled ? changes.isEnabled.newValue : isEnabled;
  handleSampleTool(isEnabled);
});


function getTweetTexts() {
  const tweetElements = document.querySelectorAll('[data-testid="cellInnerDiv"]');
  tweetElements.forEach(tweetElement => {
    const tweetTextElement = tweetElement.querySelector('[data-testid="tweetText"]');
    if (tweetTextElement) {
      const text = tweetTextElement.innerText;

      if (text.includes("オリジナル URL")) {
        return;  // すでに処理済みなのでスキップ
      }
      // const urlPattern = new RegExp(userUrls.map(url => url.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1")).join('|') + '[^\\s]+', 'g');
      // URLを抽出するための正規表現
      const urlPattern = /https:\/\/al\.dmm\.co\.jp\/[^\s]+/g;
      const urls = text.match(urlPattern);
      // console.log(urls);
      if (urls) {
        const cleanedUrls = urls.map(url => url.replace(/…[」】]$/, ''));
        const affiliateUrls = [];
        affiliateUrls.push(...cleanedUrls);
        const url = extractUrl(affiliateUrls[0]);
        const formattedText = `<strong style="color: #2d87f0;">オリジナル URL:</strong><br><a href="${url}" target="_blank" style="color: #ff6600; text-decoration: underline;">${url}</a><br><br>${text.replace(affiliateUrls[0], `<del>${shortenUrl(affiliateUrls[0])}</del>`)}`;
        tweetTextElement.innerHTML = formattedText;
      }
    }
  });
}

function shortenUrl(url, maxLength = 20) {
  if (url.length > maxLength) {
    return url.slice(0, maxLength) + '…' + url.slice(-maxLength / 2);
  }
  return url;
}

function extractUrl(affiliateUrl) {
  const urlParams = new URLSearchParams(new URL(affiliateUrl).search);
  const encodedOriginalUrl = urlParams.get('lurl');
  
  if (encodedOriginalUrl) {
    let originalUrl = decodeURIComponent(encodedOriginalUrl);
    const cleanUrl = originalUrl.split('?')[0].split('#')[0];

    return cleanUrl;
  } else {
    return '元のURLが見つかりません';
  }
}

