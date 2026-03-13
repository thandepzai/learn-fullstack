// remove all dirtyValues from array
export const cleanArray = <T>(array: any[], dirtyValues: any[] = [undefined]): T[] => {
    return array.filter((el) => {
        return !dirtyValues.some((value) => {
            if (Number.isNaN(value)) return Number.isNaN(el);
            return value === el;
        });
    }) as T[];
};
