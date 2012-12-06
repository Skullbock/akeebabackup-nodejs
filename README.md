# AkeebaBackup module for NodeJS

This module lets you easily use the AkeebaBackup JSON APIs in node.js. AkeebaBackup (http://www.akeebabackup.com) is THE backup software for Joomla!

## Installation

Using `npm`:

	npm install akeebabackup

You can also clone this repository into your `node_modules` directory.

## Examples

### Trigger a Backup

```js
var akeeba = require('akeebabackup');
var yoursite = new akeeba('http://www.example.com', 'yoursecretkey');

try {
	yoursite.backup();
	yoursite.on('completed', function(data){console.log('backup completed')});
} catch(e) {
	console.log(e);
}
```

## Available methods

Here you'll be able to see a list of methods available in the akeebabackup module, such as:
- backup
- srp
- delete
- deleteFiles
- download
- downloadDirect
- getBackupInfo
- getLog
- getProfiles
- getVersion
- listBackups
- update
- updateGetInformations

### backup

Trigger a new backup

```js
var akeeba = require('akeebabackup');
var yoursite = new akeeba('http://www.example.com', 'yoursecretkey');

try {
	yoursite.backup();
	
	yoursite.on('started', function(data){
		console.log('backup started');
	});
	yoursite.on('step', function(data){
		console.log('backup has completed a step');
	});
	yoursite.on('completed', function(data){
		console.log('backup completed');
	});
} catch(e) {
	console.log(e);
}
```