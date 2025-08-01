export const formatMinutesToHours = (minutes) => {
    if (!minutes || minutes === 0) return "0 хв";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours} год ` : ""}${mins} хв`;
};