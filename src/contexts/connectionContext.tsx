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
  setApiTokenMap: (value: { [key: string]: string }) => void;
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

const CONNECTION_INTERVAL = 5000;
const CONNECTION_TERM = 25;
const MAXIMUM_BACKOFF = 1000 * 2;

const getExponentialBackOffTime = (fail = 0) => {
  return Math.min(fail * 50, MAXIMUM_BACKOFF);
};

interface QueryConnectionArgs<Param = { [key: string]: string | number }> {
  pcode: number;
  category: ApiCategoryKeys;
  fail?: number;
  key: string;
  responseParser?: (response: any) => ConnectionResult[];
  updateData?: boolean;
  params?: Param;
  recurParams?: (args?: Param) => Param;
  timeout?: number;
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

type ApiQueryKey = string;
type ConnectionState = {
  interval?: NodeJS.Timer;
  timeout?: NodeJS.Timer;
  callback?: () => void;
};

type ConnectionStateRecord = Record<ApiQueryKey, ConnectionState>;

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
  const clearConnection = useCallback((key?: string) => {
    const clearOf = (key: string) => {
      const connection = connectionRecord[key];
      if (connection) {
        const { timeout, interval } = connection;
        clearTimeout(timeout);
        clearInterval(interval);
        // connection 을 종료할 경우, 그 key 에 해당하는 '대기 상태의 query' 또한 삭제한다.
        setWaitQueue((prevState) =>
          prevState.filter((data) => data.key !== key)
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

  const queryConnection = useCallback(
    (args: QueryConnectionArgs) => {
      const { key } = args;
      // query 가 일어날 경우, query 상태를 초기화함
      clearConnection(key);

      connectionRecord[key] = {};
      connectionRecord[key].callback = () => request(args);
      enqueueWaits(args);
    },
    [connectionRecord, apiTokenMap]
  );

  const request = (args: QueryConnectionArgs) => {
    let header: OpenApiHeader;
    switch (args.category) {
      case 'account':
        header = {
          'x-whatap-token': DEMO_ACCOUNT_API_TOCKEN,
        };
        break;
      case 'project':
      default:
        header = {
          'x-whatap-token': apiTokenMap[args.pcode],
          'x-whatap-pcode': `${args.pcode}`,
        };
        break;
    }

    getApiModule(args.category, { ...header })(args.key, args.params)
      .then((result) => {
        setDataRecord((prevState) => {
          const prevValue = prevState[args.key];
          const parsedResponse = args.responseParser
            ? args.responseParser(result.data)
            : [defaultResponseParser(result.data)];

          const nextRecord = [
            ...(args.updateData && prevValue ? prevValue : []),
            ...parsedResponse,
          ];
          return {
            ...prevState,
            [args.key]: nextRecord,
          };
        });
        const nextQueryArgs = {
          ...args,
          params: args.recurParams
            ? args.recurParams(args.params)
            : args.params,
        };

        connectionRecord[args.key].callback = () => request(nextQueryArgs);
      })

      .catch((error) => {
        //TODO: casing error status
        if (error.status === 429) {
          console.log('too many request: ', error);

          tooManyCountRef.current++;
          clearConnection(args.key);

          // set timeout for loop request
          const t = setTimeout(() => {
            enqueueWaits(args);
          }, getExponentialBackOffTime(tooManyCountRef.current++));
          connectionRecord[args.key].timeout = t;
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
        const { key } = wait;

        const nextInterval = startInterval(() => {
          const callback = connectionRecord[key].callback;
          callback && callback();
        }, CONNECTION_INTERVAL);

        const updateInterval = () => {
          connectionRecord[key].interval = nextInterval;
        };

        const term = CONNECTION_TERM * waitQueue.length - 1;

        connectionRecord[key].timeout = setTimeout(updateInterval, term);
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
