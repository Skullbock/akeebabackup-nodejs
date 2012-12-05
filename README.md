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