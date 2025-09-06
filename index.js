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
	const xEvaluatedTo = document.querySelector("#x-evaluated-to");

	if (input.value.length > 0) {
		button.removeAttribute("disabled");

		const toEval = `x = ${input.value}`;
		let x = undefined;

		try {
			eval(toEval);
			xEvaluatedTo.textContent = `const x = ${format(x)};`;
		} catch (error) {
			xEvaluatedTo.textContent = "Invalid expression";
		}
	} else {
		button.setAttribute("disabled", "");
		xEvaluatedTo.textContent = "undefined";
	}
}

function run() {
	const input = document.querySelector("#input");
	const xEvaluatedTo = document.querySelector("#x-evaluated-to");
	const output = document.querySelector("#output");
	const button = document.querySelector("#run");
	const buttonText = button.querySelector(".button-text");
	const spinner = button.querySelector(".spinner-border");

	button.disabled = true;
	buttonText.classList.add("d-none");
	spinner.classList.remove("d-none");

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

			output.classList.add("success");
		} else {
			result = `Nothing is loosely equal to ${format(x)}.`;
		}

		output.classList.remove("error");
	} catch (error) {
		console.error(error);

		xEvaluatedTo.textContent = "undefined";
		result = error.message || error.stack;
		output.classList.add("error");
		output.classList.remove("success");
	}

	output.textContent = result;

	setTimeout(
		() => {
			button.disabled = false;
			buttonText.classList.remove("d-none");
			spinner.classList.add("d-none");
		},
		100
	);
}
