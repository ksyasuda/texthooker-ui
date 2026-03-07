import { describe, expect, it } from 'bun:test';
import { parseIncomingLineMessage } from './socket-message';

describe('parseIncomingLineMessage', () => {
	it('returns sentence value from JSON payload', () => {
		expect(parseIncomingLineMessage('{"sentence":"字幕"}')).toBe('字幕');
	});

	it('returns empty string for empty sentence payload', () => {
		expect(parseIncomingLineMessage('{"sentence":""}')).toBe('');
	});

	it('ignores extra annotation api fields and keeps sentence markup', () => {
		expect(
			parseIncomingLineMessage(
				'{"version":1,"text":"字幕","sentence":"<span class=\\"word word-known\\">字幕</span>","tokens":[{"surface":"字幕"}]}',
			),
		).toBe('<span class="word word-known">字幕</span>');
	});


	it('returns raw input when payload is plain text', () => {
		expect(parseIncomingLineMessage('plain subtitle')).toBe('plain subtitle');
	});
});
