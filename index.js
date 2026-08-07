document.addEventListener('DOMContentLoaded', onBodyLoad);

const input = document.querySelector('#input');
const xEvaluatedTo = document.querySelector('#x-evaluated-to');
const output = document.querySelector('#output');
const runButton = document.querySelector('#run');
const buttonText = runButton.querySelector('.button-text');
const spinner = runButton.querySelector('.spinner');

runButton.addEventListener('click', run);

function onBodyLoad() {
	const footer = document.querySelector('#user-agent');
	footer.textContent = window.navigator.userAgent;

	input.addEventListener('input', onInput);
	input.addEventListener(
		'keydown',
		(event) => {
			if (event.ctrlKey && event.code === 'Enter') {
				run();
			}
		}
	);

	onInput();
}

/**
 * Evaluates the input as `x` and reflects it into #x-evaluated-to; throws when the input is not a valid expression.
 * @return {*} the evaluated value
 */
function evaluateInput() {
	const toEval = `x = ${input.value}`;
	console.debug('toEval', toEval);

	let x = undefined;
	eval(toEval);

	xEvaluatedTo.textContent = `const x = ${format(x)};`;

	return x;
}

function onInput() {
	if (input.value.length > 0) {
		runButton.removeAttribute('disabled');

		try {
			evaluateInput();
		} catch (error) {
			console.error(error);

			xEvaluatedTo.textContent = 'Invalid expression';
		}
	} else {
		runButton.setAttribute('disabled', '');
		xEvaluatedTo.textContent = 'undefined';
	}
}

function run() {
	runButton.disabled = true;
	buttonText.classList.add('hidden');
	spinner.classList.remove('hidden');

	let result;

	try {
		const x = evaluateInput();
		const { isInfinite, examples } = giveExamples(x);

		if (examples.length > 0) {
			result = examples
				.map(({ value, depth }) => `x == ${format(value, depth)}`)
				.join('\n');

			if (isInfinite) {
				result = result.concat('\n…');
			}

			output.classList.add('success');
		} else {
			result = `Nothing is loosely equal to ${format(x)}.`;
		}

		output.classList.remove('error');
	} catch (error) {
		console.error(error);

		xEvaluatedTo.textContent = 'undefined';
		result = error.message || error.stack;
		output.classList.add('error');
		output.classList.remove('success');
	}

	output.textContent = result;

	setTimeout(
		() => {
			runButton.disabled = false;
			buttonText.classList.remove('hidden');
			spinner.classList.add('hidden');
		},
		100
	);
}
