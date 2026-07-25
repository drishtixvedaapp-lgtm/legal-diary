/**
 * Builds WhatsApp reminder message in the client's preferred language
 * Languages: english, telugu, hindi
 */

const formatDate = (date) => {
  const d = new Date(date);
  const day   = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year  = d.getFullYear();
  const long  = d.toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  return { long, short: `${day}-${month}-${year}` };
};

const buildWAMessage = (type, client, caseDoc, lawyerName, lawyerPhone) => {
  const lang     = client.language || "english";
  const isToday  = type === "morning";
  const prefix   = caseDoc.casePrefix || "";
  const num      = caseDoc.caseNumber || "";
  const caseRef  = prefix ? `${prefix}/${num}` : num;
  const { long: dateLong, short: dateShort } = formatDate(caseDoc.nextHearing);
  const time     = caseDoc.hearingTime || "As scheduled";
  const phone    = lawyerPhone ? `\n📞 *సంప్రదించండి:* ${lawyerPhone}` : "";
  const phoneH   = lawyerPhone ? `\n📞 *संपर्क:* ${lawyerPhone}` : "";
  const phoneE   = lawyerPhone ? `\n📞 *Contact:* ${lawyerPhone}` : "";

  // ── ENGLISH ────────────────────────────────────────────────────────────────
  if (lang === "english") {
    const when = isToday ? "TODAY" : "TOMORROW";
    const intro = type === "newCase"
      ? "A new case has been filed on your behalf and your first hearing has been scheduled."
      : type === "updated"
      ? "Your hearing date has been updated. Please note the new schedule."
      : isToday
      ? "Your court hearing is scheduled for TODAY. Please be present on time."
      : "Your court hearing is scheduled for TOMORROW. Please make necessary arrangements.";

    return `⚖️ *VakilSummons${type === "newCase" ? " — New Hearing Scheduled" : type === "updated" ? " — Hearing Date Updated" : ` — Hearing Reminder (${when})`}*

Dear ${client.name},

${intro}

📋 *Case:* ${caseDoc.caseTitle}
🔢 *Case No:* ${caseRef}
🏛️ *Court:* ${caseDoc.courtName}

📅 *Hearing Date:*
*${dateLong}*
*(${dateShort})*

🕐 *Time:* ${time}
👨‍⚖️ *Lawyer:* ${lawyerName}${phoneE}

${isToday || type === "newCase" || type === "updated"
  ? "Please carry all relevant documents to court."
  : "Please be present at the court 15 minutes early."}

— VakilSummons System`;
  }

  // ── TELUGU ─────────────────────────────────────────────────────────────────
  if (lang === "telugu") {
    const when = isToday ? "నేడు" : "రేపు";
    const intro = type === "newCase"
      ? "మీ తరపున కొత్త కేసు నమోదు చేయబడింది మరియు మొదటి విచారణ షెడ్యూల్ చేయబడింది."
      : type === "updated"
      ? "మీ విచారణ తేదీ నవీకరించబడింది. దయచేసి కొత్త షెడ్యూల్ గమనించండి."
      : isToday
      ? "మీ కోర్టు విచారణ *నేడు* జరుగుతుంది. సమయానికి హాజరు కండి."
      : "మీ కోర్టు విచారణ *రేపు* జరుగుతుంది. అవసరమైన ఏర్పాట్లు చేసుకోండి.";

    return `⚖️ *లీగల్ డైరీ${type === "newCase" ? " — కొత్త విచారణ షెడ్యూల్ అయింది" : type === "updated" ? " — విచారణ తేదీ మారింది" : ` — విచారణ రిమైండర్ (${when})`}*

నమస్కారం ${client.name} గారు,

${intro}

📋 *కేసు:* ${caseDoc.caseTitle}
🔢 *కేసు నంబర్:* ${caseRef}
🏛️ *కోర్టు:* ${caseDoc.courtName}

📅 *విచారణ తేదీ:*
*${dateLong}*
*(${dateShort})*

🕐 *సమయం:* ${time}
👨‍⚖️ *న్యాయవాది:* ${lawyerName}${phone}

${isToday || type === "newCase" || type === "updated"
  ? "దయచేసి అన్ని అవసరమైన పత్రాలు కోర్టుకు తీసుకురండి."
  : "కోర్టుకు 15 నిమిషాల ముందు హాజరు కండి."}

— లీగల్ డైరీ సిస్టమ్`;
  }

  // ── HINDI ──────────────────────────────────────────────────────────────────
  if (lang === "hindi") {
    const when = isToday ? "आज" : "कल";
    const intro = type === "newCase"
      ? "आपकी ओर से एक नया मामला दर्ज किया गया है और पहली सुनवाई निर्धारित की गई है।"
      : type === "updated"
      ? "आपकी सुनवाई की तारीख बदल दी गई है। कृपया नई तारीख नोट करें।"
      : isToday
      ? "आपकी अदालती सुनवाई *आज* है। कृपया समय पर उपस्थित हों।"
      : "आपकी अदालती सुनवाई *कल* है। कृपया आवश्यक व्यवस्था करें।";

    return `⚖️ *लीगल डायरी${type === "newCase" ? " — नई सुनवाई निर्धारित" : type === "updated" ? " — सुनवाई की तारीख बदली" : ` — सुनवाई रिमाइंडर (${when})`}*

नमस्ते ${client.name} जी,

${intro}

📋 *मामला:* ${caseDoc.caseTitle}
🔢 *केस नंबर:* ${caseRef}
🏛️ *अदालत:* ${caseDoc.courtName}

📅 *सुनवाई की तारीख:*
*${dateLong}*
*(${dateShort})*

🕐 *समय:* ${time}
👨‍⚖️ *वकील:* ${lawyerName}${phoneH}

${isToday || type === "newCase" || type === "updated"
  ? "कृपया सभी जरूरी दस्तावेज अदालत में लेकर आएं।"
  : "कृपया अदालत में 15 मिनट पहले पहुंचें।"}

— लीगल डायरी सिस्टम`;
  }
};


/**
 * Returns array of messages to send
 * Always includes English + selected language if different
 */
const buildWAMessages = (type, client, caseDoc, lawyerName, lawyerPhone) => {
  const lang     = client.language || "english";
  const messages = [];

  // Always send English first
  const englishMsg = buildWAMessage(type, { ...client, language: "english" }, caseDoc, lawyerName, lawyerPhone);
  messages.push(englishMsg);

  // If client language is not English, also send in their language
  if (lang !== "english") {
    const nativeMsg = buildWAMessage(type, client, caseDoc, lawyerName, lawyerPhone);
    messages.push(nativeMsg);
  }

  return messages;
};

module.exports = { buildWAMessage, buildWAMessages };