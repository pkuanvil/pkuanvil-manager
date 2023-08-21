// @ts-check
"use client";

import AssertClient from "./AssertClient";
import { pkuanvil_get_b2keys_client } from "@/utility/pkuanvilapi";
import { readCookiesAsJson, writeCookiesFromJson } from "@/utility/client/misc";

async function TryToken() {
	AssertClient();
	const cookieJSON = readCookiesAsJson();
	if (cookieJSON.uid && cookieJSON.token) {
		// Verify existing token
		const data = await pkuanvil_get_b2keys_client({ useCredentials: false, uid: cookieJSON.uid, token: cookieJSON.token });
		if (data.success) {
			return {
				cookieChanged: false,
				userInfo: data,
			};
		}
	}
	// Failed, try again with credentials
	const data = await pkuanvil_get_b2keys_client({ useCredentials: true });
	if (!data.success) {
		// No login found, giveup
		return {
			cookieChanged: false,
			userInfo: data,
		}
	}
	// Update Token
	const { uid } = data.userdata;
	const { token } = data;
	writeCookiesFromJson({
		uid,
		token,
	});
	return {
		cookieChanged: true,
		userInfo: data,
	};
}

export {
	TryToken,
}
