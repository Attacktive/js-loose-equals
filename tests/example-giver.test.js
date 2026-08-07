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

		assert.ok(examples.every((example) => typeof example !== 'number'));
	}
);

test(
	'["1abc"] is equated with its string form',
	() => {
		const { examples } = giveExamples(['1abc']);

		assert.ok(examples.includes('1abc'));
	}
);

test(
	'[2] is equated with 2 and "2"',
	() => {
		const { examples } = giveExamples([2]);

		assert.ok(examples.includes(2));
		assert.ok(examples.includes('2'));
	}
);

test(
	'[1,2] is equated with "1,2"',
	() => {
		const { examples } = giveExamples([1, 2]);

		assert.ok(examples.includes('1,2'));
	}
);

test(
	'[" "] is equated with 0 but not with "0"',
	() => {
		const { examples } = giveExamples([' ']);

		assert.ok(examples.includes(0));
		assert.ok(!examples.includes('0'));
	}
);

test(
	'[null] is equated with "" but not with "0"',
	() => {
		const { examples } = giveExamples([null]);

		assert.ok(examples.includes(''));
		assert.ok(!examples.includes('0'));
	}
);

test(
	'nested falsy/truthy singleton arrays keep their equalities',
	() => {
		assert.deepEqual(giveExamples([]).examples, [false, 0, '']);
		assert.deepEqual(giveExamples([0]).examples, [false, 0, '0']);
		assert.deepEqual(giveExamples([1]).examples, [true, 1, '1']);
		assert.deepEqual(giveExamples([['0']]).examples, [false, 0, '0']);
	}
);

test(
	'every array example is actually loosely equal to the array',
	() => {
		const arrays = [[], [0], [1], [2], [1, 2], ['1abc'], [' '], [null], [[42]]];

		for (const array of arrays) {
			const { examples } = giveExamples(array);

			assert.ok(examples.length > 0);
			assert.ok(examples.every((example) => example == array));
		}
	}
);

test(
	'a plain object is equated with "[object Object]"',
	() => {
		const { examples } = giveExamples({});

		assert.ok(examples.includes('[object Object]'));
	}
);

test(
	'an object with valueOf is equated with the number and its string form',
	() => {
		const { examples } = giveExamples({ valueOf: () => 5 });

		assert.ok(examples.includes(5));
		assert.ok(examples.includes('5'));
		assert.ok(!examples.includes('[object Object]'));
	}
);

test(
	'Symbol.toPrimitive is invoked on the object with the "default" hint',
	() => {
		let receiver;
		let hint;
		const object = {
			[Symbol.toPrimitive](...args) {
				receiver = this;
				[hint] = args;

				return '2';
			}
		};

		const { examples } = giveExamples(object);

		assert.equal(receiver, object);
		assert.equal(hint, 'default');
		assert.ok(examples.includes('2'));
		assert.ok(examples.includes(2));
	}
);

test(
	'a Date is equated with its string form without needing a special case',
	() => {
		const date = new Date();

		const { examples } = giveExamples(date);

		assert.deepEqual(examples, [String(date)]);
	}
);

test(
	'object examples are finite and never contain other objects',
	() => {
		const objects = [{}, { valueOf: () => 1 }, { [Symbol.toPrimitive]: () => '1' }, new Date()];

		for (const object of objects) {
			const { isInfinite, examples } = giveExamples(object);

			assert.equal(isInfinite, false);
			assert.ok(examples.every((example) => Object(example) !== example));
		}
	}
);

test(
	'an object with no way to coerce is equated with nothing',
	() => {
		const { examples } = giveExamples(Object.create(null));

		assert.deepEqual(examples, []);
	}
);

test(
	'every object example is actually loosely equal to the object',
	() => {
		const objects = [{}, { valueOf: () => 5 }, { toString: () => '1' }, { [Symbol.toPrimitive]: () => 0 }, new Date()];

		for (const object of objects) {
			const { examples } = giveExamples(object);

			assert.ok(examples.length > 0);
			assert.ok(examples.every((example) => example == object));
		}
	}
);
