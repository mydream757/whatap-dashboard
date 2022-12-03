import { useEffect, useState } from 'react';
import api from '../../api';

//const HOUR = 1000 * 60 * 60;

function Guide() {
  const [accountMeta, setAccountMeta] = useState();
  const [series, setSeries] = useState();
  const [projectMeta, setProjectMeta] = useState();
  const [spot, setSpot] = useState();

  useEffect(() => {
    api.accountMeta('projects').then((result) => setAccountMeta(result));
    api.spot('act_agent').then((result) => setSpot(result));
    api.projectMeta('agents').then((result) => setProjectMeta(result));
    api.series('project').then((result) => setSeries(result));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Open API (Application)</h1>
      <a
        href="https://guide.whatap.io/whatap_guide/use_guide/integration/pages/open_api_common.html"
        target="_blank"
        rel="noreferrer"
      >
        가이드 문서
      </a>
      <hr />
      <h2>계정 API 예시</h2>
      <h3>계정 API 정보 조회 </h3>
      <pre>{JSON.stringify(accountMeta, null, 4)}</pre>
      <hr />
      <h2>프로젝트 API 예시</h2>
      <h3>메타 정보 조회 URL</h3>
      <pre>{JSON.stringify(projectMeta, null, 4)}</pre>
      <h3>Spot 정보 조회 URL</h3>
      <pre>{JSON.stringify(spot, null, 4)}</pre>
      <h3>통계 정보 조회 URL</h3>
      <pre>{JSON.stringify(series, null, 4)}</pre>
    </div>
  );
}

export default Guide;
