import React, { ReactNode, useEffect, useRef, useState } from 'react';
import getApiModule from '../api/getApiModule';
import { ApiCategoryKeys } from '../components/chart/constants';
import { DEMO_ACCOUNT_API_TOCKEN } from '../api/constants';

export interface ConnectionResult<Data> {
  data: { value: Data; time: number };
}

type ApiState = Partial<{
  [key: string]: ConnectionResult<number>[];
}>;

interface ConnectionContextReturn {
  queryConnection: (
    pcode: number,
    category: ApiCategoryKeys,
    key: string
  ) => void;
  selectProject: (projectCode: number) => void;
  setApiTokenMap: (value: { [key: string]: string }) => void;
  datum: ApiState;
  clear: () => void;
  config: Record<number, string>;
}

const ConnectionContext = React.createContext<ConnectionContextReturn>({
  queryConnection: (pcode, category, key) => {
    console.log(category, key);
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

type ConnectionStatus = {
  key: string;
  category: ApiCategoryKeys;
};

interface ConnectionState {
  projectCode?: number;
  waits: ConnectionStatus[];
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
      queryConnection(state.projectCode, next.category, next.key);
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

  const queryConnection = (
    pcode: number,
    category: ApiCategoryKeys,
    key: string
  ) => {
    if (!config || !state.projectCode || !config[state.projectCode]) {
      setState((prevState) => ({
        ...prevState,
        waits: [
          ...prevState.waits,
          {
            category,
            key,
          },
        ],
      }));
      return;
    }
    if (count.current < MAX_PARALLEL_COUNT) {
      count.current += 1;
      let header;
      switch (category) {
        case 'account':
          header = {
            'x-whatap-token': DEMO_ACCOUNT_API_TOCKEN,
          };
          break;
        case 'project':
        default:
          header = {
            'x-whatap-token': config[pcode],
            'x-whatap-pcode': pcode,
          };
          break;
      }
      getApiModule(category, { ...header })(key)
        .then((result) => {
          setDatum((prevState) => ({
            ...prevState,
            [key]: [
              ...(prevState[key] || []),
              {
                data: {
                  value: result.data,
                  time: Date.now(),
                },
              },
            ],
          }));
          count.current -= 1;
          const timeout = setTimeout(
            () => queryConnection(pcode, category, key),
            5000
          );
          timeouts.current.push(timeout);
        })
        .catch(() => {
          count.current -= 1;
          //TODO: casing error status
          setState((prevState) => ({
            ...prevState,
            waits: [
              ...prevState.waits,
              {
                category,
                key,
              },
            ],
          }));
        });
    } else {
      console.log('queue push:', key);
      setState((prevState) => ({
        ...prevState,
        waits: [
          ...prevState.waits,
          {
            category,
            key,
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
