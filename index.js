document.addEventListener('DOMContentLoaded', onBodyLoad);

const runButton = document.querySelector('#run');
runButton.addEventListener('click', run);

function onBodyLoad() {
	const footer = document.querySelector('#user-agent');
	footer.textContent = window.navigator.userAgent;

	const input = document.querySelector('#input');
	const showExamplesBtn = document.querySelector('#show-examples');
	const exampleInputs = document.querySelector('#example-inputs');

	input.addEventListener('input', onInput);
	input.addEventListener(
		'keydown',
		(event) => {
			if (event.ctrlKey && event.code === 'Enter') {
				run();
			}
		}
	);

	// Toggle example inputs visibility
	showExamplesBtn.addEventListener('click', () => {
		exampleInputs.classList.toggle('d-none');
		showExamplesBtn.textContent = exampleInputs.classList.contains('d-none')
			? 'Show example inputs'
			: 'Hide example inputs';
	});

	// Handle example button clicks
	document.addEventListener('click', (event) => {
		if (event.target.hasAttribute('data-example')) {
			const example = event.target.getAttribute('data-example');
			input.value = example;
			input.focus();
			onInput();
		}
	});

	onInput();
}

function onInput() {
	const input = document.querySelector('#input');
	const button = document.querySelector('#run');
	const xEvaluatedTo = document.querySelector('#x-evaluated-to');

	if (input.value.trim().length > 0) {
		button.removeAttribute('disabled');

		const toEval = `x = ${input.value}`;
		let x = undefined;

		try {
			// Basic validation to prevent dangerous code execution
			if (input.value.includes('import') || input.value.includes('require') ||
				input.value.includes('fetch') || input.value.includes('XMLHttpRequest')) {
				throw new Error('External imports and network requests are not allowed');
			}

			eval(toEval);
			xEvaluatedTo.textContent = `const x = ${format(x)};`;
		} catch (error) {
			console.error('Input evaluation error:', error);
			xEvaluatedTo.textContent = `Invalid expression: ${error.message}`;
		}
	} else {
		button.setAttribute('disabled', '');
		xEvaluatedTo.textContent = 'undefined';
	}
}

function run() {
	const input = document.querySelector('#input');
	const xEvaluatedTo = document.querySelector('#x-evaluated-to');
	const output = document.querySelector('#output');
	const button = document.querySelector('#run');
	const buttonText = button.querySelector('.button-text');
	const spinner = button.querySelector('.spinner-border');

	button.disabled = true;
	buttonText.classList.add('d-none');
	spinner.classList.remove('d-none');

	const toEval = `x = ${input.value}`;
	console.debug('toEval', toEval);

	let x = undefined;
	let result;

	try {
		// Basic validation to prevent dangerous code execution
		if (input.value.includes('import') || input.value.includes('require') ||
			input.value.includes('fetch') || input.value.includes('XMLHttpRequest') ||
			input.value.includes('document') || input.value.includes('window')) {
			throw new Error('External imports, network requests, and DOM manipulation are not allowed');
		}

		eval(toEval);

		xEvaluatedTo.textContent = `const x = ${format(x)};`;

		const { isInfinite, examples } = giveExamples(x);

		if (examples.length > 0) {
			if (isInfinite) {
				result = examples
					.map((example, index) => `x == ${format(example, index)}`)
					.join('\n')
					.concat('\n…');
			} else {
				result = examples
					.map(example => `x == ${format(example)}`)
					.join('\n');
			}

			output.classList.add('success');
		} else {
			result = `Nothing is loosely equal to ${format(x)}.`;
		}

		output.classList.remove('error');
	} catch (error) {
		console.error('Execution error:', error);

		xEvaluatedTo.textContent = 'Error in expression';
		result = `Error: ${error.message}`;
		output.classList.add('error');
		output.classList.remove('success');
	}

	output.textContent = result;

	setTimeout(
		() => {
			button.disabled = false;
			buttonText.classList.remove('d-none');
			spinner.classList.add('d-none');
		},
		100
	);
}
