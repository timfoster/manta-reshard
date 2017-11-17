

var mod_assert = require('assert-plus');
var mod_restify = require('restify');
var mod_verror = require('verror');
var mod_vasync = require('vasync');
var mod_jsprim = require('jsprim');
var mod_uuid = require('uuid');

var VE = mod_verror.VError;


function
SerialQueue(name)
{
	var self = this;

	mod_assert.string(name, 'name');
	self.sq_name = name;

	self.sq_running = false;
	self.sq_queue = [];
}

SerialQueue.prototype._swtch = function
_swtch()
{
	var self = this;

	if (self.sq_running || self.sq_queue.length < 1) {
		/*
		 * We are already running, or we have nothing left to do.
		 */
		return;
	}
	self.sq_running = true;

	var sqe = self.sq_queue.shift();
	mod_assert.func(sqe.sqe_callback, 'sqe_callback');

	var baton = {
		baton_sq: self,
		baton_time_enqueue: sqe.sqe_when,
		baton_time_birth: Date.now(),
		baton_time_release: null,
		baton_released: false,

		release: function () {
			mod_assert.equal(baton.baton_released, false,
			    'baton released twice?');
			mod_assert.equal(self.sq_running, true,
			    'not running?');

			baton.baton_released = true;
			baton.baton_time_release = Date.now();

			self.sq_running = false;
			self._swtch();
		}
	};

	setImmediate(sqe.sqe_callback, null, baton);
};

SerialQueue.prototype.run = function
run(callback)
{
	var self = this;

	self.sq_queue.push({
		sqe_when: Date.now(),
		sqe_callback: callback,
	});
	self._swtch();
};


module.exports = {
	SerialQueue: SerialQueue
};