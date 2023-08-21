import { b2_create_key, b2helper_auth_nonmaster } from "@/utility/b2api";
import { helper_pkuanvil_userinfo_raw } from "@/utility/helper_token_auth";
import { isValidPrefix, readRequestAsJSON } from "@/utility/misc";
import { pkuanvil_append_b2keys } from "@/utility/pkuanvilapi";
import { NextResponse } from 'next/server'

/**
 * 
 * @param {Request} request 
 */

export async function POST(request) {
	let { uid, token, prefix } = await readRequestAsJSON(request);
	uid = parseInt(uid);
	// Check whether token is valid
	const { success } = await helper_pkuanvil_userinfo_raw({ uid, token });
	if (!success) {
		return NextResponse.json({ error: 'Invalid Token' }, { status: 403 });
	}
	if (!isValidPrefix(prefix)) {
		return NextResponse.json({ error: 'Invalid Prefix' }, { status: 403 });

	}
	// Token is valid
	if (prefix.startsWith("uid")) {
		// Don't allow creation for other uid
		if (prefix !== `uid${uid}/`) {
			return NextResponse.json({ error: `"uid" prefix is reserved. For "uid" prefix you can only create: "uid${uid}/"` }, { status: 403 });
		}
	}
	const { applicationKeyId: keyID, applicationKey } = await b2_create_key({ prefix });
	const [b2auth, ] = await Promise.all([
		b2helper_auth_nonmaster({ keyID, applicationKey }),
		pkuanvil_append_b2keys({ uid, token, keys: [{ keyID, applicationKey, namePrefix: prefix }]}),
	]);
	return NextResponse.json(b2auth);
}
