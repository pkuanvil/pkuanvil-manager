export default function FileUploadProgress({ progress }) {
	if (!progress || !progress.lengthComputable) {
		return <></>;
	}
	const { loaded, total } = progress;
	// calculate the ratio
	const ratio = Math.min((loaded / total) * 100, 100);

	return (
		<div className="max-w-[12rem] min-w-[4rem]">
			<div className="bg-green-200 transition-width ease-in-out delay-1000" style={{ width: `${ratio}%` }}>
				<span>{loaded} / {total}</span>
			</div>
		</div>
	);
}