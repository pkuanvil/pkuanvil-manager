function Items({ viewId, id, isLast, description, handleClick }) {
  let wrapperClass = "py-2 pr-1 float-left";
  let textClass = "px-2 py-1 rounded border";
  if (isLast) {
    wrapperClass = "py-2";
  }
  if (viewId === id) {
    textClass += " border-black";
  }
  return (
    <div className={wrapperClass} key={id}>
      <button id={id} className={textClass} onClick={() => handleClick && handleClick(id)}>{description}</button>
    </div>
  )
}

export default function FilesNavBar({ viewId, handleClick }) {
  return (
    <div>
      <Items viewId={viewId} id={0} description="View Files" handleClick={handleClick}></Items>
      <Items viewId={viewId} id={1} description="Upload Files" handleClick={handleClick}></Items>
      <Items viewId={viewId} id={2} description="Upload Directory" handleClick={handleClick}></Items>
      <Items viewId={viewId} id={3} isLast={1} description="Delete" handleClick={handleClick}></Items>
    </div>
  )
}
