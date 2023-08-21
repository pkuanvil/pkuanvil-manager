// @ts-check
"use client";

/**
 * Check for client environment.
 * In addition to rendering server component entirely at server-side, next.js _also_ prerender client component
 * and hydrated at client. Server Client may also include client component as a child component.
 * (See https://nextjs.org/docs/getting-started/react-essentials#client-components)
 *
 * Some utility functions are only intended to be used at client (e.g. use browser-only API like localStorage).
 * This function is provided for utility functions.
 * **Don't use this for render function of client components!** (Use in event handlers is fine)
 * During server side rendering, either use `isClient()` instead to detect server and do nothing,
 * or use correct React API like useEffect() to actually use Client-side Rendering (CSR).
 * (See https://nextjs.org/docs/pages/building-your-application/rendering/client-side-rendering)
 */

function AssertClient() {
	if (!isClient()) {
		throw Error('Expect a client environment');
	}
}

/**
 * Check for client environment.
 * In addition to rendering server component entirely at server-side, next.js _also_ prerender client component
 * and hydrated at client. Server Client may also include client component as a child component.
 * (See https://nextjs.org/docs/getting-started/react-essentials#client-components)
 *
 * This function is provided for client components which want to detect client environment.
 * Usually, they will do nothing (like don't attempt to update React state) if no client component is found.
 * 
 * Note: this function is only a check. Use correct React API like useEffect() to actually use Client-side Rendering (CSR).
 * (See https://nextjs.org/docs/pages/building-your-application/rendering/client-side-rendering)
 */

function isClient() {
	let result = true;
	try {
		result = !!(globalThis.window && window.document && (!(globalThis.process && process.env)))
	} catch (e) {
		result = false;
	}
	return result;
}

export {
	AssertClient,
	isClient,
}

export default AssertClient;
