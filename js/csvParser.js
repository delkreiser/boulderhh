export function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = [];
        let current = '';
        let inQuotes = false;

        for (let char of line) {
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());

        if (values[0]) {
            const deal = {
                venue: values[0],
                city: values[1] || '',
                day: values[2] || '',
                deal_type: values[3] || '',
                time: values[4] || '',
                deal_description: values[5] || '',
                beer: (values[6] || '').toLowerCase().trim() === 'x',
                wine: (values[7] || '').toLowerCase().trim() === 'x',
                cocktail: (values[8] || '').toLowerCase().trim() === 'x',
                margarita: (values[9] || '').toLowerCase().trim() === 'x',
                nobo: (values[10] || '').toLowerCase().trim() === 'x',
                sobo: (values[11] || '').toLowerCase().trim() === 'x',
                downtown: (values[12] || '').toLowerCase().trim() === 'x',
                lesbo: (values[13] || '').toLowerCase().trim() === 'x',
                thehill: (values[14] || '').toLowerCase().trim() === 'x',
                central: (values[15] || '').toLowerCase().trim() === 'x',
                latenight: (values[16] || '').toLowerCase().trim() === 'x',
                taco_tuesday: (values[17] || '').toLowerCase().trim() === 'x',
                url: (values[18] || '').trim(),
                feature_tier: (values[19] || '').toLowerCase().trim(),
                feature_expiration: (values[20] || '').trim(),
                show_ad_card: (values[21] || '').toLowerCase().trim() === 'x',
                feature_priority: parseInt(values[22] || '999'),
                coffee: (values[23] || '').toLowerCase().trim() === 'x'
            };

            result.push(deal);
        }
    }

    return result;
}
