// oplog by jbk
var fs        = require('fs')
var argv      = require('minimist')(process.argv.slice(2))
var dias      = require('dias')
var microtime = require('microtime-nodejs')
var opUA      = ''
var platform  = {}
var options   = {}
var opStream  = process.stdout

// opOn = timestamp
// opUA = useragent
// opAt = reserve for: geo
// opBy = reserve for: md564(opUA) alias of opUA

function init(opts, cb) {
	if (typeof opts == 'function') {
		cb   = opts
		opts = undefined
	}

	var streamOptions = { 
	  flags:     (opts && opts.flags)                           ? opts.flags     : 'w',
	  encoding:  (opts && opts.encoding)                        ? opts.encoding  : 'utf8',
	  mode:      (opts && opts.mode)                            ? opts.mode      : 0666,
	  autoClose: (opts && typeof opts.autoClose != 'undefined') ? opts.autoClose : true
	}

	var filename           = (argv.log) ? argv.log : (opts && opts.file) ? opts.file : undefined
	if (filename) opStream = fs.createWriteStream(filename, streamOptions)

	if (typeof opts == 'object') { options = opts }
	dias({uanode: true}, function(data) {
		platform = data
		opUA     = platform.useragent
		if (opts && opts.ua) {
			opUA               = opts.ua + ' ' + opUA
			platform.useragent = opUA
		}
		cb(platform)
	})
}


// log operation
function log(msg) {
	var log            = (options.log) ? options.log : {}
	if (msg instanceof Error) {
		log.op         = msg.name
		log.error      = msg.message
		log.errorStack = msg.stack
	} else if (typeof msg == 'object') {
		log            = msg
	} else {
		log.op         = msg
	}
	log.opUA = (log.opUA) ? log.opUA + ' ' + platform.useragent : platform.useragent
	log.opOn = new Date().toISOString().replace('T', ' ').split('.')[0]
	if (options.microtime) {
		log.opOn += '.' + microtime.nowStruct()[1]
	}
	opStream.write(JSON.stringify(log) + "\n")
	if (options.haltOnError && log.error) process.exit(1)
}


function useragent() {
	return platform.useragent
}


module.exports = {
	useragent: useragent,
	init:      init,
	log:       log
}