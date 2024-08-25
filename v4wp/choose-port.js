import { createServer } from 'net';

export async function choose_port( options = {} ) {
	const server = createServer();

	return new Promise( ( resolve, reject ) => {
		let { host = 'localhost', port = 5173 } = options;
        
		const handle_error = error => {
			if ( error.code === 'EADDRINUSE' ) {
				server.listen( ++port, host );
			} else {
				server.removeListener( 'error', handle_error );
				reject( error );
			}
		};

		server.on( 'error', handle_error );

		server.listen( port, host, () => {
			server.removeListener( 'error', handle_error );
			server.close();
			resolve( port );
		} );
	} );
}
