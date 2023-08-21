export default function FileDelete({ show, deleting, doDelete }) {
	let htmlClass = "hidden mb-2";
	let prompt = 'Click the file names to mark the files or directories you want to delete, and click the "Confirm" button to delete them';
	if (deleting) {
		prompt = 'Deleting...'
	}
	if (show) {
		htmlClass = htmlClass.replace("hidden", "");
	}
	return (
		<div className={htmlClass}>
			<p>{prompt}</p>
			<button
				className="px-2 py-1 rounded border hover:bg-amber-50 hover:text-red-600"
				onClick={doDelete}
			>
				Confirm
			</button>
		</div>
	)
}