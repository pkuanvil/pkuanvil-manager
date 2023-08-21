import HeaderClient from "./client/HeaderClient";
import { helper_pkuanvil_userinfo } from '@/utility/helper_token_auth';
import { cookies } from 'next/headers';

export default async function Header() {
	const userInfo = await helper_pkuanvil_userinfo(cookies());
	return <HeaderClient userInfo={userInfo}></HeaderClient>
}
