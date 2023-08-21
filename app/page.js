import NavSide from '@/components/NavSide';
import Header from '@/components/Header';
import { pkuanvil_host } from '@/utility/pkuanvilapi';
import { helper_pkuanvil_userinfo } from '@/utility/helper_token_auth';
import { cookies } from 'next/headers';

function Greeting({ userInfo }) {
  if (!userInfo || !userInfo.success) {
    return (
      <p>
        You are not logged in. Login at <a href={pkuanvil_host}>{pkuanvil_host}</a> first, then refresh the page.
      </p>
    )
  }
  return (
    <p>
      Welcome <b>{userInfo.userdata.username}</b>! This is the index page of pkuanvil-manager.
    </p>
  )
}

export default async function Home() {
  let userInfo;
  try {
    userInfo = await helper_pkuanvil_userinfo(cookies());
  } catch (e) {
    // do nothing
  }
  return (
    <>
      <Header></Header>
      <NavSide currentPath={'/'}></NavSide>
      <main className="lg:pl-80">
        <Greeting userInfo={userInfo}></Greeting>
      </main>
    </>
  )
}
