# AkeebaBackup module for NodeJS

This module lets you easily use the AkeebaBackup JSON APIs in node.js. AkeebaBackup (http://www.akeebabackup.com) is THE backup software for Joomla! As of version 0.1.0, it supports only the raw encryption, but in the future, if needed, the other encryption system supported by the apis will be added.

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
- [backup](#backup "backup")
- [srp](#backup "srp")
- [delete](#backup "delete")
- [deleteFiles](#backup "deleteFiles")
- [download](#backup "download")
- [downloadDirect](#backup "downloadDirect")
- [getBackupInfo](#backup "getBackupInfo")
- [getLog](#backup "getLog")
- [getProfiles](#backup "getProfiles")
- [getVersion](#backup "getVersion")
- [listBackups](#backup "listBackups")
- [update](#backup "update")
- [updateGetInformations](#backup "updateGetInformations")

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

### srp

Trigger a System Restore Point backup for an extension

```js
var akeeba = require('akeebabackup');
var yoursite = new akeeba('http://www.example.com', 'yoursecretkey');

try {
	// yoursite.srp('name', 'type', ['group']); 
	yoursite.srp('akeeba', 'component');
	
	yoursite.on('started', function(data){
		console.log('srp started');
	});
	yoursite.on('step', function(data){
		console.log('srp has completed a step');
	});
	yoursite.on('completed', function(data){
		console.log('srp completed');
	});
} catch(e) {
	console.log(e);
}
```

### delete

Completely removes a backup record from the database. 
Unlike [deleteFiles](#backup "deleteFiles"), it will delete the files corresponding to the given backup record and the backup record itself. 
The Akeeba Backup component will not be aware that the specified backup record ever existed.

```js
var akeeba = require('akeebabackup');
var yoursite = new akeeba('http://www.example.com', 'yoursecretkey');

try {
	// yoursite.delete(id, callback)
	yoursite.delete(42, function(result){

	});
} catch(e) {
	console.log(e);
}
```

### deleteFiles

Remove only the files corresponding to a given backup record, but not the backup record itself. 
The Akeeba Backup component will display this backup record marked as "obsolete"

```js
var akeeba = require('akeebabackup');
var yoursite = new akeeba('http://www.example.com', 'yoursecretkey');

try {
	// yoursite.deleteFiles(id, callback)
	yoursite.deleteFiles(42, function(result){

	});
} catch(e) {
	console.log(e);
}
```

### download

Download (step by step) a backup file to a file

```js
var akeeba = require('akeebabackup');
var yoursite = new akeeba('http://www.example.com', 'yoursecretkey');

try {
	// yoursite.download(id, file)
	yoursite.download(42, 'yourbackup.jpa');

	yoursite.on('completed', function(){
		console.log('File saved');
	});
} catch(e) {
	console.log(e);
}
```

### downloadDirect

Download a file directly, without encryption and step by step download

```js
var akeeba = require('akeebabackup');
var yoursite = new akeeba('http://www.example.com', 'yoursecretkey');

try {
	// yoursite.downloadDirect(id, file)
	yoursite.downloadDirect(42, 'yourbackup.jpa');

	yoursite.on('completed', function(){
		console.log('File saved');
	});
} catch(e) {
	console.log(e);
}
```

### getBackupInfo

Gets detailed information about a specific backup record.

```js
var akeeba = require('akeebabackup');
var yoursite = new akeeba('http://www.example.com', 'yoursecretkey');

try {
	// yoursite.getBackupInfo(id, callback)
	yoursite.getBackupInfo(42, function(data){
		console.log(data);
	});
} catch(e) {
	console.log(e);
}
```

### getLog

Downloads The log file for a specific backup tag

```js
var akeeba = require('akeebabackup');
var yoursite = new akeeba('http://www.example.com', 'yoursecretkey');

try {
	// yoursite.getLog(tag, file)
	yoursite.getLog('remote', 'log.txt');

	yoursite.on('completed', function(){
		console.log('Log saved');
	});
} catch(e) {
	console.log(e);
}
```