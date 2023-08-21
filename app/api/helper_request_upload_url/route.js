import { helper_token_auth_raw } from "@/utility/helper_token_auth";
import { b2_get_upload_url } from "@/utility/b2api";
import { readRequestAsJSON } from "@/utility/misc";
import { NextResponse } from 'next/server'

/**
 * 
 * @param {Request} request 
 */

export async function POST(request) {
	let { uid, token } = await readRequestAsJSON(request);
	uid = parseInt(uid, 10);
	const { conf, auth } = await helper_token_auth_raw({ uid, token });
	const result = await b2_get_upload_url(conf, auth);
	return NextResponse.json({
		uploadAuth: result,
		namePrefix: conf.namePrefix,
	});
}
