Firebase Profile watch
======================

Watches a firebase profiler stream for operations that take a long time and report those operations to a slack webhook.

Environment variables:
- `FIREBASE_URL` - required, `*.firebaseio.com`
- `FIREBASE_AUTH_SECRET` - required, the DB's auth key
- `SLACK_HOOK` - optional, a slack incoming webhook URL to report to
- `TIME_THRESHOLD` - operations over this number of ms will be reported.  Default 5000.