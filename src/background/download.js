'use strict';

const state = {
  concurrentDownloads: 0,    // Number of running downloads.
  queue: []                  // Current queue of downloads.
};

const settings = {
  maxConcurrentDownloads: 4, // Maximum concurrent downloads.
  keepHistory: 'never',      // Store download history?
  maxHistory: 1000           // Maximum number of history entries.
};

// Initialize settings from local storage.
browser.storage.local.get(settings).then(results => {
  Object.keys(settings).forEach(key => {
    if (results[key]) {
      settings[key] = results[key];
    }
  });
});

// Object model --------------------------------------------------------------------------------------------------------

/**
 * Model for items in the queue or history.
 */
class QueueItem {
  constructor (data) {
    this.options = data.options;
    this.mediaItem = data.mediaItem;
    this.state = data.state || null;
    this.downloadId = null;

    // Generate the target path for this item.
    this.targetPath = [ data.options.downloadPath, this.getFilename() ]
      .filter(part => !!part)
      .join('/');
  }

  /**
   * Get the URL.
   */
  getUrl () {
    return this.mediaItem.url;
  }

  /**
   * True if the URL is a data: URL, otherwise false.
   */
  isDataUrl () {
    return this.getUrl().startsWith('data:');
  }

  /**
   * Get the filename.
   */
  getFilename () {
    return this.mediaItem.filename;
  }

  /**
   * Get the target path.
   */
  getTargetPath () {
    return this.targetPath;
  }

  /**
   * Item is in the queue but hasn't been processed.
   */
  isNew () {
    return !this.state && !this.$picked;
  }

  /**
   * True if item is picked, otherwise false. This is a flag to prevent getNextQueuedItem() from picking the QueueItem
   * again during async processing. It covers the time between when a QueueItem is returned, but has not had its state
   * updated.
   */
  setPicked () {
    this.$picked = true;
  }

  /**
   * Item was skipped.
   */
  isSkipped () {
    return this.state === 'skipped';
  }

  /**
   * Set item state to skipped.
   */
  setSkipped () {
    this.state = 'skipped';
    delete this.$picked;
  }

  /**
   * Set item state to in_progress.
   */
  setInProgress () {
    this.state = 'in_progress';
    delete this.$picked;
  }

  /**
   * Set item state to interrupted.
   */
  setInterrupted () {
    this.state = 'interrupted';
    delete this.$picked;
  }

  /**
   * Set item state to completed.
   */
  setCompleted () {
    this.state = 'completed';
    delete this.$picked;
  }

  /**
   * Set item state to failed.
   */
  setFailed () {
    this.state = 'failed';
    delete this.$picked;
  }

  /**
   * True if item should be skipped if it was already downloaded, otherwise false.
   */
  isSkipOnConflict () {
    return this.options.conflictAction === 'skip';
  }

  /**
   * Get the conflict action for this item.
   */
  getConflictAction () {
    // Conflict action 'skip' is not supported by the API.
    // It is a synthetic behaviour implemented with workarounds.
    return this.isSkipOnConflict() ? 'uniquify' : this.options.conflictAction;
  }

  /**
   * True if the given filename does not end with the original filename, otherwise false
   */
  wasRenamed (filename) {
    return !filename.endsWith(this.mediaItem.filename);
  }

  /**
   * True if the given item has the same download path and is not new, otherwise false.
   */
  isQueued (queueItem) {
    return (this !== queueItem) &&
      (this.getTargetPath() === queueItem.getTargetPath()) &&
      // New items do not count since they haven't been downloaded.
      !queueItem.isNew();
  }

  /**
   * True if the history entry matches the URL and download path of this item, otherwise false.
   */
  isHistory (historyEntry) {
    return (this.getUrl() === historyEntry.url) &&
      (this.getTargetPath() === historyEntry.path);
  }

  /**
   * True if the download should be removed from the native manager, otherwise false.
   */
  isEraseHistory () {
    return this.options.eraseHistory;
  }

