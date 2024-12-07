"use client";

import { readCookiesAsJson } from "@/utility/client/misc";
import { pkuanvil_set_default_b2keyid_client } from "@/utility/pkuanvilapi";
import { useState } from "react";

export default function KeySetDefault({ keyID }) {
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState(null);
	const [error, setError] = useState(null);

	const doActivate = async event => {
		setLoading(true);
		setResult(null);
		setError(null);

		try {
			const { uid, token } = readCookiesAsJson();
			const response = await pkuanvil_set_default_b2keyid({ uid, token, keyID });
			setLoading(false);
			setResult(response);
			setError(null);
		} catch (err) {
			setLoading(false);
			setError(err);
		}
	};

	return (
		<div>
			<button
				className="px-2 py-1 rounded border hover:bg-amber-50 hover:text-red-600"
				onClick={doActivate}
			>
				Activate this key
			</button>
			{loading && <div>Activating this key...</div>}
			{error && <div className="text-red-600">Error: {error.message}</div>}
			{result && <div className="break-all">Activate success.</div>}
		</div>
	)
}
