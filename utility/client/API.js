"use client";

/**
 * @typedef {import("../b2api").B2UploadAuth} B2UploadAuth
 */

async function VercelAPIThrowError(functionName, result) {
	let message = result.status;
	if (result.status >= 400 && result.status < 500) {
		try {
			const data = await result.json();
			message = `${result.status}: ${data.error}`;
		} catch (e) {
			message = `${result.status}`;
		}
	}
	throw Error(`${functionName} failed: ${message}`);
}

async function api_create_b2_key(param) {
	const { uid, token, prefix } = param;
	const result = await fetch('/api/create_b2_key', {
		method: 'POST',
		body: JSON.stringify({
			uid,
			token,
			prefix,
		})
	});
	if (!result.ok) {
		return VercelAPIThrowError('api_create_b2_key', result);
	}
	return await result.json();
}

async function api_delete_b2_key(param) {
	const { uid, token, keyID } = param;
	const result = await fetch('/api/delete_b2_key', {
		method: 'POST',
		body: JSON.stringify({
			uid,
			token,
			keyID,
		})
	});
	if (!result.ok) {
		return VercelAPIThrowError('api_delete_b2_key', result);
	}
	return await result.json();
}

async function api_helper_request_upload_url(param) {
	const { uid, token } = param;
	const result = await fetch('/api/helper_request_upload_url', {
		method: 'POST',
		body: JSON.stringify({
			uid,
			token,
		})
	});
	if (!result.ok) {
		return VercelAPIThrowError('api_helper_request_upload_url', result);
	}
	return await result.json();
}

async function api_helper_delete_prefix(param) {
	const { uid, token, prefix } = param;
	const result = await fetch('/api/helper_delete_prefix', {
		method: 'POST',
		body: JSON.stringify({
			uid,
			token,
			prefix,
		})
	});
	if (!result.ok) {
		return VercelAPIThrowError('api_helper_delete_prefix', result);
	}
	return await result.json();
}

export {
	api_create_b2_key,
	api_delete_b2_key,
	api_helper_request_upload_url,
	api_helper_delete_prefix,
}
