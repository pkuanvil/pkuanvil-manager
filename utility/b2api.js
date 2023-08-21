// @ts-check

import { APIError, APIThrowError } from "./misc";

/**
 * @typedef {Object} B2Auth         - B2 Account Authentication
 * @property {string} accountId           - B2 Account Id
 * @property {string} apiUrl              - B2 API URL
 * @property {string} downloadUrl         - B2 File Download URL
 * @property {string} authorizationToken  - B2 Account authorizationToken
 * @property {Object} allowed             - B2 Account Privileges
 * @property {string | null} allowed.bucketId    - B2 Account allowed bucketId
 * @property {string | null} allowed.bucketName  - B2 Account allowed bucketName
 * @property {string | null} allowed.namePrefix  - B2 Account allowed namePrefix
 * @property {Array} allowed.capabilities
 * 
 * @typedef {Object} B2Key         - B2 Key
 * @property {string} keyID          - B2 keyID
 * @property {string} applicationKey - B2 applicationKey
 * 
 * @typedef {Object} B2Conf        - B2 Key Configuration
 * @property {string} keyID          - B2 keyID
 * @property {string} applicationKey - B2 applicationKey
 * @property {string} namePrefix     - namePrefix
 * @property {string} bucketId       - bucketId
 * 
 * @typedef {Object} B2UploadAuth - B2 Upload Authentication
 * @property {string} authorizationToken   - B2 Upload authorizationToken
 * @property {string} bucketId             - B2 BucketId
 * @property {string} uploadUrl            - B2 Upload URL
 * 
 * @typedef {Object} B2FileInfo   - B2 FileInfo
 * @property {string} fileName      - Filename
 * @property {string} sha1          - SHA1 hash of the file
 * @property {string} contentType   - MIME Type
 * @property {Number} contentLength - File Length
 * @property {Number=} lastModified  - Last Modified (UNIX milliseconds)
 * 
 * @typedef {Object} B2UploadSuccessInfo - B2 Upload Success Info
 * @property {number} uploadTimestamp       - Upload Timestamp
 */

/**
 * @param {B2Key} conf
 * @returns {Promise<B2Auth>}
 */

async function b2_authorize_account(conf) {
	const res = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
		headers: {
			Authorization: 'Basic' + btoa(`${conf.keyID}:${conf.applicationKey}`),
		},
	});
	const auth = await res.json();
	if (!res.ok) {
		APIThrowError('b2_authorize_account', auth);
	}
	return auth;
}

/**
 * @param {Object} param
 * @param {string} param.prefix
 * @param {string=} param.keyName
 * @param {string=} param.bucketId
 */

async function b2_create_key(param) {
	const conf_master = {
		keyID: process.env.MASTER_KEYID,
		applicationKey: process.env.MASTER_AK,
	};
	const auth_master = await b2_authorize_account(conf_master);
	const { prefix, keyName = prefix.substring(0, prefix.length - 1), bucketId = process.env.defaultBucketId } = param;
	const result = await fetch(`${auth_master.apiUrl}/b2api/v2/b2_create_key`, {
		method: 'POST',
		headers: {
			Authorization: auth_master.authorizationToken,
		},
		body: JSON.stringify({
			accountId: auth_master.accountId,
			capabilities: [
				'deleteFiles',
				'listBuckets',
				'listFiles',
				'readBuckets',
				'readFiles',
				'readBucketEncryption',
				'readBucketReplications',
				'shareFiles',
				'writeBucketEncryption',
				'writeBucketReplications',
				'writeFiles',
			],
			keyName,
			bucketId,
			namePrefix: prefix,
		}),
	});
	const data = await result.json();
	if (!result.ok) {
		APIThrowError('b2_create_key', data);
	}
	return data;
}

/**
 * @param {Object} param
 * @param {string} param.keyID
 */

async function b2_delete_key(param) {
	const conf_master = {
		keyID: process.env.MASTER_KEYID,
		applicationKey: process.env.MASTER_AK,
	};
	const auth_master = await b2_authorize_account(conf_master);
	const result = await fetch(`${auth_master.apiUrl}/b2api/v2/b2_delete_key`, {
		method: 'POST',
		headers: {
			Authorization: auth_master.authorizationToken,
		},
		body: JSON.stringify({
			applicationKeyId: param.keyID,
		}),
	});
	const data = await result.json();
	if (!result.ok) {
		APIThrowError('b2_delete_key', data);
	}
	return data;
}

