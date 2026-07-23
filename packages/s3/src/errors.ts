const notFoundCodes = new Set(['NoSuchKey', 'NotFound'])

/**
 * Detects "object does not exist" errors across S3 SDKs.
 *
 * The AWS SDK v3 reports them via the error `name` (`NoSuchKey` for GetObject,
 * `NotFound` for HeadObject) and a 404 status code in `$metadata`, while the
 * MinIO SDK exposes the S3 error code in a `code` property instead.
 */
export function isNotFoundError(error: unknown): boolean {
	if (typeof error !== 'object' || error === null) {
		return false
	}

	const { name, code, $metadata } = error as {
		name?: unknown
		code?: unknown
		$metadata?: { httpStatusCode?: unknown }
	}

	return (
		(typeof name === 'string' && notFoundCodes.has(name)) ||
		(typeof code === 'string' && notFoundCodes.has(code)) ||
		$metadata?.httpStatusCode === 404
	)
}
