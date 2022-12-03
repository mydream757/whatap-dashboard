import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { API_CATEGORIES } from '../api/constants';
import getApiModule from '../api/getApiModule';

interface ConnectionResult<Data> {
  data: { value: Data; time: Date }[];
}

type ApiState = Partial<{
  [key in keyof typeof API_CATEGORIES['project']['api']]: ConnectionResult<number>;
}>;

interface ConnectionContextReturn {
  queryConnection: (key: keyof typeof API_CATEGORIES['project']['api']) => void;
  selectProject: (projectCode: number) => void;
  setApiTokenMap: (value: { [key: string]: string }) => void;
  datum: ApiState;
  clear: () => void;
  config: Record<number, string>;
}

const ConnectionContext = React.createContext<ConnectionContextReturn>({
  queryConnection: (key) => {
    console.log(key);
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
  key: keyof typeof API_CATEGORIES['project']['api'];
};

interface ConnectionState {
  projectCode?: number;
  waits: ConnectionStatus[];
}

const MAX_PARALLEL_COUNT = 5;

function ConnectionProvider({ children }: { children?: ReactNode }) {
  const [config, setConfig] = useState<Record<number, string>>({});
  const [state, setState] = useState<ConnectionState>({
    waits: [],
  });
  const count = useRef<number>(0);
  const timeouts = useRef<NodeJS.Timeout[]>([]);
  const [datum, setDatum] = useState<ApiState>({});

  useEffect(() => {
    if (count.current < MAX_PARALLEL_COUNT && state.waits.length) {
      const next = state.waits[0];
      setState((prevState) => ({
        ...prevState,
        waits: prevState.waits.slice(1),
      }));
      queryConnection(next.key);
    }
  }, [count.current, config, state]);

  const setApiTokenMap = useCallback((value: { [key: number]: string }) => {
    setConfig(value);
  }, []);

  const clear = useCallback(() => {
    setState({ waits: [] });
    timeouts.current.forEach((timeout) => {
      clearTimeout(timeout);
    });
    setDatum({});
  }, [timeouts]);

  const selectProject = useCallback(
    (projectCode: number) => {
      setState((prevState) => ({
        ...prevState,
        projectCode,
      }));
    },
    [config]
  );

  const queryConnection = useCallback(
    (key: keyof typeof API_CATEGORIES['project']['api']) => {
      if (!config || !state.projectCode || !config[state.projectCode]) {
        setState((prevState) => ({
          ...prevState,
          waits: [
            ...prevState.waits,
            {
              key,
            },
          ],
        }));
        return;
      }
      if (count.current < MAX_PARALLEL_COUNT) {
        count.current += 1;
        getApiModule('project', {
          'x-whatap-token': config[state.projectCode],
          'x-whatap-pcode': Number(state.projectCode),
        })('api')(key)
          .then((result) => {
            setDatum((prevState) => {
              return {
                ...prevState,
                [key]: {
                  ...prevState[key],
                  data: [
                    ...(prevState[key]?.data || []),
                    {
                      value: result.data,
                      time: Date.now(),
                    },
                  ],
                },
              };
            });
            count.current -= 1;
            const timeout = setTimeout(() => {
              queryConnection(key);
            }, 5000);
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
              key,
            },
          ],
        }));
      }
    },
    [state, count.current]
  );

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
