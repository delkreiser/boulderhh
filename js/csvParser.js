// Fields that should be parsed as boolean ("x" = true)
const BOOLEAN_FIELDS = [
    'beer', 'wine', 'cocktail', 'margarita',
    'nobo', 'sobo', 'downtown', 'lesbo', 'thehill', 'central',
    'latenight', 'taco_tuesday', 'show_ad_card', 'coffee'
];

function parseLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let char of line) {
        if (char === '"') {
            if (inQuotes && current.endsWith('"')) {
                // Escaped quote ("") inside quoted field — keep one quote
                current = current.slice(0, -1) + '"';
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current.trim());
    return values;
}

function normalizeHeader(header) {
    // Convert header text to a consistent field name:
    // "Deal Type" -> "deal_type", "Taco Tuesday" -> "taco_tuesday", "URL" -> "url"
    return header
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
}

export function parseCSV(csvText) {
    const lines = csvText.split('\n');
    if (lines.length < 2) return [];

    // Parse header row to build column name -> index map
    const headerValues = parseLine(lines[0]);
    const columnMap = {};
    headerValues.forEach((header, index) => {
        const name = normalizeHeader(header);
        if (name) {
            columnMap[name] = index;
        }
    });

    // Helper to get a value by column name
    const get = (values, name) => {
        const idx = columnMap[name];
        if (idx === undefined) return '';
        return (values[idx] || '').trim();
    };

    const getBool = (values, name) => {
        return get(values, name).toLowerCase() === 'x';
    };

    const result = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = parseLine(line);

        const venue = get(values, 'venue');
        if (!venue) continue;

        const deal = {
            venue,
            city: get(values, 'city'),
            day: get(values, 'day'),
            deal_type: get(values, 'deal_type'),
            time: get(values, 'time'),
            deal_description: get(values, 'deal_description'),
            beer: getBool(values, 'beer'),
            wine: getBool(values, 'wine'),
            cocktail: getBool(values, 'cocktail'),
            margarita: getBool(values, 'margarita'),
            nobo: getBool(values, 'nobo'),
            sobo: getBool(values, 'sobo'),
            downtown: getBool(values, 'downtown'),
            lesbo: getBool(values, 'lesbo'),
            thehill: getBool(values, 'thehill'),
            central: getBool(values, 'central'),
            latenight: getBool(values, 'latenight'),
            taco_tuesday: getBool(values, 'taco_tuesday'),
            url: get(values, 'url'),
            feature_tier: get(values, 'feature_tier').toLowerCase(),
            feature_expiration: get(values, 'feature_expiration'),
            show_ad_card: getBool(values, 'show_ad_card'),
            feature_priority: parseInt(get(values, 'feature_priority') || '999'),
            coffee: getBool(values, 'coffee')
        };

        result.push(deal);
    }

    return result;
}
