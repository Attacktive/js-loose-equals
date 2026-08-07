/**
 * @typedef ExampleEntry
 * @type {Object}
 * @property {*} value
 * @property {number} depth how many Object(…) layers to render around the value's own representation
 */

/**
 * @typedef Example
 * @type {Object}
 * @property {boolean} isInfinite
 * @property {Array<ExampleEntry>} examples
 */

/**
 * {@link https://262.ecma-international.org/5.1/#sec-11.9.3}
 * {@link https://dorey.github.io/JavaScript-Equality-Table/}
 * @param x
 * @return {Example}
 */
function giveExamples(x) {
	const examples = handleSpecialCases(x);
	if (examples) {
		return examples;
	}

	const type = typeof x;
	switch (type) {
		case 'undefined':
			return {
				isInfinite: false,
				examples: toPlainExamples([undefined, null])
			};
		case 'number':
		case 'bigint':
			return {
				isInfinite: false,
				examples: toPlainExamples([x, String(x)])
			};
		case 'boolean':
			throw Error(`${x} is another Boolean value other than true or false!?`);
		case 'string': {
			const parsed = tryParsingToNumber(x);
			const plainValues = [x];

			if (parsed !== undefined) {
				plainValues.push(parsed);
			}

			const examples = toPlainExamples(plainValues)
				.concat(generateWrapperExamples(x, 0, 9));

			return {
				isInfinite: true,
				examples
			};
		}
		case 'object':
			if (Array.isArray(x)) {
				return handleArray(x);
			} else {
				return handleObject(x);
			}
		case 'symbol':
			return handleSymbol(x);
		case 'function':
			return handleFunction(x);
		default: {
			const message = `I'm surprised that we have ${type}! 😯😯😯`;

			console.error(message, x);
			throw Error(message);
		}
	}
}

/**
 * @param x
 * @return {Example|undefined}
 */
function handleSpecialCases(x) {
	if (Number.isNaN(x)) {
		return {
			isInfinite: false,
			examples: []
		};
	}

	if (x === null) {
		return {
			isInfinite: false,
			examples: toPlainExamples([undefined, null])
		};
	}

	if (x === false || x === 0) {
		return {
			isInfinite: true,
			examples: toPlainExamples([
				false,
				0,
				'0',
				'',
				[],
				[0],
				['0'],
				[[]],
				[[0]],
				[['0']],
				[[[]]],
				[[[0]]],
				[[['0']]]
			])
		};
	}

	if (x === '0') {
		const examples = toPlainExamples([
			false,
			0,
			'0',
			[0],
			['0'],
			[[0]],
			[['0']],
			[[[0]]],
			[[['0']]],
			[[[[0]]]],
			[[[['0']]]]
		])
			.concat(generateWrapperExamples(x, 0, 2));

		return {
			isInfinite: true,
			examples
		};
	}

	if (x === true || x === 1) {
		return {
			isInfinite: true,
			examples: toPlainExamples([
				true,
				1,
				'1',
				[1],
				['1'],
				[[1]],
				[['1']],
				[[[1]]],
				[[['1']]],
				[[[[1]]]],
				[[[['1']]]]
			])
		};
	}

	if (x === '1') {
		const examples = toPlainExamples([
			true,
			1,
			'1',
			[1],
			['1'],
			[[1]],
			[['1']],
			[[[1]]],
			[[['1']]],
			[[[[1]]]],
			[[[['1']]]]
		])
			.concat(generateWrapperExamples(x, 0, 2));

		return {
			isInfinite: true,
			examples
		};
	}

	if (x === '') {
		const examples = toPlainExamples([
			false,
			0,
			'',
			[],
			[[]],
			[[[]]],
			[[[[]]]],
			[[[[[]]]]],
			[[[[[[]]]]]],
			[[[[[[[]]]]]]],
			[[[[[[[[]]]]]]]]
		])
			.concat(generateWrapperExamples(x, 0, 2));

		return {
			isInfinite: true,
			examples
		};
	}
}

