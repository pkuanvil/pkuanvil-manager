import { b2_create_key, b2helper_auth_nonmaster } from "@/utility/b2api";
import { helper_pkuanvil_userinfo_raw } from "@/utility/helper_token_auth";
import { isValidPrefix, readRequestAsJSON } from "@/utility/misc";
import { pkuanvil_append_b2keys, pkuanvil_register_prefix } from "@/utility/pkuanvilapi";
import { NextResponse } from 'next/server'


function detailErrorMessage({ uid, prefix, message }) {
	if (message === 'isOwner') {
		return `uid: ${uid} is already owner for prefix: ${prefix}`;
	} else if (message === 'isRegistered') {
		return `Prefix: ${prefix} is already registered`;
	} else if (message === 'exceedLimit') {
		return `You have exceeded the prefix creation limit`;
	}
	return 'Unknown Error';
}

/**
 * 
 * @param {Request} request 
 */

export async function POST(request) {
	let { uid, token, prefix } = await readRequestAsJSON(request);
	if (!isValidPrefix(prefix)) {
		return NextResponse.json({ error: 'Invalid Prefix' }, { status: 403 });

	}
	prefix = prefix.toLowerCase();
	// Token is valid
	if (prefix.startsWith("uid")) {
		// Don't allow creation for other uid
		if (!prefix.startsWith(`uid${uid}`)) {
			return NextResponse.json({ error: `"uid" prefix is reserved. For "uid" prefix you can only create: "uid${uid}/"` }, { status: 403 });
		}
	}
	// Register it with pkuanvil
	const result = await pkuanvil_register_prefix({ uid, token, prefix });
	if (!result.success) {
		return NextResponse.json({ error: detailErrorMessage({ uid, prefix, message: result.message })}, { status: 403 });
	}
	const { applicationKeyId: keyID, applicationKey } = await b2_create_key({ prefix });
	const [b2auth, ] = await Promise.all([
		b2helper_auth_nonmaster({ keyID, applicationKey }),
		pkuanvil_append_b2keys({ uid, token, keys: [{ keyID, applicationKey, namePrefix: prefix }]}),
	]);
	return NextResponse.json(b2auth);
}
