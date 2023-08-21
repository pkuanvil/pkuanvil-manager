import NavSide from '@/components/NavSide'
import Header from '@/components/Header'
import KeyInfo from '@/components/KeyInfo'

import { helper_token_auth } from '@/utility/helper_token_auth'
import { cookies } from 'next/headers'
import { readCookiesAsJson } from '@/utility/misc'
import { pkuanvil_get_b2keys } from '@/utility/pkuanvilapi'
import { b2helper_auth_nonmaster } from '@/utility/b2api'
import B2KeyForm from '@/components/client/B2KeyForm'

function DefaultKeyInfo({ conf }) {
	if (conf && conf.keyID) {
		return (
			<>
				<p>Current Active Key:</p>
				<KeyInfo conf={conf}></KeyInfo>
			</>
		)
	} else {
		return (
			<p>No Active Key Selected.</p>
		)
	}
}

function TryKeyInfo({ hasError, conf, message }) {
	if (!hasError) {
		return <KeyInfo conf={conf}></KeyInfo>
	} else {
		return <p className="text-red-600">{message}</p>
	}
}

async function AllKeysInfo({ confPromises }) {
	return (
		<>
			{ confPromises.length && <p>All keys:</p> }
			{
				confPromises.map(({ status, value, reason }, index) => {
					return (
						<TryKeyInfo
							key={index}
							hasError={status === "fulfilled" ? false : true}
							conf={value && value.conf}
							message={reason && reason.toString()}
						></TryKeyInfo>
					)
				})
			}
		</>
	)
}

async function getDefaultKeyConf() {
	let defaultKeyConf = null;
	try {
		defaultKeyConf = (await helper_token_auth(cookies())).conf;
	} catch (e) {
		// Do nothing
	}
	return defaultKeyConf;
}

async function getConfPromises() {
	const { keys, success } = await pkuanvil_get_b2keys(readCookiesAsJson(cookies()));
	if (!success) {
		return [];
	}
	const confPromises = await Promise.allSettled(
		keys.map(({ keyID, applicationKey }) => b2helper_auth_nonmaster({ keyID, applicationKey }))
	);
	return confPromises;
}

export default async function Prefix() {
	// helper_token_auth may create a default key, so these must be sequential
	const defaultKeyConf = await getDefaultKeyConf();
	const confPromises = await getConfPromises();
	try {
		return (
			<>
				<Header></Header>
				<NavSide currentPath={'/prefix'}></NavSide>
				<main className="lg:pl-80">
					<p>Click on each item to show key details.</p>
					<DefaultKeyInfo conf={defaultKeyConf}></DefaultKeyInfo>
					<div className="py-4"></div>
					<AllKeysInfo confPromises={confPromises}></AllKeysInfo>
					<div className="py-4"></div>
					<B2KeyForm></B2KeyForm>
					<div className="py-4"></div>
				</main>
			</>
		)
	} catch (e) {
		return (
			<>
				<Header></Header>
				<NavSide currentPath={'/prefix'}></NavSide>
				<main className='lg:pl-80'>
					<p>{e.toString()}</p>
				</main>
			</>
		)
	}
}
