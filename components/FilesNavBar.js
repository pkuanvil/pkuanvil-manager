import Link from "next/link";

function Items({ viewId, id, isLast, description, handleClick }) {
  let wrapperClass = "mr-1 inline-block";
  let textClass = "px-2 py-1 rounded border";
  if (isLast) {
    wrapperClass = "";
  }
  if (viewId === id) {
    textClass += " border-black";
  }
  return (
    <span className={wrapperClass} key={id}>
      <button id={id} className={textClass} onClick={() => handleClick && handleClick(id)}>{description}</button>
    </span>
  )
}

function FilesNavBar({ viewId, handleClick }) {
  return (
    <div className="my-2">
      <Items viewId={viewId} id={0} description="View Files" handleClick={handleClick}></Items>
      <Items viewId={viewId} id={1} description="Upload Files" handleClick={handleClick}></Items>
      <Items viewId={viewId} id={2} description="Upload Directory" handleClick={handleClick}></Items>
      <Items viewId={viewId} id={3} isLast={1} description="Delete" handleClick={handleClick}></Items>
    </div>
  )
}

function FilesNextAndPrev({ nextFileName }) {
  const wrapperClass = "mr-3 inline-block";
  const textClassNext = "px-4 py-1 mr-2 inline-block border-2 border-dotted no-underline"
  const textClassPrev = "px-4 py-1 inline-block border-2 border-dotted no-underline"
	if (!nextFileName) {
		return null;
	}
	return (
		<div className="my-2">
      <span className="mr-4 inline-block">Showing first 1000 files of this directory. <br/>Click &quot;Next&quot; to show more files, or &quot;Start&quot; to show the beginning.</span>
      <Link className={textClassNext} id={0} href={`?startFileName=${encodeURIComponent(nextFileName)}`}>Next</Link>
      <Link className={textClassPrev} id={1} href="?dummy_quote">Start</Link>
		</div>
	);
}

export {
  FilesNavBar,
  FilesNextAndPrev
}
