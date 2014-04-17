// oplog by jbk
var fs       = require('fs')
var argv     = require('minimist')(process.argv.slice(2))
var dias     = require('dias')
var S        = require('string')
var opUA     = ''
var platform = {}
var options  = {}
var opStream = process.stdout

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
	if (filename) opStream = fs.createWriteStream(filename, options)

	if (typeof opts == 'object') { options = opts }
	dias(function(data) {
		platform = data
		opUA     = platform.useragent
		if (opts && opts.ua) {
			opUA               = S(opUA).replaceAll(' ', '; ').s
			opUA               = opts.ua + ' (' + opUA + ')'
			platform.useragent = opUA
		}
		cb(platform)
	})
}


// log operation
function log(msg) {
	var log    = (options.log) ? options.log : {}
	if (msg instanceof Error) {
		log.msg        = msg.name
		log.error      = msg.message
		log.errorStack = msg.stack
	} else if (typeof msg == 'object' {
		log            = msg
	} else {
		log.msg        = msg
	}
	log.opUA = platform.useragent
	log.opOn = new Date().toISOString().replace('T', ' ').split('.')[0]
	outStream.write(JSON.stringify(log) + "\n")
	if (log.error) process.exit(1)
}


module.exports = {
	init: init,
	log:  log
}