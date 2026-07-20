import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/index.ts'],
	outDir: 'lib',
	target: 'node18',
	format: ['cjs', 'esm'],
	clean: true,
	splitting: false,
	dts: false,
	esbuildOptions(opt) {
		opt.loader = {
			'.graphql': 'text',
		};
	},
});
