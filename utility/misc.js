// @ts-check
/**
 * @param {Request} request 
 */

async function readRequestAsJSON(request) {
  const blobObj = await request.blob();
  const text = await blobObj.text();
	return JSON.parse(text);
}

function readCookiesAsJson(cookiesObj) {
  const cookiesAll = cookiesObj.getAll();
  const cookiesJson = {};
  cookiesAll.forEach(({name, value}) => {
    cookiesJson[name] = value;
  });
  return cookiesJson;
}

function getPrefixFull(prefix, allowedPrefix) {
	if (prefix.startsWith(allowedPrefix)) {
		prefix = prefix.substring(allowedPrefix.length);
	} else if ((prefix + '/').startsWith(allowedPrefix)) {
		prefix = prefix.substring(allowedPrefix.length - 1);
	}
	let result = `${allowedPrefix}${prefix}`;
	if (!result.endsWith('/')) {
		result += '/';
	}
	return result;
}

function isValidPrefix(prefix) {
	// "formed from the set of ASCII letters, digits, and hyphens (a–z, A–Z, 0–9, -), but not starting or ending with a hyphen"
	// ...plus an ending slash at end
	if (typeof prefix !== "string" || prefix.length < 2) {
		return false;
	}
	if (prefix.length === 2) {
		return /^[A-Za-z0-9]\/$/.test(prefix);
	}
	return /^[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9]\/$/.test(prefix);
}

/**
 * @param {string} functionName 
 * @param {Object} errorJSON 
 */

function APIThrowError(functionName, errorJSON) {
	throw APIError(functionName, errorJSON);
}

function replacer(key, value) {
	if (value instanceof Error) {
		return value.toString();
	} else if (('ProgressEvent' in globalThis) && (value instanceof ProgressEvent)) {
		return {
				type: value.type,
				timeStamp: value.timeStamp,
				lengthComputable: value.lengthComputable,
				loaded: value.loaded,
				total: value.total
		};
	}
	return value;
}


/**
 * @param {string} functionName 
 * @param {Object} errorJSON 
 */

function APIError(functionName, errorJSON) {
	return new Error(`${functionName} failed: ${JSON.stringify(errorJSON, replacer, 2)}`);
}

/**
 * @param {Number | string} uid
 */
function uidInt(uid) {
  if (typeof uid === "string") {
    return parseInt(uid, 10);
  } else {
    return uid;
  }
}

/**
 * Array of numbers [left, right) (Left-closed, right-open)
 * @param {Number} left 
 * @param {Number} right 
 */

function NumberArray(left, right) {
  return Array.from({ length: right - left }, (_, index) => left + index);
}

export {
	readRequestAsJSON,
	readCookiesAsJson,
  getPrefixFull,
	isValidPrefix,
	APIThrowError,
	APIError,
	uidInt,
	NumberArray,
}

