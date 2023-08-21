"use client";

import { api_delete_b2_key } from "@/utility/client/API";
import { readCookiesAsJson } from "@/utility/client/misc";
import { useState } from "react";

export default function KeyDelete({ keyID }) {
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState(null);
	const [error, setError] = useState(null);

	const doDelete = async event => {
		setLoading(true);
		setResult(null);
		setError(null);

		try {
			const { uid, token } = readCookiesAsJson();
			const response = await api_delete_b2_key({ uid, token, keyID });
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
				className={`px-2 py-1 rounded border hover:bg-amber-50 hover:text-red-600 ${result ? 'hidden' : ''}`}
				onClick={doDelete}
			>
				Delete This Key
			</button>
			{loading && <div>Deleting key...</div>}
			{error && <div className="text-red-600">Error: {error.message}</div>}
			{result && <div className="break-all">This Key is deleted.</div>}
		</div>
	)
}