export const isDevelopmentMode = (): boolean => {
    return process.env.NODE_ENV !== undefined && process.env.NODE_ENV === 'development';
}