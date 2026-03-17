import { describe, expect, test } from 'bun:test';
import { normalizeLineMarkupForDisplay } from './line-markup';

describe('normalizeLineMarkupForDisplay', () => {
	test('escapes plain text input', () => {
		const actual = normalizeLineMarkupForDisplay('<script>alert(1)</script>');
		expect(actual).toBe('alert(1)');
	});

	test('keeps known-word class when enabled', () => {
		const actual = normalizeLineMarkupForDisplay('<span class="word word-known">既知</span>', {
			enableKnownWordColoring: true,
		});
		expect(actual).toBe('<span class="word word-known">既知</span>');
	});

	test('drops known-word class when disabled', () => {
		const actual = normalizeLineMarkupForDisplay('<span class="word word-known">既知</span>', {
			enableKnownWordColoring: false,
		});
		expect(actual).toBe('<span class="word">既知</span>');
	});

	test('drops n+1 class when disabled and keeps other allowed classes', () => {
		const actual = normalizeLineMarkupForDisplay('<span class="word word-n-plus-one word-jlpt-n2">語</span>', {
			enableNPlusOneColoring: false,
			enableJlptColoring: true,
		});
		expect(actual).toBe('<span class="word word-jlpt-n2">語</span>');
	});

	test('drops frequency classes when disabled', () => {
		const actual = normalizeLineMarkupForDisplay(
			'<span class="word word-frequency-band-3">頻度</span><span class="word word-frequency-single">上位</span>',
			{ enableFrequencyColoring: false },
		);
		expect(actual).toBe('<span class="word">頻度</span><span class="word">上位</span>');
	});

	test('prefers n+1 class over frequency class when both are present', () => {
		const actual = normalizeLineMarkupForDisplay(
			'<span class="word word-n-plus-one word-frequency-band-5">語</span>',
			{ enableNPlusOneColoring: true, enableFrequencyColoring: true },
		);
		expect(actual).toBe('<span class="word word-n-plus-one">語</span>');
	});

	test('drops jlpt classes when disabled', () => {
		const actual = normalizeLineMarkupForDisplay('<span class="word word-jlpt-n5">基本</span>', {
			enableJlptColoring: false,
		});
		expect(actual).toBe('<span class="word">基本</span>');
	});

	test('keeps name-match class when enabled', () => {
		const actual = normalizeLineMarkupForDisplay('<span class="word word-name-match">アレクシア</span>', {
			enableNameMatchColoring: true,
		});
		expect(actual).toBe('<span class="word word-name-match">アレクシア</span>');
	});

	test('prefers name-match over n+1 and strips jlpt and frequency tagging', () => {
		const actual = normalizeLineMarkupForDisplay(
			'<span class="word word-name-match word-n-plus-one word-jlpt-n5" data-frequency-rank="12" data-jlpt-level="N5">アレクシア</span>',
			{
				enableNameMatchColoring: true,
				enableNPlusOneColoring: true,
				enableFrequencyColoring: true,
				enableJlptColoring: true,
			},
		);
		expect(actual).toBe('<span class="word word-name-match">アレクシア</span>');
	});

	test('drops name-match class when disabled and preserves known fallback', () => {
		const actual = normalizeLineMarkupForDisplay(
			'<span class="word word-name-match word-known">アレクシア</span>',
			{ enableNameMatchColoring: false, enableKnownWordColoring: true },
		);
		expect(actual).toBe('<span class="word word-known">アレクシア</span>');
	});

	test('preserves frequency and jlpt tooltip attrs when enabled', () => {
		const actual = normalizeLineMarkupForDisplay(
			'<span class="word word-known word-jlpt-n2" data-frequency-rank="745" data-jlpt-level="N2">無事</span>',
			{
				enableKnownWordColoring: true,
				enableFrequencyColoring: true,
				enableJlptColoring: true,
			},
		);
		expect(actual).toBe(
			'<span class="word word-known word-jlpt-n2" data-frequency-rank="745" data-jlpt-level="N2">無事</span>',
		);
	});

	test('drops tooltip attrs when matching highlight is disabled', () => {
		const actual = normalizeLineMarkupForDisplay(
			'<span class="word word-jlpt-n2" data-frequency-rank="745" data-jlpt-level="N2">無事</span>',
			{
				enableFrequencyColoring: false,
				enableJlptColoring: true,
			},
		);
		expect(actual).toBe('<span class="word word-jlpt-n2" data-jlpt-level="N2">無事</span>');
	});

	test('removes unsupported elements but preserves text', () => {
		const actual = normalizeLineMarkupForDisplay('<div><span class="word word-known">語</span><b>太字</b></div>');
		expect(actual).toBe('<span class="word word-known">語</span>太字');
	});
});
