const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// example-giver.js is a plain browser script without exports; direct eval brings its declarations into scope
eval(fs.readFileSync(path.join(__dirname, '../scripts/example-giver.js'), 'utf-8'));

test(
	'"1.5" is equated with 1.5, not the parseInt result 1',
	() => {
		const { examples } = giveExamples('1.5');

		assert.ok(examples.includes(1.5));
		assert.ok(!examples.includes(1));
	}
);

test(
	'"1e3" is equated with 1000, not the parseInt result 1',
	() => {
		const { examples } = giveExamples('1e3');

		assert.ok(examples.includes(1000));
		assert.ok(!examples.includes(1));
	}
);

test(
	'"1abc" is not equated with any number despite parseFloat accepting it',
	() => {
		const { examples } = giveExamples('1abc');

		assert.ok(examples.every((example) => typeof example !== 'number'));
	}
);

test(
	'"00" is equated with 0 even though 0 is falsy',
	() => {
		const { examples } = giveExamples('00');

		assert.ok(examples.includes(0));
	}
);

test(
	'["1abc"] is not claimed to equal 1',
	() => {
		const { examples } = giveExamples(['1abc']);

		assert.deepEqual(examples, []);
	}
);
