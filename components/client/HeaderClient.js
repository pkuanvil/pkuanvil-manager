"use client";

import HeaderRaw from "../HeaderRaw";
import { isClient } from "@/utility/client/AssertClient";
import { TryToken } from "@/utility/client/TryToken";
import DummyCatchError from "@/utility/client/DummyCatchError";
import { useState } from "react";

export default function HeaderClient({ userInfo }) {
	const [init, setInit] = useState(false);
	if (!init && isClient()) {
		TryToken()
		.then(({ cookieChanged }) => {
			// Refresh page if a cookie set happened
			if (cookieChanged) {
				location.reload();
			}
			// Set this first because Promise.finally() is not synchronious 
			setInit(true);
		})
		.catch(e => {
			setInit(true);
			DummyCatchError(e);
		})
	}
	return <HeaderRaw userInfo={userInfo}></HeaderRaw>
}
