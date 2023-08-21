// @ts-check
import AssertClient from './client/AssertClient';
import { uidInt } from './misc';
import { APIThrowError } from './misc';

/** @type {string} */
let pkuanvil_host;
if (process.env.PKUANVIL_HOST) {
	pkuanvil_host = process.env.PKUANVIL_HOST;
} else if (process.env.NODE_ENV === 'production') {
	pkuanvil_host = 'https://www.pkuanvil.com';
} else if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' ) {
	pkuanvil_host = 'http://127.0.0.1:4567';
}

/**
 * @typedef {Object} B2Key
 * @property {string} keyID
 * @property {string} applicationKey
 */

/**
 * @typedef {Object} PKUAnvilB2ListKeys        - PKUAnvil B2 List Keys
 * @property {Object} userdata                    - userdata of the authenticating user
 * @property {Number} userdata.uid                   - uid of the authenticating user
 * @property {string} userdata.username              - username of the authenticating user     
 * @property {Object} token                       - Token to authenticate /pr_B2Token
 * @property {string | null} defaultb2keyid       - Default B2 Key ID
 * @property {Array<B2Key>} keys                  - B2 Keys
 * @property {true} success                    - Whether this authentication succeeded
 */

/**
 * @typedef {Object} PKUAnvilB2ListKeysFailed   - PKUAnvil B2 List Keys Failed
 * @property {false} success                    - Whether this authentication succeeded
 */

/** @typedef {(param: { uid: Number | string, token: string }) => Promise<PKUAnvilB2ListKeys | PKUAnvilB2ListKeysFailed>} PKUAnvilGetB2Keys */

/** @type {PKUAnvilGetB2Keys} */

const pkuanvil_get_b2keys = async (param) => {
	const { uid, token } = param;
	const result = await fetch(`${pkuanvil_host}/api/v3/plugins/pr_B2Token`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			uid: uidInt(uid),
			token,
			action: 'listb2keys',
		}),
	});
	if (!result.ok) {
		return { success: false };
	}
	const { response } = await result.json();
	if (response.token !== token) {
		return { success: false };
	}
	return {
		...response,
		success: true,
	};
};

/**
 * @param {Object} param
 * @param {Boolean} param.useCredentials
 * @param {Number | string=} param.uid
 * @param {string=} param.token
 * @returns {Promise<PKUAnvilB2ListKeys | PKUAnvilB2ListKeysFailed>}
 */

const pkuanvil_get_b2keys_client = async (param) => {
	const { useCredentials, uid, token } = param;
	AssertClient();
	const result = await fetch(`${pkuanvil_host}/api/v3/plugins/pr_B2Token`, {
		method: 'POST',
		mode: 'cors',
		credentials: useCredentials ? 'include': 'omit',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			uid: useCredentials ? undefined: uid,
			token: useCredentials ? undefined: token,
			action: 'listb2keys',
		}),
	});
	if (!result.ok) {
		return { success: false };
	}
	const { response } = await result.json();
	return {
		...response,
		success: true,
	}
};

/**
 * @param {Object} param
 * @param {Number | string} param.uid
 * @param {string} param.token
 * @param {B2Key[]} param.keys
 * @returns {Promise<PKUAnvilB2ListKeys>}
 */

const pkuanvil_append_b2keys = async (param) => {
	const { uid, token, keys } = param;
	const result = await fetch(`${pkuanvil_host}/api/v3/plugins/pr_B2Token`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			uid: uidInt(uid),
			token,
			action: 'appendb2keys',
			keys,
		}),
	});
	const data = await result.json();
	if (!result.ok) {
		APIThrowError('pkuanvil_append_b2keys', data);
	}
	return data;
};

/**
 * @param {Object} param
 * @param {Number | string} param.uid
 * @param {string} param.token
 * @param {B2Key[]} param.keys
 * @returns {Promise<PKUAnvilB2ListKeys>}
 */

const pkuanvil_remove_b2keys = async (param) => {
	const { uid, token, keys } = param;
	const result = await fetch(`${pkuanvil_host}/api/v3/plugins/pr_B2Token`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			uid: uidInt(uid),
			token,
			action: 'removeb2keys',
			keys,
		}),
	});
	const data = await result.json();
	if (!result.ok) {
		APIThrowError('pkuanvil_remove_b2keys', data);
	}
	return data;
};

/**
 * @param {Object} param
 * @param {Number | string} param.uid
 * @param {string} param.token
 * @param {string} param.keyID
 */

const pkuanvil_set_default_b2keyid = async (param) => {
	const { uid, token, keyID } = param;
	const result = await fetch(`${pkuanvil_host}/api/v3/plugins/pr_B2Token`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			uid: uidInt(uid),
			token,
			action: 'setdefaultb2keyid',
			keyID,
		}),
	});
	const data = await result.json();
	if (!result.ok) {
		APIThrowError('pkuanvil_set_default_b2keyid', data);
	}
	return data;
};

export {
	pkuanvil_get_b2keys,
	pkuanvil_get_b2keys_client,
	pkuanvil_append_b2keys,
	pkuanvil_remove_b2keys,
	pkuanvil_set_default_b2keyid,
	pkuanvil_host,
}
