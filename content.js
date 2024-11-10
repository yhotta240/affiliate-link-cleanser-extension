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
    if (!tweetTextElement) return;

    const htmlContent = tweetTextElement.innerHTML;
    const text = tweetTextElement.innerText;

    if (text.includes("オリジナル URL")) return;

    const aTagPattern = /<a [^>]*href="https:\/\/t\.co\/[^"]*"[^>]*>[\s\S]*?<\/a>/g;
    const anchorTags = htmlContent.match(aTagPattern);
    const urlPattern = /https:\/\/al\.dmm\.co\.jp\/[^\s]+/g;
    const urls = text.match(urlPattern);

    if (urls && anchorTags) {
      // console.log("anchorTags", anchorTags);
      // console.log("urls", urls);
      const cleanedUrls = urls.map(url => url.replace(/[」】]$/, ''));

      // 各URLを処理
      let tweetHtml = htmlContent;

      anchorTags.forEach((aTag, index) => {
        // console.log("index:", index);
        const originalUrl = extractUrl(cleanedUrls[index]);
        const aTagIndex = tweetHtml.indexOf(aTag);
        const aTagLength = aTag.length;

        const untilATag = tweetHtml.slice(0, aTagIndex + aTagLength);
        const parser = new DOMParser();
        const doc = parser.parseFromString(untilATag, 'text/html');
        const allATags = doc.querySelectorAll('a');
        const aTagElement = allATags[allATags.length - 1];  // 最後の <a> タグ

        let preATag = aTagElement ? aTagElement.previousElementSibling : null;
        while (preATag && (preATag.tagName === 'BR' || preATag.tagName === 'STRONG')) {
          preATag = preATag.previousElementSibling;
        }

        // console.log("preATag:", preATag.textContent);
        const isLineBreak = /\s$/.test(preATag.textContent);
        const preATagContent = preATag.textContent;
        const lineBreakPositions = [...preATagContent.matchAll(/\n/g)].map(match => match.index);
        const splitIndex = lineBreakPositions.length >= 1 ? lineBreakPositions[lineBreakPositions.length - 1] : -1;

        let mainText = preATagContent;
        let specialChar = "";
        
        if (splitIndex !== -1) {
          mainText = preATagContent.slice(0, splitIndex);
          specialChar = preATagContent.slice(splitIndex).trim();
        }

        // console.log("mainText:", mainText);
        // console.log("specialChar:", specialChar);

        let prePreATagHTML = '';
        let sibling = isLineBreak ? preATag : preATag.previousElementSibling;

        while (sibling) {
          prePreATagHTML = sibling.outerHTML + prePreATagHTML;
          sibling = sibling.previousElementSibling;
        }

        // 正規化されたURLを表示
        const originalUrlLink = `<a href="${originalUrl}" style="text-overflow: unset; color: rgb(29, 155, 240);">${originalUrl} </a>`;
        const replacementText = (isLineBreak ? "" : `<span>${mainText}</span><br>`)
          + `<strong style="color: #ff6600;">オリジナル URL:</strong><br>${originalUrlLink}<br>`
          + `<div  style="color: gray;">アフィリエイトリンク:</div>`
          + (isLineBreak ? "" : `<span>${specialChar}</span>`)
          + `<s>${aTag}</s>`;
        tweetHtml = prePreATagHTML + replacementText + tweetHtml.slice(aTagIndex + aTagLength);
        // console.log("tweetHtml:", tweetHtml);
      });

      tweetTextElement.innerHTML = tweetHtml;
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


