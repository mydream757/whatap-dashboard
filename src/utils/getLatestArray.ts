export const getLatestArray = <T>(
  prevData: T[] = [],
  data: T[],
  maxSize?: number
): T[] => {
  if (!maxSize) {
    return data;
  } else {
    const mergedRecord = [...prevData, ...data];

    const dif = mergedRecord.length - maxSize;
    if (dif > 0) {
      mergedRecord.splice(0, dif);
    }

    return mergedRecord;
  }
};
