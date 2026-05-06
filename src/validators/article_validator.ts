
// This function has been specifically written to emulate Article Data Service's validator,
// so that the same input is evaluated true/false by both validators
export function isValidGazellaJson(jsonString: string): boolean {
    try {
        const content = JSON.parse(jsonString);

        // We also ensure it's an object, as C# deserializing to a class instance demands a JSON object.
        if (content === null || typeof content !== 'object' || Array.isArray(content)) {
            return false;
        }

        // Helper to emulate C#'s PropertyNameCaseInsensitive = true
        const getPropertyCaseInsensitive = (obj: any, propName: string): { exists: boolean, value?: any } => {
            if (obj === null || typeof obj !== 'object') return { exists: false };
            
            const lowerPropName = propName.toLowerCase();
            const foundKey = Object.keys(obj).find(k => k.toLowerCase() === lowerPropName);
            
            return foundKey === undefined 
                ? { exists: false } 
                : { exists: true, value: obj[foundKey] };
        };

        const blocksProp = getPropertyCaseInsensitive(content, 'blocks');

        // Note: In C#, if "blocks" is completely missing and uninitialized, .All() throws a NullReferenceException. 
        // If it's the wrong type, JsonSerializer throws a JsonException. 
        // In both cases, the C# result is ultimately a failure.
        if (!blocksProp.exists || !Array.isArray(blocksProp.value)) {
            return false;
        }

        // content.Blocks.All(b => b.Data.ValueKind != JsonValueKind.Undefined)
        for (const block of blocksProp.value) {
            const dataProp = getPropertyCaseInsensitive(block, 'data');

            // JsonValueKind.Undefined means the property does not exist in the JSON payload at all.
            // If it exists but is null ("data": null), it is valid.
            if (!dataProp.exists) {
                return false;
            }
        }

        return true;
    } catch (error) {
        // If an exception is thrown, is not valid JSON, no need to log
        return false;
    }
}
