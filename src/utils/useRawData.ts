export const useRawData = (): boolean => {
	return process.env.MDL_USE_RAW !== undefined && process.env.MDL_USE_RAW.toString() === 'true';
}