"use client";

import { useState } from 'react';
import { isValidPrefix } from '@/utility/misc';
import { api_create_b2_key } from '@/utility/client/API';
import { readCookiesAsJson } from '@/utility/client/misc';
import KeyInfo from '../KeyInfo';

const B2KeyForm = () => {
	const [prefix, setPrefix] = useState('');
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState(null);
	const [error, setError] = useState(null);

	const handleSubmit = async event => {
		event.preventDefault();
		setLoading(true);
		setResult(null);
		setError(null);

		let prefix_2 = prefix;
		if (!prefix.endsWith('/')) {
			prefix_2 = prefix + '/';
		} 
		if (!isValidPrefix(prefix_2)) {
			setError({ message: 'Invalid prefix' });
			return;
		}
		if (!prefix.endsWith('/')) {
			setPrefix(prefix_2);
		} 	

		try {
			const { uid, token } = readCookiesAsJson();
			const response = await api_create_b2_key({ uid, token, prefix: prefix_2 });
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
			<p>Create new key:</p>
			<div className="py-1"></div>
			<form onSubmit={handleSubmit}>
				<label>
					Prefix:
					<input className="mx-2 border" type="text" value={prefix} onChange={e => setPrefix(e.target.value)} required />
				</label>
				<button className="px-2 py-1 rounded border hover:border-black" type="submit">Confirm</button>
			</form>
			{loading && <div>Creating key...</div>}
			{error && <div className="text-red-600">Error: {error.message}</div>}
			{result && <div className="break-all">Result: <br></br><KeyInfo conf={result.conf}></KeyInfo></div>}
		</div>
	);
};

export default B2KeyForm;
