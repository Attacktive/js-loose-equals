/**
 * @typedef Example
 * @type {Object}
 * @property {boolean} isInfinite
 * @property {Array} examples
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
				examples: [undefined, null]
			};
		case 'number':
		case 'bigint':
			return {
				isInfinite: false,
				examples: [x, String(x)]
			};
		case 'boolean':
			throw Error(`${x} is another Boolean value other than true or false!?`);
		case 'string': {
			const parsed = tryParsingToNumber(x);
			if (parsed !== undefined) {
				return {
					isInfinite: true,
					examples: [x, parsed].concat(generateWrappedArrayUpToNTimes(x, 10, String))
				};
			} else {
				return {
					isInfinite: true,
					examples: [x].concat(generateWrappedArrayUpToNTimes(x, 10, String))
				};
			}
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
			examples: [undefined, null]
		};
	}

	if (x === false || x === 0) {
		return {
			isInfinite: true,
			examples: [
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
			]
		};
	}

	if (x === '0') {
		// TODO: add objects using String constructor
		return {
			isInfinite: true,
			examples: [
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
			]
		};
	}

	if (x === true || x === 1) {
		return {
			isInfinite: true,
			examples: [
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
			]
		};
	}

	if (x === '1') {
		// TODO: add objects using String constructor
		return {
			isInfinite: true,
			examples: [
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
			]
		};
	}

	if (x === '') {
		// TODO: add objects using String constructor
		return {
			isInfinite: true,
			examples: [
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
			]
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
	const examples = [];

	if (parsed === 0) {
		examples.push(false);
	} else if (parsed === 1) {
		examples.push(true);
	}

	if (parsed !== undefined) {
		examples.push(parsed);
	}

	examples.push(string);

	return {
		isInfinite: false,
		examples
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

	return {
		isInfinite: false,
		examples: [...new Set(examples.filter(isPrimitive))]
	};
}

/**
 * @param {symbol} symbol
 * @return {Example}
 */
function handleSymbol(symbol) {
	return {
		isInfinite: true,
		examples: generateObjectWrappedArrayUpToNTimes(symbol, 10)
	};
}

/**
 * @param {Function} fn
 * @returns {Example}
 */
function handleFunction(fn) {
	return {
		isInfinite: false,
		examples: [fn]
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
 * @param any
 * @param {number} n
 * @param constructor
 * @return {Array}
 */
function generateWrappedArrayUpToNTimes(any, n, constructor) {
	const array = [];

	for (let i = 0; i <= n; i++) {
		array.push(wrapWithConstructorNTimes(any, i, constructor));
	}

	return array;
}

/**
 * @param any
 * @param {number} n
 * @param {Function} constructor
 * @return {*|Object}
 */
function wrapWithConstructorNTimes(any, n, constructor) {
	if (n === 0) {
		return any;
	}

	const wrapped = constructor(any);

	if (n === 1) {
		return wrapped;
	}

	return wrapWithObjectNTimes(wrapped, n - 1);
}

/**
 * @param any
 * @param {number} n
 * @return {Array}
 */
function generateObjectWrappedArrayUpToNTimes(any, n) {
	return generateWrappedArrayUpToNTimes(any, n, Object);
}

/**
 * @param any
 * @param {number} n
 * @return {*|Object}
 */
function wrapWithObjectNTimes(any, n) {
	return wrapWithConstructorNTimes(any, n, Object);
}
