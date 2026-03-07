import type { LineItem } from './types';

export function getLineSourceText(line: LineItem): string {
	return line.sourceText ?? line.text;
}

export function createLineItem(id: string, sourceText: string, text: string): LineItem {
	return {
		id,
		text,
		sourceText,
	};
}

export function updateLineItemText(line: LineItem, text: string, sourceText = getLineSourceText(line)): LineItem {
	return {
		...line,
		text,
		sourceText,
	};
}
