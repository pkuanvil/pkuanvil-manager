import KeyDelete from "./client/KeyDelete";
import KeySetDefault from "./client/KeySetDefault";

export default function KeyInfo({ conf }) {
	// React always expects <tbody> inside <table>: Expected server HTML to contain a matching <tr> in <table>.
	// https://stackoverflow.com/questions/46443652/react-16-warning-expected-server-html-to-contain-a-matching-div-in-body
	return (
		<details>
			<summary className="py-2">namePrefix: {conf.namePrefix}</summary>
			<div className="py-2">
				<table className="table-auto">
					<thead></thead>
					<tbody>
						<tr>
							<td className="pr-8">bucketName:</td>
							<td className="pr-4">{conf.bucketName}</td>
						</tr>
						<tr>
							<td className="pr-8">namePrefix:</td>
							<td className="pr-4">{conf.namePrefix}</td>
						</tr>
						<tr>
							<td className="pr-8">keyID:</td>
							<td className="pr-4">{conf.keyID}</td>
						</tr>
						<tr>
							<td className="pr-8">applicationKey:</td>
							<td className="pr-4">{conf.applicationKey}</td>
						</tr>
					</tbody>
				</table>
				<KeyDelete keyID={conf.keyID}></KeyDelete>
				<KeySetDefault keyID={conf.keyID}></KeySetDefault>
			</div>
		</details>
	)
}
