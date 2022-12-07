import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { DEMO_ACCOUNT_API_TOCKEN } from '../api/constants';
import getApiModule from '../api/getApiModule';
import { format } from 'date-fns';
import { ApiCategoryKeys, OpenApiHeader } from '../types';

interface ConnectionContextReturn {
  queryConnection: (args: QueryConnectionArgs) => void;
  selectProject: (projectCode: number) => void;
  setApiTokenMap: (value: { [key: string]: string }) => void;
  datum: DataRecord;
  clear: () => void;
  config: Record<number, string>;
}

export interface ConnectionResult<Data = number> {
  value: Data;
  label?: string | number;
  time: number;
}

export type DataRecord = Partial<{
  [key: string]: ConnectionResult[];
}>;

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

function ConnectionProvider({ children }: { children?: ReactNode }) {
  const [config, setConfig] = useState<Record<number, string>>({});
  const [pcode, setPcode] = useState<number>();
  const [datum, setDatum] = useState<DataRecord>({});

  const countTooMany = useRef<number>(0);

  const [waitState, setWaits] = useState<QueryConnectionArgs[]>([]);
  const recordRef = useRef<{
    [key: string]: {
      interval?: NodeJS.Timer;
      timeout?: NodeJS.Timer;
      callback?: () => void;
    };
  }>({});

  const isReady = useMemo(() => {
    return !!(config && pcode && config[pcode]);
  }, [config, pcode]);

  const clearRecordOf = (key: string) => {
    if (recordRef.current[key]) {
      clearTimeout(recordRef.current[key].timeout);
      clearInterval(recordRef.current[key].interval);
      delete recordRef.current[key];
    }
  };

  useEffect(() => {
    return () => {
      for (const key in recordRef.current) {
        clearRecordOf(key);
      }
    };
  }, []);
  useEffect(() => {
    if (isReady && waitState.length) {
      const wait = waitState[0];
      setWaits((prevState) => prevState.slice(1));
      if (recordRef.current[wait.key]) {
        recordRef.current[wait.key].timeout = setTimeout(() => {
          recordRef.current[wait.key].interval = startInterval(() => {
            const callback = recordRef.current[wait.key].callback;
            callback && callback();
          }, 5000);
        }, 25 * Object.keys(recordRef.current).length - 1);
      }
    }
    return () => {
      countTooMany.current > 0 && countTooMany.current--;
    };
  }, [waitState, isReady]);

  const setApiTokenMap = (value: { [key: number]: string }) => {
    setConfig(value);
  };

  const clear = () => {
    setWaits([]);
    countTooMany.current = 0;
    //waits.current = [];
    for (const key in recordRef.current) {
      clearRecordOf(key);
    }
    setDatum({});
    sleep(1000);
  };

  const selectProject = (projectCode: number) => {
    setPcode(projectCode);
  };

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
          'x-whatap-token': config[args.pcode],
          'x-whatap-pcode': `${args.pcode}`,
        };
        break;
    }

    getApiModule(args.category, { ...header })(args.key, args.params)
      .then((result) => {
        setDatum((prevState) => {
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

        recordRef.current[args.key].callback = () => request(nextQueryArgs);
      })

      .catch((error) => {
        //TODO: casing error status
        if (error.status === 429) {
          console.log('too many request: ', error);

          countTooMany.current++;
          clearRecordOf(args.key);

          // set timeout for loop request
          const t = setTimeout(() => {
            setWaits((prevState) => [...prevState, args]);
          }, getExponentialBackOffTime(countTooMany.current++));
          recordRef.current[args.key].timeout = t;
        } else {
          console.log('other errors: ', error);
        }
      });
  };

  const queryConnection = (args: QueryConnectionArgs) => {
    clearRecordOf(args.key);
    recordRef.current[args.key] = {};
    recordRef.current[args.key].callback = () => request(args);
    setWaits((prevState) => [...prevState, args]);
  };

  return (
    <ConnectionContext.Provider
      value={{
        queryConnection,
        datum,
        selectProject,
        clear,
        setApiTokenMap,
        config,
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
  datum: {},
  clear: () => {
    console.log('clear state');
  },
  config: {},
});

function useConnection() {
  return React.useContext(ConnectionContext);
}

export { ConnectionProvider, useConnection };