/**
 * @param {B2Conf} conf
 * @param {B2Auth} auth
 */

async function b2_list_file_names(conf, auth, prefix) {
	const res = await fetch(`${auth.apiUrl}/b2api/v2/b2_list_file_names`, {
		method: 'POST',
		headers: {
			Authorization: auth.authorizationToken,
		},
		body: JSON.stringify({
			bucketId: conf.bucketId,
			delimiter: '/',
			prefix: prefix || conf.namePrefix,
			maxFileCount: 1000,
		}),
	});
	const data = await res.json();
	if (!res.ok) {
		APIThrowError('b2_list_file_names', data);
	}
	return data;
}

/**
 * @param {B2Conf} conf
 * @param {B2Auth} auth
 */

async function b2_list_file_names_expand_folder(conf, auth, prefix) {
	const res = await fetch(`${auth.apiUrl}/b2api/v2/b2_list_file_names`, {
		method: 'POST',
		headers: {
			Authorization: auth.authorizationToken,
		},
		body: JSON.stringify({
			bucketId: conf.bucketId,
			prefix: prefix || conf.namePrefix,
			maxFileCount: 1000,
		}),
	});
	const data = await res.json();
	if (!res.ok) {
		APIThrowError('b2_list_file_names_expand_folder', data);
	}
	return data;
}

/**
 * @param {B2Conf} conf
 * @param {B2Auth} auth
 */

async function b2_list_file_versions(conf, auth, prefix) {
	const res = await fetch(`${auth.apiUrl}/b2api/v2/b2_list_file_versions`, {
		method: 'POST',
		headers: {
			Authorization: auth.authorizationToken,
		},
		body: JSON.stringify({
			bucketId: conf.bucketId,
			delimiter: '/',
			prefix: prefix || conf.namePrefix,
			maxFileCount: 1000,
		}),
	});
	const data = await res.json();
	if (!res.ok) {
		APIThrowError('b2_list_file_versions', data);
	}
	return data;
}

/**
 * @param {B2Conf} conf
 * @param {B2Auth} auth
 */

async function b2_list_file_versions_expand_folder(conf, auth, prefix) {
	const res = await fetch(`${auth.apiUrl}/b2api/v2/b2_list_file_versions`, {
		method: 'POST',
		headers: {
			Authorization: auth.authorizationToken,
		},
		body: JSON.stringify({
			bucketId: conf.bucketId,
			prefix: prefix || conf.namePrefix,
			maxFileCount: 1000,
		}),
	});
	const data = await res.json();
	if (!res.ok) {
		APIThrowError('b2_list_file_versions_expand_folder', data);
	}
	return data;
}

/**
 * @param {B2Conf} conf
 * @param {B2Auth} auth
 * @returns {Promise<B2UploadAuth>}
 */

async function b2_get_upload_url(conf, auth) {
	const res = await fetch(`${auth.apiUrl}/b2api/v2/b2_get_upload_url`, {
		method: 'POST',
		headers: {
			Authorization: auth.authorizationToken,
		},
		body: JSON.stringify({
			bucketId: conf.bucketId,
		}),
	});
	const data = await res.json();
	if (!res.ok) {
		APIThrowError('b2_get_upload_url', data);
	}
	return data;
}

/**
 * @param {B2Conf} conf 
 * @param {B2UploadAuth} uploadAuth 
 * @param {BodyInit} fileBody 
 * @param {B2FileInfo} fileInfo
 * @returns {Promise<B2UploadSuccessInfo>}
 */

async function b2_upload_file(conf, uploadAuth, fileBody, fileInfo) {
	const res = await fetch(uploadAuth.uploadUrl, {
		method: 'POST',
		headers: {
			Authorization: uploadAuth.authorizationToken,
			'X-Bz-File-Name': encodeURIComponent(`${conf.namePrefix}${fileInfo.fileName}`),
			'X-Bz-Content-Sha1': fileInfo.sha1,
			'Content-Length': fileInfo.contentLength.toString(),
			// @ts-ignore
			'X-Bz-Info-src_last_modified_millis': fileInfo.lastModified || undefined,
		},
		body: fileBody,
	});
	const data = await res.json();
	if (!res.ok) {
		APIThrowError('b2_upload_file', data);
	}
	return data;
}

/**
 * @param {B2UploadAuth} uploadAuth 
 * @param {BodyInit} file 
 * @param {B2FileInfo} fileInfo
 * @returns {Promise<B2UploadSuccessInfo>}
 */
