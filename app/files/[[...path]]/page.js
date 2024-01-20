import NavSide from '@/components/NavSide'
import Header from '@/components/Header'
import { Files } from '@/components/client/Files'

import { b2_list_file_names } from '@/utility/b2api'
import { helper_token_auth } from '@/utility/helper_token_auth'
import { cookies } from 'next/headers'

import { getPrefixFull } from '@/utility/misc'

export default async function Files_Page({ params, searchParams }) {
	const { path: pathSegs } = params;
	let { startFileName } = searchParams;
	const prefix = pathSegs ? pathSegs.map(pathseg => decodeURIComponent(pathseg)).join('/'): '';
	try {
		const { conf, auth } = await helper_token_auth(cookies());
		const downloadPrefix = `${auth.downloadUrl}/file/${conf.bucketName}/`;
		const prefixFull = getPrefixFull(prefix, conf.namePrefix);
		const data = await b2_list_file_names(conf, auth, prefixFull, startFileName);
		return (
			<>
				<Header></Header>
				<NavSide currentPath={'/files'}></NavSide>
				<main className="lg:pl-80">
					<Files
						initFiles={data.files}
						prefixFull={prefixFull}
						nextFileName={data.nextFileName}
						authToken={auth.authorizationToken}
						downloadPrefix={downloadPrefix}
					/>
				</main>
			</>
		)
	} catch (e) {
		return (
			<>
				<Header></Header>
				<NavSide currentPath={'/files'}></NavSide>
				<main className='lg:pl-80'>
					<p>{e.toString()}</p>
				</main>
			</>
		)
	}
}
