import { useEffect, useState } from 'react';
import { API_ROUTES } from '../api/constants';
import API from '../api';

type Api = keyof typeof API_ROUTES[''];

interface UseApiConnectionProps {
  apis: Api[];
  intervalTime?: number;
}

interface ConnectionResult<Data> {
  data: { value: Data; time: Date }[];
}

type ApiState = Partial<{
  [key in keyof typeof API_ROUTES['']]: ConnectionResult<number>;
}>;

export const useSpotConnections = ({
  apis,
  intervalTime = 5000,
}: UseApiConnectionProps): ApiState => {
  const [datum, setDatum] = useState<ApiState>(() => {
    const initialState = {};
    apis.forEach((key) => {
      Object.assign(initialState, {
        [key]: {
          data: [],
        },
      });
    });
    return initialState;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      apis.forEach((key) => {
        API.spot(key).then((result) => {
          setDatum((prevState) => {
            return {
              ...prevState,
              [key]: {
                ...[key],
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
        });
      });
    }, intervalTime);
    return () => clearInterval(interval);
  }, []);

  return datum;
};
