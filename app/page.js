import NavSide from '@/components/NavSide';
import Header from '@/components/Header';
import { pkuanvil_host, pkuanvil_host_client } from '@/utility/pkuanvilapi';
import { helper_pkuanvil_userinfo } from '@/utility/helper_token_auth';
import { cookies } from 'next/headers';
import "./page.css";
import Link from 'next/link';

function Greeting({ userInfo }) {
  if (!userInfo || !userInfo.success) {
    return (
      <p>
        You are not logged in. Login at <a href={pkuanvil_host_client}>{pkuanvil_host_client}</a> first, then refresh the page.
      </p>
    )
  }
  return (
    <div>
      <p>Welcome <b>{userInfo.userdata.username}</b>! This is the management website of your Backblaze files.</p>
      <p>
        <h2>What is Backblaze?</h2>
Backblaze is a S3-compatible, cost-effective cloud storage service. Their storage cost is $6 each TB (Terabyte) and each month
(compared to $26 of Amazon S3), and they provide exemption of egrees (download) data up to 3 times of monthly storage,
so each 1TB storage gets 3TB free download each month, while any download above 3TB costs $10 each TB.
Backblaze provides enterprise-level SLA over 99.9% which guarantees high usability and stability.
      </p>
      <p>
        <h2>Easy-to-use webpage to view, upload and download BackBlaze files</h2>
At pkuanvil, we provides this web page to every pkuanvil user for easy access to the BackBlaze cloud storage.
Your data is securely storaged at Backblaze with a high usuability guarantee, so if you encountered any network errors at this page,
the existing files you have stored do not get lost (but you need to re-upload new files anyway).
<br></br>
In addition to pkuanvil&apos;s web page, users are also provided their Backblaze secret key, so they can access their own files with other tools
like the <a href="https://www.backblaze.com/docs/cloud-storage-command-line-tools">BackBlaze Command-Line Tools</a>.
      </p>
      <p>
        <h2>Prefix</h2>
At pkuanvil, we have registered a shared &quot;pkuanvil&quot; bucket. Only the pkuanvil admin have control over the BackBlaze account and all files
(but the admin promise not to stamp on your files unless you exceeded the storage limit). Regular users can only manage files with a filename
starting with a certain string (prefix).
<br/>
Since you, <b>{userInfo.userdata.username}</b>, are a registered pkuanvil user with uid <b>{userInfo.userdata.uid}</b>,
you are automatically assigned exclusive access to any files starting with name <b>{`uid${userInfo.userdata.uid}/`}</b>.
You may register other prefixes (up to 100 prefixes) at the <Link href="/prefix">Manage BackBlaze Keys</Link> page.
      </p>
      <p>
        <h2>Static website</h2>
You can own your personal static website! pkuanvil automatically maps BackBlaze files to a URL. For example, if you uploaded a file to
<b> {`uid${userInfo.userdata.uid}/hello_world.txt`}</b>, you can visit it at the URL <b>{`https://uid${userInfo.userdata.uid}.pkuanvil.io/hello_world.txt`}</b>.
      </p>
      <p>
        <h2>Files</h2>
You can view, upload, delete and download files at the <Link href="/files">Manage BackBlaze Files</Link> page.
<br/>
By default files starting with prefix <b>{`uid${userInfo.userdata.uid}/`}</b> are shown; you can switch this prefix by creating a new prefix,
clicking the &quot;namePrefix&quot; and &quot;Activate this key&quot;.
<br/>
We currently have a limit of 5GB for each file&apos;size.
We don&apos;t encourage you to store too many files under one directory (spliting files under sub directories is fine. since a sub directory counts as one file for the sake of listing files),
since we can only return 1000 files each directory at once due to API limits; you need to click &quot;Next&quot; to show more files if a directory have more than 1000 files.
      </p>
      <p>
        <h2>Storage Limit</h2>
The admin have not currently decided on it, but the admin suggests that each user use a soft limit of 100GB storage at total and 300GB download each month.
(Compared to Github pages of 1GB storage and 100GB download each month, this is a big leap)
      </p>
    </div>
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
      <main className="lg:pl-80 route-index">
        <Greeting userInfo={userInfo}></Greeting>
      </main>
    </>
  )
}
