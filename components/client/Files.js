"use client";

import FilesNavBar from "../FilesNavBar";
import FilesList from "../FilesList";
import { InputFiles, InputDirectory, FilesUploadStatus } from "../FilesUpload";
import FileDelete from "../FileDelete";
import { useState } from "react";
import { api_helper_delete_prefix } from "@/utility/client/API";
import { DeleteFilesByNames } from "@/utility/client/Delete";
import DummyCatchError from "@/utility/client/DummyCatchError";
import FileMark from "@/utility/client/FileMark";

function PathSegments({ prefixFull }) {
	// TODO: Assert prefix must be full
	if (prefixFull.endsWith('/')) {
		prefixFull = prefixFull.substring(0, prefixFull.length - 1);
	}
	const segs = prefixFull.split('/');
	let path = '/files';
	const anchors = [];
	for (let i = 0; i < segs.length; i++) {
		const seg = segs[i];
		path += `/${seg}`;
		anchors.push(
			<a key={2 * i} href={path}>{seg}</a>
		)
		anchors.push(
			<span key={2 * i + 1}> / </span>
		)
	}
	return <div key={-1}>{anchors}</div>
}

function getDeleteFileNamesAndIndex(files, markedItems) {
	const fileNames = [];
	const indexes = [];
	for (let i = 0; i < files.length; i++) {
		if (markedItems[i] === FileMark.MARK_DELETE) {
			fileNames.push(files[i].fileName);
			indexes.push(i);
		}
	}
	return { fileNames, indexes };
}

function Files({ initFiles, prefixFull, authToken, downloadPrefix }) {
	const [uploadStatus, setUploadStatus] = useState(new Map());
	const [viewId, setViewId] = useState(0);
	const [markedItems, setMarkedItems] = useState(new Array(initFiles.length).fill(FileMark.NORMAL));
	const [deleting, setDeleting] = useState(false);
	const [errors, setErrors] = useState([]);
	// TODO
	global.api_helper_delete_prefix = api_helper_delete_prefix;
	let showInputFiles = false;
	let showInputDir = false;
	let showUploadStatus = false;
	let allowDelete = false;
	if (viewId === 1) {
		showInputFiles = true;
		showUploadStatus = true;
	}
	if (viewId === 2) {
		showInputDir = true;
		showUploadStatus = true;
	}
	if (viewId === 3) {
		allowDelete = true;
	}
	const showErrors = (error) => {
		DummyCatchError(error);
		setErrors((prevErrors) => [...prevErrors, error]);
	}
	const doDelete = () => {
		const { fileNames, indexes } = getDeleteFileNamesAndIndex(initFiles, markedItems);
		if (!fileNames.length) {
			setErrors((prevErrors) => [...prevErrors, "No file to delete!"]);
		}
		setDeleting(true);
		Promise.all(
			DeleteFilesByNames(fileNames)
				.map((promise, delete_index) => promise.then(() => setMarkedItems(prevMarkedItems => {
					const newMarkedItems = [...prevMarkedItems];
					const file_index = indexes[delete_index];
					newMarkedItems[file_index] = FileMark.DELETED;
					return newMarkedItems;
				}))
					.catch(showErrors))
		).then(() => setDeleting(false));
	}
	return (
		<div>
			<PathSegments prefixFull={prefixFull} />
			<FilesNavBar viewId={viewId} handleClick={setViewId} />
			<InputFiles show={showInputFiles} errorCallback={showErrors} setUploadStatus={setUploadStatus} />
			<InputDirectory show={showInputDir} errorCallback={showErrors} setUploadStatus={setUploadStatus} />
			<div className="overflow-scroll max-h-48">
				{
					errors.map((error, index) => {
						return (
							<p key={index} className="text-red-600">{error.toString()}</p>
						)
					})
				}
			</div>
			<FilesUploadStatus show={showUploadStatus} status={uploadStatus} />
			<FileDelete show={allowDelete} deleting={deleting} doDelete={doDelete} />
			<FilesList
				files={initFiles}
				prefixFull={prefixFull}
				authToken={authToken}
				downloadPrefix={downloadPrefix}
				allowDelete={allowDelete}
				markedItems={markedItems}
				setMarkedItems={setMarkedItems}
			/>
		</div>
	);
}

export {
	InputDirectory,
	Files,
}
