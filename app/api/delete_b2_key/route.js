import { b2_delete_key } from "@/utility/b2api";
import { helper_pkuanvil_userinfo_raw } from "@/utility/helper_token_auth";
import { readRequestAsJSON } from "@/utility/misc";
import { pkuanvil_remove_b2keys } from "@/utility/pkuanvilapi";
import { NextResponse } from 'next/server'

/**
 * 
 * @param {Request} request 
 */

export async function POST(request) {
	let { uid, token, keyID } = await readRequestAsJSON(request);
	uid = parseInt(uid);
	// Check whether token is valid
	const { success } = await helper_pkuanvil_userinfo_raw({ uid, token });
	if (!success) {
		return NextResponse.json({ error: 'Invalid Token' }, { status: 403 });
	}

	const [result, ] = await Promise.all([
		b2_delete_key({ keyID }),
		pkuanvil_remove_b2keys({ uid, token, keys: [{ keyID }]}),
	]);
	return NextResponse.json(result);
}
