var eventSourceStream = require('event-source-stream'),
	request = require('request'),
	charm = require('charm')(process.stderr, process.stdin);

var ops = 0, avg=0, bad=0;

var TIME_THRESHOLD = parseInt(process.env.TIME_THRESHOLD) || 5000;

eventSourceStream('https://' + process.env.FIREBASE_URL + '/.settings/profile.json?auth=' + process.env.FIREBASE_AUTH_SECRET, {
	request: {
		headers: {
			Accept: 'text/event-stream'
		}
	}
})
.on('data', function(raw) {
	try {
		var op = JSON.parse(raw);
	} catch(ex) {}
	if (op && op.millis > 0) {
		ops++;

		avg -= avg/1000;
		avg += op.millis / 1000;

		if (op.millis > TIME_THRESHOLD) {
			bad++;
			if (process.stdout.isTTY) {
				charm.erase('line');
				charm.position(function(x, y) {
					charm.position(0, y);
					console.dir(op, {
						depth: null,
						colors: true
					});
				});
			} else {
				process.stdout.write(raw + '\n');
			}


			if (process.env.SLACK_HOOK) {
				var title;
				if (op.path) {
					title = '/' + op.path.join('/') + ' took ' + op.millis + 'ms';
				} else {
					title = 'Operation took ' + op.millis + 'ms';
				}

				request({
					method: 'POST',
					url: process.env.SLACK_HOOK,
					json: {
						username: 'Firebase Profiler',
						icon_emoji: ':fire:',
						text: title + '\n```' + JSON.stringify(op, null, 2) + '\n```'
					}
				}, function(err, slackRes, body) {
					// ignore
				});
			}
		}
	}
});

if (process.stderr.isTTY) {
	setInterval(function(err, d) {
		charm.erase('line');
		charm.position(function(x, y) {
			charm.position(0, y);
			charm.write(ops + ' ops, avg ' + (Math.round(avg * 100)/100) + 'ms, ' + bad + ' bad');
		});
	}, 1000);
}
