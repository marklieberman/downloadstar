'use strict';

let state = {
  downloads: {},
  history: []
};

browser.storage.local.get({ history: [] }).then(result => {
  state.history = result.history;
});

browser.runtime.onMessage.addListener(message => {
  switch (message.topic) {
    case 'ds-downloadFiles':
      // Filter already downloaded items if the conflict action is 'skip'.
      downloadItems(filterItemsFromHistory(message.data), message.data);
      break;
  }
});

browser.downloads.onChanged.addListener(downloadDelta => {
  let download = state.downloads[downloadDelta.id];
  if (download) {
    switch (downloadDelta.state.current) {
      case 'interrupted':
        onDownloadStopped(downloadDelta.id, download, false);
        break;
      case 'complete':
        onDownloadStopped(downloadDelta.id, download, true);
        break;
    }
  }
});

// Filter all items that have been previosuly downloaded.
function filterItemsFromHistory (data) {
  if (data.conflictAction === 'skip') {
    // Remove already downloaded items.
    data.conflictAction = 'overwrite';
    return data.items.filter(item => {
      let historyKey = item.url + data.downloadPath;
      return state.history.indexOf(historyKey) === -1;
    });
  }
  return data.items;
}

// Start a download of every item in the list.
function downloadItems (filteredItems, data) {
  filteredItems.forEach(item => {
    // Determine the target filename.
    let historyKey = item.url + data.downloadPath;
    let filename = [ data.downloadPath, item.filename ].join('/');

    browser.downloads.download({
      url: item.url,
      filename: filename,
      conflictAction: data.conflictAction,
      saveAs: false
    }).then(downloadId => {
      // Monitor the state of this download.
      state.downloads[downloadId] = {
        historyKey: historyKey,
        erase: data.eraseHistory
      };
    });
  });
}

function onDownloadStopped (downloadId, download, completed) {
  // Erase the completed download.
  if (download.erase) {
    browser.downloads.erase({ id: downloadId });
  }

  // Remember the URL of this download.
  if (completed) {
    state.history.unshift(download.historyKey);
    if (state.history.length > 1000) {
      state.history.pop();
    }

    browser.storage.local.set({ history: state.history });
  }

  // Stop tracking this download.
  delete state.downloads[downloadId];
}
