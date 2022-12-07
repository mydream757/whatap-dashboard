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

interface QueryConnectionArgs<Param = { [key: string]: string | number }> {
  pcode: number;
  category: ApiCategoryKeys;
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

const DEFAULT_MAX_PARALLEL_COUNT = 20;

function ConnectionProvider({ children }: { children?: ReactNode }) {
  const [config, setConfig] = useState<Record<number, string>>({});
  const [pcode, setPcode] = useState<number>();
  const [datum, setDatum] = useState<DataRecord>({});

  const maxCount = useRef<number>(DEFAULT_MAX_PARALLEL_COUNT);
  const count = useRef<number>(0);
  const timeouts = useRef<NodeJS.Timeout[]>([]);
  const waits = useRef<QueryConnectionArgs[]>([]);
  const callbacks = useRef<{ [key: string]: () => void }>({});

  const isReady = useMemo(() => {
    return config && pcode && config[pcode];
  }, [config, pcode]);

  useEffect(() => {
    if (isReady && waits.current.length) {
      const next = waits.current.shift();

      if (next) {
        queryConnection(next);
      }
    }
  }, [waits.current.length, isReady]);

  const setApiTokenMap = (value: { [key: number]: string }) => {
    setConfig(value);
  };

  const clear = () => {
    timeouts.current.forEach((timeout) => {
      clearTimeout(timeout);
    });
    timeouts.current = [];
    callbacks.current = {};
    waits.current = [];

    setDatum({});
  };

  const selectProject = (projectCode: number) => {
    clear();
    setPcode(projectCode);
  };

  const queryConnection = (args: QueryConnectionArgs) => {
    if (!isReady) {
      waits.current.push(args);
      return;
    }
    // ready to request api
    // not yet maximum concurrency
    if (count.current < maxCount.current) {
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

          // set timeout for loop request
          const t = setTimeout(() => {
            queryConnection(nextQueryArgs);
          }, args.timeout || 5000);
          count.current -= 1;
          timeouts.current.push(t);
        })
        .catch((error) => {
          count.current -= 1;
          //TODO: casing error status
          if (error.status === 429) {
            console.log('too many request: ', error);
            waits.current.push(args);
          }
          console.log('other errors: ', error);
        });
      count.current += 1;
    }
    // on maximum concurrency
    else {
      console.log('queue push:', args);
      waits.current.push(args);
    }
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
