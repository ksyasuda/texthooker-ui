import { describe, expect, test } from 'bun:test';
import { createLineItem, getLineSourceText, updateLineItemText } from './line-state';

describe('line-state', () => {
	test('getLineSourceText prefers stored source text', () => {
		expect(getLineSourceText({ id: '1', text: 'rendered', sourceText: 'raw' })).toBe('raw');
	});

	test('getLineSourceText falls back to rendered text', () => {
		expect(getLineSourceText({ id: '1', text: 'rendered' })).toBe('rendered');
	});

	test('createLineItem stores both source and rendered text', () => {
		expect(createLineItem('1', 'raw', 'rendered')).toEqual({
			id: '1',
			text: 'rendered',
			sourceText: 'raw',
		});
	});

	test('updateLineItemText preserves original source by default', () => {
		expect(updateLineItemText({ id: '1', text: 'old', sourceText: 'raw' }, 'new')).toEqual({
			id: '1',
			text: 'new',
			sourceText: 'raw',
		});
	});

	test('updateLineItemText can replace source text after manual edits', () => {
		expect(updateLineItemText({ id: '1', text: 'old', sourceText: 'raw' }, 'new', 'edited')).toEqual({
			id: '1',
			text: 'new',
			sourceText: 'edited',
		});
	});
});
