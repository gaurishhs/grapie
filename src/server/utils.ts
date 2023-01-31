export const getPath = (url: string): string => {
	const queryIndex = url.indexOf('?')
	const result = url.substring(
		url.charCodeAt(0) === 47 ? 0 : url.indexOf('/', 11),
		queryIndex === -1 ? url.length : queryIndex
	)

	return result
}