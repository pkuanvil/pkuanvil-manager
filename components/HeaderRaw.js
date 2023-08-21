export default function HeaderRaw({ userInfo }) {
	if (userInfo.success) {
		return (
			<header className="py-4 sticky top-0">
				<p>UserName: {userInfo.userdata.username}</p>
				<p>Uid: {userInfo.userdata.uid}</p>
			</header>
		)
	} else {
		return (
			<header className="py-4 sticky top-0">
				<p>Not Logged In</p>
			</header>
		)
	}
}
