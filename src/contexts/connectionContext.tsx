import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { DEMO_ACCOUNT_API_TOCKEN } from '../api/constants';
import getApiModule from '../api/getApiModule';
import { ApiCategoryKeys, OpenApiHeader } from '../types';
import { defaultResponseParser } from '../constants/parsers';
import startInterval from '../utils/startInterval';
import getLatestArray from '../utils/getLatestArray';
import sleep from '../utils/sleep';

interface ConnectionContextReturn {
  queryConnection: (args: QueryConnectionArgs) => void;
  selectProject: (projectCode: number) => void;
  setApiTokenMap: (value: { [key: ApiToken]: string }) => void;
  dataRecord: DataRecord;
  clear: () => void;
  apiTokenMap: Record<ProjectCode, ApiToken>;
}

export interface ConnectionResult<Data = number> {
  value: Data;
  label?: string | number;
  time: number;
}

type QueryKey = string;

type ProjectCode = number;
type ApiToken = string;

type ConnectionState = {
  apiKey: string;
  interval?: NodeJS.Timer;
  timeout?: NodeJS.Timer;
  callback?: () => void;
};
export type DataRecord = Record<QueryKey, ConnectionResult[]>;

type ConnectionStateRecord = Record<QueryKey, ConnectionState>;

export interface QueryConnectionArgs<
  Param = { [field: string]: string | number }
> {
  pcode: number;
  category: ApiCategoryKeys;
  fail?: number;
  queryKey?: QueryKey;
  apiKey: string;
  responseParser?: (response: any) => ConnectionResult[];
  maxStackSize?: number;
  params?: Param;
  recurParams?: (args?: Param) => Param;
  intervalTime?: number;
}

const getQueryKey = ({
  queryKey,
  apiKey,
}: Pick<QueryConnectionArgs, 'apiKey' | 'queryKey'>) => {
  return queryKey || apiKey;
};

export const CONNECTION_INTERVAL = 5000;
const CONNECTION_TERM = 25;
const MAXIMUM_BACKOFF = CONNECTION_INTERVAL / 2;

const getBackOffTime = (fail = 0) => {
  return Math.min(CONNECTION_TERM + 2 ** fail, MAXIMUM_BACKOFF);
};

