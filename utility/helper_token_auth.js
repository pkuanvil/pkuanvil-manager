import { pkuanvil_append_b2keys, pkuanvil_get_b2keys, pkuanvil_set_default_b2keyid } from "./pkuanvilapi";
import { b2_create_key, b2helper_auth_nonmaster } from "./b2api";
import { APIThrowError, readCookiesAsJson } from "./misc";

async function helper_token_auth(cookies) {
	const { uid, token } = readCookiesAsJson(cookies);
	return await helper_token_auth_raw({ uid, token });
}

async function create_and_set_default_b2key({ uid, token }) {
	const prefix = `uid${uid}/`;
	const { applicationKeyId: keyID, applicationKey } = await b2_create_key({ prefix });
	await Promise.all([
		pkuanvil_set_default_b2keyid({ uid, token, keyID }),
		pkuanvil_append_b2keys({ uid, token, keys: [{ keyID, applicationKey, namePrefix: prefix }]})
	]);
	return { keyID, applicationKey };
}

async function helper_token_auth_raw({ uid, token }) {
	const result = await pkuanvil_get_b2keys({ uid, token });
	if (!result.success) {
		APIThrowError('helper_token_auth_raw', 'Token Auth failed');
	}
	let result2;
	if (!result.keys || !result.keys.length) {
		result2 = await create_and_set_default_b2key({ uid, token });
	} else {
		result2 = helper_get_default_key(result);
	}
	const { keyID, applicationKey } = result2;
	if (!keyID || !applicationKey) {
		APIThrowError('helper_token_auth_raw', 'No default key');
	}
	const { conf, auth } = await b2helper_auth_nonmaster({ keyID, applicationKey });
	return {
		userdata: result.userdata,
		token,
		conf,
		auth,
	};
}

function helper_get_default_key(result) {
	if (!result.success) {
		APIThrowError('helper_get_default_key', 'Token Auth failed')
	}
	if (!result.keys || !result.keys.length) {
		APIThrowError('helper_get_default_key', 'No B2 key')
	}
	if (!result.defaultb2keyid) {
		return {
			keyID: null,
			applicationKey: null,
		};
	}
	for (const { keyID, applicationKey } of result.keys) {
		if (result.defaultb2keyid === keyID) {
			return {
				keyID,
				applicationKey,
			};
		}
	}
	return {
		keyID: null,
		applicationKey: null,
	};
}

async function helper_pkuanvil_userinfo(cookies) {
	const { uid, token } = readCookiesAsJson(cookies);
	return await helper_pkuanvil_userinfo_raw({ uid, token });
}

async function helper_pkuanvil_userinfo_raw({ uid, token }) {
	const { userdata, success } = await pkuanvil_get_b2keys({ uid, token });
	return { userdata, success };
}

export {
	helper_token_auth,
	helper_token_auth_raw,
	helper_get_default_key,
	helper_pkuanvil_userinfo,
	helper_pkuanvil_userinfo_raw,
}
