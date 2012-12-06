var crypto      = require('crypto'),
    request     = require('request'),
    sys         = require('sys'),
    nodeurl     = require('url'),
    fs          = require('fs'),
    emitter     = require('events').EventEmitter;

/**
 * Constructor
 * @param  {string}   url       The url of the website to backup
 * @param  {string}   secret    The secret key of the website
 *
 * @class Container class for all the AkeebaBackup related method
 * @extends EventEmitter
 */
function AkeebaBackup(url, secret) {
    /** @lends AkeebaBackup# */
    if(false === (this instanceof AkeebaBackup)) {
        return new AkeebaBackup(url, secret);
    }
    // Parent call
    emitter.call(this);

    this.url = url;
    this.secret = secret;
}
// Inheritance
sys.inherits(AkeebaBackup, emitter);

/**
 * Backup a website
 *
 * @fires   started     When the backup actually is started on the website
 * @fires   step        When another step of the backup is finished
 * @fires   completed   When the backup is completed
 */
AkeebaBackup.prototype.backup = function() {

    $this = this;        
    
    var json = this.getRequest('startBackup');

    this.sendRequest(json, function (data) {
        
        $this.emit("started", {data: data});
        
        // Backup has to continue?
        if (data.HasRun) {
            // Go on!
            $this.stepBackup();
        } else {
            $this.emit("completed", {data: data});
        }
    });
}

/**
 * Trigger a System Restore Point backup for an extension
 *
 * @param  {string} extension The extension name / element (ie: akeeba)
 * @param  {string} type      The extension type (ie: component)
 * @param  {string} group     Optional: the extension group (ie: system for plugins)
 *
 * @fires   started     When the System Restore Point is started
 * @fires   step            When another step of the backup is finished
 * @fires   completed       When the System Restore Point is finished
 */
AkeebaBackup.prototype.srp = function(extension, type, group) {

    var $this = this;

    var data = {
        name: extension,
        type: type,
        group: group,
        tag: 'restorepoint'
    };

    var json = this.getRequest('startSRPBackup', data);

    this.sendRequest(json, function (data) {
        $this.emit("started", {data: data});

        // Backup has to continue?
        if (data.HasRun) {
            // Go on!
            $this.stepBackup();
        } else {
            $this.emit("completed", {data: data});
        }
    });
}

/**
 * Step a Backup
 *
 * @fires   step        
 * @fires   completed
 */
AkeebaBackup.prototype.stepBackup = function() {
       
    var $this = this;
    
    var data = {
        tag: 'restorepoint'
    };

    var json = this.getRequest('stepBackup', data);

    this.sendRequest(json, function (data) {
        // Backup has to continue?
        if (data.HasRun) {
            // Go on!
            $this.emit("step", {data: data});
            $this.stepBackup();
        } else {
            $this.emit("completed", {data: data});
        }
    });
}

/**
 * Returns the version number of the API and the component.
 * The callback receives a parameter with properties:
 * api, component, date, edition, updateinfo
 *
 * @param  {Function} callback The function to call when the version is fetched.
 */
AkeebaBackup.prototype.getVersion = function(callback) {
       
    var $this = this;
       
    var json = this.getRequest('getVersion');

    this.sendRequest(json, function (data) {
        callback(data);
    });
}

/**
 * Returns a list of the backup profiles.
 * The callback receives an array. Each object has properties:
 * id, name
 *
 * @param  {Function} callback The function to call when the version is fetched.
 */
AkeebaBackup.prototype.getProfiles = function(callback) {
       
    var $this = this;
       
    var json = this.getRequest('getProfiles');

    this.sendRequest(json, function (data) {
        callback(data);
    });
}

/**
 * Returns a (partial) list of the backup records known to the component. 
 * The records are presented in reverse order, i.e. the first record is the last backup attempt, 
 * whereas the last record is the earliest backup attempt known to the component.
 *
 * @param  {Function} callback Function to call when the request is done
 * @param  {int}      from     Default = 0.  The starting offset of the list, maps to the limitstart parameter in the Joomla! API.
 * @param  {int}      limit    Default = 50. How many records to return at once, maps to the limit parameter in the Joomla! API. You can set it to 0 to return all records, but do note that this may cause a server timeout.
 */
AkeebaBackup.prototype.listBackups = function(callback, from, limit) {

    from = from ? from : 0;
    limit = limit ? limit : 50;

    var data = {
        from: from,
        limit: limit
    };

    var $this = this;
       
    var json = this.getRequest('listBackups', data);

    this.sendRequest(json, function (data) {
        callback(data);
    });
}