  /**
   * Start the download.
   */
  download () {
    // Must convert data: URLs into object URLs for download.
    if (this.isDataUrl()) {
      let blob = dataURLToBlob(this.getUrl());
      this.objectUrl = URL.createObjectURL(blob);
    }

    // Start downloading the item.
    var self = this;
    return browser.downloads.download({
      url: this.objectUrl || this.getUrl(),
      filename: this.getTargetPath(),
      conflictAction: this.getConflictAction(),
      saveAs: false
    }).then(downloadId => {
      // Record the download ID and update the state.
      self.setInProgress();
      self.downloadId = downloadId;
      return downloadId;
    }).catch(error => {
      // Record the error and update the state.
      self.setFailed();
      self.error = error;
      throw error;
    });
  }

  /**
   * Cancel the download.
   */
  cancel (skipped) {
    // This can fail if the download has already completed for example.
    return browser.downloads.cancel(this.downloadId);
  }

  /**
   * Attempt to remove the file from disk.
   * @param {Boolean} erase Also erase the download from the native manager.
   */
  removeFile (erase) {
    return browser.downloads.removeFile(this.downloadId).finally(() => {
      if (erase) {
        return browser.downloads.erase({ id: this.downloadId });
      }
    });
  }

  /**
   * Erase the download from the native manager.
   */
  removeFromNativeManager (force) {
    return browser.downloads.erase({ id: this.downloadId });
  }

  /**
   * Cleanup resources used during the download (e.g.: object URLs)
   */
  cleanup () {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }

}

// Event Listeners -----------------------------------------------------------------------------------------------------

/**
 * Invoked when settings are changed.
 */
browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    Object.keys(settings).forEach(key => {
      if (changes[key]) {
        settings[key] = changes[key].newValue;
      }
    });
  }
});

/**
 * Invoked when a message is recevied.
 */
browser.runtime.onMessage.addListener(message => {
  switch (message.topic) {
    case 'ds-getQueue':
      return Promise.resolve(state);
    case 'ds-clearQueue':
      state.queue.length = 0;
      return Promise.resolve(state);
    case 'ds-downloadMediaItems':
      enqueueMediaItems(message.data);
      break;
  }
});

/**
 * Invoked when a download is created.
 */
browser.downloads.onCreated.addListener(downloadItem => {
  // Need to defer this callback until the downloads.download() promise can resolve with a download ID.
  window.setTimeout(() => {
    // Only interested in queued items.
    let queueItem = state.queue.find(queueItem => queueItem.downloadId === downloadItem.id);
    if (queueItem) {
      onDownloadCreated(queueItem, downloadItem);
    }
  }, 0);
});

/**
 * Invoked when a download is changed.
 */
browser.downloads.onChanged.addListener(downloadDelta => {
  // Only interested in state changes.
  if (downloadDelta.state) {
    // Only interested in queued items.
    let queueItem = state.queue.find(queueItem => queueItem.downloadId === downloadDelta.id);
    if (queueItem) {
      switch (downloadDelta.state.current) {
        case 'interrupted':
          onDownloadStopped(queueItem, false);
          break;
        case 'complete':
          onDownloadStopped(queueItem, true);
          break;
      }
    }
  }
});

/**
 * Add the media items to the download queue.
 */
function enqueueMediaItems (data) {
  data.mediaItems.forEach(mediaItem => state.queue.push(new QueueItem({
    options: data.options,
    mediaItem
  })));

  // Limit the queue to the last 1000 items for the time being.
  while (state.queue.length > 1000) {
    state.queue.shift();
  }

  processNextQueuedItem();
}

/**
 * Invoked when a QueueItem starts downloading.
 */
function onDownloadCreated (queueItem, downloadItem) {
  // Detect existing files by checking if the download was renamed.
  if (queueItem.isSkipOnConflict() && queueItem.wasRenamed(downloadItem.filename)) {
    // File got renamed when the download was created - it must already exist.
    console.log('cancel download - already exists', queueItem);
    queueItem.setSkipped();
    queueItem.cancel();
  }
}

/**
 * Invoked when a QueueItem stops downloading.
 */
