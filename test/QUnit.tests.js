/*global QUnit F deepEqual QUint AjaxNode zagMap */

(function() {
	
	window['appBase'] = '../';

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// QUnit reconfiguration for lazy loading

	if (sessionStorage['QUintGo'] != 'y') {
		QUnit.test = QUnit.skip;
		QUnit.config.hidepassed = true;
	}

	sessionStorage['QUintGo'] = 'n';

	var qTmr = setInterval(function() {
		if ($('button:contains(Go)')['length'] > 0) {
			$('button:contains(Go),a:contains(Rerun)')['click'](function() {
				sessionStorage['QUintGo'] = 'y';
				$(document).trigger('QUnitGo');
			});
			clearInterval(qTmr);
		}
	}, 50);

	QUnit.begin(function() {
		$['allowScroll'] && $['allowScroll'](false);
		$('#QUnitOuter')['hide']();
		QUnit.myLogs = {};
	});
	QUnit.done(function(totals) {
		$['allowScroll'] && $['allowScroll'](true);
		$('#QUnitOuter')['show']();
		if (Object.keys(QUnit.myLogs).length) { // Test for empty logs
			QUnit.myLogs.totals = totals;
			QUnit.myLogs = {};
		}
	});
	QUnit.log(function(details) {
		if (!QUnit.myLogs)
			QUnit.myLogs = {};
		if (!QUnit.myLogs[details.module])
			QUnit.myLogs[details.module] = {};
		if (!QUnit.myLogs[details.module][details.name])
			QUnit.myLogs[details.module][details.name] = {};
		QUnit.myLogs[details.module][details.name][(new Date()).getTime()] = details;
	});

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Basic tests

	QUnit.module("ajax-node");

	zagMap({
		// Test objects
	});
	
	QUnit.test("hello world", function(p) {
		
		var done = p.async();
		
		AjaxNode.DoCmd({
			"script": 'test-js/hello-world.js'
		}, function(data) {
			p.strictEqual(data, 'Hi there. I\'m alive!', data);
			done();
		});
	});
	
	QUnit.test("nodejs error", function(p) {
		
		var done = p.async();
		
		AjaxNode.DoCmd({
			"script": 'test-js/js-error.js'
		}, function(data, error) {
			var has = data === null && error && error.indexOf('library-that-doesent-exist') >= 0;
			p.strictEqual(has, true, error);
			done();
		});
	});
	
	QUnit.test("reading stdin", function(p) {
		
		var done = p.async();
		var content = 'abc xyz\nover the clover\n3rd line';
		
		AjaxNode.DoCmd({
			"script": 'test-js/js-stdin.js',
			"content": content
		}, function(data) {
			data = $.trim(data);
			p.strictEqual(data, 'Bytes read: ' + content.length + '; content: ' + content, data);
			done();
		});
	});
	
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// MySql tests - auto skipped when no mysql user and password are given on test page

	var qTest = QUnit.test;
	
	$(document).on('QUnitGo', function() {
		sessionStorage['QUnitMysqlUser'] = $('#mysql_qunit_uu').val() || sessionStorage['QUnitMysqlUser'];
		sessionStorage['QUnitMysqlPassword'] = $('#mysql_qunit_pp').val() || sessionStorage['QUnitMysqlPassword'];
	});

	var user = sessionStorage['QUnitMysqlUser'];
	var password = sessionStorage['QUnitMysqlPassword'];
	$('#mysql_qunit_uu').val(user);
	$('#mysql_qunit_pp').val(password);
	user && password || (QUnit.test = QUnit.skip);

	QUnit.module("ajax-node mysql");

	QUnit.test("read databases", function(p) {
		
		var done = p.async();
		
		AjaxNode.DoCmd({
			"script": 'test-js/mysql-database.js',
			"content": JSON.stringify({
				"user": user,
				"password": password
			})
		}, function(data) {
			var res = JSON.stringify(data && data['queryResult'] || '"x"');
			var has = res.indexOf('[{"Database":') === 0;
			p.strictEqual(has, true, res);
			done();
		});
	});
	
	QUnit.test = qTest;

})();