/**
 * Gets detailed information about a specific backup record.
 *
 * @param  {int}        id       The id of the backup
 * @param  {Function}   callback Function to call when the request is done
 */
AkeebaBackup.prototype.getBackupInfo = function(id, callback) {
    var data = {
        backup_id: parseInt(id)
    };

    var $this = this;
       
    var json = this.getRequest('getBackupInfo', data);

    this.sendRequest(json, function (data) {
        callback(data);
    });
}

/**
 * Download (step by step) a backup file to a file
 *
 * @param  {int} id      The id of the backup to download
 * @param  {string} file The file to which we should save the file
 *
 * @fires   step
 * @fires   completed
 */
AkeebaBackup.prototype.download = function(id, file) {

    var $this = this;

    fs.writeFile(file, '', function(err){
        if (err) {
            $this.emit("error", err);
        }

        var data = {
            backup_id:  parseInt(id),
            part_id:    1,
            segment:    1
        };

        var json = $this.getRequest('download', data);

        function stepDownload(part, segment) {
            data.part_id = part;
            data.segment = segment;
            json = $this.getRequest('download', data);

            $this.sendRequest(json, function(response){
                if (response) {
                    $this.emit("step", {file: file});
                    var buff = new Buffer(response, 'base64');
                    fs.appendFile(file, buff, 'binary', function(err){
                        if (err) {
                            $this.emit("error", err);
                        }
                        stepDownload(part, segment + 1);
                    });
                } else {
                    if (segment != 1) {
                        stepDownload(part+1, 1);
                    } else {
                        $this.emit("completed", {file: file});
                    }
                }
            });
        };

        stepDownload(1,1);
    });
}

/**
 * Download a file directly, without encryption and step by step download
 *
 * @param  {int}    id   The id of the backup
 * @param  {string} file The file on which we'll save the backup
 *
 * @fires   step
 * @fires   completed
 */
AkeebaBackup.prototype.downloadDirect = function(id, file) {
    var $this = this;

    fs.writeFile(file, '', function(err){
        if (err) {
            $this.emit("error", err);
        }

        var data = {
            backup_id:  parseInt(id),
            part_id:    1
        };

        var json = $this.getRequest('downloadDirect', data);

        function stepDownload(part) {
            data.part_id = part;
            json = $this.getRequest('downloadDirect', data);

            $this.sendRequest(json, function(response){
                if (response) {
                    $this.emit("step", {file: file});
                    fs.appendFile(file, response, 'binary', function(err){
                        if (err) {
                            $this.emit("error", err);
                        }
                        stepDownload(part + 1 );
                    });
                } else {
                    $this.emit("completed", {file: file});
                }
            }, true);
        };

        stepDownload(1);
    });
}

/**
 * Completely removes a backup record from the database. 
 * Unlike deleteFiles, it will delete the files corresponding to the given backup record and the backup record itself. 
 * The Akeeba Backup component will not be aware that the specified backup record ever existed.
 *
 * @param  {int}        id       The id of the backup
 * @param  {Function}   callback Function to call when the delete has been completed, with the result as a boolean
 */
AkeebaBackup.prototype.delete = function(id, callback) {
    var data = {
        backup_id: parseInt(id)
    };

    var $this = this;
       
    var json = this.getRequest('delete', data);

    this.sendRequest(json, function (data) {
        callback(data);
    });
}

/**
 * Remove only the files corresponding to a given backup record, but not the backup record itself. 
 * The Akeeba Backup component will display this backup record marked as "obsolete"
 *
 * @param  {int}        id       The id of the backup
 * @param  {Function}   callback Function to call when the delete has been completed, with the result as a boolean
 */
AkeebaBackup.prototype.deleteFiles = function(id, callback) {
    var data = {
        backup_id: parseInt(id)
    };

    var $this = this;
       
    var json = this.getRequest('deleteFiles', data);

    this.sendRequest(json, function (data) {
        callback(data);
    });
}

/**
 * Downloads The log file for a specific backup tag
 *
 * @param  {string} tag  The tag of the log file (ie: remote, restorepoint)
 * @param  {string} file The file to which we should save the log
 *
 * @fires   completed
 */
