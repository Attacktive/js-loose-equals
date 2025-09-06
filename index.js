document.addEventListener("DOMContentLoaded", onBodyLoad);

const runButton = document.querySelector("#run");
runButton.addEventListener("click", run);

function onBodyLoad() {
	const footer = document.querySelector("#user-agent");
	footer.textContent = window.navigator.userAgent;

	const input = document.querySelector("#input");

	input.addEventListener("input", onInput);
	input.addEventListener(
		"keydown",
		(event) => {
			if (event.ctrlKey && event.code === "Enter") {
				run();
			}
		}
	);
}

function onInput() {
	const input = document.querySelector("#input");
	const button = document.querySelector("#run");

	if (input.value.length > 0) {
		button.removeAttribute("disabled");
	} else {
		button.setAttribute("disabled", "");
	}
}

function run() {
	const input = document.querySelector("#input");
	const xEvaluatedTo = document.querySelector("#x-evaluated-to");
	const output = document.querySelector("#output");

	const toEval = `x = ${input.value}`;
	console.debug("toEval", toEval);

	let x = undefined;
	let result;

	try {
		eval(toEval);

		xEvaluatedTo.textContent = `const x = ${format(x)};`;

		const { isInfinite, examples } = giveExamples(x);

		if (examples.length > 0) {
			if (isInfinite) {
				result = examples
					.map((example, index) => `x == ${format(example, index)}`)
					.join("\n")
					.concat("\n…");
			} else {
				result = examples
					.map(example => `x == ${format(example)}`)
					.join("\n");
			}
		} else {
			result = `Nothing is loosely equal to ${format(x)}.`;
		}
	} catch (error) {
		console.error(error);

		xEvaluatedTo.textContent = "undefined";
		result = error.stack;
	}

	output.textContent = result;
}
