import { describe, expect, it } from 'vitest';
import { memoryStringToNumber, parse_cookie, runtimeStringToNumber, sleep } from '../utils';

describe('Utils', () => {
	it('parse_cookie', () => {
		expect(parse_cookie('a=b; c=d; abc-123=456-def')).toEqual({
			a: 'b',
			c: 'd',
			'abc-123': '456-def',
		});
	});

	it('parse_cookie with = in values', () => {
		expect(parse_cookie('token=abc=def=; session=xyz==')).toEqual({
			token: 'abc=def=',
			session: 'xyz==',
		});
	});

	it('parse_cookie with no value', () => {
		expect(parse_cookie('flagonly')).toEqual({
			flagonly: '',
		});
	});

	it('sleep', async () => {
		const start = Date.now();
		const returning = await sleep(300, 'I am a string');
		expect(Date.now() - start).toBeGreaterThanOrEqual(290);
		expect(returning).toBe('I am a string');
	});

	it('sleep with default value', async () => {
		const returning = await sleep(10);
		expect(returning).toBeNull();
	});

	it('memoryStringToNumber', () => {
		expect(memoryStringToNumber('18152 KB')).toBe(18152);
		expect(memoryStringToNumber('512 MB')).toBe(512);
	});

	it('runtimeStringToNumber', () => {
		expect(runtimeStringToNumber('8 ms')).toBe(8);
		expect(runtimeStringToNumber('120 ms')).toBe(120);
	});
});
