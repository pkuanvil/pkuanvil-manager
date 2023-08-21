// @ts-check
"use client";

import jsSHA from "jssha";

/**
 * This is very ugly, but to avoid additional download in web worker, and also cater for the build system
 * (i.e. no custom <script>, instead everything is bundled by next.js), 
 * we use a prebuild script to export sha1 source code as a string (escaping backticks of course), and prepend it
 * before the web worker source string.
 */
import sha1Source from "../../vendor/jssha/sha1";

/**
 * @param {ArrayBuffer} buffer
 */

async function bufferToSHA1(buffer) {
	let shaObj = new jsSHA("SHA-1", "ARRAYBUFFER");
	shaObj.update(buffer);
	return shaObj.getHash("HEX");
}

/**
 * @param {Blob} blob 
 * @returns {Promise<ArrayBuffer>}
 */

function getInputFileAsArrayBuffer(blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		// @ts-ignore
		reader.onload = () => resolve(reader.result);
		reader.onerror = error => reject(new Error(`FileReader error: ${error}`));
		reader.readAsArrayBuffer(blob);
	});
}

/** Worker string is computed once and reused in workerSHA1 function */
const workerString = `${sha1Source};
self.onmessage = async (e) => {
	const response = await fetch(e.data.url);
	const reader = response.body.getReader();
	const shaObj = new jsSHA('SHA-1', 'ARRAYBUFFER');
	let result;
	while ((result = await reader.read()) && !result.done) {
		shaObj.update(result.value);
	}
	postMessage(shaObj.getHash("HEX"));
};`;

/**
 * A web worker wrapper for jsSHA
 * @param {Blob} blob
 * @returns {Promise<string>}
 */
async function workerSHA1(blob) {
	const blobURL = URL.createObjectURL(blob);
	const workerBlob = new Blob([workerString], { type: 'text/javascript' });

	const worker = new Worker(URL.createObjectURL(workerBlob));

	return new Promise((resolve, reject) => {
		worker.onmessage = (event) => {
			URL.revokeObjectURL(blobURL);
			worker.terminate();

			if (event.data.error) {
				reject(new Error(`Worker error: ${event.data.error}`));
			} else {
				resolve(event.data);
			}
		};
		worker.onerror = (event) => {
			reject(event);
		};
		worker.onmessageerror = (event) => {
			reject(event);
		};
		worker.postMessage({ url: blobURL });
	});
}

/**
 * @param {Blob} blob 
 */
async function streamingSHA1(blob) {
	const reader = blob.stream().getReader();
	const shaObj = new jsSHA('SHA-1', 'ARRAYBUFFER');
	let result;
	while ((result = await reader.read()) && !result.done) {
		shaObj.update(result.value);
	}
	return shaObj.getHash("HEX");
}

/**
 * @param {Blob} blob 
 */
async function fileToSHA1(blob) {
	// Web Worker has an overhead of 40ms for creation, plus a fixed 1-2ms for each postMessage.
	// (postMessage also have serialize and transmit cost of 80KB/ms, which is not significant in our case)
	// It makes very little sense to use web worker for small file sizes.

	// 4MB
	const MIN_WORKER_FILE_SIZE = 4 * 1024 * 1024;
	if (blob.size >= MIN_WORKER_FILE_SIZE) {
		try {
			// Try Web Worker first
			if (!window.Worker) {
				throw new Error('No web Worker');
			}
			return await workerSHA1(blob);
		} catch (error) {
			console.info(error);
		}
	}

	// Use streaming hash API if error occurs with worker, or file size is small
	try {
		return await streamingSHA1(blob);
	} catch (error) {
		console.info(error);
	}

	// Fall back to buffer if streaming hash API fails
	return bufferToSHA1(await getInputFileAsArrayBuffer(blob));
}

export {
	bufferToSHA1,
	fileToSHA1,
	streamingSHA1,
	workerSHA1,
	getInputFileAsArrayBuffer,
}
