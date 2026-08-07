const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// example-giver.js and formatter.js are plain browser scripts without exports; direct eval brings their declarations into scope
eval(fs.readFileSync(path.join(__dirname, '../scripts/example-giver.js'), 'utf-8'));
eval(fs.readFileSync(path.join(__dirname, '../scripts/formatter.js'), 'utf-8'));

/**
 * @param {Example} example
 * @return {Array}
 */
const valuesOf = ({ examples }) => examples.map(({ value }) => value);

test(
	'"1.5" is equated with 1.5, not the parseInt result 1',
	() => {
		const values = valuesOf(giveExamples('1.5'));

		assert.ok(values.includes(1.5));
		assert.ok(!values.includes(1));
	}
);

test(
	'"1e3" is equated with 1000, not the parseInt result 1',
	() => {
		const values = valuesOf(giveExamples('1e3'));

		assert.ok(values.includes(1000));
		assert.ok(!values.includes(1));
	}
);

test(
	'"1abc" is not equated with any number despite parseFloat accepting it',
	() => {
		const values = valuesOf(giveExamples('1abc'));

		assert.ok(values.every((value) => typeof value !== 'number'));
	}
);

test(
	'"00" is equated with 0 even though 0 is falsy',
	() => {
		const values = valuesOf(giveExamples('00'));

		assert.ok(values.includes(0));
	}
);

test(
	'["1abc"] is not claimed to equal 1',
	() => {
		const values = valuesOf(giveExamples(['1abc']));

		assert.ok(values.every((value) => typeof value !== 'number'));
	}
);

test(
	'["1abc"] is equated with its string form',
	() => {
		const values = valuesOf(giveExamples(['1abc']));

		assert.ok(values.includes('1abc'));
	}
);

test(
	'[2] is equated with 2 and "2"',
	() => {
		const values = valuesOf(giveExamples([2]));

		assert.ok(values.includes(2));
		assert.ok(values.includes('2'));
	}
);

test(
	'[1,2] is equated with "1,2"',
	() => {
		const values = valuesOf(giveExamples([1, 2]));

		assert.ok(values.includes('1,2'));
	}
);

test(
	'[" "] is equated with 0 but not with "0"',
	() => {
		const values = valuesOf(giveExamples([' ']));

		assert.ok(values.includes(0));
		assert.ok(!values.includes('0'));
	}
);

test(
	'[null] is equated with "" but not with "0"',
	() => {
		const values = valuesOf(giveExamples([null]));

		assert.ok(values.includes(''));
		assert.ok(!values.includes('0'));
	}
);

test(
	'nested falsy/truthy singleton arrays keep their equalities',
	() => {
		assert.deepEqual(valuesOf(giveExamples([])), [false, 0, '']);
		assert.deepEqual(valuesOf(giveExamples([0])), [false, 0, '0']);
		assert.deepEqual(valuesOf(giveExamples([1])), [true, 1, '1']);
		assert.deepEqual(valuesOf(giveExamples([['0']])), [false, 0, '0']);
	}
);

test(
	'every array example is actually loosely equal to the array',
	() => {
		const arrays = [[], [0], [1], [2], [1, 2], ['1abc'], [' '], [null], [[42]]];

		for (const array of arrays) {
			const values = valuesOf(giveExamples(array));

			assert.ok(values.length > 0);
			assert.ok(values.every((value) => value == array));
		}
	}
);

test(
	'a plain object is equated with "[object Object]"',
	() => {
		const values = valuesOf(giveExamples({}));

		assert.ok(values.includes('[object Object]'));
	}
);

test(
	'an object with valueOf is equated with the number and its string form',
	() => {
		const values = valuesOf(giveExamples({ valueOf: () => 5 }));

		assert.ok(values.includes(5));
		assert.ok(values.includes('5'));
		assert.ok(!values.includes('[object Object]'));
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

		const values = valuesOf(giveExamples(object));

		assert.equal(receiver, object);
		assert.equal(hint, 'default');
		assert.ok(values.includes('2'));
		assert.ok(values.includes(2));
	}
);

test(
	'a Date is equated with its string form without needing a special case',
	() => {
		const date = new Date();

		assert.deepEqual(valuesOf(giveExamples(date)), [String(date)]);
	}
);

test(
	'object examples are finite and never contain other objects',
	() => {
		const objects = [{}, { valueOf: () => 1 }, { [Symbol.toPrimitive]: () => '1' }, new Date()];

		for (const object of objects) {
			const { isInfinite, examples } = giveExamples(object);

			assert.equal(isInfinite, false);
			assert.ok(examples.every(({ value }) => Object(value) !== value));
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
			const values = valuesOf(giveExamples(object));

			assert.ok(values.length > 0);
			assert.ok(values.every((value) => value == object));
		}
	}
);

test(
	'string examples carry real String wrapper objects, not re-derived primitives',
	() => {
		const { examples } = giveExamples('abc');
		const wrappers = examples.filter(({ value }) => typeof value === 'object');

		assert.ok(wrappers.length > 0);
		assert.ok(wrappers.every(({ value }) => value instanceof String));
	}
);

test(
	'wrapped string examples carry their own render depth without shifting',
	() => {
		const { examples } = giveExamples('5');
		const wrapped = examples.filter(({ value }) => typeof value === 'object');

		assert.deepEqual(wrapped.map(({ depth }) => depth), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
	}
);

test(
	'symbol examples keep the raw symbol first and wrappers at increasing depths',
	() => {
		const symbol = Symbol('example');
		const { examples } = giveExamples(symbol);

		assert.equal(examples[0].value, symbol);
		assert.equal(examples[0].depth, 0);
		assert.ok(examples.slice(1).every(({ value }) => value instanceof Symbol));
		assert.deepEqual(examples.slice(1).map(({ depth }) => depth), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
	}
);

test(
	'"0", "1" and "" are equated with their String wrapper objects',
	() => {
		for (const string of ['0', '1', '']) {
			const { examples } = giveExamples(string);
			const wrappers = examples.filter(({ value }) => value instanceof String);

			assert.ok(wrappers.length > 0);
			assert.ok(wrappers.every(({ value }) => value == string));
		}
	}
);

test(
	'every rendered example evaluates to a value loosely equal to x',
	() => {
		const inputs = [undefined, null, true, false, 0, 1, 42, 42n, '', '0', '1', '5', 'abc', [], [0], [2], [1, 2], {}, new Date()];

		for (const x of inputs) {
			const { examples } = giveExamples(x);

			for (const { value, depth } of examples) {
				const rendered = format(value, depth);

				assert.ok(eval(rendered) == x, `expected ${rendered} == ${format(x)}`);
			}
		}
	}
);