AkeebaBackup.prototype.getLog = function(tag, file) {

    var $this = this;

    fs.writeFile(file, '', function(err){
        if (err) {
            $this.emit("error", err);
        }

        var data = {
            tag: tag
        };

        var json = $this.getRequest('getLog', data);

        $this.sendRequest(json, function(response){
            if (response) {
                var buff = new Buffer(response, 'base64');
                fs.appendFile(file, buff, function(err){
                    if (err) {
                        $this.emit("error", err);
                    } else {
                        $this.emit("completed", {file: file});
                    }
                });
            } else {
                $this.emit("error", "Empty Log File");
            }
        });
    });
}

/**
 * Returns update status information, as returned by Live Update itself
 *
 * @param  {Function} callback The callback called when the request is done
 * @param  {bool}     force    If the information should be forcibly retrieved. False means you can get cached responses
 */
AkeebaBackup.prototype.updateGetInformation = function(callback, force) {
    var data = {
        force: force ? force : 0
    };

    var $this = this;
       
    var json = this.getRequest('updateGetInformation', data);

    this.sendRequest(json, function (data) {
        callback(data);
    });
}

/**
 * Triggers the entire akeeba update process
 *
 * @fires   step
 * @fires   completed
 */
AkeebaBackup.prototype.update = function() {
    var $this = this;

    this.updateDownload(function(){
        $this.updateExtract(function(){
            $this.updateInstall(function(data){
                $this.emit('completed', data);
            });
        })
    });
}

/**
 * Download the update package for akeeba
 *
 * @param  {Function} callback The callback called at the end of the download
 *
 * @fires   step
 */
AkeebaBackup.prototype.updateDownload = function(callback) {

    var $this = this;
       
    var json = this.getRequest('updateDownload');

    this.sendRequest(json, function (data) {
        $this.emit('step', data);
        callback(data);
    });
}

/**
 * Extract the update package for akeeba
 *
 * @param  {Function} callback The callback called at the end of the download
 *
 * @fires   step
 */
AkeebaBackup.prototype.updateExtract = function(callback) {

    var $this = this;
       
    var json = this.getRequest('updateExtract');

    this.sendRequest(json, function (data) {
        $this.emit('step', data);
        callback(data);
    });
}

/**
 * Install the update package for akeeba
 *
 * @param  {Function} callback The callback called at the end of the download
 *
 * @fires   step
 */
AkeebaBackup.prototype.updateInstall = function(callback) {

    var $this = this;
       
    var json = this.getRequest('updateInstall');

    this.sendRequest(json, function (data) {
        $this.emit('step', data);
        callback(data);
    });
}


/**
 * Get the challenge string for the API communications
 *
 * @return {string}        The challenge string
 */
AkeebaBackup.prototype.getChallenge = function() {
    // Challenge for authentication
    var date = new Date();
    var salt = date.getTime();
    var key = crypto.createHash('md5').update(salt + this.secret).digest("hex");
    var challenge = salt + ':' + key;

    return challenge;
}

/**
 * Get the request to send to the server
 *
 * @param  {string} method The method to call
 * @param  {object} data   The data object to send
 *
 * @return {string}        The json request to send
 */
AkeebaBackup.prototype.getRequest = function(method, data) {
    var challenge = this.getChallenge();
    
    var body = {
        method: method,
        challenge: challenge,
        data: data
    };

    var json = {
        encapsulation : 1,
        body: JSON.stringify(body)
    };

    return JSON.stringify(json);
}

/**
 * Send the request to the server. Deals with errors automatically
 *
 * @param  {string}   json     the json string to send
 * @param  {Function} callback The method to call on success
 */
AkeebaBackup.prototype.sendRequest = function(json, callback, do_not_parse) {
    
    var $this = this;

    // parse url
    url = nodeurl.parse(this.url, false);
    url = nodeurl.format(url);

    // get website info
    var options = url + 'index.php?option=com_akeeba&view=json&format=component&json='+ encodeURIComponent(json);

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var data = body;
            if (!do_not_parse) {
                data = $this.parseResponse(body);
            }
            callback(data);
        } else {
            if (!do_not_parse) {
                $this.emit("error", {response: response, body: body, data: body});
            }
        }
    });
}

/**
 * Parse the AkeebaBackup Response
 *
 * @param  {strng} data The data sent by AkeebaBackup
 *
 * @return {string}      The parsed data
 */
AkeebaBackup.prototype.parseResponse = function(data) {
    var data = data.substring(3, data.length - 3);
    try {
        var data = JSON.parse(data);
        if (data.body && data.body.status == 200) {
            return JSON.parse(data.body.data);
        }
    } catch(e) {
        return {};
    }
}

module.exports = AkeebaBackup;