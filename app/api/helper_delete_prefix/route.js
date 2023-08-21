import { b2_delete_file, b2_list_file_names_expand_folder, b2_list_file_versions_expand_folder } from "@/utility/b2api";
import { helper_token_auth_raw } from "@/utility/helper_token_auth";
import { readRequestAsJSON } from "@/utility/misc";
import { NextResponse } from "next/server";

/**
 * 
 * @param {Request} request 
 */

export async function POST(request) {
	let { uid, token, prefix } = await readRequestAsJSON(request);
	uid = parseInt(uid, 10);
	const { conf, auth } = await helper_token_auth_raw({ uid, token });
	const { files } = await b2_list_file_versions_expand_folder(conf, auth, prefix);
	const result = await Promise.all(files.map(file => b2_delete_file(auth, file.fileName, file.fileId)));
	return NextResponse.json(result);
}
