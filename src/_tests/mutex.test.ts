import { describe, expect, it } from 'vitest';
import { Mutex, RateLimiter } from '../mutex';
import { sleep } from '../utils';

describe('Mutex', () => {
	it('should be an instance of Mutex', () => {
		const mutex = new Mutex();
		expect(mutex).toBeInstanceOf(Mutex);
	});

	it('should be able to lock and unlock', async () => {
		const mutex = new Mutex();

		const results: number[] = [];
		for (let i = 0; i < 10; i++) {
			(async () => {
				await mutex.lock();
				await sleep(100);
				results.push(i);
				mutex.unlock();
			})();
		}

		expect(results).toEqual([]);
		await sleep(1050);
		expect(results).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
	});

	it('unlock when nothing is locked should return 0', () => {
		const mutex = new Mutex();
		expect(mutex.unlock()).toBe(0);
	});

	it('should report full and waiting correctly', async () => {
		const mutex = new Mutex(1);
		expect(mutex.full()).toBe(false);
		expect(mutex.waiting()).toBe(0);

		await mutex.lock();
		expect(mutex.full()).toBe(true);

		// Queue a waiter
		const waitPromise = mutex.lock();
		expect(mutex.waiting()).toBe(1);

		mutex.unlock();
		await waitPromise;
		expect(mutex.full()).toBe(true);
		expect(mutex.waiting()).toBe(0);
		mutex.unlock();
	});

	it('resize should release waiting locks', async () => {
		const mutex = new Mutex(1);
		await mutex.lock();

		const results: number[] = [];
		for (let i = 0; i < 3; i++) {
			(async () => {
				await mutex.lock();
				results.push(i);
			})();
		}

		expect(mutex.waiting()).toBe(3);
		mutex.resize(4);
		await sleep(10);
		expect(results).toEqual([0, 1, 2]);
	});

	it('should emit all-clear when fully unlocked', async () => {
		const mutex = new Mutex(2);
		let cleared = false;
		mutex.on('all-clear', () => {
			cleared = true;
		});

		await mutex.lock();
		await mutex.lock();
		mutex.unlock();
		expect(cleared).toBe(false);
		mutex.unlock();
		expect(cleared).toBe(true);
	});

	it('once should work for events', async () => {
		const mutex = new Mutex();
		let lockCount = 0;
		mutex.once('lock', () => {
			lockCount++;
		});

		await mutex.lock();
		mutex.unlock();
		await mutex.lock();
		mutex.unlock();
		expect(lockCount).toBe(1);
	});
});

describe('RateLimiter', () => {
	it('should be an instance of RateLimiter', () => {
		const rate_limiter = new RateLimiter();
		expect(rate_limiter).toBeInstanceOf(RateLimiter);
	});

	it('should be able to limit', async () => {
		const limiter = new RateLimiter();
		limiter.limit = 4;
		limiter.interval = 500;

		const results: number[] = [];
		for (let i = 0; i < 10; i++) {
			(async () => {
				await limiter.lock();
				results.push(i);
				await sleep(50);
				limiter.unlock();
			})();
		}

		expect(results).toEqual([]);
		await sleep(900);
		expect(results).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
		await sleep(1000);
		expect(results).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
	});
});
