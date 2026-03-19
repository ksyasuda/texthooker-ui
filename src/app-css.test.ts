import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const cssText = readFileSync(join(import.meta.dir, 'app.css'), 'utf-8');

describe('texthooker app css', () => {
	test('defines hover tooltip selectors for frequency and jlpt metadata', () => {
		expect(cssText).toMatch(/p \.word\[data-frequency-rank\]::before/);
		expect(cssText).toMatch(/p \.word\[data-jlpt-level\]::after/);
		expect(cssText).toMatch(/p \.word\[data-frequency-rank\]:hover::before/);
		expect(cssText).toMatch(/p \.word\[data-jlpt-level\]:hover::after/);
	});

	test('defines name-match and colored hover selectors', () => {
		expect(cssText).toMatch(/p \.word\.word-name-match\s*\{/);
		expect(cssText).toMatch(/p \.word\.word-known:hover,/);
		expect(cssText).toMatch(/p \.word\.word-name-match:hover,/);
		expect(cssText).toMatch(/p\s+\.word:not\(\.word-known\):not\(\.word-n-plus-one\):not\(\.word-name-match\)/);
	});

	test('supports SubMiner color override variables for annotation classes', () => {
		expect(cssText).toMatch(/color:\s*var\(--subminer-known-word-color,\s*var\(--sm-green\)\);/);
		expect(cssText).toMatch(/color:\s*var\(--subminer-n-plus-one-color,\s*var\(--sm-n-plus-one\)\);/);
		expect(cssText).toMatch(/color:\s*var\(--subminer-name-match-color,\s*var\(--sm-name-match\)\);/);
		expect(cssText).toMatch(
			/text-decoration-color:\s*var\(--subminer-jlpt-n1-color,\s*var\(--sm-red\)\);/,
		);
		expect(cssText).toMatch(
			/color:\s*var\(--subminer-frequency-band-4-color,\s*var\(--sm-teal\)\);/,
		);
	});
});
