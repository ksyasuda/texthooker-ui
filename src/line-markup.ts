export interface LineHighlightToggleSettings {
	enableKnownWordColoring: boolean;
	enableNPlusOneColoring: boolean;
	enableFrequencyColoring: boolean;
	enableJlptColoring: boolean;
}

const defaultHighlightToggleSettings: LineHighlightToggleSettings = {
	enableKnownWordColoring: true,
	enableNPlusOneColoring: true,
	enableFrequencyColoring: true,
	enableJlptColoring: true,
};

const frequencyClassPattern = /^word-frequency-(single|band-[1-5])$/;
const jlptClassPattern = /^word-jlpt-n[1-5]$/;

function escapeHtml(text: string): string {
	return text
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

function decodeBasicEntities(text: string): string {
	return text
		.replaceAll('&lt;', '<')
		.replaceAll('&gt;', '>')
		.replaceAll('&quot;', '"')
		.replaceAll('&#39;', "'")
		.replaceAll('&amp;', '&');
}

function getClassAttributeValue(tag: string): string {
	const classMatch = tag.match(/\bclass\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
	return (classMatch?.[1] ?? classMatch?.[2] ?? classMatch?.[3] ?? '').trim();
}

function getAllowedWordClasses(
	classNames: string[],
	settings: LineHighlightToggleSettings,
): string[] {
	const allowed = new Set<string>();
	const hasWordClass = classNames.includes('word');
	const hasNPlusOneClass = classNames.includes('word-n-plus-one');

	if (hasWordClass) {
		allowed.add('word');
	}

	for (let index = 0; index < classNames.length; index += 1) {
		const className = classNames[index];

		if (className === 'word-known') {
			if (settings.enableKnownWordColoring && hasWordClass) {
				allowed.add(className);
			}
		} else if (className === 'word-n-plus-one') {
			if (settings.enableNPlusOneColoring && hasWordClass) {
				allowed.add(className);
			}
		} else if (frequencyClassPattern.test(className)) {
			if (settings.enableFrequencyColoring && hasWordClass && !(settings.enableNPlusOneColoring && hasNPlusOneClass)) {
				allowed.add(className);
			}
		} else if (jlptClassPattern.test(className)) {
			if (settings.enableJlptColoring && hasWordClass) {
				allowed.add(className);
			}
		}
	}

	return [...allowed];
}

export function normalizeLineMarkupForDisplay(
	text: string,
	settings: Partial<LineHighlightToggleSettings> = {},
): string {
	const resolvedSettings = { ...defaultHighlightToggleSettings, ...settings };
	const tagPattern = /<[^>]*>/g;
	const output: string[] = [];
	const spanStack: boolean[] = [];
	let lastIndex = 0;

	for (const tagMatch of text.matchAll(tagPattern)) {
		const [tag] = tagMatch;
		const index = tagMatch.index ?? 0;
		const textBeforeTag = text.slice(lastIndex, index);
		output.push(escapeHtml(textBeforeTag));

		if (/^<\s*\/\s*span\s*>$/i.test(tag)) {
			const shouldEmitClose = spanStack.pop();
			if (shouldEmitClose) {
				output.push('</span>');
			}
		} else if (/^<\s*span\b/i.test(tag)) {
			const classNames = getClassAttributeValue(tag)
				.split(/\s+/)
				.map((value) => value.trim())
				.filter(Boolean);
			const allowedClasses = getAllowedWordClasses(classNames, resolvedSettings);
			const shouldEmitOpen = allowedClasses.length > 0;
			spanStack.push(shouldEmitOpen);

			if (shouldEmitOpen) {
				output.push(`<span class="${escapeHtml(allowedClasses.join(' '))}">`);
			}
		}

		lastIndex = index + tag.length;
	}

	output.push(escapeHtml(text.slice(lastIndex)));

	while (spanStack.length) {
		const shouldEmitClose = spanStack.pop();
		if (shouldEmitClose) {
			output.push('</span>');
		}
	}

	return output.join('');
}

export function getPlainTextFromLineMarkup(text: string): string {
	return decodeBasicEntities(text.replace(/<[^>]*>/g, ''));
}
