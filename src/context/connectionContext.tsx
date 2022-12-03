import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import getApiModule from '../api/getApiModule';
import { API_ROUTES } from '../api/constants';

interface ConnectionResult<Data> {
  data: { value: Data; time: Date }[];
}

type ApiState = Partial<{
  [key in keyof typeof API_ROUTES['']]: ConnectionResult<number>;
}>;

interface ConnectionContextProps {
  queryConnection: (key: keyof typeof API_ROUTES['']) => void;
  datum: ApiState;
}

const ConnectionContext = React.createContext<ConnectionContextProps>({
  queryConnection: (key) => {
    console.log(key);
  },
  datum: {},
});

type ConnectionStatus = {
  key: keyof typeof API_ROUTES[''];
};

interface ConnectionState {
  waits: ConnectionStatus[];
}

const MAX_PARALLEL_COUNT = 5;

function ConnectionProvider({ children }: { children?: ReactNode }) {
  const [state, setState] = useState<ConnectionState>({
    waits: [],
  });
  const count = useRef<number>(0);
  const [datum, setDatum] = useState<ApiState>({});

  useEffect(() => {
    if (count.current < MAX_PARALLEL_COUNT) {
      const next = state.waits.shift();
      if (next) {
        queryConnection(next.key);
      }
    }
  }, [count.current]);

  const queryConnection = useCallback((key: keyof typeof API_ROUTES['']) => {
    if (count.current < MAX_PARALLEL_COUNT) {
      count.current += 1;
      getApiModule('')(key)
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
          setTimeout(() => {
            queryConnection(key);
          }, 5000);
        })
        .catch(() => {
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
  }, []);

  return (
    <ConnectionContext.Provider
      value={{
        queryConnection,
        datum,
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
