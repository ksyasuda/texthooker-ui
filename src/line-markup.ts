export interface LineHighlightToggleSettings {
	enableKnownWordColoring: boolean;
	enableNPlusOneColoring: boolean;
	enableNameMatchColoring: boolean;
	enableFrequencyColoring: boolean;
	enableJlptColoring: boolean;
}

const defaultHighlightToggleSettings: LineHighlightToggleSettings = {
	enableKnownWordColoring: true,
	enableNPlusOneColoring: true,
	enableNameMatchColoring: true,
	enableFrequencyColoring: true,
	enableJlptColoring: true,
};

const frequencyClassPattern = /^word-frequency-(single|band-[1-5])$/;
const jlptClassPattern = /^word-jlpt-n[1-5]$/;
const allowedDataAttributeNames = ['data-reading', 'data-headword', 'data-frequency-rank', 'data-jlpt-level'];

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

function getAttributeValue(tag: string, attributeName: string): string | null {
	const escapedAttributeName = attributeName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const attributePattern = new RegExp(
		`\\b${escapedAttributeName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
		'i',
	);
	const attributeMatch = tag.match(attributePattern);
	const value = (attributeMatch?.[1] ?? attributeMatch?.[2] ?? attributeMatch?.[3] ?? '').trim();
	return value.length > 0 ? value : null;
}


function getAllowedWordClasses(
	classNames: string[],
	settings: LineHighlightToggleSettings,
): string[] {
	const allowed = new Set<string>();
	const hasWordClass = classNames.includes('word');
	const hasNPlusOneClass = classNames.includes('word-n-plus-one');
	const hasNameMatchClass = classNames.includes('word-name-match');
	const hasKnownClass = classNames.includes('word-known');

	if (hasWordClass) {
		allowed.add('word');
	}

	const emittedWinnerClass =
		hasWordClass && hasNameMatchClass && settings.enableNameMatchColoring
			? 'word-name-match'
			: hasWordClass && hasNPlusOneClass && settings.enableNPlusOneColoring
				? 'word-n-plus-one'
				: hasWordClass && hasKnownClass && settings.enableKnownWordColoring
					? 'word-known'
					: null;

	if (emittedWinnerClass) {
		allowed.add(emittedWinnerClass);
	}

	for (const className of classNames) {
		if (frequencyClassPattern.test(className)) {
			if (settings.enableFrequencyColoring && hasWordClass && !emittedWinnerClass) {
				allowed.add(className);
			}
		} else if (jlptClassPattern.test(className)) {
			if (settings.enableJlptColoring && hasWordClass && emittedWinnerClass !== 'word-name-match') {
				allowed.add(className);
			}
		}
	}

	return [...allowed];
}

function getAllowedWordAttributes(
	tag: string,
	classNames: string[],
	settings: LineHighlightToggleSettings,
): string[] {
	const attributes: string[] = [];
	const hasPrioritizedNameMatch =
		classNames.includes('word') &&
		classNames.includes('word-name-match') &&
		settings.enableNameMatchColoring;

	for (const attributeName of allowedDataAttributeNames) {
		const value = getAttributeValue(tag, attributeName);
		if (!value) {
			continue;
		}

		if (
			attributeName === 'data-frequency-rank' &&
			(!settings.enableFrequencyColoring || hasPrioritizedNameMatch)
		) {
			continue;
		}

		if (
			attributeName === 'data-jlpt-level' &&
			(!settings.enableJlptColoring || hasPrioritizedNameMatch)
		) {
			continue;
		}

		attributes.push(`${attributeName}="${escapeHtml(value)}"`);
	}

	return attributes;
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
			const allowedAttributes = getAllowedWordAttributes(
				tag,
				classNames,
				resolvedSettings,
			);
			const shouldEmitOpen = allowedClasses.length > 0;
			spanStack.push(shouldEmitOpen);

			if (shouldEmitOpen) {
				const attributeSuffix = allowedAttributes.length > 0 ? ` ${allowedAttributes.join(' ')}` : '';
				output.push(`<span class="${escapeHtml(allowedClasses.join(' '))}"${attributeSuffix}>`);
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
