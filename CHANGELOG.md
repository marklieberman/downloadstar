# Changelog

### Version 2.0.4
 - Added option to run as a popup window instead of a browser action popup.
 - Added running download count in browser action icon badge.
 - Added light and dark theme icons.
 - Added scraping of CSS background-image styles.
 - Added scripting of iframe/frame sources.
 - Fixed filenames incorrectly parsed if first charater is non-word.
 - Fixed different URL fragments cause duplicate items.
 - Exposed the internal history and queue but these are WIP areas.

### Version 2.0.3
 - Disabled thumbnails by default and added a toggle in bottom of the popup.
 - Added function noFolder to strip slashes from a variable.
 - Added variables frameTitle and tabTitle. (tigregalis)
 - Naming mask can be used to sort downloads into subfolders. (tigregalis)
 - Fixed filename sanitization issues around naming mask.
 - Fixed filters not saving due to changes in FF's storage backend.
 - Fixed addon breaking due to use of deprecated Array.concat method.

### Version 2.0.2
 - Fixed a bug where invalid escape codes in a URL caused no media to be found.

### Version 2.0.1
 - Removed '<all_urls>' from required permissions and changed to an optional permission.
 - Fixed a bug in which ${inum} was counting checked items from disabled sources.
 - Fixed a bug in which adding 1000+ downloads caused some downloads not to be added.
 - Added variables for item, frame, and tab URL.
 - Added split and replace filters. (OkanEsen)
 - Added an option to save changes to popup controls immediately.

### Version 2.0.0
 - Rewrote the majority of the addon.
 - Made interface work properly when width is fixed in overflow menu.
 - Localized the addon.
 - Implemented a concurrent download limit.
 - Implemented a naming mask feature for filenames.
 - Added a button to scrape all tabs in the window.
 - Fixed downloading of data: URLs.
 - Fixed scraping of source tags in audio/video/object tags.
 - Added options to control/disable download history.

### Version 1.0.2
 - Interface no longer allows absolute download paths.
 - Fix default filters are case sensitive. (OkanEsen)
 - Fix matching bug in fast filters. (OkanEsen)
 - Add more extensions to default filters. (DeadnightWarrior)
 - Fix URI encoded filenames in downloads. (jrie)

### Version 1.0.1
 - Add matching items count to download button. (OkanEsen)
 - Scrape links from text elements. (OkanEsen)

### Version 1.0.0
 - Initial release.
