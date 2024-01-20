import FileMark from "@/utility/client/FileMark";
import Link from "next/link";

function DeleteItem({ href, mark, displayName, handleOnClick }) {
	let htmlClass = "";
	if (mark === FileMark.MARK_DELETE) {
		htmlClass = "text-red-600";
	} else if (mark === FileMark.DELETED) {
		htmlClass = "text-red-300 line-through"
	}
	const onClick = (event) => {
		event.preventDefault();
		handleOnClick();
	}
	return (
		<a className={htmlClass} href={href} onClick={onClick} >{displayName}</a>
	)
}

function StaticItem({ href, displayName }) {
	return (
		<Link href={href}>{displayName}</Link>
	)
}

function Item({ href, displayName, allowDelete, mark, handleOnClick }) {
	if (!allowDelete) {
		return (
			<StaticItem href={href} displayName={displayName} />
		)
	} else {
		return (
			<DeleteItem href={href} displayName={displayName} mark={mark} handleOnClick={handleOnClick} />
		)
	}
}

export default function FilesList({ files, prefixFull, authToken, downloadPrefix, allowDelete, markedItems, setMarkedItems }) {
	const fileItems = files.map((file, index) => {
		const isFolder = file.action === 'folder';
		const displayName = file.fileName.substring(prefixFull.length);
		const mark = markedItems[index];
		const handleOnClick = () => {
			setMarkedItems(prevMarkedItems => {
				const newMarkedItems = [...prevMarkedItems];
				const prevmark = newMarkedItems[index];
				if (prevmark === FileMark.NORMAL) {
					newMarkedItems[index] = FileMark.MARK_DELETE;
				} else if (prevmark === FileMark.MARK_DELETE) {
					newMarkedItems[index] = FileMark.NORMAL;
				} else {
					// Do nothing
				}
				return newMarkedItems;
			});
		}
		if (isFolder) {
			return (
				<tr key={index}>
					<td className="pr-8">
						<Item href={"/files/" + file.fileName} displayName={displayName} allowDelete={allowDelete} mark={mark} handleOnClick={handleOnClick} />
					</td>
					<td className="pr-8">-</td>
					<td className="pr-4">-</td>
					<td className="pr-4">-</td>
				</tr>
			)
		} else {
			const uploadTime = new Date(file.uploadTimestamp).toISOString();
			let lastModifiedTime = '-';
			if (file.fileInfo.src_last_modified_millis) {
				try {
					const timeNumber = parseInt(file.fileInfo.src_last_modified_millis, 10);
					lastModifiedTime = new Date(timeNumber).toISOString();
				} catch {
					// Do nothing
				}
			}
			return (
				<tr key={index}>
					<td className="pr-8">
						<Item href={downloadPrefix + file.fileName + `?Authorization=${authToken}`} displayName={displayName} allowDelete={allowDelete} mark={mark} handleOnClick={handleOnClick} />
					</td>
					<td className="pr-8">{file.contentLength}</td>
					<td className="pr-4">{uploadTime}</td>
					<td className="pr-4">{lastModifiedTime}</td>
				</tr>
			)
		}
	})
	return (
		<div className="max-h-screen overflow-scroll">
			<table className="table-auto">
				<thead>
					<tr>
						<th className="pr-8">File Name</th>
						<th className="pr-8">File Size</th>
						<th className="pr-4">Upload Time (ISO)</th>
						<th className="pr-4">Last Modified Time (ISO)</th>
					</tr>
				</thead>
				<tbody>
					{fileItems}
				</tbody>
			</table>
		</div>
	)
}