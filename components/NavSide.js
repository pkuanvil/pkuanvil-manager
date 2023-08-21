function Link1({ currentPath, path, description }) {
  if (currentPath === path) {
    return (
      <li className="mb-2">
        <a href={path} className="text-sky-600">{description}</a>
      </li>
    )
  } else {
    return (
      <li className="mb-2">
        <a href={path} className="text-slate-700 hover:text-sky-500">{description}</a>
      </li>
    )
  }
}

export default function NavSide({ currentPath }) {
  return (
    <nav className="lg:w-80 lg:fixed">
      <ol>
        <Link1 path='/' currentPath={currentPath} description='Index'></Link1>
        <Link1 path='/prefix' currentPath={currentPath} description='Manage BackBlaze Keys'></Link1>
        <Link1 path='/files' currentPath={currentPath} description='Manage Files'></Link1>
      </ol>
    </nav>
  )
}
