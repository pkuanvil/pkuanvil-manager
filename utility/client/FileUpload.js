// @ts-check
'use client';

import { api_helper_request_upload_url } from "@/utility/client/API";
import { b2_upload_file_client_progress } from "@/utility/b2api";
import { readCookiesAsJson } from "./misc";
import { NumberArray } from "../misc";
import doTasks from "./Task";
import AssertClient from "./AssertClient";
import { getPrefixFull } from "../misc";
import { fileToSHA1 } from "./Hash";

/**
 * @typedef {import("../b2api").B2FileInfo} B2FileInfo
 * @typedef {import("../b2api").B2UploadAuth} B2UploadAuth
 * @typedef {import("../b2api").B2UploadSuccessInfo} B2UploadSuccessInfo
 */

/**
 * @param {File} inputFile
 * @param {boolean} isDirectory
 * @returns {Promise<B2FileInfo>}
 */
async function getInputFileInfo(inputFile, isDirectory) {
	const fileName = isDirectory ? inputFile.webkitRelativePath : inputFile.name;
	const sha1 = await fileToSHA1(inputFile);
	return {
		fileName: fileName,
		sha1: sha1,
		contentLength: inputFile.size,
		contentType: inputFile.type,
		lastModified: inputFile.lastModified,
	};
}

async function requestUploadAuth() {
	const result = await api_helper_request_upload_url(readCookiesAsJson());
	// Get current path
	AssertClient();
	result.namePrefix = getPrefixFull(decodeURIComponent(window.location.pathname.substring('/files/'.length)), result.namePrefix);
	return result;
}

const CONCURRENCY_LIMIT = [
	{ fileSize: 1024 * 1024, count: 20, concurrency: 5 },
	{ fileSize: 512 * 1024, count: 20, concurrency: 7 },
	{ fileSize: 256 * 1024, count: 20, concurrency: 10 },
	{ fileSize: 100 * 1024, count: 50, concurrency: 15 },
	{ fileSize: 100 * 1024, count: 100, concurrency: 20 },
	{ fileSize: 100 * 1024, count: 200, concurrency: 25 },
	{ fileSize: 100 * 1024, count: 300, concurrency: 30 },
	{ fileSize: 100 * 1024, count: 500, concurrency: 50 },
	{ fileSize: 50 * 1024, count: 1000, concurrency: 75 },
	{ fileSize: 25 * 1024, count: 2000, concurrency: 100 },
]

/**
 * @param {FileList} files
 */

function getConcurrency(files) {
	// Initial concurrency
	let result = Math.min(3, files.length);
	// The general idea is that for smaller average size and larger number of files, use more concurrency.
	let totalFileSize = 0;
	for (let i = 0; i < files.length; i++) {
		totalFileSize += files[i].size;
	}
	const averageFileSize = totalFileSize / files.length;
	const fileCount = files.length;
	CONCURRENCY_LIMIT.forEach(({ fileSize, count, concurrency }) => {
		if (averageFileSize <= fileSize && fileCount >= count) {
			result = Math.max(result, concurrency);
		}
	});
	return result;
}

/**
 * @param {FileList} files
 * @param {boolean} isDirectory
 * @param {Function} callback
 */

async function FileUpload(files, isDirectory, callback) {
	// Intended concurrent uploads
	const uploadURLCount = getConcurrency(files);
	/**
	 * @type {import("./Task").Task[]}
	 */
	const tasks = Array()
	const func = createUploadFunc();
	// FileList is not an Array, so no Array.map() here. Just use for loop
	for (let i = 0; i < files.length; i++) {
		tasks.push({
			params: [files[i], isDirectory, callback],
			func,
		});
	}
	const workerPromises = NumberArray(0, uploadURLCount).map((_, index) => initUploadWorker(index) );
	const envs = await Promise.all(workerPromises);
	return doTasks(tasks, {
		maxConcurrency: uploadURLCount,
		concurrencyEnvs: envs,
	});
}

/**
 * @typedef {Object} WorkerRef
 * @property {Number} index
 * @property {Number} uploadRetryAuthCount
 * @property {Number} uploadRetryCount
 * @property {string} namePrefix
 * @property {B2UploadAuth} uploadAuth
 */

/**
 * @returns {Promise<WorkerRef>}
 */

async function initUploadWorker(index) {
	const workerRef = {};
	workerRef.index = index;
	workerRef.uploadRetryAuthCount = 0;
	workerRef.uploadRetryCount = 0;
	const { uploadAuth, namePrefix } = await requestUploadAuth();
	workerRef.uploadAuth = uploadAuth;
	workerRef.namePrefix = namePrefix;
	return workerRef;
}

function createUploadFunc() {
	/**
	 * @param {WorkerRef} workerRef
	 * @param {File} file
	 * @param {boolean} isDirectory
	 */
	
	return async function(workerRef, file, isDirectory, callback) {
		return uploadWorkerDoUpload(workerRef, file, isDirectory, callback)
			.then((data) => {
				const event = {
					name: 'fileUploadSuccess',
					data,
					file,
					error: null,
				};
				callback(event);
				return event;
			})
			.catch((error) => {
				const event = {
					name: 'fileUploadError',
					data: null,
					file,
					error,
				};
				callback(event);
				return event;
			})
	}
}

/**
 * @param {WorkerRef} workerRef
 * @param {File} file
 * @param {boolean} isDirectory
 */

async function uploadWorkerDoUpload(workerRef, file, isDirectory, callback) {
	const MAX_RETRY_AUTH = 2;
	const MAX_RETRY_COUNT = 2;

	const fileInfo = await getInputFileInfo(file, isDirectory);
	fileInfo.fileName = `${workerRef.namePrefix}${fileInfo.fileName}`;

	callback({
		name: 'fileUploadStart', 
		data: null,
		file,
		error: null,
	})

	/**
	 * @param {ProgressEvent} event
	 */
	function onProgress(event) {
		callback({
			name: 'ProgressEvent',
			data: event,
			file,
			error: null,
		})
	}

	while (true) {
		let success = false;
		let data;
		let errors = [];
		try {
			data = await b2_upload_file_client_progress(workerRef.uploadAuth, file, fileInfo, onProgress);
			success = true;
		} catch (e) {
			errors.push(e);
		}
		if (!success) {
			// Upload Failed
			workerRef.uploadRetryCount += 1;
			if (workerRef.uploadRetryCount >= MAX_RETRY_COUNT) {
				if (workerRef.uploadRetryAuthCount >= MAX_RETRY_AUTH) {
					// Giveup
					const message = `Too many retry: ${workerRef.uploadRetryAuthCount},${workerRef.uploadRetryCount}`;
					throw new Error(`${message}; ${errors.map(e => e.toString()).join('; ')}`)
				} else {
					// Try another url
					try {
						const { uploadAuth } = await requestUploadAuth();
						workerRef.uploadAuth = uploadAuth;
					} catch (e) {
						// Cannot get uploadAuth
						errors.push(e);
					}
					workerRef.uploadRetryCount = 0;
					workerRef.uploadRetryAuthCount += 1;
				}
			}
		} else {
			// Upload success
			return data;
		}
	}
}

export default FileUpload;
