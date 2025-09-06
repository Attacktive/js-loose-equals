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
			if (parsed) {
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
		default: {
			// TODO: "function"
			const message = `Not implemented for type ${type}.`;

			console.error(message, x);
			throw Error(message);
		}
	}
}

/**
 * @param x
 * @return {Example}
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
 * @param {Array} array
 * @return {Example}
 */
function handleArray(array) {
	if (isNestedEmptyArray(array) || isNumberInNestedArray(0, array)) {
		return {
			isInfinite: false,
			examples: [false, 0, '']
		};
	}
	if (isNumberInNestedArray(0, array)) {
		return {
			isInfinite: false,
			examples: [false, 0, '0']
		};
	}
	if (isNumberInNestedArray(1, array)) {
		return {
			isInfinite: false,
			examples: [true, 1, '1']
		};
	}

	return {
		isInfinite: false,
		examples: []
	};
}

/**
 * @param {Object} object
 * @return {Example}
 */
function handleObject(object) {
	const toPrimitive = object[Symbol.toPrimitive];
	if (typeof toPrimitive === 'function') {
		try {
			const primitive = toPrimitive();
			return giveExamples(primitive);
		} catch (error) {
			console.trace('Failed to invoke Symbol.toPrimitive.', error);

			if (object instanceof Date) {
				return {
					isInfinite: true,
					examples: generateObjectWrappedArrayUpToNTimes(object, 10)
				};
			}

			// anything else?
		}
	}

	return {
		isInfinite: false,
		examples: []
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
 * @param {string} string
 * @return {undefined|number}
 */
function tryParsingToNumber(string) {
	let parsed = parseInt(string, 10);
	if (Number.isInteger(parsed)) {
		return parsed;
	}

	parsed = parseFloat(string);
	if (Number.isFinite(parsed)) {
		return parsed;
	}

	return undefined;
}

/**
 * @param {Array} array
 * @return {boolean}
 */
function isNestedEmptyArray(array) {
	if (!Array.isArray(array)) {
		return false;
	}
	if (array.length === 0) {
		return true;
	}
	if (array.length > 1) {
		return false;
	}

	const theOnlyElement = array[0];
	return isNestedEmptyArray(theOnlyElement);
}

/**
 * @param {number} target
 * @param {Array} array
 * @return {boolean}
 */
function isNumberInNestedArray(target, array) {
	if (array.length !== 1) {
		return false;
	}

	const theOnlyElement = array[0];
	if (Array.isArray(theOnlyElement)) {
		return isNumberInNestedArray(target, theOnlyElement);
	} else {
		let parsed = parseFloat(theOnlyElement);
		return (parsed === target);
	}
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
