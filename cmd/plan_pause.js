/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
 * Copyright (c) 2018, Joyent, Inc.
 */


var lib_common = require('../lib/common');
var lib_http_client = require('../lib/http_client');


if (process.argv.length < 3 || process.argv.length > 4 ||
    !lib_common.is_uuid(process.argv[2])) {
	console.error('ERROR: Usage: pause <plan_uuid> [<pause_at_phase>]');
	process.exit(1);
}

var body = null;
if (process.argv[3]) {
	if (process.argv[3] === 'none') {
		body = { pause_at_phase: null };
	} else {
		body = { pause_at_phase: process.argv[3] };
	}
}

lib_http_client.http_post('127.0.0.1', 80,
    '/plan/' + process.argv[2] + '/pause', body,
    lib_http_client.cmd_print_result);