async function b2_upload_file_client(uploadAuth, file, fileInfo) {
	const res = await fetch(uploadAuth.uploadUrl, {
		method: 'POST',
		mode: 'cors',
		headers: {
			Authorization: uploadAuth.authorizationToken,
			'X-Bz-File-Name': encodeURIComponent(fileInfo.fileName),
			'X-Bz-Content-Sha1': fileInfo.sha1,
			'Content-Type': fileInfo.contentType,
			// No Content-Length on client
			// @ts-ignore
			'X-Bz-Info-src_last_modified_millis': fileInfo.lastModified || undefined,
		},
		body: file,
	});
	const data = await res.json();
	if (!res.ok) {
		APIThrowError('b2_upload_file_client', data);
	}
	return data;
}

/**
 * @param {B2UploadAuth} uploadAuth 
 * @param {XMLHttpRequestBodyInit} file 
 * @param {B2FileInfo} fileInfo
 * @param {Function} onProgress
 * @returns {Promise<B2UploadSuccessInfo>}
 */
async function b2_upload_file_client_progress(uploadAuth, file, fileInfo, onProgress) {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();

		xhr.upload.addEventListener('progress', (e) => {
			onProgress && onProgress(e, fileInfo);
		});

		xhr.open('POST', uploadAuth.uploadUrl, true);
		xhr.setRequestHeader('Authorization', uploadAuth.authorizationToken);
		xhr.setRequestHeader('X-Bz-File-Name', encodeURIComponent(fileInfo.fileName));
		xhr.setRequestHeader('X-Bz-Content-Sha1', fileInfo.sha1);
		xhr.setRequestHeader('Content-Type', fileInfo.contentType);
		// No Content-Length on client
		if (fileInfo.lastModified) {
			xhr.setRequestHeader('X-Bz-Info-src_last_modified_millis', fileInfo.lastModified.toString());
		}

		xhr.onload = async function () {
			let data;
			try {
				data = JSON.parse(this.response);
			} catch (e) {
				reject(APIError("b2_upload_file_client_progress", e));
			}
			if (this.status >= 200 && this.status < 300) {
				resolve(data);
			} else {
				reject(APIError("b2_upload_file_client_progress", data));
			}
		};
		
		xhr.onabort = (e) => {
			reject(APIError("b2_upload_file_client_progress", "abort"));
		};
		xhr.onerror = (e) => {
			reject(APIError("b2_upload_file_client_progress", "error"));
		};
		xhr.ontimeout = (e) => {
			reject(APIError("b2_upload_file_client_progress", "timeout"));
		};

		xhr.send(file);
	});
}

/**
 * @param {B2Auth} auth 
 * @param {string} fileName 
 * @param {string} fileId 
 */

async function b2_delete_file(auth, fileName, fileId) {
	const res = await fetch(`${auth.apiUrl}/b2api/v2/b2_delete_file_version`, {
		method: 'POST',
		headers: {
			Authorization: auth.authorizationToken,
		},
		body: JSON.stringify({
			fileName,
			fileId,
		}),
	});
	const data = await res.json();
	if (!res.ok) {
		APIThrowError('b2_delete_file', data);
	}
	return data;
}

/* Some custom helpers */

/**
 * Authenticating a non-master key, which have a unique namePrefix and bucketId.
 * @param {Object} nonmaster_conf
 * @param {string} nonmaster_conf.keyID
 * @param {string} nonmaster_conf.applicationKey 
 */
async function b2helper_auth_nonmaster(nonmaster_conf) {
	const conf_1 = {};
	conf_1.keyID = nonmaster_conf.keyID;
	conf_1.applicationKey = nonmaster_conf.applicationKey;
	const auth = await b2_authorize_account(conf_1);
	conf_1.namePrefix = auth.allowed.namePrefix;
	conf_1.bucketId = auth.allowed.bucketId;
	conf_1.bucketName = auth.allowed.bucketName;
	return { conf: conf_1, auth };
}

export {
	b2_authorize_account,
	b2_create_key,
	b2_delete_key,
	b2_list_file_names,
	b2_list_file_names_expand_folder,
	b2_list_file_versions,
	b2_list_file_versions_expand_folder,
	b2_get_upload_url,
	b2_upload_file,
	b2_upload_file_client,
	b2_upload_file_client_progress,
	b2_delete_file,
	b2helper_auth_nonmaster,
};
