const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// formatter.js is a plain browser script without exports; direct eval brings its declarations into scope
eval(fs.readFileSync(path.join(__dirname, '../scripts/formatter.js'), 'utf-8'));

test(
	'format does not append a semicolon to non-primitives',
	() => assert.equal(format(new Date(), 1), 'Object(new Date())')
);

test(
	'format leaves primitives untouched by semicolons',
	() => {
		assert.equal(format('abc'), '"abc"');
		assert.equal(format(42), '42');
	}
);