function ConnectionProvider({ children }: { children?: ReactNode }) {
  /* states */
  const [pcode, setPcode] = useState<ProjectCode>();
  //'프로젝트 코드 <-> 프로젝트의 api 토큰'에 대한 map
  const [apiTokenMap, setApiTokenMap] = useState<Record<ProjectCode, ApiToken>>(
    {}
  );
  //'queryKey <-> 가공된 응답 데이터'에 대한 map
  const [dataRecord, setDataRecord] = useState<DataRecord>({});
  // 수행되어야할 네트워크 요청을 위한 argument 를 담아 대기시키기 위한 queue
  const [waitQueue, setWaitQueue] = useState<QueryConnectionArgs[]>([]);
  /* refs */
  // interval 및 timeout 을 통해 관리되는 네트워크 요청 주기 관련 정보를 저장할 변수의 ref
  const connectionRecordRef = useRef<ConnectionStateRecord>({});
  const connectionRecord = connectionRecordRef.current;

  const tooManyRequestCountRef = useRef<number>(0);
  const tooManyCount = tooManyRequestCountRef.current;

  // 네트워크 요청을 통해 적재된 데이터는 유지하고, interval 로 수행되고 있는 모든 네트워크 요청 상태를 초기화함
  const clearConnectionBy = useCallback(
    (key: QueryKey) => {
      const connection = connectionRecord[key];
      if (connection) {
        const { timeout, interval } = connection;
        clearTimeout(timeout);
        clearInterval(interval);
        // connection 을 종료할 경우, 그 key 에 해당하는 '대기 상태의 요청' 또한 삭제한다.
        setWaitQueue((prevState) =>
          prevState.filter((data) => {
            const targetKey = getQueryKey({
              queryKey: data.queryKey,
              apiKey: data.apiKey,
            });
            return targetKey !== key;
          })
        );
        delete connectionRecord[key];
      }
    },
    [connectionRecord]
  );
  /* callbacks */
  const clearConnections = useCallback(() => {
    for (const query in connectionRecord) {
      clearConnectionBy(query);
    }
  }, [clearConnectionBy]);

  const enqueueWaits = useCallback((args: QueryConnectionArgs) => {
    setWaitQueue((prevState) => [...prevState, args]);
  }, []);

  const dequeueWaits = useCallback((index = 0) => {
    setWaitQueue((prevState) => prevState.filter((_, i) => i !== index));
  }, []);

  // context 가 가지고 있는 모든 상태를 초기화
  const clear = useCallback(() => {
    setWaitQueue([]);
    tooManyRequestCountRef.current = 0;
    clearConnections();
    setDataRecord({});
    sleep(1000);
  }, []);

  const selectProject = useCallback((projectCode: number) => {
    setPcode(projectCode);
  }, []);

  const request = useCallback(
    (args: QueryConnectionArgs) => {
      const {
        category,
        pcode,
        apiKey,
        queryKey,
        params,
        responseParser,
        recurParams,
        maxStackSize,
      } = args;

      let header: OpenApiHeader;
      switch (category) {
        case 'account':
          header = {
            'x-whatap-token': DEMO_ACCOUNT_API_TOCKEN,
          };
          break;
        case 'project':
        default:
          header = {
            'x-whatap-token': apiTokenMap[pcode],
            'x-whatap-pcode': `${pcode}`,
          };
          break;
      }

      const key = getQueryKey({
        apiKey,
        queryKey,
      });
      // apiKey 를 통해 api 모듈을 생성
      getApiModule(category, { ...header })(apiKey, params)
        .then((result) => {
          // 요청 및 응답 상태(connection) 관리를 위한 데이터는 'key' 에 맵핑
          setDataRecord((prevState) => {
            //응답에 대한 별도의 parser 를 전달받지 않으면 기본 parser 를 이용하여 응답 데이터를 파싱
            const parser = responseParser || defaultResponseParser;
            return {
              ...prevState,
              // 최신데이터(= 누적된 데이터 혹은 이번 시점에 응답 받은 데이터)를 maxStackSize 에 따라 slice 함
              [key]: getLatestArray(
                prevState[key],
                parser(result.data),
                maxStackSize
              ),
            };
          });

          // 요청에 성공할 경우, 다음 요청 시에는 파라미터가 갱신된 요청을 수행함
          const nextQueryArgs = {
            ...args,
            params: recurParams ? recurParams(params) : params,
          };

          connectionRecord[key].callback = () => request(nextQueryArgs);
        })
        .catch(
          ({
            error,
            key,
            args,
          }: {
            error: any;
            key: QueryKey;
            args: QueryConnectionArgs;
          }) => {
            clearConnectionBy(key);
            //TODO: casing error status
            // 요청이 동시에 너무 많이 일어날 경우, 에러를 반환하며, 이 때는 기존 요청을 지연시켜 retry 해야함.
            if (error.status === 429) {
              console.log('too many request: ', error);

              const timeout = setTimeout(() => {
                enqueueWaits(args);
              }, getBackOffTime(tooManyRequestCountRef.current++));
              connectionRecord[key] = {
                apiKey: args.apiKey,
                callback: () => request(args),
                timeout,
              };
            } else {
              //TODO: retry when error occurred
              console.log('other errors: ', error);
            }
          }
        );
    },
    [connectionRecord, apiTokenMap]
  );

  const queryConnection = useCallback(
    (args: QueryConnectionArgs) => {
      const { queryKey, apiKey } = args;
      const key = getQueryKey({
        queryKey,
        apiKey,
      });
      clearConnectionBy(key);

      connectionRecord[key] = { apiKey };
      connectionRecord[key].callback = () => request(args);
      enqueueWaits(args);
    },
    [connectionRecord, apiTokenMap, clearConnectionBy, request]
  );

  /* memoized values */
  // 프로젝트 코드<-> api token 에 대한 데이터가 정상적으로 로드된 상태에서, 특정 프로젝트가 선택되었을 경우, 네트워크 요청이 준비된 상태로 간주
  const isReady = useMemo(() => {
    return !!(apiTokenMap && pcode && apiTokenMap[pcode]);
  }, [apiTokenMap, pcode]);

  /* effects */
  useEffect(() => {
    return () => clear();
  }, []);

  useEffect(() => {
    if (isReady && waitQueue[0]) {
      const wait = waitQueue[0];
      if (wait) {
        const { queryKey, intervalTime, apiKey } = wait;

        const key = getQueryKey({
          queryKey,
          apiKey,
        });

        const intervalStarter = () => {
          connectionRecord[key].interval = startInterval(() => {
            const callback = connectionRecord[key].callback;
            callback && callback();
          }, intervalTime || CONNECTION_INTERVAL);
        };

        const term = CONNECTION_TERM * (waitQueue.length - 1);
        connectionRecord[key].timeout = setTimeout(intervalStarter, term);
        dequeueWaits();
      }
    }

    return () => {
      tooManyCount > 0 && tooManyRequestCountRef.current--;
    };
  }, [waitQueue, isReady]);

  return (
    <ConnectionContext.Provider
      value={{
        queryConnection,
        dataRecord,
        selectProject,
        clear,
        setApiTokenMap,
        apiTokenMap,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
}

const ConnectionContext = React.createContext<ConnectionContextReturn>({
  queryConnection: (args) => {
    console.log(args);
  },
  selectProject: (projectCode) => {
    console.log(projectCode);
  },
  setApiTokenMap: (value) => {
    console.log(value);
  },
  dataRecord: {},
  clear: () => {
    console.log('clear state');
  },
  apiTokenMap: {},
});

function useConnection() {
  return React.useContext(ConnectionContext);
}

export { ConnectionProvider, useConnection };
