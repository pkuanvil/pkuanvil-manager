import FileUpload from "@/utility/client/FileUpload";
import DummyCatchError from "@/utility/client/DummyCatchError";
import FileUploadProgress from "./FileUploadProgress";

/**
 * @param {FileList} files
 */

function initStatus(files, isDirectory) {
	const status = new Map();
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		const fileName = isDirectory ? file.webkitRelativePath : file.name;
		status.set(fileName, {
			statusName: "Pending",
			progress: null,
		});
	}
	return status;
}

function mapClone(map1) {
	const newMap = new Map();
	for (const [name, value] of map1) {
		newMap.set(name, value);
	}
	return newMap;
}

function updateStatus(status, isDirectory, event) {
	const { file, name } = event;
	const fileName = isDirectory ? file.webkitRelativePath : file.name;
	const fileStatus = status.get(fileName);
	if (name === "fileUploadStart") {
		fileStatus.statusName = "Uploading"
	}
	else if (name === "fileUploadSuccess") {
		fileStatus.statusName = "Sucess";
	} else if (name === "fileUploadError") {
		fileStatus.statusName = "Error";
	} else if (name === "ProgressEvent") {
		fileStatus.progress = event.data;
	}
	status.set(fileName, fileStatus);
	return mapClone(status);
}

async function uploadFileWithHash(setUploadStatus, isDirectory, errorCallback = DummyCatchError) {
	const fileInput = isDirectory ?
		document.getElementById("file-input-directory")
		: document.getElementById("file-input");
	let status = initStatus(fileInput.files, isDirectory);
	// TODO
	globalThis.status_1 = status;
	setUploadStatus(status);
	FileUpload(fileInput.files, isDirectory, (event) => {
		status = updateStatus(status, isDirectory, event);
		setUploadStatus(status);
		if (event.name === "fileUploadError") {
			errorCallback(event.error);
		}
	}).catch(errorCallback);
}

function InputFiles({ show, setUploadStatus, errorCallback }) {
	const onChangeCb = () => uploadFileWithHash(setUploadStatus, false, errorCallback);
	let htmlClass = "hidden";
	if (show) {
		htmlClass = "";
	}
	return (
		<input className={htmlClass} type="file" multiple id="file-input" onChange={onChangeCb} />
	)
}

function InputDirectory({ show, setUploadStatus, errorCallback }) {
	const onChangeCb = () => uploadFileWithHash(setUploadStatus, true, errorCallback);
	let htmlClass = "hidden";
	let textClass = "hidden";
	if (show) {
		htmlClass = "";
		textClass = "text-orange-900";
	}
	return (
		<>
			<p className={textClass}>Warning: Directory upload usually only works on desktop browsers.</p>
			<input className={htmlClass} type="file" multiple webkitdirectory="true" id="file-input-directory" onChange={onChangeCb} />
		</>
	)
}

function FilesUploadStatus({ show, hideSuccess, status }) {
	let htmlClass = "hidden max-h-screen overflow-scroll py-2";
	if (show) {
		htmlClass = htmlClass.replace("hidden", "");
	}	
	if (!status || !status.size) {
		return (
			<div id="upload-status" className={htmlClass}>
			</div>	
		)
	}
	const items = [];
	let count = 0;
	let successCount = 0;
	let failedCount = 0;
	let uploadingCount = 0;
	for (const [name, value] of status.entries()) {
		const { statusName, progress } = value;
		if (statusName === "Sucess") {
			successCount += 1;
		} else if (statusName === "Uploading") {
			uploadingCount += 1;
		} else if (statusName === "Error") {
			failedCount += 1;
		}
		const borderCSS = statusName === "Uploading" ? "border border-black" : "";
		if (!(hideSuccess && statusName === "Success")) {
			items.push(
				<tr className={borderCSS} key={count}>
					<td className="pr-8">{name}</td>
					<td className={`pr-4 ${statusName === 'Error' ? 'text-red-600' : ''}`}>{statusName}</td>
					<td className="pr-4"><FileUploadProgress progress={progress} /></td>
				</tr>
			)
		}
		count++;
	}
	return (
		<div id="upload-status" className={htmlClass}>
			<p> File {successCount} / {count} Uploading: {uploadingCount} Error: {failedCount}</p>
			<table className="table-auto">
				<thead>
					<tr>
						<th className="pr-8">File Name</th>
						<th className="pr-4">File Status</th>
						<th className="pr-4">Upload Progress</th>
					</tr>
				</thead>
				<tbody>
					{items}
				</tbody>
			</table>
		</div>
	)
}

export {
	InputFiles,
	InputDirectory,
	FilesUploadStatus,
}
