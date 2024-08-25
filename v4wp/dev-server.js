import { choose_port } from './choose-port';
import { join } from 'node:path';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';

export function dev_server( options = {} ) {

	const plugins_to_check = [ 'vite:react-refresh' ];

	let manifest_file;
	let resolved_config;

	return {
		apply: 'serve',
		name: 'v4wp:dev-server',

		async config( config ) {
			const { server = {} } = config;
			let { host = 'localhost', port = 5173, ...server_config } = server;
            
			if ( typeof host === 'boolean' ) {
				host = '0.0.0.0';
			}

			const hmr_protocol = server_config.https ? 'wss' : 'ws';
			const server_protocol = server_config.https ? 'https' : 'http';
            
			port = await choose_port( { host, port } );
            
			const origin = `${ server_protocol }://${ host }:${ port }`;

			return {
				server: {
					...server_config,
					host,
					origin,
					port,
					strictPort: true,
					hmr: {
						port,
						host,
						protocol: hmr_protocol,
					},
				},
			};
		},

		configResolved( config ) {
			resolved_config = config;
		},

		buildStart() {
			const { base, build, plugins, server } = resolved_config;

			const data = JSON.stringify( {
				base,
				origin: server.origin,
				port: server.port,
				plugins: plugins_to_check.filter( i => plugins.some( ( { name } ) => name === i ) ),
			} );
            
			const manifest_dir = options.manifest_dir || build.outDir;
            
			manifest_file = join( manifest_dir, 'vite-dev-server.json' );

			mkdirSync( manifest_dir, { recursive: true } );
			writeFileSync( manifest_file, data, 'utf8' );
		},

		buildEnd() {
			rmSync( manifest_file, { force: true } );
		},
	};
}