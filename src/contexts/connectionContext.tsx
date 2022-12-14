import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ApiToken,
  ConnectionContextReturn,
  ConnectionKey,
  ConnectionStateRecord,
  DataRecord,
  OpenApiHeader,
  ProjectCode,
  QueryConnectionArgs,
} from '../@types';
import { getLatestArray, sleep, startInterval } from '../utils';
import { defaultResponseParser, DEMO_ACCOUNT_API_TOCKEN } from '../constants';
import { getApiModule } from '../api';

/** ConnectionContext
 * @description : 네트워크 요청이 동시 다발적으로 일어나 429 오류를 발생시키는 것을 방지하기 위해, 전역 레벨에서 네트워크 요청들을 관리하기 위한 context
 * - 선택된 프로젝트의 api token 을 request header 에 설정할 수 있도록 제어
 * - api token 에 대한 정보가 로드될 때까지 요청을 대기시킴
 * - interval 을 이용하여, 일정 주기마다 네트워크 요청이 수행될 수 있도록 관리
 * - 네트워크 요청의 응답 결과를 저장하여, context 를 참조하는 컴포넌트에서 데이터를 수신할 수 있도록 함
 */

// queryKey 로서, queryKey 가 전달되지 않은 경우 apiKey 를 queryKey 로서 반환함.
const getFinalConnectionKey = ({
  connectionKey,
  apiKey,
}: Pick<QueryConnectionArgs, 'apiKey' | 'connectionKey'>) => {
  return connectionKey || apiKey;
};

// 기본 interval : 5초
export const CONNECTION_INTERVAL = 5000;
// 개별 요청(주기) 간격 : 25ms
const CONNECTION_TERM = 25;
// backoff 시킬 수 있는 최대치
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

  // 429 오류 (= "Too many requests.) 발생 시, 최근 발생 횟수를 카운트하기 위한 변수의 ref
  const tooManyRequestCountRef = useRef<number>(0);
  const tooManyCount = tooManyRequestCountRef.current;

  // 네트워크 요청을 통해 적재된 데이터는 유지하고, interval 로 수행되고 있는 모든 네트워크 요청 상태를 초기화함
  const clearConnectionBy = useCallback(
    (key: ConnectionKey) => {
      const connection = connectionRecord[key];
      if (connection) {
        const { timeout, interval } = connection;
        clearTimeout(timeout);
        clearInterval(interval);
        delete connectionRecord[key];
      }
    },
    [connectionRecord]
  );
  /* callbacks */
  const clearConnections = useCallback(() => {
    for (const connectionKey in connectionRecord) {
      clearConnectionBy(connectionKey);
      setWaitQueue([]);
    }
  }, [clearConnectionBy]);

  const clearWaitQueueBy = useCallback(
    (key: string) => {
      const nextQueue = waitQueue.filter((args) => {
        return args.connectionKey !== key;
      });
      if (waitQueue.length !== nextQueue.length) {
        setWaitQueue(nextQueue);
      }
    },
    [waitQueue]
  );

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
        connectionKey,
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

      const key = getFinalConnectionKey({
        apiKey,
        connectionKey,
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
        .catch((error) => {
          clearConnectionBy(key);
          //TODO: casing error status
          // 요청이 동시에 너무 많이 일어날 경우, 에러를 반환하며, 이 때는 기존 요청을 지연시켜 retry 해야함.
          if (error.status === 429) {
            console.log('too many request: ', error);

            // 동일 시점에 오류가 많이 발생할 수록, 더 오래 지연시킴.
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
        });
    },
    [connectionRecord, apiTokenMap]
  );

  const queryConnection = useCallback(
    (args: QueryConnectionArgs) => {
      const { connectionKey, apiKey } = args;
      const key = getFinalConnectionKey({
        connectionKey,
        apiKey,
      });

      // 동일 connectionKey 에 대한 요청 발생 시, 네트워크 connection 상태를 초기화하고, interval 을 재시작
      clearConnectionBy(key);
      clearWaitQueueBy(key);
      const parsedArguments = {
        ...args,
        connectionKey: key,
      };

      connectionRecord[key] = { apiKey };
      connectionRecord[key].callback = () => request(parsedArguments);
      enqueueWaits(parsedArguments);
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
    if (isReady && waitQueue.length) {
      const wait = waitQueue[0];
      const { connectionKey, intervalTime } = wait;

      if (connectionKey && connectionRecord[connectionKey]) {
        // 호출되는 순간 콜백을 실행시키고, setInterval을 실행시키는 함수
        const intervalStarter = () => {
          connectionRecord[connectionKey].interval = startInterval(() => {
            const callback = connectionRecord[connectionKey].callback;
            callback && callback();
          }, intervalTime || CONNECTION_INTERVAL);
        };

        const connectionCount = waitQueue.length;
        // Too many request 요청 오류를 피하기 위해 지연 요청 처리
        const term = CONNECTION_TERM * (connectionCount - 1);
        connectionRecord[connectionKey].timeout = setTimeout(
          intervalStarter,
          term
        );
        tooManyCount > 0 && tooManyRequestCountRef.current--;
      }

      dequeueWaits();
    }
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
