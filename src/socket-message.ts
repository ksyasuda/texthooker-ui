export function parseIncomingLineMessage(raw: unknown): string {
	if (typeof raw !== 'string') {
		return '';
	}

	try {
		const parsed = JSON.parse(raw);
		if (parsed && typeof parsed === 'object' && 'sentence' in parsed) {
			const sentence = (parsed as { sentence?: unknown }).sentence;
			return typeof sentence === 'string' ? sentence : '';
		}
	} catch (_) {
		// no-op
	}

	return raw;
}
