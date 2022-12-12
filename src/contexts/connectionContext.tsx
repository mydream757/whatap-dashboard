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
import { format } from 'date-fns';
import { ApiCategoryKeys, OpenApiHeader } from '../types';

type ProjectCode = number;
type ApiToken = string;

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

export type DataRecord = Record<string, ConnectionResult[]>;

export const CONNECTION_INTERVAL = 5000;
const CONNECTION_TERM = 25;
const MAXIMUM_BACKOFF = 1000 * 2;

const getExponentialBackOffTime = (fail = 0) => {
  return Math.min(fail * 50, MAXIMUM_BACKOFF);
};

type QueryKey = string;

type ConnectionState = {
  apiKey: string;
  interval?: NodeJS.Timer;
  timeout?: NodeJS.Timer;
  callback?: () => void;
};

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

const defaultResponseParser = (response: number) => {
  return {
    value: response,
    label: format(new Date(Date.now()), 'mm:ss'),
    time: Date.now(),
  };
};

const startInterval = (callback: () => void, timeout: number) => {
  callback();
  return setInterval(callback, timeout);
};

function sleep(ms: number) {
  const start = Date.now();
  let now = start;
  while (now - start < ms) {
    now = Date.now();
  }
}

function ConnectionProvider({ children }: { children?: ReactNode }) {
  /* states */
  const [pcode, setPcode] = useState<ProjectCode>();
  const [apiTokenMap, setApiTokenMap] = useState<Record<ProjectCode, ApiToken>>(
    {}
  );
  const [dataRecord, setDataRecord] = useState<DataRecord>({});
  const [waitQueue, setWaitQueue] = useState<QueryConnectionArgs[]>([]);
  /* refs */
  const connectionRecordRef = useRef<ConnectionStateRecord>({});
  const connectionRecord = connectionRecordRef.current;

  const tooManyCountRef = useRef<number>(0);
  const tooManyCount = tooManyCountRef.current;

  /* callbacks */
  const clearConnection = useCallback((key?: QueryKey) => {
    const clearOf = (key: string) => {
      const connection = connectionRecord[key];
      if (connection) {
        const { timeout, interval } = connection;
        clearTimeout(timeout);
        clearInterval(interval);
        // connection 을 종료할 경우, 그 key 에 해당하는 '대기 상태의 query' 또한 삭제한다.
        setWaitQueue((prevState) =>
          prevState.filter((data) => {
            const targetKey = getKey({
              queryKey: data.queryKey,
              apiKey: data.apiKey,
            });
            return targetKey !== key;
          })
        );
        delete connectionRecord[key];
      }
    };

    if (key === undefined) {
      for (const key in connectionRecord) {
        clearOf(key);
      }
    } else {
      clearOf(key);
    }
  }, []);

  const enqueueWaits = useCallback((args: QueryConnectionArgs) => {
    setWaitQueue((prevState) => [...prevState, args]);
  }, []);

  const dequeueWaits = useCallback((index = 0) => {
    setWaitQueue((prevState) => prevState.filter((_, i) => i !== index));
  }, []);

  const clear = useCallback(() => {
    setWaitQueue([]);
    tooManyCountRef.current = 0;
    clearConnection();
    setDataRecord({});
    sleep(1000);
  }, []);

  const selectProject = useCallback((projectCode: number) => {
    setPcode(projectCode);
  }, []);

  const getKey = useCallback(
    ({
      queryKey,
      apiKey,
    }: Pick<QueryConnectionArgs, 'apiKey' | 'queryKey'>) => {
      return queryKey || apiKey;
    },
    []
  );

  const queryConnection = useCallback(
    (args: QueryConnectionArgs) => {
      const { queryKey, apiKey } = args;
      const key = getKey({
        queryKey,
        apiKey,
      });
      // query 가 일어날 경우, query 상태를 초기화함
      clearConnection(key);

      connectionRecord[key] = { apiKey };
      connectionRecord[key].callback = () => request(args);
      enqueueWaits(args);
    },
    [connectionRecord, apiTokenMap]
  );

  const request = (args: QueryConnectionArgs) => {
    let header: OpenApiHeader;
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

    const key = getKey({
      apiKey,
      queryKey,
    });

    // api 호출은 apiKey 를 통하고, 요청 및 응답에 대한 상태 관리는 'key' 에 맵핑
    getApiModule(category, { ...header })(apiKey, params)
      .then((result) => {
        setDataRecord((prevState) => {
          let currentRecord = responseParser
            ? responseParser(result.data)
            : [defaultResponseParser(result.data)];

          if (maxStackSize) {
            const prevRecord = prevState[key] || [];
            const mergedRecord = [...prevRecord, ...currentRecord];

            while (maxStackSize < mergedRecord.length) {
              mergedRecord.shift();
            }

            currentRecord = mergedRecord;
          }

          return {
            ...prevState,
            [key]: currentRecord,
          };
        });
        const nextQueryArgs = {
          ...args,
          params: recurParams ? recurParams(params) : params,
        };

        const nextCallback = () => request(nextQueryArgs);
        connectionRecord[key].callback = nextCallback;
      })

      .catch((error) => {
        //TODO: casing error status
        if (error.status === 429) {
          console.log('too many request: ', error);

          tooManyCountRef.current++;
          clearConnection(key);

          // set timeout for loop request
          const t = setTimeout(() => {
            enqueueWaits(args);
          }, getExponentialBackOffTime(tooManyCountRef.current++));
          connectionRecord[key].timeout = t;
        } else {
          console.log('other errors: ', error);
        }
      });
  };

  /* memoized values */
  const isReady = useMemo(() => {
    return !!(apiTokenMap && pcode && apiTokenMap[pcode]);
  }, [apiTokenMap, pcode]);

  /* effects */
  useEffect(() => {
    return () => clearConnection();
  }, []);

  useEffect(() => {
    if (isReady && waitQueue[0]) {
      const wait = waitQueue[0];
      if (wait) {
        const { queryKey, intervalTime, apiKey } = wait;
        const key = getKey({
          queryKey,
          apiKey,
        });

        const nextInterval = startInterval(() => {
          const callback = connectionRecord[key].callback;
          callback && callback();
        }, intervalTime || CONNECTION_INTERVAL);

        const startIntervalAfter = () => {
          connectionRecord[key].interval = nextInterval;
        };

        const term = CONNECTION_TERM * waitQueue.length - 1;

        connectionRecord[key].timeout = setTimeout(startIntervalAfter, term);
        dequeueWaits();
      }
    }

    return () => {
      tooManyCount > 0 && tooManyCountRef.current--;
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
