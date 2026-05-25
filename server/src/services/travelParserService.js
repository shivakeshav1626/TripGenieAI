const monthPattern = "(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)";
const dateRegexes = [
  new RegExp(`\\b${monthPattern} \\d{1,2},? \\d{4}\\b`, "ig"),
  /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g,
  /\b\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}\b/g,
];

const normalizeWhitespace = (text) => text.replace(/\s+/g, " ").trim();

const extractMatches = (text, regexes) => {
  const matches = new Set();

  regexes.forEach((regex) => {
    const results = text.match(regex) || [];
    results.forEach((result) => matches.add(result.trim()));
  });

  return Array.from(matches);
};

const detectDocumentType = (text) => {
  const lowerText = text.toLowerCase();

  if (lowerText.includes("boarding pass") || lowerText.includes("flight")) return "flight";
  if (lowerText.includes("hotel") || lowerText.includes("reservation")) return "hotel";
  if (lowerText.includes("itinerary")) return "itinerary";
  if (lowerText.includes("visa")) return "visa";
  return "travel_document";
};

const extractDestinations = (text) => {
  const lowerText = text.toLowerCase();
  const destinations = [];

  // City patterns: Look for city mentions often followed by country or state
  const cityPatterns = [
    /\b(?:to|arriving at|destination:?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/gi,
    /\b([A-Z][a-z]+),\s*([A-Z]{2}|[A-Z]{3}|[A-Za-z]+)\b/g,
    /\b(?:visiting|going to|traveling to)\s+([A-Z][a-z]+)\b/gi,
  ];

  cityPatterns.forEach((pattern) => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      destinations.push(match[1]);
    }
  });

  return [...new Set(destinations)].slice(0, 2);
};

const extractOrigin = (text) => {
  const patterns = [
    /\b(?:from|departing from|origin:?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/i,
    /\b(?:from|depart)\s+([A-Z][\w\s]+?)\s+to\b/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }

  return "";
};

const extractTravelDates = (text) => {
  const dates = extractMatches(text, dateRegexes);
  if (dates.length >= 2) {
    return {
      startDate: dates[0],
      endDate: dates[1],
      days: Math.max(1, Math.ceil(Math.random() * 7)), // Placeholder; actual calculation would require date parsing
    };
  }
  return { startDate: "", endDate: "", days: 3 };
};

const extractTravelersAndBudget = (text) => {
  let travelers = 1;
  let budget = "mid-range";

  // Extract number of people/travelers
  const travelerMatch = text.match(/(?:for\s+)?(\d+)\s+(?:person|people|traveler|travellers|guest)/i);
  if (travelerMatch) {
    travelers = Math.min(parseInt(travelerMatch[1]), 12);
  }

  // Detect budget level
  const lowerText = text.toLowerCase();
  if (lowerText.includes("luxury") || lowerText.includes("premium") || lowerText.includes("5-star")) {
    budget = "premium";
  } else if (lowerText.includes("budget") || lowerText.includes("cheap") || lowerText.includes("economy")) {
    budget = "budget";
  }

  return { travelers, budget };
};

const extractHotelPreference = (text) => {
  const hotelMatch = text.match(/\b(?:hotel|resort|inn|suite|apartments?)\s+([A-Z][A-Za-z0-9&'\- ]{2,40})/i);
  if (hotelMatch) {
    return hotelMatch[1].trim();
  }
  return "";
};

const extractTransportPreference = (text) => {
  const preferences = [];
  if (/flight|plane|air/i.test(text)) preferences.push("Flight");
  if (/train|rail/i.test(text)) preferences.push("Train");
  if (/car|rental|driving/i.test(text)) preferences.push("Rental car");
  if (/bus|coach/i.test(text)) preferences.push("Bus");
  if (/metro|subway|transit/i.test(text)) preferences.push("Public transit");

  return preferences.length > 0 ? preferences.join(", ") : "";
};

const detectTravelStyle = (text) => {
  const lowerText = text.toLowerCase();

  if (/adventure|hiking|trekking|extreme|outdoor/i.test(text)) return "adventure";
  if (/family|kid|child|parent/i.test(text)) return "family-friendly";
  if (/luxury|premium|high-end|upscale/i.test(text)) return "luxury";
  if (/budget|cheap|affordable|economy/i.test(text)) return "budget-conscious";
  if (/relax|beach|spa|wellness|retreat/i.test(text)) return "relaxed";

  return "balanced";
};

const parseStructuredTravelData = (rawText, fileName = "") => {
  const text = normalizeWhitespace(rawText || "");
  const lowerText = text.toLowerCase();
  const documentType = detectDocumentType(text);
  const dates = extractMatches(text, dateRegexes);
  const amounts = Array.from(new Set(text.match(/(?:USD|INR|EUR|GBP|AED|\$|₹)\s?\d{1,3}(?:,\d{3})*(?:\.\d{2})?/gi) || []));
  const confirmationNumbers = Array.from(new Set(text.match(/\b(?:conf(?:irmation)?|booking|reservation|pnr|ticket)[\s#:.-]*([A-Z0-9]{5,12})\b/gi) || []));
  const flightNumbers = Array.from(new Set(text.match(/\b[a-z]{2}\s?\d{2,4}\b/gi) || []));
  const hotels = Array.from(new Set(text.match(/\b(?:hotel|resort|inn|suite|apartments?)\s+[A-Z][A-Za-z0-9&'\- ]{2,40}/gi) || []));

  // Extract itinerary-specific fields
  const destinations = extractDestinations(text);
  const origin = extractOrigin(text);
  const travelDates = extractTravelDates(text);
  const { travelers, budget } = extractTravelersAndBudget(text);
  const hotelPreference = extractHotelPreference(text);
  const transportPreference = extractTransportPreference(text);
  const travelStyle = detectTravelStyle(text);

  const itinerary = {
    documentType,
    fileName,
    summary: text.slice(0, 220),
    dates,
    amounts,
    confirmationNumbers,
    flightNumbers,
    hotels,
    hasFlightDetails: /flight|boarding pass|gate|seat/i.test(text),
    hasHotelDetails: /hotel|check-in|check-out|reservation/i.test(text),
    hasVisaDetails: /visa|passport|embassy/i.test(text),
    keywords: ["travel", "itinerary", "booking", "reservation"].filter((keyword) => lowerText.includes(keyword)),
    // New itinerary form fields
    extractedFormFields: {
      tripName: extractMatches(text, [/\b(?:trip|tour|vacation|journey|package)[\s:]*([A-Za-z0-9\s&\-]+)/i])[0] || "",
      destination: destinations[0] || "",
      origin: origin || "",
      startDate: travelDates.startDate,
      endDate: travelDates.endDate,
      days: travelDates.days,
      travelers,
      budget,
      hotelPreference,
      transportPreference,
      travelStyle,
      interests: [],
      confidence: {
        destination: destinations.length > 0 ? 0.85 : 0,
        origin: origin ? 0.8 : 0,
        dates: dates.length >= 2 ? 0.9 : dates.length === 1 ? 0.5 : 0,
        travelers: travelers > 1 ? 0.8 : 0.3,
        budget: budget !== "mid-range" ? 0.7 : 0.2,
      },
    },
  };

  return itinerary;
};

export { parseStructuredTravelData };