function onDownloadStopped (queueItem, completed) {
  // Release any resources allocated during the download.
  queueItem.cleanup();

  // Remove any downloads that were cancelled due to skipping.
  if (queueItem.isSkipped()) {
    queueItem.removeFile(true).finally(() => {
      // Resume processing items from the queue.
      state.concurrentDownloads--;
      processNextQueuedItem();
    });
    return;
  }

  // Set the download state based on the download outcome.
  if (completed) {
    queueItem.setCompleted();
  } else {
    queueItem.setInterrupted();
  }

  // Remove the download from the native download manager.
  if (queueItem.isEraseHistory()) {
    queueItem.removeFromNativeManager();
  }

  let promise = new Promise((resolve, reject) => {
    // When enabled, add completed downloads to our history.
    if (completed && (settings.keepHistory !== 'never')) {
      resolve(appendQueuedItemToHistory(queueItem));
    } else {
      resolve();
    }
  });

  promise.finally(() => {
    // Resume processing items from the queue.
    state.concurrentDownloads--;
    processNextQueuedItem();
  });
}

// Functions -----------------------------------------------------------------------------------------------------------

/**
 * True if an item with the same url, filename, and download path exists in the queue, otherwise false.
 */
function duplicateInQueue (queueItem) {
  return Promise.resolve(!!state.queue.find(findItem => queueItem.isQueued(findItem)));
}

/**
 * True if an item with the same url, filename, and download path exists in the history, otherwise false.
 */
function duplicateInHistory (queueItem) {
  return new Promise((resolve, reject) => {
    if (settings.keepHistory) {
      browser.storage.local.get({ history: [] }).then(results => {
        resolve(!!results.history.find(historyEntry => queueItem.isHistory(historyEntry)));
      });
    } else {
      resolve(false);
    }
  });
}

/**
 * Get the next item in the download queue.
 */
function getNextQueuedItem () {
  let queueItem = state.queue.find(queueItem => queueItem.isNew());
  if (queueItem) {
    // Ensure this QueueItem is not returned again.
    queueItem.setPicked();
  }
  return queueItem;
}

/**
 * Try to begin downloading items in the queue.
 */
function processNextQueuedItem () {
  // Do nothing if the maximum concurrent downloads is reached.
  if (state.concurrentDownloads >= settings.maxConcurrentDownloads) {
    console.log('waiting - too many concurrent downloads');
    return false;
  }

  // Process the next item in the queue.
  let queueItem = getNextQueuedItem();
  if (queueItem) {
    let promise = Promise.resolve(queueItem);

    // Immediately skip duplicate downloads when conflict strategy is skip.
    if (queueItem.isSkipOnConflict()) {
      promise = promise.then(() => duplicateInQueue(queueItem)).then(duplicated => {
        if (duplicated) {
          console.log('skipping file - already queued', queueItem);
          queueItem.setSkipped();
          throw 'skip';
        }
      });

      promise = promise.then(() => duplicateInHistory(queueItem)).then(duplicated => {
        if (duplicated) {
          console.log('skipping file - already downloaded', queueItem);
          queueItem.setSkipped();
          throw 'skip';
        }
      });
    }

    // Start the download if the promise has not yet been rejected.
    promise = promise.then(() => {
      console.log('starting download', queueItem);
      return queueItem.download().then(() => {
        // Increment the concurrent download counter.
        state.concurrentDownloads++;
      });
    });

    // Log the reason for failure.
    promise.catch(error => {
      if (error !== 'skip') {
        console.log('failed to start download', queueItem);
      }
    });

    // Continue attempting to download items.
    promise.finally(() => processNextQueuedItem());
  } else {
    console.log('download queue is empty');
  }
}

/**
 * Append a QueueItem to the history in local storage.
 */
function appendQueuedItemToHistory (queueItem) {
  // Fetch the history from storage.
  return browser.storage.local.get({ history: [] }).then(results => {
    let history = results.history;

    history.unshift({
      url: queueItem.getUrl(),
      path: queueItem.getTargetPath()
    });

    // Limit the amount of stored history entries.
    if (history.length > settings.maxHistory) {
      history.pop();
    }

    return browser.storage.local.set({ history });
  });
}

/**
 * Convert a data: URL to a Blob.
 */
function dataURLToBlob (dataURI) {
    // Convert base64 to raw binary data held in a string.
    var byteString = window.atob(dataURI.split(',')[1]);

    // Separate out the mime component.
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // Write the bytes of the string to an ArrayBuffer.
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ ab ], { type: mimeString });
}
