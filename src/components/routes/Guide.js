import { useEffect, useState } from 'react';
import getApiModule from '../../api/getApiModule';
import { DEMO_ACCOUNT_API_TOCKEN, DEMO_PROJECT_API_TOCKEN, DEMO_PROJECT_CODE } from '../../api/constants';

//const HOUR = 1000 * 60 * 60;

const projectApi = getApiModule('project', {
  'x-whatap-pcode': DEMO_PROJECT_CODE,
  'x-whatap-token': DEMO_PROJECT_API_TOCKEN,
});
const accountApi = getApiModule('account', {
  'x-whatap-token': DEMO_ACCOUNT_API_TOCKEN,
});

function Guide() {
  const [accountMeta, setAccountMeta] = useState();
  const [series, setSeries] = useState();
  const [projectMeta, setProjectMeta] = useState();
  const [spot, setSpot] = useState();

  useEffect(() => {
    accountApi('api/json/projects').then((result) => setAccountMeta(result));
    projectApi('api/act_agent').then((result) => setSpot(result));
    projectApi('api/json/project').then((result) => setProjectMeta(result));
    projectApi('api/json/project/{pcode}/members', {
      pcode: DEMO_PROJECT_CODE,
    }).then((result) => setSeries(result));
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
