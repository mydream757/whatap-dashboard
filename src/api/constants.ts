const API_ROOT = 'https://api.whatap.io/open';
const DEMO_ACCOUNT_API_TOCKEN = '1VQR6S6QY715GKROD4O8';
const DEMO_PROJECT_API_TOCKEN = 'XGJHUSQZTI2AVIENWA27HI5V';
const DEMO_PROJECT_CODE = 5490;
const API_HEADER = {
  'x-whatap-pcode': DEMO_PROJECT_CODE,
  'x-whatap-token': DEMO_PROJECT_API_TOCKEN,
};

const SPOT_REGISTRY = {
  'api/act_agent': '활성화 상태의 에이전트 수',
  'api/inact_agent': '비활성화 상태의 에이전트 수',
  'api/host': '호스트 수',
  'api/cpucore': '호스트의 CPU 코어 합',
  'api/txcount': '트랜잭션 수',
  'api/tps': '초당 트랜잭션 수',
  'api/user': '5분간 집계된 고유 사용자 수',
  'api/actx': '액티브 트랜잭션 수',
  'api/rtime': '평균 응답 시간',
  'api/cpu': 'CPU 사용률',
  'api/threadpool_active': '쓰레드풀 활성 쓰레드 수',
  'api/threadpool_queue': '쓰레드풀 큐잉 쓰레드 수',
  'api/dbc_count': '전체 DB Connection 수',
  'api/dbc_active': '활성(Active) DB Connection 수',
  'api/dbc_idle': '비활성(Idle) DB Connection 수',
  'api/act_method': '액티브 Method 수',
  'api/act_sql': '액티브 SQL 수',
  'api/act_httpc': '액티브 HTTP Call 수',
  'api/act_dbc': '액티브 DB Connection 수',
  'api/act_socket': '액티브 Socket 수',
} as const;

const SERIES_REGISTRY = {
  'api/json/exception/{stime}/{etime}': 'Exception 발생 ',
  'api/json/project': '프로젝트 정보 조회',
  'api/json/project/{pcode}/members': '프로젝트 멤버 목록 조회',
  'api/json/remote/{stime}/{etime}': 'Client IP',
  'api/json/transaction/{stime}/{etime}': '트랜잭션',
  'api/json/visitor_5m/{stime}/{etime}': '액티브 사용자 (5분 단위)',
  'api/json/visitor_h/{stime}/{etime}': '액티브 사용자 (1시간 단위)',
  'api/json/fullgclog/{stime}/{etime}': 'Full GC 로그',
} as const;

const META_REGISTRY = {
  'json/agents': '프로젝트 에이전트 상태 및 호스트 조회',
} as const;

const ACCOUNT_META = {
  'api/json/projects': '프로젝트 목록 조회',
} as const;

const API_CATEGORIES = {
  account: {
    ...ACCOUNT_META,
  },
  project: {
    ...META_REGISTRY,
    ...SERIES_REGISTRY,
    ...SPOT_REGISTRY,
  },
} as const;

export {
  API_CATEGORIES,
  API_ROOT,
  DEMO_ACCOUNT_API_TOCKEN,
  DEMO_PROJECT_API_TOCKEN,
  DEMO_PROJECT_CODE,
  API_HEADER,
};
