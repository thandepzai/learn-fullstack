// remove all dirtyValues from object
export const cleanObject = <T extends object>(object: any, dirtyValues: any[] = [undefined]): T => {
    const newObject: Partial<T> = {};
    Object.keys(object).forEach((key) => {
        const typedKey = key as keyof T;

        if (
            !dirtyValues.some((value) => {
                if (Number.isNaN(value)) return Number.isNaN(object[typedKey]);
                return value === object[typedKey];
            })
        ) {
            newObject[typedKey] = object[typedKey];
        }
    });

    return newObject as T;
};
