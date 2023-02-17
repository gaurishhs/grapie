// 4.25x faster than url.parse
export const getPath = (url: string): string => {
	var queryIndex = url.indexOf("?");
	return url.substring(
		url.charCodeAt(0) === 47 ? 0 : url.indexOf("/", 11),
		queryIndex === -1 ? url.length : queryIndex
	);
};
