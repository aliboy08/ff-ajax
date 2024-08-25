import { dev_server } from './dev-server';

export function v4wp( options = {} ) {
	const { input, outDir } = options;
	const plugin = {
		name: 'v4wp:config',
		enforce: 'pre',

		config() {
			return {
				base: './',
				build: {
					outDir,
					emptyOutDir: true,
					manifest: true,
					modulePreload: false,
					rollupOptions: { input },
					sourcemap: true,
				},
				css: {
					devSourcemap: true,
				},
			};
		},
	};
	return [ plugin, dev_server() ];
}