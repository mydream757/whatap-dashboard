import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { DEMO_ACCOUNT_API_TOCKEN } from '../api/constants';
import getApiModule from '../api/getApiModule';
import { format } from 'date-fns';
import { ApiCategoryKeys } from '../types';

export interface ConnectionResult<Data = number> {
  value: Data;
  label?: string | number;
  time: number;
}

type ApiState = Partial<{
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

interface ConnectionContextReturn {
  queryConnection: (args: QueryConnectionArgs) => void;
  selectProject: (projectCode: number) => void;
  setApiTokenMap: (value: { [key: string]: string }) => void;
  datum: ApiState;
  clear: () => void;
  config: Record<number, string>;
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

interface ConnectionState {
  projectCode?: number;
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
  const [state, setState] = useState<ConnectionState>({});
  const maxCount = useRef<number>(DEFAULT_MAX_PARALLEL_COUNT);
  const count = useRef<number>(0);
  const timeouts = useRef<NodeJS.Timeout[]>([]);
  const waits = useRef<QueryConnectionArgs[]>([]);
  const callbacks = useRef<{ [key: string]: () => void }>({});
  const [datum, setDatum] = useState<ApiState>({});

  useEffect(() => {
    if (
      state.projectCode &&
      count.current < maxCount.current &&
      waits.current.length
    ) {
      const next = waits.current.shift();

      if (next) {
        queryConnection(next);
      }
    }
  }, [config, waits.current.length, state]);

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
    setState((prevState) => ({
      ...prevState,
      projectCode,
    }));
  };

  const queryConnection = (args: QueryConnectionArgs) => {
    if (!config || !state.projectCode || !config[state.projectCode]) {
      waits.current.push(args);
      return;
    }
    if (count.current < maxCount.current) {
      count.current += 1;
      let header;
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
            'x-whatap-pcode': args.pcode,
          };
          break;
      }
      getApiModule(args.category, { ...header })(args.key, args.params)
        .then((result) => {
          count.current -= 1;
          setDatum((prevState) => {
            const prevValue = prevState[args.key];
            return {
              ...prevState,
              [args.key]: args?.responseParser
                ? args?.responseParser(result.data)
                : [
                    ...(!args.updateData && prevValue ? prevValue : []),
                    defaultResponseParser(result.data),
                  ],
            };
          });
          const t = setTimeout(() => {
            queryConnection({
              ...args,
              params: args.recurParams
                ? args.recurParams(args.params)
                : args.params,
            });
          }, args.timeout || 5000);
          timeouts.current.push(t);
        })
        .catch((error) => {
          count.current -= 1;
          //TODO: casing error status
          if (error.status === 429) {
            console.log('too many request: ', error);
            waits.current.push(args);
          }
        });
    } else {
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

function useConnection() {
  return React.useContext(ConnectionContext);
}

export { ConnectionProvider, useConnection };
