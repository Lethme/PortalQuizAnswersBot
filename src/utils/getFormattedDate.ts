export const getFormattedDate = (date: Date) => {
    const formattedDate = date.toLocaleString("en", {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    return formattedDate;
}

export const getFormattedDateNow = () => {
    return getFormattedDate(new Date());
}