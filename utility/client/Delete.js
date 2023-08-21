"use client";

import { api_helper_delete_prefix } from "./API";
import { readCookiesAsJson } from "./misc";

function DeleteFilesByNames(fullNames) {
	const { uid, token } = readCookiesAsJson();
	return fullNames.map(name => api_helper_delete_prefix({ uid, token, prefix: name }).then(result => result.fileName));
}

export {
	DeleteFilesByNames,
}
