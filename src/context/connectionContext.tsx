import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { ApiCategoryKeys } from '../components/chart/constants';
import { DEMO_ACCOUNT_API_TOCKEN } from '../api/constants';
import getApiModule from '../api/getApiModule';

export interface ConnectionResult<Data = number> {
  value: Data;
  time: number;
}

type ApiState = Partial<{
  [key: string]: ConnectionResult[];
}>;

interface QueryConnectionArgs<Param = { [key: string]: string | number }> {
  pcode: number;
  category: ApiCategoryKeys;
  key: string;
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
  waits: QueryConnectionArgs[];
}

const MAX_PARALLEL_COUNT = 6;

function ConnectionProvider({ children }: { children?: ReactNode }) {
  const [config, setConfig] = useState<Record<number, string>>({});
  const [state, setState] = useState<ConnectionState>({
    waits: [],
  });
  const count = useRef<number>(0);
  const timeouts = useRef<NodeJS.Timeout[]>([]);
  const callbacks = useRef<{ [key: string]: () => void }>({});
  const [datum, setDatum] = useState<ApiState>({});

  useEffect(() => {
    if (
      state.projectCode &&
      count.current < MAX_PARALLEL_COUNT &&
      state.waits.length
    ) {
      const next = state.waits[0];
      setState((prevState) => ({
        ...prevState,
        waits: prevState.waits.slice(1),
      }));
      queryConnection(next);
    }
  }, [count.current, config, state]);

  const setApiTokenMap = (value: { [key: number]: string }) => {
    setConfig(value);
  };

  const clear = () => {
    setState(() => ({ waits: [] }));
    timeouts.current.forEach((timeout) => {
      clearTimeout(timeout);
    });
    timeouts.current = [];
    callbacks.current = {};

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
      setState((prevState) => ({
        ...prevState,
        waits: [
          ...prevState.waits,
          {
            ...args,
          },
        ],
      }));
      return;
    }
    if (count.current < MAX_PARALLEL_COUNT) {
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
          setDatum((prevState) => {
            const prevValue = prevState[args.key];
            return {
              ...prevState,
              [args.key]: [
                ...(!args.updateData && prevValue ? prevValue : []),
                {
                  value: result.data,
                  time: Date.now(),
                },
              ],
            };
          });
          count.current -= 1;
          const t = setTimeout(
            () =>
              queryConnection({
                ...args,
                params: args.recurParams
                  ? args.recurParams(args.params)
                  : args.params,
              }),
            args.timeout || 5000
          );
          timeouts.current.push(t);
        })
        .catch(() => {
          count.current -= 1;
          //TODO: casing error status
          /*
          setState((prevState) => ({
            ...prevState,
            waits: [
              ...prevState.waits,
              {
                ...args,
              },
            ],
          }));*/
        });
    } else {
      console.log('queue push:', args);
      setState((prevState) => ({
        ...prevState,
        waits: [
          ...prevState.waits,
          {
            ...args,
          },
        ],
      }));
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
