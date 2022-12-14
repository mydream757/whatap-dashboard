export const getLatestArray = <T>(
  prevData: T[] = [],
  data: T[],
  maxSize?: number
): T[] => {
  if (!maxSize) {
    return data;
  } else {
    const mergedRecord = [...prevData, ...data];

    while (maxSize < mergedRecord.length) {
      mergedRecord.shift();
    }

    return mergedRecord;
  }
};
