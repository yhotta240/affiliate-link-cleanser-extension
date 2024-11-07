let isEnabled = false;
// タイムラインの変化を監視
const observer = new MutationObserver(() => {
  getTweetTexts();
});
// Sampleツールの有効/無効を処理する関数
const handleSampleTool = (isEnabled) => {
  if (isEnabled) {
    console.log("SampleがONになりました");
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    console.log("SampleがOFFになりました");
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



// バックグラウンドスクリプトから受け取ったHTMLを解析
// chrome.storage からデータを取得して解析
// chrome.storage.local.get('htmlText', function (result) {
//   if (result.htmlText) {
//     console.log('抽出した詳細情報:', result.htmlText);
//     const details = extractDetails(result.htmlText);

//   } else {
//     console.log('HTMLテキストがchrome.storageに保存されていません');
//   }
// });


// function extractDetails(htmlText) {
//   const parser = new DOMParser();
//   const doc = parser.parseFromString(htmlText, 'text/html');
//   const rootElement = doc.getElementById('root');
//   console.log('rootElement:', rootElement);
//   // JSON-LDのscriptタグを抽出
//   // const jsonLdScript = doc.querySelector('script[type="application/ld+json"]');
//   // console.log('抽出した詳細情報:', jsonLdScript);
//   // if (jsonLdScript) {
//   //   // JSONデータをパース
//   //   const jsonData = JSON.parse(jsonLdScript.textContent);

//   //   // 必要な情報を抽出
//   //   const productDetails = {
//   //     seriesName: jsonData.name || '', // 作品名 (シリーズ名)
//   //     author: jsonData.author?.name[0] || '', // 作家
//   //     label: jsonData.subjectOf?.url ? jsonData.subjectOf.url.split("/")[5] : '', // レーベル
//   //     publisher: jsonData.publisher?.name || '', // 出版社
//   //     categories: jsonData.genre || [], // カテゴリー（複数のジャンル）
//   //     genres: jsonData.genre || [], // ジャンル（複数）
//   //     publishDate: jsonData.dateCreated || '', // 配信開始日
//   //     fileSize: jsonData.offers?.price || '', // ファイル価格（価格はファイルサイズの代わり）
//   //     fileFormat: jsonData.offers?.priceCurrency || '' // ファイル形式（価格通貨）
//   //   };

//   //   return productDetails;
//   // } else {
//   //   console.error('JSON-LD script not found.');
//   //   return null;
//   // }
// }