/**
 * Under `==` an array coerces via ToPrimitive to `String(array)`, so it is loosely equal to that string, to the number the string parses to (if any), and to the boolean whose numeric value matches.
 * @param {Array} array
 * @return {Example}
 */
function handleArray(array) {
	const string = String(array);
	const parsed = tryParsingToNumber(string);
	const values = [];

	if (parsed === 0) {
		values.push(false);
	} else if (parsed === 1) {
		values.push(true);
	}

	if (parsed !== undefined) {
		values.push(parsed);
	}

	values.push(string);

	return {
		isInfinite: false,
		examples: toPlainExamples(values)
	};
}

/**
 * An object operand of `==` is only ever compared through its ToPrimitive coercion, so its examples are the primitive values loosely equal to that coercion; other objects never qualify since they are compared by reference.
 * @param {Object} object
 * @return {Example}
 */
function handleObject(object) {
	let primitive;

	try {
		primitive = coerceToPrimitive(object);
	} catch (error) {
		console.trace('Failed to coerce the object into a primitive value.', error);

		return {
			isInfinite: false,
			examples: []
		};
	}

	// `==` compares null and undefined to objects without coercing, so an object whose primitive is null or undefined equals nothing
	if (primitive === undefined || primitive === null) {
		return {
			isInfinite: false,
			examples: []
		};
	}

	const { examples } = giveExamples(primitive);
	const values = examples.map(({ value }) => value);
	const primitiveValues = [...new Set(values)].filter(isPrimitive);

	return {
		isInfinite: false,
		examples: toPlainExamples(primitiveValues)
	};
}

/**
 * @param {symbol} symbol
 * @return {Example}
 */
function handleSymbol(symbol) {
	const examples = toPlainExamples([symbol])
		.concat(generateWrapperExamples(symbol, 1, 10));

	return {
		isInfinite: true,
		examples
	};
}

/**
 * @param {Function} fn
 * @returns {Example}
 */
function handleFunction(fn) {
	return {
		isInfinite: false,
		examples: toPlainExamples([fn])
	};
}

/**
 * @param {string} string
 * @return {undefined|number}
 */
function tryParsingToNumber(string) {
	const parsed = Number(string);
	if (Number.isNaN(parsed)) {
		return undefined;
	}

	return parsed;
}

/**
 * Emulates how `==` coerces its object operand: Symbol.toPrimitive with the 'default' hint when present, otherwise valueOf then toString.
 * {@link https://262.ecma-international.org/#sec-toprimitive}
 * @param {Object} object
 * @return {undefined|null|boolean|number|bigint|string|symbol}
 */
function coerceToPrimitive(object) {
	const toPrimitive = object[Symbol.toPrimitive];
	if (typeof toPrimitive === 'function') {
		const primitive = toPrimitive.call(object, 'default');
		if (isPrimitive(primitive)) {
			return primitive;
		}

		throw TypeError('Symbol.toPrimitive returned a non-primitive value.');
	}

	for (const name of ['valueOf', 'toString']) {
		const method = object[name];
		if (typeof method === 'function') {
			const candidate = method.call(object);
			if (isPrimitive(candidate)) {
				return candidate;
			}
		}
	}

	throw TypeError('Cannot convert the object to a primitive value.');
}

/**
 * @param any
 * @return {boolean}
 */
function isPrimitive(any) {
	return Object(any) !== any;
}

/**
 * @param {Array} values
 * @return {Array<ExampleEntry>}
 */
function toPlainExamples(values) {
	return values.map((value) => ({ value, depth: 0 }));
}

/**
 * A single Object() call produces the wrapper for every depth: wrapping the wrapper again would return the very same object, so only the rendered depth grows.
 * @param any
 * @param {number} from
 * @param {number} to
 * @return {Array<ExampleEntry>}
 */
function generateWrapperExamples(any, from, to) {
	const wrapper = Object(any);
	const examples = [];

	for (let depth = from; depth <= to; depth++) {
		examples.push({ value: wrapper, depth });
	}

	return examples;
}
